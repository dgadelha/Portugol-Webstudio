import { HttpClient } from "@angular/common/http";
import { inject, Service, signal } from "@angular/core";
import type { Exercício, ÍndiceDeExercícios } from "@portugol-webstudio/resources/exercicios";
import {
  analyzeExerciseCode,
  CheckOptions,
  checkExercise,
  ExerciseResult,
  PortugolWebWorkersRunner,
} from "@portugol-webstudio/runner";
import { LocalStorageService } from "ngx-webstorage";
import { firstValueFrom, retry } from "rxjs";

import { WorkerService } from "./worker.service";

export type { Exercício } from "@portugol-webstudio/resources/exercicios";

/**
 * O progresso de um exercício neste navegador. Ter progresso já quer dizer que o exercício
 * foi aberto.
 */
export type ExerciseProgress = {
  /**
   * O último código escrito na aba do exercício: reabrir o exercício o traz de volta.
   */
  código: string;
  /**
   * Quando passou em todos os casos: o código que passou, e o hash do exercício quando
   * passou. Se os casos mudarem, esse código é conferido de novo ao abrir o exercício, e o
   * exercício deixa de estar aprovado se ele não passar mais.
   */
  aprovado?: { código: string; hash: string };
};

/**
 * O resultado do botão Verificar.
 */
export type ExerciseCheckOutcome =
  | { type: "compileErrors" }
  /**
   * O Parar antes de algum caso começar, enquanto o código era preparado.
   */
  | { type: "aborted" }
  | { type: "blockedLibraries"; libraries: string[] }
  | {
      type: "checked";
      result: ExerciseResult;
      usesSorteia: boolean;
      /**
       * O resultado conta para o progresso (numa cópia do exercício, não).
       */
      recorded: boolean;
    };

const PROGRESS_KEY = "exercicios";

/**
 * De onde o exercício foi adaptado, como o enunciado e a prévia mostram: "Adaptado de: Portugol
 * Studio (UNIVALI), exercício 05. Licença: LGPL-3.0." `null` num exercício original.
 */
export function attributionText({ atribuição }: Pick<Exercício, "atribuição">) {
  if (!atribuição) {
    return null;
  }

  const source = atribuição.fonte.replace(/\.$/, "");

  return `Adaptado de: ${source}. Licença: ${atribuição.licença}.`;
}

/**
 * Como a dificuldade de um exercício aparece.
 */
export const DIFFICULTY_LABELS: Record<Exercício["dificuldade"], string> = { 1: "Fácil", 2: "Médio", 3: "Difícil" };

/*
 * Os caminhos dos ícones ficam escritos por inteiro: o `cleanup-icons.sh` apaga do build os
 * ícones cujo nome não aparece no código.
 */

/**
 * Uma, duas ou três barras, como o sinal do celular.
 */
export const DIFFICULTY_ICONS: Record<Exercício["dificuldade"], string> = {
  1: "assets/mdi/signal-cellular-1.svg",
  2: "assets/mdi/signal-cellular-2.svg",
  3: "assets/mdi/signal-cellular-3.svg",
};

export const TOPIC_ICONS: Record<Exercício["tópico"], string> = {
  saida: "assets/mdi/console.svg",
  "entrada-e-variaveis": "assets/mdi/keyboard-outline.svg",
  operadores: "assets/mdi/plus-minus-variant.svg",
  condicionais: "assets/mdi/arrow-decision-outline.svg",
  escolha: "assets/mdi/sign-direction.svg",
  lacos: "assets/mdi/repeat.svg",
  vetores: "assets/mdi/code-brackets.svg",
  matrizes: "assets/mdi/grid.svg",
  funcoes: "assets/mdi/function-variant.svg",
};

/**
 * O comentário que liga o código de um arquivo `.por` ao exercício. Para o Portugol Studio é
 * só um comentário, e ele grava as próprias configurações num comentário depois deste: o
 * comentário não precisa estar no fim do arquivo.
 */
const EXERCISE_MARKER = /\/\* @exercicio: ((?:pws|share):[\w-]+) \*\/\n?/g;

/**
 * O exercício não está no índice: foi removido, ou o arquivo veio de outra versão do IDE.
 * Tentar de novo não adianta, ao contrário de uma falha de conexão.
 */
export class ExerciseNotFoundError extends Error {
  constructor(id: string) {
    super(`Exercício não encontrado: ${id}`);
    this.name = "ExerciseNotFoundError";
  }
}

/**
 * Os exercícios embutidos e o progresso de cada um, guardado no navegador.
 */
@Service()
export class ExercisesService {
  private http = inject(HttpClient);
  private storage = inject(LocalStorageService);
  private worker = inject(WorkerService);

  private readonly cache = new Map<string, Promise<Exercício>>();
  private index?: Promise<ÍndiceDeExercícios>;

  readonly progress = signal<Record<string, ExerciseProgress>>(this.readProgress());

  /**
   * Quantas vezes cada exercício recomeçou nesta janela: uma correção que começou antes não
   * aprova o código antigo por cima.
   */
  private readonly generations = new Map<string, number>();

  constructor() {
    // Outra janela do IDE também grava o progresso: esta acompanha
    this.storage.observe(PROGRESS_KEY).subscribe(() => {
      this.progress.set(this.readProgress());
    });
  }

  loadIndex() {
    this.index ??= firstValueFrom(
      this.http.get<ÍndiceDeExercícios>("assets/recursos/exercicios/index.json").pipe(retry(2)),
    ).catch((error: unknown) => {
      this.index = undefined;
      throw error;
    });

    return this.index;
  }

  async load(id: string) {
    let exercise = this.cache.get(id);

    if (!exercise) {
      exercise = this.loadIndex().then(index => {
        const item = index.flatMap(topic => topic.itens).find(entry => entry.id === id);

        if (!item) {
          throw new ExerciseNotFoundError(id);
        }

        return firstValueFrom(this.http.get<Exercício>(`assets/recursos/exercicios/${item.arquivo}`).pipe(retry(2)));
      });

      exercise.catch(() => this.cache.delete(id));
      this.cache.set(id, exercise);
    }

    return exercise;
  }

  /**
   * O código com que a aba do exercício abre: o último escrito, ou o código inicial.
   */
  initialCode(exercise: Exercício, fallback: string) {
    return this.progress()[exercise.id]?.código ?? exercise.códigoInicial ?? fallback;
  }

  isDone(id: string) {
    return this.progress()[id]?.aprovado !== undefined;
  }

  /**
   * Guarda o código editado na aba. Quem já passou continua aprovado: uma tentativa depois não
   * desfaz isso.
   */
  saveDraft(id: string, código: string) {
    // O gravado agora, que outra janela pode ter mudado
    const current = this.readProgress()[id];

    if (current?.código !== código) {
      this.updateProgress(id, { ...current, código });
    }
  }

  /**
   * O Recomeçar, e o Usar no meu exercício de uma cópia: o exercício volta a não estar feito,
   * e o código aprovado é descartado com o resto.
   */
  restart(id: string, código: string) {
    this.generations.set(id, (this.generations.get(id) ?? 0) + 1);
    this.updateProgress(id, { código });
  }

  /**
   * Transpila e corrige o código no exercício. Código com erro de compilação não executa, e
   * uma biblioteca bloqueada impede a correção.
   */
  async check(
    exercise: Exercício,
    code: string,
    { record = true, signal, onCase }: { record?: boolean } & Pick<CheckOptions, "signal" | "onCase"> = {},
  ): Promise<ExerciseCheckOutcome> {
    // Um Recomeçar (ou Usar no meu exercício) enquanto esta correção roda vale mais que ela
    const generation = this.generations.get(exercise.id);
    const analysis = analyzeExerciseCode(code);

    if (analysis.blockedLibraries.length > 0) {
      return { type: "blockedLibraries", libraries: analysis.blockedLibraries };
    }

    let transpiled: Awaited<ReturnType<WorkerService["transpileCode"]>>;

    try {
      transpiled = await this.worker.transpileCode(code, { signal });
    } catch (error) {
      if (signal?.aborted) {
        return { type: "aborted" };
      }

      throw error;
    }

    if (this.worker.hasCompileErrors(transpiled)) {
      return { type: "compileErrors" };
    }

    const result = await checkExercise(PortugolWebWorkersRunner, transpiled, exercise, { signal, onCase });

    // Uma correção interrompida não diz nada sobre o código
    if (record && result.passed && this.generations.get(exercise.id) === generation) {
      // O rascunho fica como está: outra janela pode ter editado o código enquanto conferia
      const latest = this.readProgress()[exercise.id];

      this.updateProgress(exercise.id, {
        ...latest,
        código: latest?.código ?? code,
        aprovado: { código: code, hash: this.hash(exercise) },
      });
    }

    return { type: "checked", result, usesSorteia: analysis.usesSorteia, recorded: record };
  }

  /**
   * O resumo do Verificar: aparece na aba Correção e é lido pelo leitor de tela.
   */
  summary(outcome: ExerciseCheckOutcome) {
    switch (outcome.type) {
      case "aborted": {
        return "A correção foi interrompida.";
      }

      case "compileErrors": {
        return "O código tem erros de compilação e não foi conferido. Eles estão na aba Problemas.";
      }

      case "blockedLibraries": {
        const { libraries } = outcome;

        return `Os exercícios não aceitam ${libraries.length === 1 ? "a biblioteca" : "as bibliotecas"} ${libraries.join(", ")}.`;
      }

      case "checked": {
        const { result } = outcome;

        const done = outcome.recorded ? " Exercício concluído." : "";

        if (result.passed) {
          return result.total === 1
            ? `Passou no único caso.${done}`
            : `Passou em todos os ${result.total} casos.${done}`;
        }

        const passed = result.cases.filter(item => !item.failure).length;
        const stopped = {
          timeout: " Os casos seguintes não foram conferidos: o tempo esgotou.",
          aborted: " A correção foi interrompida.",
        };

        return `Passou em ${passed} de ${result.total} ${result.total === 1 ? "caso" : "casos"}.${result.stopped ? stopped[result.stopped] : ""}`;
      }
    }
  }

  /**
   * Um exercício aprovado cujos casos mudaram: o código que passou é conferido de novo. Se
   * não passar mais, o exercício volta a não estar feito. Devolve se ele deixou de estar
   * aprovado.
   */
  async recheckIfChanged(exercise: Exercício, signal?: AbortSignal) {
    const approved = this.progress()[exercise.id]?.aprovado;
    const hash = this.hash(exercise);

    if (!approved || approved.hash === hash) {
      return false;
    }

    const outcome = await this.check(exercise, approved.código, { record: false, signal });

    // Interrompida (a aba fechou): fica para a próxima vez que o exercício abrir
    if (signal?.aborted) {
      return false;
    }

    const passed = outcome.type === "checked" && outcome.result.passed;
    const latest = this.progress()[exercise.id];

    // Enquanto conferia, o exercício passou de novo ou recomeçou: o resultado não vale mais
    if (latest?.aprovado?.código !== approved.código || latest.aprovado.hash !== approved.hash) {
      return false;
    }

    this.updateProgress(exercise.id, {
      ...latest,
      aprovado: passed ? { código: approved.código, hash } : undefined,
    });

    return !passed;
  }

  /**
   * O código sem o comentário do exercício, e o exercício, se o comentário existir.
   */
  extractMarker(code: string) {
    const match = Array.from(code.matchAll(EXERCISE_MARKER)).at(-1);

    if (!match) {
      return { code, exerciseId: undefined };
    }

    // As linhas em branco antes do comentário saem com `trimEnd`, e não na expressão: um `\n*`
    // nela levaria um tempo quadrático num arquivo com muitas linhas em branco
    const before = code.slice(0, match.index).trimEnd();
    const rest = code.slice(match.index + match[0].length);

    return { code: `${before}\n${rest}`.trimEnd() + "\n", exerciseId: match[1] };
  }

  /**
   * O código como é salvo ou compartilhado: com o comentário que o liga ao exercício.
   */
  addMarker(code: string, exerciseId: string) {
    return `${this.extractMarker(code).code.trimEnd()}\n\n/* @exercicio: ${exerciseId} */\n`;
  }

  /**
   * O que muda o veredito: os casos e o modo, sem as descrições (dos casos e das verificações).
   * Corrigir o enunciado ou uma descrição não muda o hash.
   */
  hash(exercise: Exercício) {
    const withoutDescriptions = (key: string, value: unknown) => (key === "descrição" ? undefined : value);
    const text = JSON.stringify([exercise.modo, exercise.exemplos, exercise.testes], withoutDescriptions);

    // cyrb53: não precisa ser criptográfico, e funciona fora de um contexto seguro
    let h1 = 0xde_ad_be_ef;
    let h2 = 0x41_c6_ce_57;

    for (let i = 0; i < text.length; i++) {
      const char = text.codePointAt(i)!;

      h1 = Math.imul(h1 ^ char, 2_654_435_761);
      h2 = Math.imul(h2 ^ char, 1_597_334_677);
    }

    h1 = Math.imul(h1 ^ (h1 >>> 16), 2_246_822_507) ^ Math.imul(h2 ^ (h2 >>> 13), 3_266_489_909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2_246_822_507) ^ Math.imul(h1 ^ (h1 >>> 13), 3_266_489_909);

    return (4_294_967_296 * (2_097_151 & h2) + (h1 >>> 0)).toString(36);
  }

  private updateProgress(id: string, progress: ExerciseProgress) {
    // Parte do que está gravado, para não desfazer o que outra janela gravou
    this.progress.set({ ...this.readProgress(), [id]: progress });

    try {
      this.storage.store(PROGRESS_KEY, this.progress());
    } catch {
      // Cota cheia: o progresso vale só nesta janela
    }
  }

  private readProgress(): Record<string, ExerciseProgress> {
    const stored: unknown = this.storage.retrieve(PROGRESS_KEY);

    return stored && typeof stored === "object" ? (stored as Record<string, ExerciseProgress>) : {};
  }
}
