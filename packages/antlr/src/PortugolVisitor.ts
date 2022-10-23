// Generated from src/antlr/Portugol.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { ChamadaFuncaoContext } from "./PortugolParser";
import { ReferenciaArrayContext } from "./PortugolParser";
import { ReferenciaMatrizContext } from "./PortugolParser";
import { MenosUnarioContext } from "./PortugolParser";
import { MaisUnarioContext } from "./PortugolParser";
import { NegacaoContext } from "./PortugolParser";
import { NegacaoBitwiseContext } from "./PortugolParser";
import { IncrementoUnarioPosfixadoContext } from "./PortugolParser";
import { DecrementoUnarioPosfixadoContext } from "./PortugolParser";
import { IncrementoUnarioPrefixadoContext } from "./PortugolParser";
import { DecrementoUnarioPrefixadoContext } from "./PortugolParser";
import { MultiplicacaoContext } from "./PortugolParser";
import { DivisaoContext } from "./PortugolParser";
import { ModuloContext } from "./PortugolParser";
import { AdicaoContext } from "./PortugolParser";
import { SubtracaoContext } from "./PortugolParser";
import { OperacaoIgualdadeContext } from "./PortugolParser";
import { OperacaoDiferencaContext } from "./PortugolParser";
import { OperacaoMaiorContext } from "./PortugolParser";
import { OperacaoMenorContext } from "./PortugolParser";
import { OperacaoMenorIgualContext } from "./PortugolParser";
import { OperacaoMaiorIgualContext } from "./PortugolParser";
import { OperacaoELogicoContext } from "./PortugolParser";
import { OperacaoOuLogicoContext } from "./PortugolParser";
import { OperacaoXorContext } from "./PortugolParser";
import { OperacaoShiftLeftContext } from "./PortugolParser";
import { OperacaoShiftRightContext } from "./PortugolParser";
import { OperacaoAndBitwiseContext } from "./PortugolParser";
import { OperacaoOrBitwiseContext } from "./PortugolParser";
import { ReferenciaParaVariavelContext } from "./PortugolParser";
import { NumeroInteiroContext } from "./PortugolParser";
import { NumeroRealContext } from "./PortugolParser";
import { ValorLogicoContext } from "./PortugolParser";
import { CaracterContext } from "./PortugolParser";
import { StringContext } from "./PortugolParser";
import { ExpressaoEntreParentesesContext } from "./PortugolParser";
import { AtribuicaoCompostaSomaContext } from "./PortugolParser";
import { AtribuicaoCompostaSubtracaoContext } from "./PortugolParser";
import { AtribuicaoCompostaMultiplicacaoContext } from "./PortugolParser";
import { AtribuicaoCompostaDivisaoContext } from "./PortugolParser";
import { ArquivoContext } from "./PortugolParser";
import { InclusaoBibliotecaContext } from "./PortugolParser";
import { ListaDeclaracoesContext } from "./PortugolParser";
import { DeclaracaoContext } from "./PortugolParser";
import { DeclaracaoVariavelContext } from "./PortugolParser";
import { DeclaracaoMatrizContext } from "./PortugolParser";
import { InicializacaoMatrizContext } from "./PortugolParser";
import { LinhaMatrizContext } from "./PortugolParser";
import { ColunaMatrizContext } from "./PortugolParser";
import { DeclaracaoArrayContext } from "./PortugolParser";
import { InicializacaoArrayContext } from "./PortugolParser";
import { TamanhoArrayContext } from "./PortugolParser";
import { DeclaracaoFuncaoContext } from "./PortugolParser";
import { ParametroFuncaoContext } from "./PortugolParser";
import { ListaParametrosContext } from "./PortugolParser";
import { ParametroContext } from "./PortugolParser";
import { ParametroArrayContext } from "./PortugolParser";
import { ParametroMatrizContext } from "./PortugolParser";
import { ComandoContext } from "./PortugolParser";
import { AtribuicaoContext } from "./PortugolParser";
import { AtribuicaoCompostaContext } from "./PortugolParser";
import { RetorneContext } from "./PortugolParser";
import { SeContext } from "./PortugolParser";
import { SenaoContext } from "./PortugolParser";
import { EnquantoContext } from "./PortugolParser";
import { FacaEnquantoContext } from "./PortugolParser";
import { ParaContext } from "./PortugolParser";
import { ListaComandosContext } from "./PortugolParser";
import { InicializacaoParaContext } from "./PortugolParser";
import { CondicaoContext } from "./PortugolParser";
import { IncrementoParaContext } from "./PortugolParser";
import { EscolhaContext } from "./PortugolParser";
import { CasoContext } from "./PortugolParser";
import { PareContext } from "./PortugolParser";
import { IndiceArrayContext } from "./PortugolParser";
import { ExpressaoContext } from "./PortugolParser";
import { ListaExpressoesContext } from "./PortugolParser";
import { EscopoBibliotecaContext } from "./PortugolParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `PortugolParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface PortugolVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by the `chamadaFuncao`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitChamadaFuncao?: (ctx: ChamadaFuncaoContext) => Result;

	/**
	 * Visit a parse tree produced by the `referenciaArray`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitReferenciaArray?: (ctx: ReferenciaArrayContext) => Result;

	/**
	 * Visit a parse tree produced by the `referenciaMatriz`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitReferenciaMatriz?: (ctx: ReferenciaMatrizContext) => Result;

	/**
	 * Visit a parse tree produced by the `menosUnario`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMenosUnario?: (ctx: MenosUnarioContext) => Result;

	/**
	 * Visit a parse tree produced by the `maisUnario`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMaisUnario?: (ctx: MaisUnarioContext) => Result;

	/**
	 * Visit a parse tree produced by the `negacao`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNegacao?: (ctx: NegacaoContext) => Result;

	/**
	 * Visit a parse tree produced by the `negacaoBitwise`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNegacaoBitwise?: (ctx: NegacaoBitwiseContext) => Result;

	/**
	 * Visit a parse tree produced by the `incrementoUnarioPosfixado`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIncrementoUnarioPosfixado?: (ctx: IncrementoUnarioPosfixadoContext) => Result;

	/**
	 * Visit a parse tree produced by the `decrementoUnarioPosfixado`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDecrementoUnarioPosfixado?: (ctx: DecrementoUnarioPosfixadoContext) => Result;

	/**
	 * Visit a parse tree produced by the `incrementoUnarioPrefixado`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIncrementoUnarioPrefixado?: (ctx: IncrementoUnarioPrefixadoContext) => Result;

	/**
	 * Visit a parse tree produced by the `decrementoUnarioPrefixado`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDecrementoUnarioPrefixado?: (ctx: DecrementoUnarioPrefixadoContext) => Result;

	/**
	 * Visit a parse tree produced by the `multiplicacao`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMultiplicacao?: (ctx: MultiplicacaoContext) => Result;

	/**
	 * Visit a parse tree produced by the `divisao`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDivisao?: (ctx: DivisaoContext) => Result;

	/**
	 * Visit a parse tree produced by the `modulo`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitModulo?: (ctx: ModuloContext) => Result;

	/**
	 * Visit a parse tree produced by the `adicao`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAdicao?: (ctx: AdicaoContext) => Result;

	/**
	 * Visit a parse tree produced by the `subtracao`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSubtracao?: (ctx: SubtracaoContext) => Result;

	/**
	 * Visit a parse tree produced by the `operacaoIgualdade`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOperacaoIgualdade?: (ctx: OperacaoIgualdadeContext) => Result;

	/**
	 * Visit a parse tree produced by the `operacaoDiferenca`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOperacaoDiferenca?: (ctx: OperacaoDiferencaContext) => Result;

	/**
	 * Visit a parse tree produced by the `operacaoMaior`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOperacaoMaior?: (ctx: OperacaoMaiorContext) => Result;

	/**
	 * Visit a parse tree produced by the `operacaoMenor`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOperacaoMenor?: (ctx: OperacaoMenorContext) => Result;

	/**
	 * Visit a parse tree produced by the `operacaoMenorIgual`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOperacaoMenorIgual?: (ctx: OperacaoMenorIgualContext) => Result;

	/**
	 * Visit a parse tree produced by the `operacaoMaiorIgual`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOperacaoMaiorIgual?: (ctx: OperacaoMaiorIgualContext) => Result;

	/**
	 * Visit a parse tree produced by the `operacaoELogico`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOperacaoELogico?: (ctx: OperacaoELogicoContext) => Result;

	/**
	 * Visit a parse tree produced by the `operacaoOuLogico`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOperacaoOuLogico?: (ctx: OperacaoOuLogicoContext) => Result;

	/**
	 * Visit a parse tree produced by the `operacaoXor`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOperacaoXor?: (ctx: OperacaoXorContext) => Result;

	/**
	 * Visit a parse tree produced by the `operacaoShiftLeft`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOperacaoShiftLeft?: (ctx: OperacaoShiftLeftContext) => Result;

	/**
	 * Visit a parse tree produced by the `operacaoShiftRight`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOperacaoShiftRight?: (ctx: OperacaoShiftRightContext) => Result;

	/**
	 * Visit a parse tree produced by the `operacaoAndBitwise`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOperacaoAndBitwise?: (ctx: OperacaoAndBitwiseContext) => Result;

	/**
	 * Visit a parse tree produced by the `operacaoOrBitwise`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOperacaoOrBitwise?: (ctx: OperacaoOrBitwiseContext) => Result;

	/**
	 * Visit a parse tree produced by the `referenciaParaVariavel`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitReferenciaParaVariavel?: (ctx: ReferenciaParaVariavelContext) => Result;

	/**
	 * Visit a parse tree produced by the `numeroInteiro`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNumeroInteiro?: (ctx: NumeroInteiroContext) => Result;

	/**
	 * Visit a parse tree produced by the `numeroReal`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNumeroReal?: (ctx: NumeroRealContext) => Result;

	/**
	 * Visit a parse tree produced by the `valorLogico`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitValorLogico?: (ctx: ValorLogicoContext) => Result;

	/**
	 * Visit a parse tree produced by the `caracter`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCaracter?: (ctx: CaracterContext) => Result;

	/**
	 * Visit a parse tree produced by the `string`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitString?: (ctx: StringContext) => Result;

	/**
	 * Visit a parse tree produced by the `expressaoEntreParenteses`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpressaoEntreParenteses?: (ctx: ExpressaoEntreParentesesContext) => Result;

	/**
	 * Visit a parse tree produced by the `atribuicaoCompostaSoma`
	 * labeled alternative in `PortugolParser.atribuicaoComposta`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAtribuicaoCompostaSoma?: (ctx: AtribuicaoCompostaSomaContext) => Result;

	/**
	 * Visit a parse tree produced by the `atribuicaoCompostaSubtracao`
	 * labeled alternative in `PortugolParser.atribuicaoComposta`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAtribuicaoCompostaSubtracao?: (ctx: AtribuicaoCompostaSubtracaoContext) => Result;

	/**
	 * Visit a parse tree produced by the `atribuicaoCompostaMultiplicacao`
	 * labeled alternative in `PortugolParser.atribuicaoComposta`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAtribuicaoCompostaMultiplicacao?: (ctx: AtribuicaoCompostaMultiplicacaoContext) => Result;

	/**
	 * Visit a parse tree produced by the `atribuicaoCompostaDivisao`
	 * labeled alternative in `PortugolParser.atribuicaoComposta`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAtribuicaoCompostaDivisao?: (ctx: AtribuicaoCompostaDivisaoContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.arquivo`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArquivo?: (ctx: ArquivoContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.inclusaoBiblioteca`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInclusaoBiblioteca?: (ctx: InclusaoBibliotecaContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.listaDeclaracoes`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitListaDeclaracoes?: (ctx: ListaDeclaracoesContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.declaracao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDeclaracao?: (ctx: DeclaracaoContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.declaracaoVariavel`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDeclaracaoVariavel?: (ctx: DeclaracaoVariavelContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.declaracaoMatriz`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDeclaracaoMatriz?: (ctx: DeclaracaoMatrizContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.inicializacaoMatriz`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInicializacaoMatriz?: (ctx: InicializacaoMatrizContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.linhaMatriz`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLinhaMatriz?: (ctx: LinhaMatrizContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.colunaMatriz`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitColunaMatriz?: (ctx: ColunaMatrizContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.declaracaoArray`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDeclaracaoArray?: (ctx: DeclaracaoArrayContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.inicializacaoArray`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInicializacaoArray?: (ctx: InicializacaoArrayContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.tamanhoArray`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTamanhoArray?: (ctx: TamanhoArrayContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.declaracaoFuncao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDeclaracaoFuncao?: (ctx: DeclaracaoFuncaoContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.parametroFuncao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParametroFuncao?: (ctx: ParametroFuncaoContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.listaParametros`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitListaParametros?: (ctx: ListaParametrosContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.parametro`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParametro?: (ctx: ParametroContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.parametroArray`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParametroArray?: (ctx: ParametroArrayContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.parametroMatriz`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParametroMatriz?: (ctx: ParametroMatrizContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.comando`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitComando?: (ctx: ComandoContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.atribuicao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAtribuicao?: (ctx: AtribuicaoContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.atribuicaoComposta`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAtribuicaoComposta?: (ctx: AtribuicaoCompostaContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.retorne`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitRetorne?: (ctx: RetorneContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.se`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSe?: (ctx: SeContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.senao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSenao?: (ctx: SenaoContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.enquanto`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEnquanto?: (ctx: EnquantoContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.facaEnquanto`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFacaEnquanto?: (ctx: FacaEnquantoContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.para`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPara?: (ctx: ParaContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.listaComandos`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitListaComandos?: (ctx: ListaComandosContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.inicializacaoPara`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInicializacaoPara?: (ctx: InicializacaoParaContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.condicao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCondicao?: (ctx: CondicaoContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.incrementoPara`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIncrementoPara?: (ctx: IncrementoParaContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.escolha`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEscolha?: (ctx: EscolhaContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.caso`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCaso?: (ctx: CasoContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.pare`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPare?: (ctx: PareContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.indiceArray`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIndiceArray?: (ctx: IndiceArrayContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpressao?: (ctx: ExpressaoContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.listaExpressoes`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitListaExpressoes?: (ctx: ListaExpressoesContext) => Result;

	/**
	 * Visit a parse tree produced by `PortugolParser.escopoBiblioteca`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEscopoBiblioteca?: (ctx: EscopoBibliotecaContext) => Result;
}

