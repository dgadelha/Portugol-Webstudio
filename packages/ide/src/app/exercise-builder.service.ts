import { inject, Service } from "@angular/core";
import type { FunctionSignature } from "@portugol-webstudio/parser";
import {
  analyzeExerciseCode,
  CaseEnding,
  CaseRun,
  CallArgument,
  checkExercise,
  comparedValues,
  ExerciseArgument,
  ExpectedValue,
  PortugolWebWorkersRunner,
  runExerciseCase,
  vectorElementType,
  WrittenValue,
} from "@portugol-webstudio/runner";

import type { RascunhoDeExercício } from "@portugol-webstudio/resources/exercicios";

import { Exercício, SHARED_PREFIX } from "./exercises.service";
import { cyrb53 } from "./shared/hash";
import { WorkerService } from "./worker.service";
import { isMeaningfulCode } from "./workspace.types";

/**
 * Um exercício em construção: tudo o que quem cria precisa para editar de novo, inclusive a
 * solução, que nunca vai para o link. O tipo vem de `esquemaDoRascunho` em `resources`.
 */
export type ExerciseDraft = RascunhoDeExercício;
export type DraftCase = ExerciseDraft["casos"][number];
export type DraftCheck = DraftCase["verificações"][number];
export type DraftWriteCheck = Extract<DraftCheck, { alvo: "escreva" }>;
export type DraftFunctionCheck = Extract<DraftCheck, { alvo: "função" }>;

/**
 * O `$schema` do arquivo-fonte de um exercício: o que "Baixar" grava e "Abrir" reconhece. Como
 * no exercício, ele diz a versão do formato. Escrito aqui porque o `URL_DO_ESQUEMA_DO_RASCUNHO`
 * de `resources` vem com o zod, que só é carregado sob demanda; o tipo garante que é o mesmo.
 */
const DRAFT_SCHEMA: ExerciseDraft["$schema"] = "https://portugol.dev/esquemas/rascunho-de-exercicio/v1.json";

/**
 * O nome da aba e do cabeçalho enquanto o exercício não tem título.
 */
const UNTITLED = "Novo exercício";

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

  /**
   * Um exercício novo: a solução e o código inicial começam com o programa de uma aba nova
   * (`code`, na indentação escolhida).
   */
  emptyDraft(code: string): ExerciseDraft {
    return {
      $schema: DRAFT_SCHEMA,
      título: "",
      tópico: "saida",
      dificuldade: 1,
      enunciado: "",
      códigoInicial: code,
      solução: code,
      modo: "simples",
      casos: [
        { tipo: "exemplo", descrição: "", entradas: "", verificações: [] },
        { tipo: "teste", descrição: "", entradas: "", verificações: [] },
      ],
    };
  }

  /**
   * Um arquivo aberto pelo "Abrir": um rascunho que segue o esquema, um rascunho com erros
   * (`invalid`), ou `null` se não for um rascunho. Um arquivo editado à mão pode ter qualquer
   * coisa, e a aba de criação conta com o formato.
   */
  async readDraftFile(fileName: string, text: string): Promise<"invalid" | null | { draft: ExerciseDraft }> {
    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      return fileName.toLowerCase().endsWith(".exercicio.json") ? "invalid" : null;
    }

    if ((data as Partial<ExerciseDraft> | null)?.$schema !== DRAFT_SCHEMA) {
      return null;
    }

    const { esquemaDoRascunho } = await import("@portugol-webstudio/resources/exercicios/esquema");
    const result = esquemaDoRascunho.safeParse(data);

    return result.success ? { draft: result.data } : "invalid";
  }

  /**
   * Um rascunho gravado pela própria aba, ou `null` se o texto não for um. Um arquivo aberto
   * passa antes pelo `readDraftFile`.
   */
  parseDraft(text: string): ExerciseDraft | null {
    try {
      const data = JSON.parse(text) as Partial<ExerciseDraft> | null;

      return data?.$schema === DRAFT_SCHEMA && Array.isArray(data.casos) ? (data as ExerciseDraft) : null;
    } catch {
      return null;
    }
  }

  /**
   * Se o rascunho tem algo além do que uma aba nova traz: fechar a aba perderia trabalho.
   */
  isMeaningful(text: string) {
    const draft = this.parseDraft(text);

    if (draft === null) {
      return false;
    }

    const empty = this.emptyDraft("");

    return Boolean(
      draft.título.trim() ||
      draft.enunciado.trim() ||
      isMeaningfulCode(draft.códigoInicial) ||
      isMeaningfulCode(draft.solução) ||
      draft.tópico !== empty.tópico ||
      draft.dificuldade !== empty.dificuldade ||
      draft.modo !== empty.modo ||
      draft.casos.length !== empty.casos.length ||
      draft.casos.some(
        (caso, i) =>
          caso.tipo !== empty.casos[i]?.tipo || caso.entradas || caso.descrição || caso.verificações.length > 0,
      ),
    );
  }

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
   * O título do exercício, ou "Novo exercício" enquanto não tem um.
   */
  titleOf(draft: ExerciseDraft) {
    return draft.título.trim() || UNTITLED;
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

    let run: CaseRun | undefined;

    if (caso.verificações.some(check => check.alvo === "escreva")) {
      run = await runExerciseCase(PortugolWebWorkersRunner, program.js, inputs, { signal, writeValues: true });

      if (run.ending.type !== "finished") {
        return { ...next, problema: this.describeEnding(run.ending) };
      }
    }

    const verificações: DraftCheck[] = [];

    for (const check of caso.verificações) {
      if (check.alvo === "escreva") {
        const valores = comparedValues(run!, check.regra).map(value => this.expected(value));

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
    const signature = program.functions.find(fn => fn.name === check.nome);

    if (!signature) {
      return `a solução não tem a função ${check.nome || "(sem nome)"}.`;
    }

    if (signature.returns === "vazio") {
      return `a função ${check.nome} não retorna nenhum valor.`;
    }

    const texts = this.splitItems(check.argumentos);

    if (texts.length !== signature.parameters.length) {
      return `a função ${check.nome} recebe ${signature.parameters.length} argumento(s), e a chamada tem ${texts.length}.`;
    }

    const args: CallArgument[] = [];

    for (const [i, type] of signature.parameters.entries()) {
      const parsed = this.parseLiteral(texts[i] ?? "", type);

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
      valor: this.expected(run.returned),
    };
  }

  /**
   * O exercício no formato publicado, a partir do rascunho (sem a solução).
   */
  private build(draft: ExerciseDraft, linkId: string, schemaUrl: string): Record<string, unknown> {
    const caseOf = (caso: DraftCase) => {
      return {
        ...(caso.descrição.trim() && { descrição: caso.descrição.trim() }),
        entradas: this.inputsOf(caso),
        ...(draft.modo === "simples"
          ? { saída: caso.saída }
          : { verificações: caso.verificações.map(check => this.publishedCheck(check)) }),
      };
    };

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
      argumentos: this.splitItems(check.argumentos).map((text, i) => this.argumentOf(text, check.tipos?.[i] ?? "")),
      regra: "igual",
      valor: check.valor,
    };
  }

  /**
   * Um argumento do rascunho no formato do JSON, com o tipo do parâmetro na solução.
   */
  private argumentOf(text: string, type: string) {
    const parsed = this.parseLiteral(text, type);

    return parsed && ({ tipo: type, valor: parsed.value } as ExerciseArgument);
  }

  /**
   * Um literal do Portugol do tipo pedido (`inteiro`, `real[]`…), ou `undefined` se não for um.
   * Um inteiro vale onde se espera um real, como numa chamada.
   */
  private parseLiteral(text: string, type: string): CallArgument | undefined {
    const trimmed = text.trim();
    const element = vectorElementType(type);

    if (element) {
      const match = /^\{(.*)\}$/s.exec(trimmed);

      if (!match) {
        return undefined;
      }

      const items = this.splitItems(match[1]);
      const values: Array<WrittenValue["value"]> = [];

      for (const item of items) {
        const parsed = this.parseLiteral(item, element);

        if (!parsed || "vector" in parsed) {
          return undefined;
        }

        values.push(parsed.value);
      }

      return { type: element, vector: true, value: values };
    }

    switch (type) {
      case "inteiro": {
        return /^-?\d+$/.test(trimmed) && Number(trimmed) >= -2_147_483_648 && Number(trimmed) <= 2_147_483_647
          ? { type: "inteiro", value: Number(trimmed) }
          : undefined;
      }

      case "real": {
        return /^-?(?:\d+\.?\d*|\.\d+)$/.test(trimmed) ? { type: "real", value: Number(trimmed) } : undefined;
      }

      case "logico": {
        return trimmed === "verdadeiro" || trimmed === "falso"
          ? { type: "logico", value: trimmed === "verdadeiro" }
          : undefined;
      }

      case "cadeia": {
        const value = this.unquote(trimmed, '"');

        return value === undefined ? undefined : { type: "cadeia", value };
      }

      case "caracter": {
        const value = this.unquote(trimmed, "'");

        return value?.length === 1 ? { type: "caracter", value } : undefined;
      }

      default: {
        return undefined;
      }
    }
  }

  /**
   * O texto entre aspas, com as sequências de escape do Portugol (`\n`, `\"`, `\\`…).
   */
  private unquote(text: string, quote: string) {
    if (text.length < 2 || !text.startsWith(quote) || !text.endsWith(quote)) {
      return;
    }

    const escapes: Record<string, string> = {
      n: "\n",
      t: "\t",
      r: "\r",
      b: "\b",
      f: "\f",
      '"': '"',
      "'": "'",
      "\\": "\\",
    };
    let value = "";

    for (let i = 1; i < text.length - 1; i++) {
      const character = text[i];

      if (character === "\\") {
        const escaped = escapes[text[++i]];

        if (escaped === undefined) {
          return;
        }

        value += escaped;
      } else if (character === quote) {
        return;
      } else {
        value += character;
      }
    }

    return value;
  }

  /**
   * Os itens separados por vírgula de uma lista de argumentos ou de um vetor (`{1, 2, 3}`), sem
   * separar as vírgulas dentro das aspas nem dentro das chaves.
   */
  private splitItems(text: string) {
    if (!text.trim()) {
      return [];
    }

    const items: string[] = [];
    let current = "";
    let quote: string | undefined;
    let depth = 0;

    for (let i = 0; i < text.length; i++) {
      const character = text[i];

      if (quote) {
        current += character;

        if (character === "\\") {
          current += text[++i] ?? "";
        } else if (character === quote) {
          quote = undefined;
        }
      } else if (character === '"' || character === "'") {
        quote = character;
        current += character;
      } else if (character === "{" || character === "}") {
        depth += character === "{" ? 1 : -1;
        current += character;
      } else if (character === "," && depth === 0) {
        items.push(current);
        current = "";
      } else {
        current += character;
      }
    }

    items.push(current);

    return items;
  }

  private expected(value: WrittenValue): ExpectedValue {
    return { tipo: value.type, valor: value.value } as ExpectedValue;
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
        return `a verificação da função ${check.nome || "(sem nome)"} não tem o retorno: gere as respostas.`;
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
