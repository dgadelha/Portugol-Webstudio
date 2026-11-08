import { inject, Service } from "@angular/core";
import type { FunctionSignature } from "@portugol-webstudio/parser";
import {
  analyzeExerciseCode,
  CaseEnding,
  CaseRun,
  checkExercise,
  comparedValues,
  ExerciseArgument,
  parsePortugolLiteral,
  PortugolWebWorkersRunner,
  runExerciseCase,
  runsInicio,
  splitPortugolList,
} from "@portugol-webstudio/runner";

import { TAMANHO_MAXIMO_DO_ENUNCIADO } from "@portugol-webstudio/resources/exercicios/limites.js";

import type { DraftCase, DraftCheck, DraftFunctionCheck, ExerciseDraft } from "./exercise-draft";
import { ExerciseMarkdownService } from "./exercise-markdown.service";
import { Exercício, SHARED_PREFIX } from "./exercises.service";
import { cyrb53 } from "./shared/hash";
import { WorkerService } from "./worker.service";
import { isMeaningfulCode } from "./workspace.types";

/**
 * Como estão as respostas de um caso: geradas e em dia, desatualizadas (a solução ou o caso
 * mudou depois), com problema, ou ainda não geradas.
 */
export type CaseStatus = "ready" | "stale" | "problem" | "missing";

/**
 * Quanto tempo o link de um exercício compartilhado vale, em dias (um semestre).
 */
export const SHARED_EXERCISE_DAYS = 180;

/**
 * Cria, gera as respostas e valida um exercício. As respostas esperadas nunca são digitadas:
 * saem da solução de quem cria, como nos exercícios que vêm com o IDE.
 */
@Service()
export class ExerciseBuilderService {
  private worker = inject(WorkerService);
  private markdown = inject(ExerciseMarkdownService);

  /**
   * Executa a solução em cada caso e preenche o que cada um espera: a saída no modo simples, os
   * valores escritos e o retorno das funções no avançado. Devolve um rascunho novo e o que
   * impediu de gerar.
   */
  async generate(
    draft: ExerciseDraft,
    {
      signal,
      onCase,
      only,
    }: {
      signal?: AbortSignal;
      onCase?: (done: number, total: number) => void;
      /**
       * Só este caso (a posição): os outros ficam como estão.
       */
      only?: number;
    } = {},
  ): Promise<{ draft: ExerciseDraft; problems: string[] }> {
    const problems: string[] = [];
    const program = await this.worker.transpileCode(draft.solução, { signal });

    if (this.worker.hasCompileErrors(program)) {
      return { draft, problems: ["A solução tem erros de compilação."] };
    }

    const blocked = this.blockedLibraries(draft.solução);

    if (blocked) {
      return { draft, problems: [blocked] };
    }

    const casos: DraftCase[] = [];
    const total = only === undefined ? draft.casos.length : 1;

    for (const [i, caso] of draft.casos.entries()) {
      if (only !== undefined && i !== only) {
        casos.push(caso);
        continue;
      }

      const generated = await this.generateCase(caso, draft.modo, program, signal);

      // Parar: o caso interrompido e os que nem rodaram ficam como estavam, e os já gerados
      // ficam com as respostas novas
      if (signal?.aborted) {
        casos.push(...draft.casos.slice(i));
        problems.push("A geração foi interrompida.");
        break;
      }

      casos.push({ ...generated, geradoCom: this.fingerprint(draft, caso) });
      onCase?.(only === undefined ? i + 1 : 1, total);

      if (generated.problema) {
        problems.push(`${this.caseName(draft.casos, i)}: ${generated.problema}`);
      }
    }

    return { draft: { ...draft, casos }, problems };
  }

  /**
   * O exercício publicado no link, sem a solução, ou o que ainda impede de compartilhar: as
   * mesmas regras do CI para os exercícios que vêm com o IDE.
   */
  async toExercise(draft: ExerciseDraft, linkId: string): Promise<{ exercise?: Exercício; problems: string[] }> {
    const problems: string[] = [];
    // O esquema (com o zod) baixa enquanto o resto é conferido
    const esquema = import("@portugol-webstudio/resources/exercicios/esquema");

    if (!draft.título.trim()) {
      problems.push("O exercício não tem título.");
    }

    if (!draft.enunciado.trim()) {
      problems.push("O exercício não tem enunciado.");
    } else if (draft.enunciado.trim().length > TAMANHO_MAXIMO_DO_ENUNCIADO) {
      problems.push(`O enunciado tem mais de ${TAMANHO_MAXIMO_DO_ENUNCIADO.toLocaleString("pt-BR")} caracteres.`);
    } else {
      problems.push(...(await this.statementProblems(draft.enunciado)));
    }

    // Sem ela, os casos só diriam que as respostas não foram geradas, sem dizer por quê
    if (!isMeaningfulCode(draft.solução)) {
      problems.push("O exercício não tem solução.");
    }

    for (const tipo of ["exemplo", "teste"] as const) {
      if (draft.casos.every(caso => caso.tipo !== tipo)) {
        problems.push(tipo === "exemplo" ? "O exercício não tem nenhum exemplo." : "O exercício não tem nenhum teste.");
      }
    }

    for (const [i, caso] of draft.casos.entries()) {
      const name = this.caseName(draft.casos, i);
      const status = this.caseStatus(draft, caso);

      if (status === "stale") {
        problems.push(`${name}: o caso ou a solução mudou depois de gerar as respostas.`);
      } else if (status !== "ready") {
        problems.push(`${name}: ${this.missingAnswer(caso, draft.modo) ?? "as respostas não foram geradas."}`);
      }
    }

    if (isMeaningfulCode(draft.códigoInicial)) {
      const starter = await this.worker.transpileCode(draft.códigoInicial);

      if (this.worker.hasCompileErrors(starter)) {
        problems.push("O código inicial tem erros de compilação.");
      }

      if (analyzeExerciseCode(draft.códigoInicial).blockedLibraries.length > 0) {
        problems.push("O código inicial usa bibliotecas que os exercícios não aceitam.");
      }
    }

    if (problems.length > 0) {
      return { problems };
    }

    const { schema, URL_DO_ESQUEMA } = await esquema;
    const parsed = schema.safeParse(this.build(draft, linkId, URL_DO_ESQUEMA));

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        problems.push(this.schemaProblem(issue.path, issue.message));
      }

      return { problems };
    }

    // As respostas podem ter ficado velhas: o caso ou a solução mudou depois de gerar
    const program = await this.worker.transpileCode(draft.solução);
    const result = await checkExercise(PortugolWebWorkersRunner, program, parsed.data);

    if (!result.passed) {
      // Os mesmos nomes da tela: "Exemplo 2" é o segundo exemplo, como no exercício publicado
      const failed = result.cases
        .filter(item => item.failure)
        .map(item => `${item.kind === "exemplo" ? "Exemplo" : "Teste"} ${item.index}`);

      return {
        problems: [
          failed.length > 0
            ? `A solução não passa em: ${failed.join(", ")}. Gere as respostas de novo.`
            : "A solução não passa em todos os casos: gere as respostas de novo.",
        ],
      };
    }

    return { exercise: parsed.data, problems };
  }

  /**
   * Um erro do esquema com os nomes da tela: `testes.1.verificações.0` é "Teste 2, verificação
   * 1". O exercício publicado separa exemplos e testes, na mesma ordem da tela, e as
   * verificações de cada caso também ficam na ordem.
   */
  private schemaProblem(path: PropertyKey[], message: string) {
    const [list, index, ...rest] = path;

    if (typeof index === "number" && (list === "exemplos" || list === "testes")) {
      const parts = [`${list === "exemplos" ? "Exemplo" : "Teste"} ${index + 1}`];

      if (rest[0] === "verificações" && typeof rest[1] === "number") {
        parts.push(`verificação ${rest[1] + 1}`);
        rest.splice(0, 2);
      }

      // O que sobra, contando do 1 como na tela: `valores 2`
      const detail = rest.map(part => (typeof part === "number" ? part + 1 : String(part))).join(" ");

      return `${parts.join(", ")}${detail ? ` (${detail})` : ""}: ${message}`;
    }

    return path.length > 0
      ? `O exercício não segue o formato (${path.map(String).join(".")}): ${message}`
      : `O exercício não segue o formato: ${message}`;
  }

  /**
   * Bibliotecas que os exercícios não aceitam (como Graficos) usadas pela solução: o problema,
   * ou `null` quando não usa nenhuma.
   */
  blockedLibraries(solution: string) {
    const blocked = analyzeExerciseCode(solution).blockedLibraries;

    return blocked.length > 0
      ? `A solução usa bibliotecas que os exercícios não aceitam: ${blocked.join(", ")}.`
      : null;
  }

  /**
   * "Exemplo 2", "Teste 3": como o aluno vê cada caso.
   */
  caseName(casos: DraftCase[], index: number) {
    const tipo = casos[index].tipo;
    const position = casos.slice(0, index + 1).filter(caso => caso.tipo === tipo).length;

    return `${tipo === "exemplo" ? "Exemplo" : "Teste"} ${position}`;
  }

  caseStatus(draft: ExerciseDraft, caso: DraftCase): CaseStatus {
    if (caso.geradoCom === undefined) {
      return "missing";
    }

    // Mudou depois de gerar: as respostas, e um problema que houve, são de outro caso
    if (caso.geradoCom !== this.fingerprint(draft, caso)) {
      return "stale";
    }

    if (caso.problema) {
      return "problem";
    }

    return this.missingAnswer(caso, draft.modo) ? "missing" : "ready";
  }

  /**
   * A Ajuda diz que o enunciado não aceita HTML nem imagens: o aluno veria o HTML como texto, e
   * as imagens sumiriam sem aviso. Se a conferência não carregar, o enunciado passa: o aluno
   * continua seguro, só sem o aviso para quem cria.
   */
  private async statementProblems(statement: string) {
    const found = await this.markdown.unsupported(statement).catch(() => ({ html: false, images: false }));
    const problems: string[] = [];

    if (found.html) {
      problems.push("O enunciado tem HTML, que os exercícios mostram como texto.");
    }

    if (found.images) {
      problems.push("O enunciado tem imagens, e os exercícios não mostram imagens.");
    }

    return problems;
  }

  /**
   * O que as respostas de um caso dependem: a solução, o modo, as entradas e o que cada
   * verificação confere (não a descrição, a tolerância nem os valores tirados à mão).
   */
  private fingerprint(draft: ExerciseDraft, caso: DraftCase) {
    const checks = caso.verificações.map(check =>
      check.alvo === "escreva" ? [check.alvo, check.regra] : [check.alvo, check.nome, check.argumentos],
    );

    return cyrb53(JSON.stringify([draft.solução, draft.modo, caso.entradas, checks]));
  }

  inputsOf(caso: DraftCase) {
    if (caso.entradas === "") {
      return [];
    }

    return caso.entradas.replace(/\r?\n$/, "").split(/\r?\n/);
  }

  private async generateCase(
    caso: DraftCase,
    modo: ExerciseDraft["modo"],
    program: { js: string; functions: FunctionSignature[] },
    signal?: AbortSignal,
  ): Promise<DraftCase> {
    const inputs = this.inputsOf(caso);
    const next: DraftCase = { ...caso, problema: undefined };

    if (modo === "simples") {
      const run = await runExerciseCase(PortugolWebWorkersRunner, program.js, inputs, { signal });

      return run.ending.type === "finished"
        ? { ...next, saída: run.output }
        : { ...next, saída: undefined, problema: this.describeEnding(run.ending) };
    }

    if (caso.verificações.length === 0) {
      return { ...next, problema: "o caso não tem nenhuma verificação." };
    }

    if (!runsInicio(caso) && inputs.length > 0) {
      return {
        ...next,
        problema:
          "o caso só confere funções, e o programa não é executado: as entradas nunca seriam lidas. Apague as entradas ou confira também o que o programa escreve.",
      };
    }

    let run: CaseRun | undefined;

    if (runsInicio(caso)) {
      run = await runExerciseCase(PortugolWebWorkersRunner, program.js, inputs, { signal, writeValues: true });

      if (run.ending.type !== "finished") {
        return { ...next, problema: this.describeEnding(run.ending) };
      }
    }

    const verificações: DraftCheck[] = [];

    for (const check of caso.verificações) {
      if (check.alvo === "escreva") {
        const valores = comparedValues(run!, check.regra);

        if (valores.length === 0) {
          return { ...next, problema: "a solução não escreveu nenhum valor para conferir." };
        }

        verificações.push({ ...check, valores });
        continue;
      }

      const generated = await this.generateFunctionCheck(check, program, signal);

      if (typeof generated === "string") {
        return { ...next, problema: generated };
      }

      verificações.push(generated);
    }

    return { ...next, verificações };
  }

  private async generateFunctionCheck(
    check: DraftFunctionCheck,
    program: { js: string; functions: FunctionSignature[] },
    signal?: AbortSignal,
  ): Promise<DraftFunctionCheck | string> {
    if (!check.nome) {
      return "uma verificação de função está sem o nome da função.";
    }

    const signature = program.functions.find(fn => fn.name === check.nome);

    if (!signature) {
      return `a solução não tem a função ${check.nome}.`;
    }

    if (signature.returns === "vazio") {
      return `a função ${check.nome} não retorna nenhum valor.`;
    }

    if (signature.parameters.some(type => type.endsWith("[][]"))) {
      return `a função ${check.nome} recebe uma matriz, e as verificações de função não aceitam matrizes.`;
    }

    const texts = splitPortugolList(check.argumentos);

    if (texts.length !== signature.parameters.length) {
      const expected = signature.parameters.length;
      const receives =
        expected === 0 ? "não recebe argumentos" : `recebe ${expected} ${expected === 1 ? "argumento" : "argumentos"}`;

      return `a função ${check.nome} ${receives}, e a chamada tem ${texts.length}.`;
    }

    const args: ExerciseArgument[] = [];

    for (const [i, type] of signature.parameters.entries()) {
      const parsed = parsePortugolLiteral(texts[i] ?? "", type);

      if (parsed === undefined) {
        return `o argumento ${i + 1} da função ${check.nome} não é um valor do tipo ${type}.`;
      }

      args.push(parsed);
    }

    const run = await runExerciseCase(PortugolWebWorkersRunner, program.js, [], {
      signal,
      call: { name: check.nome, args },
    });

    if (run.ending.type !== "finished") {
      return this.describeEnding(run.ending);
    }

    if (run.returned === null) {
      return `a função ${check.nome} não retornou nenhum valor.`;
    }

    return {
      ...check,
      tipos: signature.parameters,
      valor: run.returned,
    };
  }

  /**
   * O exercício no formato publicado, a partir do rascunho (sem a solução).
   */
  /**
   * Os exemplos com as respostas em dia, como o aluno vai vê-los embaixo do enunciado: para a
   * prévia. São os mesmos objetos do link, que o esquema confere ao compartilhar.
   */
  readyExamples(draft: ExerciseDraft) {
    return draft.casos
      .filter(caso => caso.tipo === "exemplo" && this.caseStatus(draft, caso) === "ready")
      .map(caso => this.publishedCase(draft, caso)) as Exercício["exemplos"];
  }

  private publishedCase(draft: ExerciseDraft, caso: DraftCase) {
    return {
      ...(caso.descrição.trim() && { descrição: caso.descrição.trim() }),
      entradas: this.inputsOf(caso),
      ...(draft.modo === "simples"
        ? { saída: caso.saída }
        : { verificações: caso.verificações.map(check => this.publishedCheck(check)) }),
    };
  }

  private build(draft: ExerciseDraft, linkId: string, schemaUrl: string): Record<string, unknown> {
    const caseOf = (caso: DraftCase) => this.publishedCase(draft, caso);

    return {
      $schema: schemaUrl,
      id: `${SHARED_PREFIX}${linkId}`,
      título: draft.título.trim(),
      tópico: draft.tópico,
      dificuldade: draft.dificuldade,
      enunciado: draft.enunciado.trim(),
      // O programa de uma aba nova não vai no link: o aluno o recebe na indentação dele
      ...(isMeaningfulCode(draft.códigoInicial) && { códigoInicial: draft.códigoInicial }),
      modo: draft.modo,
      exemplos: draft.casos.filter(caso => caso.tipo === "exemplo").map(caso => caseOf(caso)),
      testes: draft.casos.filter(caso => caso.tipo === "teste").map(caso => caseOf(caso)),
    };
  }

  private publishedCheck(check: DraftCheck) {
    const common = {
      ...(check.descrição?.trim() && { descrição: check.descrição.trim() }),
      ...(check.tolerância !== undefined && { tolerância: check.tolerância }),
    };

    if (check.alvo === "escreva") {
      return { ...common, alvo: "escreva", regra: check.regra, valores: check.valores };
    }

    return {
      ...common,
      alvo: "função",
      nome: check.nome,
      // Com o tipo do parâmetro na solução: "3" num parâmetro real é o real 3
      argumentos: splitPortugolList(check.argumentos).map((text, i) =>
        parsePortugolLiteral(text, check.tipos?.[i] ?? ""),
      ),
      regra: "igual",
      valor: check.valor,
    };
  }

  /**
   * O que falta para o caso ser publicado, ou `undefined` se ele está pronto.
   */
  private missingAnswer(caso: DraftCase, modo: ExerciseDraft["modo"]) {
    if (caso.problema) {
      return caso.problema;
    }

    if (modo === "simples") {
      return caso.saída === undefined ? "as respostas não foram geradas." : undefined;
    }

    if (caso.verificações.length === 0) {
      return "o caso não tem nenhuma verificação.";
    }

    for (const check of caso.verificações) {
      if (check.alvo === "escreva" && check.valores.length === 0) {
        return "uma verificação do escreva não tem valores: gere as respostas.";
      }

      if (check.alvo === "função" && (check.valor === undefined || check.tipos === undefined)) {
        return check.nome
          ? `a verificação da função ${check.nome} não tem o retorno: gere as respostas.`
          : "uma verificação de função não tem o retorno: gere as respostas.";
      }
    }

    return;
  }

  private describeEnding(ending: CaseEnding) {
    switch (ending.type) {
      case "timeout": {
        return "a solução esgotou o tempo.";
      }

      case "missingInputs": {
        return "a solução pediu mais entradas do que o caso tem.";
      }

      case "extraInputs": {
        return ending.remaining === 1
          ? "sobrou 1 entrada sem ser lida."
          : `sobraram ${ending.remaining} entradas sem ser lidas.`;
      }

      case "error": {
        const line = ending.position ? ` (linha ${ending.position.line})` : "";

        return `erro de execução na solução${line}: ${ending.message.split("\n", 1)[0]}`;
      }

      case "aborted": {
        return "a geração foi interrompida.";
      }

      case "finished": {
        return "";
      }
    }
  }
}
