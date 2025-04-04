import {
  AdicaoContext,
  ArquivoContext,
  AtribuicaoCompostaContext,
  AtribuicaoCompostaDivisaoContext,
  AtribuicaoCompostaMultiplicacaoContext,
  AtribuicaoCompostaSomaContext,
  AtribuicaoCompostaSubtracaoContext,
  AtribuicaoContext,
  CaracterContext,
  CasoContext,
  ChamadaFuncaoContext,
  ColunaMatrizContext,
  ComandoContext,
  CondicaoContext,
  DeclaracaoArrayContext,
  DeclaracaoContext,
  DeclaracaoFuncaoContext,
  DeclaracaoMatrizContext,
  DeclaracaoVariavelContext,
  DecrementoUnarioPosfixadoContext,
  DecrementoUnarioPrefixadoContext,
  DivisaoContext,
  EnquantoContext,
  EscolhaContext,
  EscopoBibliotecaContext,
  ExpressaoContext,
  ExpressaoEntreParentesesContext,
  FacaEnquantoContext,
  InclusaoBibliotecaContext,
  IncrementoParaContext,
  IncrementoUnarioPosfixadoContext,
  IncrementoUnarioPrefixadoContext,
  IndiceArrayContext,
  InicializacaoArrayContext,
  InicializacaoMatrizContext,
  InicializacaoParaContext,
  LinhaMatrizContext,
  ListaComandosContext,
  ListaDeclaracoesContext,
  ListaExpressoesContext,
  ListaParametrosContext,
  MaisUnarioContext,
  MenosUnarioContext,
  ModuloContext,
  MultiplicacaoContext,
  NegacaoBitwiseContext,
  NegacaoContext,
  NumeroInteiroContext,
  NumeroRealContext,
  OperacaoAndBitwiseContext,
  OperacaoDiferencaContext,
  OperacaoELogicoContext,
  OperacaoIgualdadeContext,
  OperacaoMaiorContext,
  OperacaoMaiorIgualContext,
  OperacaoMenorContext,
  OperacaoMenorIgualContext,
  OperacaoOrBitwiseContext,
  OperacaoOuLogicoContext,
  OperacaoShiftLeftContext,
  OperacaoShiftRightContext,
  OperacaoXorContext,
  ParaContext,
  ParametroArrayContext,
  ParametroContext,
  ParametroFuncaoContext,
  ParametroMatrizContext,
  PareContext,
  PortugolVisitor,
  ReferenciaArrayContext,
  ReferenciaMatrizContext,
  ReferenciaParaVariavelContext,
  RetorneContext,
  SeContext,
  SenaoContext,
  StringContext,
  SubtracaoContext,
  TamanhoArrayContext,
  ValorLogicoContext,
} from "@portugol-webstudio/antlr";
import { captureException } from "@sentry/core";
import { AbstractParseTreeVisitor, ParserRuleContext } from "antlr4ng";

import { StringBuilder } from "./utils/StringBuilder.js";

export class PortugolJs extends AbstractParseTreeVisitor<string> implements PortugolVisitor<string> {
  static thrown: Record<string, boolean> = {};

  debug = false;
  pad = 0;
  hasScope = false;

  DEBUG(fn: string, _ctx: unknown) {
    if (!this.debug) {
      return ``;
    }

    return `${this.PAD()}/*! ${fn} !*/\n`;
  }

  PAD() {
    return "  ".repeat(this.pad);
  }

  protected defaultResult(): string {
    return ``;
  }

  protected aggregateResult(aggregate: string, nextResult: string) {
    return aggregate + nextResult;
  }

  visitChildrenArray(node: ParserRuleContext) {
    const result = [];
    const n = node.getChildCount();

    for (let i = 0; i < n; i++) {
      if (!this.shouldVisitNextChild(node, result.join(""))) {
        break;
      }

      const c = node.getChild(i)!;
      const childResult = c.accept(this);

      result.push(childResult);
    }

    return result.filter(Boolean);
  }

  visitChamadaFuncao(ctx: ChamadaFuncaoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitChamadaFuncao`, ctx));
    sb.append(this.PAD(), `(await runtime.callFunction(`, `\n`);

    this.pad++;

    // Nome da função
    sb.append(this.PAD(), `"${ctx.ID().getText()}",`, `\n`);

    // Escopo
    sb.append(this.PAD(), `"${ctx.escopoBiblioteca()?.ID()?.getText() ?? ""}",`, `\n`);

    // Expressões
    const expr = ctx.listaExpressoes();

    if (expr) {
      sb.append(this.visit(expr));
    }

    this.pad--;

    sb.append(this.PAD(), `))`, `\n`);

    return sb.toString();
  }

  visitReferenciaArray(ctx: ReferenciaArrayContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitReferenciaArray`, ctx));
    sb.append(this.visitReferenciaParaVariavel(ctx).trimEnd());
    sb.append(`.value[\n`);

    this.pad++;

    sb.append(this.visit(ctx.indiceArray().expressao())?.trimEnd(), `.value`, `\n`);

    this.pad--;

    sb.append(this.PAD(), `]`, `\n`);

    return sb.toString();
  }

  visitReferenciaMatriz(ctx: ReferenciaMatrizContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitReferenciaMatriz`, ctx));
    sb.append(this.visitReferenciaParaVariavel(ctx).trimEnd());
    sb.append(`.value`, `\n`);

    for (const idx of ctx.indiceArray()) {
      this.pad++;

      sb.append(this.PAD(), `[`, `\n`);

      this.pad++;

      sb.append(this.visit(idx.expressao())?.trimEnd(), `.value`, `\n`);

      this.pad--;

      sb.append(this.PAD(), `].value`, `\n`);

      this.pad--;
    }

    sb.pop();
    sb.pop();
    sb.append(`]`, `\n`);

    return sb.toString();
  }

  visitMenosUnario(ctx: MenosUnarioContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitMenosUnario`, ctx));
    sb.append(this.PAD(), `runtime.applyModifier(`, "\n");

    this.pad++;

    sb.append(this.PAD(), `"-"`, ",\n");
    sb.append(this.visit(ctx.expressao()));

    this.pad--;

    sb.append(this.PAD(), `)`, "\n");

    return sb.toString();
  }

  visitMaisUnario(ctx: MaisUnarioContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitMaisUnario`, ctx));
    sb.append(this.PAD(), `runtime.applyModifier(`, "\n");

    this.pad++;

    sb.append(this.PAD(), `"+"`, ",\n");
    sb.append(this.visit(ctx.expressao()));

    this.pad--;

    sb.append(this.PAD(), `)`, "\n");

    return sb.toString();
  }

  visitNegacao(ctx: NegacaoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitNegacao`, ctx));
    sb.append(this.PAD(), `runtime.applyModifier(`, "\n");

    this.pad++;

    sb.append(this.PAD(), `"!"`, ",\n");
    sb.append(this.visit(ctx.expressao()));

    this.pad--;

    sb.append(this.PAD(), `)`, "\n");

    return sb.toString();
  }

  visitNegacaoBitwise(ctx: NegacaoBitwiseContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitNegacaoBitwise`, ctx));
    sb.append(this.PAD(), `runtime.applyModifier(`, "\n");

    this.pad++;

    sb.append(this.PAD(), `"~"`, ",\n");
    sb.append(this.visit(ctx.expressao()));

    this.pad--;

    sb.append(this.PAD(), `)`, "\n");

    return sb.toString();
  }

  visitIncrementoUnarioPosfixado(ctx: IncrementoUnarioPosfixadoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitIncrementoUnarioPosfixado`, ctx));
    sb.append(this.PAD(), `(() => {`, `\n`);

    this.pad++;

    sb.append(this.PAD(), `const pre = scope.variables["${ctx.ID().getText()}"].clone();`, `\n\n`);
    sb.append(this.PAD(), `runtime.assign([`, `\n`);

    this.pad++;

    sb.append(this.PAD(), `scope.variables["${ctx.ID().getText()}"],`, `\n`);
    sb.append(this.PAD(), `runtime.mathOperation("+", [`, `\n`);

    this.pad++;

    sb.append(this.PAD(), `scope.variables["${ctx.ID().getText()}"],`, `\n`);
    sb.append(this.PAD(), `new PortugolVar("inteiro", 1),`, `\n`);

    this.pad--;

    sb.append(this.PAD(), `]),`, `\n`);

    this.pad--;

    sb.append(this.PAD(), `]);`, `\n\n`);
    sb.append(this.PAD(), `return pre;`, `\n`);

    this.pad--;

    sb.append(this.PAD(), `})()`, `\n`);

    return sb.toString();
  }

  visitDecrementoUnarioPosfixado(ctx: DecrementoUnarioPosfixadoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitDecrementoUnarioPosfixado`, ctx));
    sb.append(this.PAD(), `(() => {`, `\n`);

    this.pad++;

    sb.append(this.PAD(), `const pre = scope.variables["${ctx.ID().getText()}"].clone();`, `\n\n`);
    sb.append(this.PAD(), `runtime.assign([`, `\n`);

    this.pad++;

    sb.append(this.PAD(), `scope.variables["${ctx.ID().getText()}"],`, `\n`);
    sb.append(this.PAD(), `runtime.mathOperation("-", [`, `\n`);

    this.pad++;

    sb.append(this.PAD(), `scope.variables["${ctx.ID().getText()}"],`, `\n`);
    sb.append(this.PAD(), `new PortugolVar("inteiro", 1),`, `\n`);

    this.pad--;

    sb.append(this.PAD(), `]),`, `\n`);

    this.pad--;

    sb.append(this.PAD(), `]);`, `\n\n`);
    sb.append(this.PAD(), `return pre;`, `\n`);

    this.pad--;

    sb.append(this.PAD(), `})()`, `\n`);

    return sb.toString();
  }

  visitIncrementoUnarioPrefixado(ctx: IncrementoUnarioPrefixadoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitIncrementoUnarioPrefixado`, ctx));
    sb.append(this.PAD(), `runtime.assign([`, `\n`);

    this.pad++;

    sb.append(this.PAD(), `scope.variables["${ctx.ID().getText()}"],`, `\n`);
    sb.append(this.PAD(), `runtime.mathOperation("+", [`, `\n`);

    this.pad++;

    sb.append(this.PAD(), `scope.variables["${ctx.ID().getText()}"],`, `\n`);
    sb.append(this.PAD(), `new PortugolVar("inteiro", 1),`, `\n`);

    this.pad--;

    sb.append(this.PAD(), `])`, `\n`);

    this.pad--;

    sb.append(this.PAD(), `])`, `\n`);
    sb.append(super.visitChildren(ctx));

    return sb.toString();
  }

  visitDecrementoUnarioPrefixado(ctx: DecrementoUnarioPrefixadoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitDecrementoUnarioPrefixado`, ctx));
    sb.append(this.PAD(), `runtime.assign([`, `\n`);

    this.pad++;

    sb.append(this.PAD(), `scope.variables["${ctx.ID().getText()}"],`, `\n`);
    sb.append(this.PAD(), `runtime.mathOperation("-", [`, `\n`);

    this.pad++;

    sb.append(this.PAD(), `scope.variables["${ctx.ID().getText()}"],`, `\n`);
    sb.append(this.PAD(), `new PortugolVar("inteiro", 1),`, `\n`);

    this.pad--;

    sb.append(this.PAD(), `])`, `\n`);

    this.pad--;

    sb.append(this.PAD(), `])`, `\n`);
    sb.append(super.visitChildren(ctx));

    return sb.toString();
  }

  visitOperacaoMatematica(
    ctx:
      | MultiplicacaoContext
      | DivisaoContext
      | ModuloContext
      | AdicaoContext
      | SubtracaoContext
      | OperacaoShiftLeftContext
      | OperacaoShiftRightContext,
  ) {
    const sb = new StringBuilder();

    const op =
      ctx instanceof MultiplicacaoContext
        ? "*"
        : ctx instanceof DivisaoContext
          ? "/"
          : ctx instanceof ModuloContext
            ? "%"
            : ctx instanceof AdicaoContext
              ? "+"
              : ctx instanceof SubtracaoContext
                ? "-"
                : ctx instanceof OperacaoShiftLeftContext
                  ? "<<"
                  : ctx instanceof OperacaoShiftRightContext
                    ? ">>"
                    : "?";

    sb.append(this.PAD(), `runtime.mathOperation("${op}", [`, `\n`);

    this.pad++;

    const exprs = ctx.expressao();

    for (const expr of exprs) {
      sb.append(super.visit(expr)?.trimEnd());
      sb.append(",", `\n`);
    }

    this.pad--;

    sb.append(this.PAD(), `])`, `\n`);

    return sb.toString();
  }

  visitOperacaoBitwise(
    ctx:
      | OperacaoAndBitwiseContext
      | OperacaoOrBitwiseContext
      | OperacaoXorContext
      | OperacaoShiftLeftContext
      | OperacaoShiftRightContext,
  ) {
    const sb = new StringBuilder();

    const op =
      ctx instanceof OperacaoAndBitwiseContext
        ? "&"
        : ctx instanceof OperacaoOrBitwiseContext
          ? "|"
          : ctx instanceof OperacaoXorContext
            ? "^"
            : ctx instanceof OperacaoShiftLeftContext
              ? "<<"
              : ctx instanceof OperacaoShiftRightContext
                ? ">>"
                : "?";

    sb.append(this.PAD(), `runtime.bitwiseOperation("${op}", [`, `\n`);

    this.pad++;

    const exprs = ctx.expressao();

    for (const expr of exprs) {
      sb.append(super.visit(expr)?.trimEnd());
      sb.append(",", `\n`);
    }

    this.pad--;

    sb.append(this.PAD(), `])`, `\n`);

    return sb.toString();
  }

  visitMultiplicacao(ctx: MultiplicacaoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitMultiplicacao`, ctx));
    sb.append(this.visitOperacaoMatematica(ctx));

    return sb.toString();
  }

  visitDivisao(ctx: DivisaoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitDivisao`, ctx));
    sb.append(this.visitOperacaoMatematica(ctx));

    return sb.toString();
  }

  visitModulo(ctx: ModuloContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitModulo`, ctx));
    sb.append(this.visitOperacaoMatematica(ctx));

    return sb.toString();
  }

  visitAdicao(ctx: AdicaoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitAdicao`, ctx));
    sb.append(this.visitOperacaoMatematica(ctx));

    return sb.toString();
  }

  visitSubtracao(ctx: SubtracaoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitSubtracao`, ctx));
    sb.append(this.visitOperacaoMatematica(ctx));

    return sb.toString();
  }

  visitOperacaoComparacao(
    ctx:
      | OperacaoIgualdadeContext
      | OperacaoDiferencaContext
      | OperacaoMaiorContext
      | OperacaoMenorContext
      | OperacaoMaiorIgualContext
      | OperacaoMenorIgualContext
      | OperacaoELogicoContext
      | OperacaoOuLogicoContext
      | OperacaoAndBitwiseContext
      | OperacaoOrBitwiseContext
      | OperacaoXorContext,
  ) {
    const sb = new StringBuilder();

    const op =
      ctx instanceof OperacaoIgualdadeContext
        ? "=="
        : ctx instanceof OperacaoDiferencaContext
          ? "!="
          : ctx instanceof OperacaoMaiorContext
            ? ">"
            : ctx instanceof OperacaoMenorContext
              ? "<"
              : ctx instanceof OperacaoMaiorIgualContext
                ? ">="
                : ctx instanceof OperacaoMenorIgualContext
                  ? "<="
                  : ctx instanceof OperacaoELogicoContext
                    ? "&&"
                    : ctx instanceof OperacaoOuLogicoContext
                      ? "||"
                      : ctx instanceof OperacaoAndBitwiseContext
                        ? "&"
                        : ctx instanceof OperacaoOrBitwiseContext
                          ? "|"
                          : ctx instanceof OperacaoXorContext
                            ? "^"
                            : "?";

    sb.append(this.PAD(), `new PortugolVar("logico", (`, `\n`);

    this.pad++;

    const exprs = ctx.expressao();

    for (let i = 0; i < exprs.length; i++) {
      sb.append(super.visit(exprs[i])?.trimEnd(), `.value`);

      if (i < exprs.length - 1) {
        sb.append(` ${op} `, `\n`);
      }
    }

    this.pad--;

    sb.append(`\n`, this.PAD(), `))`, `\n`);

    return sb.toString();
  }

  visitOperacaoIgualdade(ctx: OperacaoIgualdadeContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitOperacaoIgualdade`, ctx));
    sb.append(this.visitOperacaoComparacao(ctx));

    return sb.toString();
  }

  visitOperacaoDiferenca(ctx: OperacaoDiferencaContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitOperacaoDiferenca`, ctx));
    sb.append(this.visitOperacaoComparacao(ctx));

    return sb.toString();
  }

  visitOperacaoMaior(ctx: OperacaoMaiorContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitOperacaoMaior`, ctx));
    sb.append(this.visitOperacaoComparacao(ctx));

    return sb.toString();
  }

  visitOperacaoMenor(ctx: OperacaoMenorContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitOperacaoMenor`, ctx));
    sb.append(this.visitOperacaoComparacao(ctx));

    return sb.toString();
  }

  visitOperacaoMenorIgual(ctx: OperacaoMenorIgualContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitOperacaoMenorIgual`, ctx));
    sb.append(this.visitOperacaoComparacao(ctx));

    return sb.toString();
  }

  visitOperacaoMaiorIgual(ctx: OperacaoMaiorIgualContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitOperacaoMaiorIgual`, ctx));
    sb.append(this.visitOperacaoComparacao(ctx));

    return sb.toString();
  }

  visitOperacaoELogico(ctx: OperacaoELogicoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitOperacaoELogico`, ctx));
    sb.append(this.visitOperacaoComparacao(ctx));

    return sb.toString();
  }

  visitOperacaoOuLogico(ctx: OperacaoOuLogicoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitOperacaoOuLogico`, ctx));
    sb.append(this.visitOperacaoComparacao(ctx));

    return sb.toString();
  }

  visitOperacaoXor(ctx: OperacaoXorContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitOperacaoXor`, ctx));
    sb.append(this.visitOperacaoBitwise(ctx));

    return sb.toString();
  }

  visitOperacaoShiftLeft(ctx: OperacaoShiftLeftContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitOperacaoShiftLeft`, ctx));
    sb.append(this.visitOperacaoBitwise(ctx));

    return sb.toString();
  }

  visitOperacaoShiftRight(ctx: OperacaoShiftRightContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitOperacaoShiftRight`, ctx));
    sb.append(this.visitOperacaoBitwise(ctx));

    return sb.toString();
  }

  visitOperacaoAndBitwise(ctx: OperacaoAndBitwiseContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitOperacaoAndBitwise`, ctx));
    sb.append(this.visitOperacaoBitwise(ctx));

    return sb.toString();
  }

  visitOperacaoOrBitwise(ctx: OperacaoOrBitwiseContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitOperacaoOrBitwise`, ctx));
    sb.append(this.visitOperacaoBitwise(ctx));

    return sb.toString();
  }

  visitReferenciaParaVariavel(ctx: ReferenciaParaVariavelContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitReferenciaParaVariavel`, ctx));

    const libScope = ctx.escopoBiblioteca()?.ID();

    if (libScope) {
      sb.append(
        this.PAD(),
        `runtime.libs[runtime.globalScope.libAliases["${libScope}"]]["${ctx.ID().getText()}"]`,
        `\n`,
      );
    } else {
      sb.append(this.PAD(), `scope.variables["${ctx.ID().getText()}"]`, `\n`);
    }

    return sb.toString();
  }

  visitNumeroInteiro(ctx: NumeroInteiroContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitNumeroInteiro`, ctx));
    sb.append(
      this.PAD(),
      `new PortugolVar("inteiro", ${ctx.INT()?.getText() ?? ctx.HEXADECIMAL()?.getText() ?? ""})`,
      `\n`,
    );

    return sb.toString();
  }

  visitNumeroReal(ctx: NumeroRealContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitNumeroReal`, ctx));
    sb.append(this.PAD(), `new PortugolVar("real", ${ctx.REAL().getText()})`, `\n`);

    return sb.toString();
  }

  visitValorLogico(ctx: ValorLogicoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitValorLogico`, ctx));
    sb.append(this.PAD(), `new PortugolVar("logico", ${ctx.LOGICO().getText() === "verdadeiro"})`, `\n`);

    return sb.toString();
  }

  visitCaracter(ctx: CaracterContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitCaracter`, ctx));
    sb.append(this.PAD(), `new PortugolVar("caracter", ${ctx.CARACTER().getText()})`, `\n`);

    return sb.toString();
  }

  visitString(ctx: StringContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitString`, ctx));
    sb.append(this.PAD(), `new PortugolVar("cadeia", ${ctx.STRING().getText()})`, `\n`);

    return sb.toString();
  }

  visitExpressaoEntreParenteses(ctx: ExpressaoEntreParentesesContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitExpressaoEntreParenteses`, ctx));
    sb.append(this.PAD(), `(`, `\n`);

    this.pad++;
    sb.append(super.visitChildren(ctx));
    this.pad--;

    sb.append(this.PAD(), `)`, `\n`);

    return sb.toString();
  }

  visitAtribuicaoCompostaSoma(ctx: AtribuicaoCompostaSomaContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitAtribuicaoCompostaSoma`, ctx));
    sb.append(this.visitAtribuicaoComposta(ctx));

    return sb.toString();
  }

  visitAtribuicaoCompostaSubtracao(ctx: AtribuicaoCompostaSubtracaoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitAtribuicaoCompostaSubtracao`, ctx));
    sb.append(this.visitAtribuicaoComposta(ctx));

    return sb.toString();
  }

  visitAtribuicaoCompostaMultiplicacao(ctx: AtribuicaoCompostaMultiplicacaoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitAtribuicaoCompostaMultiplicacao`, ctx));
    sb.append(this.visitAtribuicaoComposta(ctx));

    return sb.toString();
  }

  visitAtribuicaoCompostaDivisao(ctx: AtribuicaoCompostaDivisaoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitAtribuicaoCompostaDivisao`, ctx));
    sb.append(this.visitAtribuicaoComposta(ctx));

    return sb.toString();
  }

  visitArquivo(ctx: ArquivoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitArquivo`, ctx));
    sb.append(`(async (initScope) => {`, `\n`);

    this.pad++;

    sb.append(this.PAD(), `const runtime = new PortugolRuntime(initScope);`, `\n\n`);
    sb.append(this.PAD(), `self.runtime = runtime;`, `\n\n`);
    sb.append(this.PAD(), `let scope = runtime.globalScope;`, `\n\n`);
    sb.append(super.visitChildren(ctx));
    sb.append(`\n`, this.PAD(), `await runtime.callFunction("inicio");\n})`);

    this.pad--;

    return sb.toString();
  }

  visitInclusaoBiblioteca(ctx: InclusaoBibliotecaContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitInclusaoBiblioteca`, ctx));
    sb.append(
      this.PAD(),
      `runtime.loadLibrary(${ctx
        .ID()
        .map(x => `"${x.getText()}"`)
        .join(", ")});`,
      `\n`,
    );

    return sb.toString();
  }

  visitListaDeclaracoes(ctx: ListaDeclaracoesContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitListaDeclaracoes`, ctx));

    const declrs = ctx.declaracao();

    for (let i = 0; i < declrs.length; i++) {
      const declr = declrs[i];
      const [arr, mtrx, varb] = [declr.declaracaoArray(), declr.declaracaoMatriz(), declr.declaracaoVariavel()];
      const scopeStr = this.hasScope ? "scope" : "runtime.globalScope";

      if (varb) {
        const expr = varb.expressao();

        if (varb.OP_ATRIBUICAO() && expr) {
          sb.append(this.PAD(), `${scopeStr}.variables["${varb.ID().getText()}"] = new PortugolVar(`);
          sb.append(`"${ctx.TIPO().getText()}"`, `, undefined)`, `\n`);

          sb.append(this.PAD(), `runtime.assign([`, `\n`);

          this.pad++;

          sb.append(this.PAD(), `${scopeStr}.variables["${varb.ID().getText()}"]`, `,`, `\n`);
          sb.append(this.visit(expr));

          this.pad--;

          sb.append(this.PAD(), `])`, `\n`);
        } else {
          sb.append(this.PAD(), `${scopeStr}.variables["${varb.ID().getText()}"] = new PortugolVar(`);
          sb.append(`"${ctx.TIPO().getText()}"`, `, undefined)`, `\n`);
        }

        if (ctx.CONSTANTE()) {
          sb.append(this.PAD(), `${scopeStr}.variables["${varb.ID().getText()}"].isConstant = true`, `\n`);
        }
      }

      if (mtrx) {
        const init = mtrx.inicializacaoMatriz();

        if (mtrx.OP_ATRIBUICAO() && init) {
          sb.append(this.PAD(), `${scopeStr}.variables["${mtrx.ID().getText()}"] = new PortugolVar(`);
          sb.append(`"matriz", `, this.visit(init)?.trim(), `)`, `\n`);

          const rows_length = Number.parseInt(mtrx.linhaMatriz()?.getText() ?? "0");
          const cols_length = Number.parseInt(mtrx.colunaMatriz()?.getText() ?? "0");

          if (rows_length > 0 && cols_length > 0) {
            const str = init.getText();
            const matrizStr = str.match(/{{(.+)}}/)?.[1];
            const linhas = matrizStr?.split("},{");
            const tamanho_matriz = linhas?.map(linha => linha.split(",").length);
            const matriz_rows_length = tamanho_matriz?.length ?? 0;

            const todas_colunas_iguais = tamanho_matriz?.every(coluna => coluna <= cols_length);

            if (rows_length < matriz_rows_length || !todas_colunas_iguais) {
              const message = `Você está atribuindo um conjunto de valores maior que o tamanho da matriz (${mtrx.ID().getText()})`;

              captureException("visitListaDeclaracoes", {
                extra: { text: message },
              });
              PortugolJs.thrown.visitListaDeclaracoes = true;

              sb.append(`throw new Error("${message}")`);
            }
          } else {
            const message = `Você precisa informar o tamanho das linhas e colunas da matriz (${mtrx.ID().getText()})`;

            captureException("visitListaDeclaracoes", {
              extra: { text: message },
            });
            PortugolJs.thrown.visitListaDeclaracoes = true;

            sb.append(`throw new Error("${message}")`);
          }
        } else {
          sb.append(this.PAD(), `${scopeStr}.variables["${mtrx.ID().getText()}"] = new PortugolVar(`);
          sb.append(`"matriz", `);

          const rows = mtrx.linhaMatriz();
          const cols = mtrx.colunaMatriz();

          if (rows) {
            sb.append(`\n`);

            this.pad++;

            sb.append(this.PAD(), `new Array(`, `\n`);

            this.pad++;

            sb.append(this.visit(rows.tamanhoArray().expressao()));
            sb.append(this.PAD(), `.value`, `\n`);

            this.pad--;

            sb.append(this.PAD(), `).fill(0).map(() => new PortugolVar("vetor", `);

            this.pad++;

            if (cols) {
              sb.append(`\n`);

              this.pad++;

              sb.append(this.PAD(), `new Array(`, `\n`);

              this.pad++;

              sb.append(this.visit(cols.tamanhoArray().expressao()));
              sb.append(this.PAD(), `.value`, `\n`);

              this.pad--;

              sb.append(this.PAD(), `).fill(0).map(() => new PortugolVar("${ctx.TIPO().getText()}", undefined))`, `\n`);

              this.pad--;

              sb.append(this.PAD(), `)`, `\n`);
            } else {
              sb.append(`[])`, `\n`);
            }

            this.pad--;

            sb.append(this.PAD(), `)`, `\n`);

            this.pad--;

            sb.append(this.PAD());
          } else {
            sb.append(`[]`);
          }

          sb.append(`)`, `\n`);
        }
      }

      if (arr) {
        const init = arr.inicializacaoArray();

        if (arr.OP_ATRIBUICAO() && init) {
          sb.append(this.PAD(), `${scopeStr}.variables["${arr.ID().getText()}"] = `);
          sb.append(this.visit(init)?.trim(), `\n`);

          const array_length = Number.parseInt(arr.tamanhoArray()?.getText() ?? "0");

          if (array_length > 0) {
            const match = arr.getText().match(/{([^}]*)}/);
            const items_array = match ? match[1].split(",") : [];

            if (array_length < items_array.length) {
              const message = `Você está atribuindo um conjunto de valores maior que o tamanho do vetor (${arr.ID().getText()})`;

              captureException("visitListaDeclaracoes", {
                extra: { text: message },
              });
              PortugolJs.thrown.visitListaDeclaracoes = true;

              sb.append(`throw new Error("${message}")`);
            }
          } else {
            const message = `Você precisa informar o tamanho do vetor (${arr.ID().getText()}) e que ele seja maior que 0`;

            captureException("visitListaDeclaracoes", {
              extra: { text: message },
            });
            PortugolJs.thrown.visitListaDeclaracoes = true;

            sb.append(`throw new Error("${message}")`);
          }
        } else {
          sb.append(this.PAD(), `${scopeStr}.variables["${arr.ID().getText()}"] = new PortugolVar(`);
          sb.append(`"vetor", `);

          const tam = arr.tamanhoArray();

          if (tam) {
            sb.append(`\n`);

            this.pad++;

            sb.append(this.PAD(), `new Array(`, `\n`);

            this.pad++;

            sb.append(this.visit(tam.expressao()));
            sb.append(this.PAD(), `.value`, `\n`);

            this.pad--;

            sb.append(this.PAD(), `).fill(0).map(() => new PortugolVar("${ctx.TIPO().getText()}", undefined))`, `\n`);

            this.pad--;
          } else {
            sb.append(`[]`);
          }

          sb.append(`)`, `\n`);
        }
      }
    }

    return sb.toString();
  }

  // TODO
  visitDeclaracao(ctx: DeclaracaoContext) {
    const sb = new StringBuilder();

    if (!PortugolJs.thrown.visitDeclaracao) {
      captureException("visitDeclaracao", { extra: { text: ctx.getText() } });
      PortugolJs.thrown.visitDeclaracao = true;
    }

    sb.append(this.DEBUG(`visitDeclaracao`, ctx));
    sb.append(super.visitChildren(ctx));

    return sb.toString();
  }

  visitDeclaracaoVariavel(ctx: DeclaracaoVariavelContext) {
    const sb = new StringBuilder();

    if (!PortugolJs.thrown.visitDeclaracaoVariavel) {
      captureException("visitDeclaracaoVariavel", {
        extra: { text: ctx.getText() },
      });
      PortugolJs.thrown.visitDeclaracaoVariavel = true;
    }

    sb.append(this.DEBUG(`visitDeclaracaoVariavel`, ctx));

    throw new Error("Not implemented");

    return sb.toString();
  }

  // TODO
  visitDeclaracaoMatriz(ctx: DeclaracaoMatrizContext) {
    const sb = new StringBuilder();

    if (!PortugolJs.thrown.visitDeclaracaoMatriz) {
      captureException("visitDeclaracaoMatriz", { extra: { text: ctx.getText() } });
      PortugolJs.thrown.visitDeclaracaoMatriz = true;
    }

    sb.append(this.DEBUG(`visitDeclaracaoMatriz`, ctx));
    sb.append(super.visitChildren(ctx));

    return sb.toString();
  }

  visitInicializacaoMatriz(ctx: InicializacaoMatrizContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitInicializacaoMatriz`, ctx));
    sb.append(this.PAD(), `[`, `\n`);

    this.pad++;

    for (const child of ctx.children) {
      if (child instanceof InicializacaoArrayContext) {
        sb.append(this.visit(child));
        sb.append(this.PAD(), `,`, `\n`);
      }
    }

    this.pad--;

    sb.append(this.PAD(), `]`, `\n`);

    return sb.toString();
  }

  // TODO
  visitLinhaMatriz(ctx: LinhaMatrizContext) {
    const sb = new StringBuilder();

    if (!PortugolJs.thrown.visitLinhaMatriz) {
      captureException("visitLinhaMatriz", { extra: { text: ctx.getText() } });
      PortugolJs.thrown.visitLinhaMatriz = true;
    }

    sb.append(this.DEBUG(`visitLinhaMatriz`, ctx));
    sb.append(super.visitChildren(ctx));

    return sb.toString();
  }

  // TODO
  visitColunaMatriz(ctx: ColunaMatrizContext) {
    const sb = new StringBuilder();

    if (!PortugolJs.thrown.visitColunaMatriz) {
      captureException("visitColunaMatriz", { extra: { text: ctx.getText() } });
      PortugolJs.thrown.visitColunaMatriz = true;
    }

    sb.append(this.DEBUG(`visitColunaMatriz`, ctx));
    sb.append(super.visitChildren(ctx));

    return sb.toString();
  }

  // TODO
  visitDeclaracaoArray(ctx: DeclaracaoArrayContext) {
    const sb = new StringBuilder();

    if (!PortugolJs.thrown.visitDeclaracaoArray) {
      captureException("visitDeclaracaoArray", { extra: { text: ctx.getText() } });
      PortugolJs.thrown.visitDeclaracaoArray = true;
    }

    sb.append(this.DEBUG(`visitDeclaracaoArray`, ctx));
    sb.append(super.visitChildren(ctx));

    return sb.toString();
  }

  visitInicializacaoArray(ctx: InicializacaoArrayContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitInicializacaoArray`, ctx));
    sb.append(this.PAD(), `new PortugolVar("vetor",`, `\n`);

    this.pad++;

    sb.append(super.visitChildren(ctx));

    this.pad--;

    sb.append(this.PAD(), `)`, `\n`);

    return sb.toString();
  }

  // TODO
  visitTamanhoArray(ctx: TamanhoArrayContext) {
    const sb = new StringBuilder();

    if (!PortugolJs.thrown.visitTamanhoArray) {
      captureException("visitTamanhoArray", { extra: { text: ctx.getText() } });
      PortugolJs.thrown.visitTamanhoArray = true;
    }

    sb.append(this.DEBUG(`visitTamanhoArray`, ctx));
    sb.append(super.visitChildren(ctx));

    return sb.toString();
  }

  visitDeclaracaoFuncao(ctx: DeclaracaoFuncaoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitDeclaracaoFuncao`, ctx));
    sb.append(this.PAD(), `runtime.declareFunction("${ctx.ID().getText()}", async (...args) => {`, `\n`);

    this.hasScope = true;
    this.pad++;

    sb.append(this.PAD(), `let scope = runtime.getScope(runtime.globalScope);`, `\n\n`);
    sb.append(super.visitChildren(ctx));

    this.pad--;
    this.hasScope = false;

    sb.append(`\n`, this.PAD(), `});`, `\n`);

    return sb.toString();
  }

  // TODO
  visitParametroFuncao(ctx: ParametroFuncaoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitParametroFuncao`, ctx));
    sb.append(super.visitChildren(ctx));

    return sb.toString();
  }

  visitListaParametros(ctx: ListaParametrosContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitListaParametros`, ctx));

    const params = ctx.parametro();

    sb.append(this.PAD(), `runtime.checkParams(`, `args, [`, `\n`);

    this.pad++;

    for (const param of params) {
      let type: string;

      if (param.parametroArray()) {
        type = "vetor";
      } else if (param.parametroMatriz()) {
        type = "matriz";
      } else {
        type = param.TIPO().getText();
      }

      sb.append(
        this.PAD(),
        `{ name: "${param.ID().getText()}", type: "${type}", reference: ${Boolean(param.E_COMERCIAL())} },`,
        `\n`,
      );
    }

    this.pad--;

    sb.append(this.PAD(), `]`, `);`, `\n\n`);

    for (let i = 0; i < params.length; i++) {
      const param = params[i];

      if (param.E_COMERCIAL()) {
        sb.append(this.PAD(), `scope.variables["${param.ID().getText()}"] = args[${i}];`, `\n`);
      } else {
        sb.append(this.PAD(), `scope.variables["${param.ID().getText()}"] = args[${i}].clone();`, `\n`);
      }
    }

    return sb.toString();
  }

  // TODO
  visitParametro(ctx: ParametroContext) {
    const sb = new StringBuilder();

    if (!PortugolJs.thrown.visitParametro) {
      captureException("visitParametro", { extra: { text: ctx.getText() } });
      PortugolJs.thrown.visitParametro = true;
    }

    sb.append(this.DEBUG(`visitParametro`, ctx));
    sb.append(super.visitChildren(ctx));

    return sb.toString();
  }

  // TODO
  visitParametroArray(ctx: ParametroArrayContext) {
    const sb = new StringBuilder();

    if (!PortugolJs.thrown.visitParametroArray) {
      captureException("visitParametroArray", { extra: { text: ctx.getText() } });
      PortugolJs.thrown.visitParametroArray = true;
    }

    sb.append(this.DEBUG(`visitParametroArray`, ctx));
    sb.append(super.visitChildren(ctx));

    return sb.toString();
  }

  // TODO
  visitParametroMatriz(ctx: ParametroMatrizContext) {
    const sb = new StringBuilder();

    if (!PortugolJs.thrown.visitParametroMatriz) {
      captureException("visitParametroMatriz", { extra: { text: ctx.getText() } });
      PortugolJs.thrown.visitParametroMatriz = true;
    }

    sb.append(this.DEBUG(`visitParametroMatriz`, ctx));
    sb.append(super.visitChildren(ctx));

    return sb.toString();
  }

  visitComando(ctx: ComandoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitComando`, ctx));
    sb.append(`\n`, `${super.visitChildren(ctx)?.trimEnd()};`, `\n`);

    return sb.toString();
  }

  visitAtribuicao(ctx: AtribuicaoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitAtribuicao`, ctx));
    sb.append(this.PAD(), `runtime.assign([`, `\n`);

    this.pad++;

    const exprs = ctx.expressao();

    for (const expr of exprs) {
      const exprResult = this.visit(expr);

      sb.append(exprResult?.trimEnd(), ",", `\n`);
    }

    this.pad--;

    sb.append(this.PAD(), `])`, `\n`);

    return sb.toString();
  }

  visitAtribuicaoComposta(ctx: AtribuicaoCompostaContext) {
    const sb = new StringBuilder();

    const op =
      ctx instanceof AtribuicaoCompostaSomaContext
        ? "+"
        : ctx instanceof AtribuicaoCompostaSubtracaoContext
          ? "-"
          : ctx instanceof AtribuicaoCompostaDivisaoContext
            ? "/"
            : ctx instanceof AtribuicaoCompostaMultiplicacaoContext
              ? "*"
              : "?";

    sb.append(this.DEBUG(`visitAtribuicaoComposta`, ctx));
    sb.append(this.PAD(), `runtime.assign([`, `\n`);

    this.pad++;

    const exprs = (ctx as unknown as AtribuicaoCompostaSomaContext).expressao();
    const first = exprs.shift();

    if (first) {
      sb.append(super.visit(first)?.trimEnd(), `,\n`);
      sb.append(this.PAD(), `runtime.mathOperation("`, op, `", [`, `\n`);

      this.pad++;

      sb.append(super.visit(first)?.trimEnd(), ",", `\n`);

      for (const expr of exprs) {
        sb.append(super.visit(expr)?.trimEnd(), ",\n");
      }

      this.pad--;

      sb.append(this.PAD(), "])", ",", `\n`);
    }

    this.pad--;

    sb.append(this.PAD(), `])`, `\n`);

    return sb.toString();
  }

  visitRetorne(ctx: RetorneContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitRetorne`, ctx));

    sb.append(this.PAD(), `return (`, `\n`);

    this.pad++;

    const expr = ctx.expressao();

    if (expr) {
      sb.append(this.visit(expr));
    } else {
      sb.append(this.PAD(), `new PortugolVar("vazio", undefined)`, `\n`);
    }

    this.pad--;

    sb.append(this.PAD(), `)`, `\n`);

    return sb.toString();
  }

  visitSe(ctx: SeContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitSe`, ctx));
    sb.append(this.PAD(), `if (`, `\n`);

    this.pad++;

    sb.append(this.visit(ctx.expressao()));
    sb.append(this.PAD(), `.value === true`, `\n`);

    this.pad--;

    sb.append(this.PAD(), `) {`, `\n`);

    this.pad++;

    sb.append(this.visit(ctx.listaComandos()));

    this.pad--;

    sb.append(this.PAD(), `}`, `\n`);

    const senao = ctx.senao();

    if (senao) {
      sb.append(super.visit(senao));
    }

    return sb.toString();
  }

  visitSenao(ctx: SenaoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitSenao`, ctx));
    sb.append(this.PAD(), `else {`, `\n`);

    this.pad++;

    sb.append(super.visitChildren(ctx));

    this.pad--;

    sb.append(this.PAD(), `}`, `\n`);

    return sb.toString();
  }

  visitEnquanto(ctx: EnquantoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitEnquanto`, ctx));
    sb.append(this.PAD(), `while (`, `\n`);

    this.pad++;

    sb.append(this.visit(ctx.expressao()));
    sb.append(this.PAD(), `.value === true`, `\n`);

    this.pad--;

    sb.append(this.PAD(), `) {`, `\n`);

    this.pad++;

    sb.append(this.visit(ctx.listaComandos()));

    this.pad--;

    sb.append(this.PAD(), `}`, `\n`);

    return sb.toString();
  }

  visitFacaEnquanto(ctx: FacaEnquantoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitFacaEnquanto`, ctx));
    sb.append(this.PAD(), `do {`, `\n`);

    this.pad++;

    sb.append(this.visit(ctx.listaComandos()));

    this.pad--;

    sb.append(this.PAD(), `} while (`, `\n`);

    this.pad++;

    sb.append(this.visit(ctx.expressao()));
    sb.append(this.PAD(), `.value === true`, `\n`);

    this.pad--;

    sb.append(this.PAD(), `)`, `\n`);

    return sb.toString();
  }

  visitPara(ctx: ParaContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitPara`, ctx));
    sb.append(this.PAD(), `{`, `\n`);

    this.pad++;

    const declr = ctx.inicializacaoPara()?.listaDeclaracoes() ?? ctx.inicializacaoPara()?.atribuicao();

    if (declr) {
      sb.append(this.visit(declr));
    }

    sb.append(this.PAD(), `;`, `\n`);
    sb.append(this.PAD(), `for (`, `\n`);

    this.pad++;

    sb.append(this.PAD(), `;`, `\n`);
    sb.append(this.visit(ctx.condicao()));
    sb.append(this.PAD(), `;`, `\n`);
    sb.append(this.visit(ctx.incrementoPara()));

    this.pad--;

    sb.append(this.PAD(), `) {`, `\n`);

    this.pad++;

    sb.append(this.visit(ctx.listaComandos()));

    this.pad--;

    sb.append(this.PAD(), `}`, `\n`);

    this.pad--;

    sb.append(this.PAD(), `}`, `\n`);

    return sb.toString();
  }

  // TODO
  visitListaComandos(ctx: ListaComandosContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitListaComandos`, ctx));
    sb.append(super.visitChildren(ctx));

    return sb.toString();
  }

  visitInicializacaoPara(ctx: InicializacaoParaContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitInicializacaoPara`, ctx));
    sb.append(`throw new Error("visitInicializacaoPara não implementado")`);

    return sb.toString();
  }

  visitCondicao(ctx: CondicaoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitCondicao`, ctx));
    sb.append(this.visit(ctx.expressao())?.trimEnd(), `.value === true`, `\n`);

    return sb.toString();
  }

  visitIncrementoPara(ctx: IncrementoParaContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitIncrementoPara`, ctx));
    sb.append(super.visitChildren(ctx));
    // sb.append(`throw new Error("visitIncrementoPara não implementado")`);

    return sb.toString();
  }

  visitEscolha(ctx: EscolhaContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitEscolha`, ctx));
    sb.append(this.PAD(), `switch (`, `\n`);

    this.pad++;

    sb.append(this.visit(ctx.expressao()));
    sb.append(this.PAD(), `.value`, `\n`);

    this.pad--;

    sb.append(this.PAD(), `) {`, `\n`);

    const cases = ctx.caso();

    this.pad++;

    for (const kase of cases) {
      sb.append(this.visit(kase));
    }

    this.pad--;

    sb.append(this.PAD(), `}`, `\n`);

    return sb.toString();
  }

  visitCaso(ctx: CasoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitCaso`, ctx));

    const expr = ctx.expressao();

    if (expr) {
      sb.append(this.PAD(), `case `, `\n`);

      this.pad++;

      sb.append(this.visit(expr)?.trimEnd(), `.value:`, `\n`);

      this.pad--;
    } else {
      sb.append(this.PAD(), `default:`, `\n`);
    }

    this.pad++;

    for (const cmd of ctx.comando()) {
      sb.append(this.visit(cmd));
    }

    this.pad--;

    return sb.toString();
  }

  visitPare(ctx: PareContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitPare`, ctx));
    sb.append(this.PAD(), `break`, `\n`);

    return sb.toString();
  }

  // TODO
  visitIndiceArray(ctx: IndiceArrayContext) {
    const sb = new StringBuilder();

    if (!PortugolJs.thrown.visitIndiceArray) {
      captureException("visitIndiceArray", { extra: { text: ctx.getText() } });
      PortugolJs.thrown.visitIndiceArray = true;
    }

    sb.append(this.DEBUG(`visitIndiceArray`, ctx));
    sb.append(super.visitChildren(ctx));

    return sb.toString();
  }

  // TODO ?
  visitExpressao(ctx: ExpressaoContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitExpressao`, ctx));
    sb.append(super.visitChildren(ctx));

    return sb.toString();
  }

  visitListaExpressoes(ctx: ListaExpressoesContext) {
    const sb = new StringBuilder();

    sb.append(this.DEBUG(`visitListaExpressoes`, ctx));
    sb.append(this.PAD(), `[`, `\n`);

    this.pad++;

    for (const child of this.visitChildrenArray(ctx)) {
      if (!child) {
        continue;
      }

      sb.append(child.slice(0, Math.max(0, child.length - 1)), ",\n");
    }

    this.pad--;

    sb.append(this.PAD(), `]`, `\n`);

    return sb.toString();
  }

  visitEscopoBiblioteca(ctx: EscopoBibliotecaContext) {
    const sb = new StringBuilder();

    if (!PortugolJs.thrown.visitEscopoBiblioteca) {
      captureException("visitEscopoBiblioteca", { extra: { text: ctx.getText() } });
      PortugolJs.thrown.visitEscopoBiblioteca = true;
    }

    sb.append(this.DEBUG(`visitEscopoBiblioteca`, ctx));
    // sb.append(this.PAD(), `"${ctx.ID()?.getText()}"`, `\n`);

    return sb.toString();
  }
}
