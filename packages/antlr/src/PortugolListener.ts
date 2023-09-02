// Generated from src/antlr/Portugol.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener.js";

import { ChamadaFuncaoContext } from "./PortugolParser.js";
import { ReferenciaArrayContext } from "./PortugolParser.js";
import { ReferenciaMatrizContext } from "./PortugolParser.js";
import { MenosUnarioContext } from "./PortugolParser.js";
import { MaisUnarioContext } from "./PortugolParser.js";
import { NegacaoContext } from "./PortugolParser.js";
import { NegacaoBitwiseContext } from "./PortugolParser.js";
import { IncrementoUnarioPosfixadoContext } from "./PortugolParser.js";
import { DecrementoUnarioPosfixadoContext } from "./PortugolParser.js";
import { IncrementoUnarioPrefixadoContext } from "./PortugolParser.js";
import { DecrementoUnarioPrefixadoContext } from "./PortugolParser.js";
import { MultiplicacaoContext } from "./PortugolParser.js";
import { DivisaoContext } from "./PortugolParser.js";
import { ModuloContext } from "./PortugolParser.js";
import { AdicaoContext } from "./PortugolParser.js";
import { SubtracaoContext } from "./PortugolParser.js";
import { OperacaoIgualdadeContext } from "./PortugolParser.js";
import { OperacaoDiferencaContext } from "./PortugolParser.js";
import { OperacaoMaiorContext } from "./PortugolParser.js";
import { OperacaoMenorContext } from "./PortugolParser.js";
import { OperacaoMenorIgualContext } from "./PortugolParser.js";
import { OperacaoMaiorIgualContext } from "./PortugolParser.js";
import { OperacaoELogicoContext } from "./PortugolParser.js";
import { OperacaoOuLogicoContext } from "./PortugolParser.js";
import { OperacaoXorContext } from "./PortugolParser.js";
import { OperacaoShiftLeftContext } from "./PortugolParser.js";
import { OperacaoShiftRightContext } from "./PortugolParser.js";
import { OperacaoAndBitwiseContext } from "./PortugolParser.js";
import { OperacaoOrBitwiseContext } from "./PortugolParser.js";
import { ReferenciaParaVariavelContext } from "./PortugolParser.js";
import { NumeroInteiroContext } from "./PortugolParser.js";
import { NumeroRealContext } from "./PortugolParser.js";
import { ValorLogicoContext } from "./PortugolParser.js";
import { CaracterContext } from "./PortugolParser.js";
import { StringContext } from "./PortugolParser.js";
import { ExpressaoEntreParentesesContext } from "./PortugolParser.js";
import { AtribuicaoCompostaSomaContext } from "./PortugolParser.js";
import { AtribuicaoCompostaSubtracaoContext } from "./PortugolParser.js";
import { AtribuicaoCompostaMultiplicacaoContext } from "./PortugolParser.js";
import { AtribuicaoCompostaDivisaoContext } from "./PortugolParser.js";
import { ArquivoContext } from "./PortugolParser.js";
import { InclusaoBibliotecaContext } from "./PortugolParser.js";
import { ListaDeclaracoesContext } from "./PortugolParser.js";
import { DeclaracaoContext } from "./PortugolParser.js";
import { DeclaracaoVariavelContext } from "./PortugolParser.js";
import { DeclaracaoMatrizContext } from "./PortugolParser.js";
import { InicializacaoMatrizContext } from "./PortugolParser.js";
import { LinhaMatrizContext } from "./PortugolParser.js";
import { ColunaMatrizContext } from "./PortugolParser.js";
import { DeclaracaoArrayContext } from "./PortugolParser.js";
import { InicializacaoArrayContext } from "./PortugolParser.js";
import { TamanhoArrayContext } from "./PortugolParser.js";
import { DeclaracaoFuncaoContext } from "./PortugolParser.js";
import { ParametroFuncaoContext } from "./PortugolParser.js";
import { ListaParametrosContext } from "./PortugolParser.js";
import { ParametroContext } from "./PortugolParser.js";
import { ParametroArrayContext } from "./PortugolParser.js";
import { ParametroMatrizContext } from "./PortugolParser.js";
import { ComandoContext } from "./PortugolParser.js";
import { AtribuicaoContext } from "./PortugolParser.js";
import { AtribuicaoCompostaContext } from "./PortugolParser.js";
import { RetorneContext } from "./PortugolParser.js";
import { SeContext } from "./PortugolParser.js";
import { SenaoContext } from "./PortugolParser.js";
import { EnquantoContext } from "./PortugolParser.js";
import { FacaEnquantoContext } from "./PortugolParser.js";
import { ParaContext } from "./PortugolParser.js";
import { ListaComandosContext } from "./PortugolParser.js";
import { InicializacaoParaContext } from "./PortugolParser.js";
import { CondicaoContext } from "./PortugolParser.js";
import { IncrementoParaContext } from "./PortugolParser.js";
import { EscolhaContext } from "./PortugolParser.js";
import { CasoContext } from "./PortugolParser.js";
import { PareContext } from "./PortugolParser.js";
import { IndiceArrayContext } from "./PortugolParser.js";
import { ExpressaoContext } from "./PortugolParser.js";
import { ListaExpressoesContext } from "./PortugolParser.js";
import { EscopoBibliotecaContext } from "./PortugolParser.js";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `PortugolParser`.
 */
export interface PortugolListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by the `chamadaFuncao`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterChamadaFuncao?: (ctx: ChamadaFuncaoContext) => void;
	/**
	 * Exit a parse tree produced by the `chamadaFuncao`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitChamadaFuncao?: (ctx: ChamadaFuncaoContext) => void;

	/**
	 * Enter a parse tree produced by the `referenciaArray`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterReferenciaArray?: (ctx: ReferenciaArrayContext) => void;
	/**
	 * Exit a parse tree produced by the `referenciaArray`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitReferenciaArray?: (ctx: ReferenciaArrayContext) => void;

	/**
	 * Enter a parse tree produced by the `referenciaMatriz`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterReferenciaMatriz?: (ctx: ReferenciaMatrizContext) => void;
	/**
	 * Exit a parse tree produced by the `referenciaMatriz`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitReferenciaMatriz?: (ctx: ReferenciaMatrizContext) => void;

	/**
	 * Enter a parse tree produced by the `menosUnario`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterMenosUnario?: (ctx: MenosUnarioContext) => void;
	/**
	 * Exit a parse tree produced by the `menosUnario`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitMenosUnario?: (ctx: MenosUnarioContext) => void;

	/**
	 * Enter a parse tree produced by the `maisUnario`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterMaisUnario?: (ctx: MaisUnarioContext) => void;
	/**
	 * Exit a parse tree produced by the `maisUnario`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitMaisUnario?: (ctx: MaisUnarioContext) => void;

	/**
	 * Enter a parse tree produced by the `negacao`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterNegacao?: (ctx: NegacaoContext) => void;
	/**
	 * Exit a parse tree produced by the `negacao`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitNegacao?: (ctx: NegacaoContext) => void;

	/**
	 * Enter a parse tree produced by the `negacaoBitwise`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterNegacaoBitwise?: (ctx: NegacaoBitwiseContext) => void;
	/**
	 * Exit a parse tree produced by the `negacaoBitwise`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitNegacaoBitwise?: (ctx: NegacaoBitwiseContext) => void;

	/**
	 * Enter a parse tree produced by the `incrementoUnarioPosfixado`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterIncrementoUnarioPosfixado?: (ctx: IncrementoUnarioPosfixadoContext) => void;
	/**
	 * Exit a parse tree produced by the `incrementoUnarioPosfixado`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitIncrementoUnarioPosfixado?: (ctx: IncrementoUnarioPosfixadoContext) => void;

	/**
	 * Enter a parse tree produced by the `decrementoUnarioPosfixado`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterDecrementoUnarioPosfixado?: (ctx: DecrementoUnarioPosfixadoContext) => void;
	/**
	 * Exit a parse tree produced by the `decrementoUnarioPosfixado`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitDecrementoUnarioPosfixado?: (ctx: DecrementoUnarioPosfixadoContext) => void;

	/**
	 * Enter a parse tree produced by the `incrementoUnarioPrefixado`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterIncrementoUnarioPrefixado?: (ctx: IncrementoUnarioPrefixadoContext) => void;
	/**
	 * Exit a parse tree produced by the `incrementoUnarioPrefixado`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitIncrementoUnarioPrefixado?: (ctx: IncrementoUnarioPrefixadoContext) => void;

	/**
	 * Enter a parse tree produced by the `decrementoUnarioPrefixado`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterDecrementoUnarioPrefixado?: (ctx: DecrementoUnarioPrefixadoContext) => void;
	/**
	 * Exit a parse tree produced by the `decrementoUnarioPrefixado`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitDecrementoUnarioPrefixado?: (ctx: DecrementoUnarioPrefixadoContext) => void;

	/**
	 * Enter a parse tree produced by the `multiplicacao`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterMultiplicacao?: (ctx: MultiplicacaoContext) => void;
	/**
	 * Exit a parse tree produced by the `multiplicacao`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitMultiplicacao?: (ctx: MultiplicacaoContext) => void;

	/**
	 * Enter a parse tree produced by the `divisao`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterDivisao?: (ctx: DivisaoContext) => void;
	/**
	 * Exit a parse tree produced by the `divisao`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitDivisao?: (ctx: DivisaoContext) => void;

	/**
	 * Enter a parse tree produced by the `modulo`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterModulo?: (ctx: ModuloContext) => void;
	/**
	 * Exit a parse tree produced by the `modulo`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitModulo?: (ctx: ModuloContext) => void;

	/**
	 * Enter a parse tree produced by the `adicao`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterAdicao?: (ctx: AdicaoContext) => void;
	/**
	 * Exit a parse tree produced by the `adicao`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitAdicao?: (ctx: AdicaoContext) => void;

	/**
	 * Enter a parse tree produced by the `subtracao`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterSubtracao?: (ctx: SubtracaoContext) => void;
	/**
	 * Exit a parse tree produced by the `subtracao`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitSubtracao?: (ctx: SubtracaoContext) => void;

	/**
	 * Enter a parse tree produced by the `operacaoIgualdade`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterOperacaoIgualdade?: (ctx: OperacaoIgualdadeContext) => void;
	/**
	 * Exit a parse tree produced by the `operacaoIgualdade`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitOperacaoIgualdade?: (ctx: OperacaoIgualdadeContext) => void;

	/**
	 * Enter a parse tree produced by the `operacaoDiferenca`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterOperacaoDiferenca?: (ctx: OperacaoDiferencaContext) => void;
	/**
	 * Exit a parse tree produced by the `operacaoDiferenca`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitOperacaoDiferenca?: (ctx: OperacaoDiferencaContext) => void;

	/**
	 * Enter a parse tree produced by the `operacaoMaior`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterOperacaoMaior?: (ctx: OperacaoMaiorContext) => void;
	/**
	 * Exit a parse tree produced by the `operacaoMaior`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitOperacaoMaior?: (ctx: OperacaoMaiorContext) => void;

	/**
	 * Enter a parse tree produced by the `operacaoMenor`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterOperacaoMenor?: (ctx: OperacaoMenorContext) => void;
	/**
	 * Exit a parse tree produced by the `operacaoMenor`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitOperacaoMenor?: (ctx: OperacaoMenorContext) => void;

	/**
	 * Enter a parse tree produced by the `operacaoMenorIgual`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterOperacaoMenorIgual?: (ctx: OperacaoMenorIgualContext) => void;
	/**
	 * Exit a parse tree produced by the `operacaoMenorIgual`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitOperacaoMenorIgual?: (ctx: OperacaoMenorIgualContext) => void;

	/**
	 * Enter a parse tree produced by the `operacaoMaiorIgual`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterOperacaoMaiorIgual?: (ctx: OperacaoMaiorIgualContext) => void;
	/**
	 * Exit a parse tree produced by the `operacaoMaiorIgual`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitOperacaoMaiorIgual?: (ctx: OperacaoMaiorIgualContext) => void;

	/**
	 * Enter a parse tree produced by the `operacaoELogico`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterOperacaoELogico?: (ctx: OperacaoELogicoContext) => void;
	/**
	 * Exit a parse tree produced by the `operacaoELogico`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitOperacaoELogico?: (ctx: OperacaoELogicoContext) => void;

	/**
	 * Enter a parse tree produced by the `operacaoOuLogico`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterOperacaoOuLogico?: (ctx: OperacaoOuLogicoContext) => void;
	/**
	 * Exit a parse tree produced by the `operacaoOuLogico`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitOperacaoOuLogico?: (ctx: OperacaoOuLogicoContext) => void;

	/**
	 * Enter a parse tree produced by the `operacaoXor`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterOperacaoXor?: (ctx: OperacaoXorContext) => void;
	/**
	 * Exit a parse tree produced by the `operacaoXor`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitOperacaoXor?: (ctx: OperacaoXorContext) => void;

	/**
	 * Enter a parse tree produced by the `operacaoShiftLeft`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterOperacaoShiftLeft?: (ctx: OperacaoShiftLeftContext) => void;
	/**
	 * Exit a parse tree produced by the `operacaoShiftLeft`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitOperacaoShiftLeft?: (ctx: OperacaoShiftLeftContext) => void;

	/**
	 * Enter a parse tree produced by the `operacaoShiftRight`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterOperacaoShiftRight?: (ctx: OperacaoShiftRightContext) => void;
	/**
	 * Exit a parse tree produced by the `operacaoShiftRight`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitOperacaoShiftRight?: (ctx: OperacaoShiftRightContext) => void;

	/**
	 * Enter a parse tree produced by the `operacaoAndBitwise`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterOperacaoAndBitwise?: (ctx: OperacaoAndBitwiseContext) => void;
	/**
	 * Exit a parse tree produced by the `operacaoAndBitwise`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitOperacaoAndBitwise?: (ctx: OperacaoAndBitwiseContext) => void;

	/**
	 * Enter a parse tree produced by the `operacaoOrBitwise`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterOperacaoOrBitwise?: (ctx: OperacaoOrBitwiseContext) => void;
	/**
	 * Exit a parse tree produced by the `operacaoOrBitwise`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitOperacaoOrBitwise?: (ctx: OperacaoOrBitwiseContext) => void;

	/**
	 * Enter a parse tree produced by the `referenciaParaVariavel`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterReferenciaParaVariavel?: (ctx: ReferenciaParaVariavelContext) => void;
	/**
	 * Exit a parse tree produced by the `referenciaParaVariavel`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitReferenciaParaVariavel?: (ctx: ReferenciaParaVariavelContext) => void;

	/**
	 * Enter a parse tree produced by the `numeroInteiro`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterNumeroInteiro?: (ctx: NumeroInteiroContext) => void;
	/**
	 * Exit a parse tree produced by the `numeroInteiro`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitNumeroInteiro?: (ctx: NumeroInteiroContext) => void;

	/**
	 * Enter a parse tree produced by the `numeroReal`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterNumeroReal?: (ctx: NumeroRealContext) => void;
	/**
	 * Exit a parse tree produced by the `numeroReal`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitNumeroReal?: (ctx: NumeroRealContext) => void;

	/**
	 * Enter a parse tree produced by the `valorLogico`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterValorLogico?: (ctx: ValorLogicoContext) => void;
	/**
	 * Exit a parse tree produced by the `valorLogico`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitValorLogico?: (ctx: ValorLogicoContext) => void;

	/**
	 * Enter a parse tree produced by the `caracter`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterCaracter?: (ctx: CaracterContext) => void;
	/**
	 * Exit a parse tree produced by the `caracter`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitCaracter?: (ctx: CaracterContext) => void;

	/**
	 * Enter a parse tree produced by the `string`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterString?: (ctx: StringContext) => void;
	/**
	 * Exit a parse tree produced by the `string`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitString?: (ctx: StringContext) => void;

	/**
	 * Enter a parse tree produced by the `expressaoEntreParenteses`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterExpressaoEntreParenteses?: (ctx: ExpressaoEntreParentesesContext) => void;
	/**
	 * Exit a parse tree produced by the `expressaoEntreParenteses`
	 * labeled alternative in `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitExpressaoEntreParenteses?: (ctx: ExpressaoEntreParentesesContext) => void;

	/**
	 * Enter a parse tree produced by the `atribuicaoCompostaSoma`
	 * labeled alternative in `PortugolParser.atribuicaoComposta`.
	 * @param ctx the parse tree
	 */
	enterAtribuicaoCompostaSoma?: (ctx: AtribuicaoCompostaSomaContext) => void;
	/**
	 * Exit a parse tree produced by the `atribuicaoCompostaSoma`
	 * labeled alternative in `PortugolParser.atribuicaoComposta`.
	 * @param ctx the parse tree
	 */
	exitAtribuicaoCompostaSoma?: (ctx: AtribuicaoCompostaSomaContext) => void;

	/**
	 * Enter a parse tree produced by the `atribuicaoCompostaSubtracao`
	 * labeled alternative in `PortugolParser.atribuicaoComposta`.
	 * @param ctx the parse tree
	 */
	enterAtribuicaoCompostaSubtracao?: (ctx: AtribuicaoCompostaSubtracaoContext) => void;
	/**
	 * Exit a parse tree produced by the `atribuicaoCompostaSubtracao`
	 * labeled alternative in `PortugolParser.atribuicaoComposta`.
	 * @param ctx the parse tree
	 */
	exitAtribuicaoCompostaSubtracao?: (ctx: AtribuicaoCompostaSubtracaoContext) => void;

	/**
	 * Enter a parse tree produced by the `atribuicaoCompostaMultiplicacao`
	 * labeled alternative in `PortugolParser.atribuicaoComposta`.
	 * @param ctx the parse tree
	 */
	enterAtribuicaoCompostaMultiplicacao?: (ctx: AtribuicaoCompostaMultiplicacaoContext) => void;
	/**
	 * Exit a parse tree produced by the `atribuicaoCompostaMultiplicacao`
	 * labeled alternative in `PortugolParser.atribuicaoComposta`.
	 * @param ctx the parse tree
	 */
	exitAtribuicaoCompostaMultiplicacao?: (ctx: AtribuicaoCompostaMultiplicacaoContext) => void;

	/**
	 * Enter a parse tree produced by the `atribuicaoCompostaDivisao`
	 * labeled alternative in `PortugolParser.atribuicaoComposta`.
	 * @param ctx the parse tree
	 */
	enterAtribuicaoCompostaDivisao?: (ctx: AtribuicaoCompostaDivisaoContext) => void;
	/**
	 * Exit a parse tree produced by the `atribuicaoCompostaDivisao`
	 * labeled alternative in `PortugolParser.atribuicaoComposta`.
	 * @param ctx the parse tree
	 */
	exitAtribuicaoCompostaDivisao?: (ctx: AtribuicaoCompostaDivisaoContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.arquivo`.
	 * @param ctx the parse tree
	 */
	enterArquivo?: (ctx: ArquivoContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.arquivo`.
	 * @param ctx the parse tree
	 */
	exitArquivo?: (ctx: ArquivoContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.inclusaoBiblioteca`.
	 * @param ctx the parse tree
	 */
	enterInclusaoBiblioteca?: (ctx: InclusaoBibliotecaContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.inclusaoBiblioteca`.
	 * @param ctx the parse tree
	 */
	exitInclusaoBiblioteca?: (ctx: InclusaoBibliotecaContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.listaDeclaracoes`.
	 * @param ctx the parse tree
	 */
	enterListaDeclaracoes?: (ctx: ListaDeclaracoesContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.listaDeclaracoes`.
	 * @param ctx the parse tree
	 */
	exitListaDeclaracoes?: (ctx: ListaDeclaracoesContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.declaracao`.
	 * @param ctx the parse tree
	 */
	enterDeclaracao?: (ctx: DeclaracaoContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.declaracao`.
	 * @param ctx the parse tree
	 */
	exitDeclaracao?: (ctx: DeclaracaoContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.declaracaoVariavel`.
	 * @param ctx the parse tree
	 */
	enterDeclaracaoVariavel?: (ctx: DeclaracaoVariavelContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.declaracaoVariavel`.
	 * @param ctx the parse tree
	 */
	exitDeclaracaoVariavel?: (ctx: DeclaracaoVariavelContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.declaracaoMatriz`.
	 * @param ctx the parse tree
	 */
	enterDeclaracaoMatriz?: (ctx: DeclaracaoMatrizContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.declaracaoMatriz`.
	 * @param ctx the parse tree
	 */
	exitDeclaracaoMatriz?: (ctx: DeclaracaoMatrizContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.inicializacaoMatriz`.
	 * @param ctx the parse tree
	 */
	enterInicializacaoMatriz?: (ctx: InicializacaoMatrizContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.inicializacaoMatriz`.
	 * @param ctx the parse tree
	 */
	exitInicializacaoMatriz?: (ctx: InicializacaoMatrizContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.linhaMatriz`.
	 * @param ctx the parse tree
	 */
	enterLinhaMatriz?: (ctx: LinhaMatrizContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.linhaMatriz`.
	 * @param ctx the parse tree
	 */
	exitLinhaMatriz?: (ctx: LinhaMatrizContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.colunaMatriz`.
	 * @param ctx the parse tree
	 */
	enterColunaMatriz?: (ctx: ColunaMatrizContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.colunaMatriz`.
	 * @param ctx the parse tree
	 */
	exitColunaMatriz?: (ctx: ColunaMatrizContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.declaracaoArray`.
	 * @param ctx the parse tree
	 */
	enterDeclaracaoArray?: (ctx: DeclaracaoArrayContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.declaracaoArray`.
	 * @param ctx the parse tree
	 */
	exitDeclaracaoArray?: (ctx: DeclaracaoArrayContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.inicializacaoArray`.
	 * @param ctx the parse tree
	 */
	enterInicializacaoArray?: (ctx: InicializacaoArrayContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.inicializacaoArray`.
	 * @param ctx the parse tree
	 */
	exitInicializacaoArray?: (ctx: InicializacaoArrayContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.tamanhoArray`.
	 * @param ctx the parse tree
	 */
	enterTamanhoArray?: (ctx: TamanhoArrayContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.tamanhoArray`.
	 * @param ctx the parse tree
	 */
	exitTamanhoArray?: (ctx: TamanhoArrayContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.declaracaoFuncao`.
	 * @param ctx the parse tree
	 */
	enterDeclaracaoFuncao?: (ctx: DeclaracaoFuncaoContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.declaracaoFuncao`.
	 * @param ctx the parse tree
	 */
	exitDeclaracaoFuncao?: (ctx: DeclaracaoFuncaoContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.parametroFuncao`.
	 * @param ctx the parse tree
	 */
	enterParametroFuncao?: (ctx: ParametroFuncaoContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.parametroFuncao`.
	 * @param ctx the parse tree
	 */
	exitParametroFuncao?: (ctx: ParametroFuncaoContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.listaParametros`.
	 * @param ctx the parse tree
	 */
	enterListaParametros?: (ctx: ListaParametrosContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.listaParametros`.
	 * @param ctx the parse tree
	 */
	exitListaParametros?: (ctx: ListaParametrosContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.parametro`.
	 * @param ctx the parse tree
	 */
	enterParametro?: (ctx: ParametroContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.parametro`.
	 * @param ctx the parse tree
	 */
	exitParametro?: (ctx: ParametroContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.parametroArray`.
	 * @param ctx the parse tree
	 */
	enterParametroArray?: (ctx: ParametroArrayContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.parametroArray`.
	 * @param ctx the parse tree
	 */
	exitParametroArray?: (ctx: ParametroArrayContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.parametroMatriz`.
	 * @param ctx the parse tree
	 */
	enterParametroMatriz?: (ctx: ParametroMatrizContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.parametroMatriz`.
	 * @param ctx the parse tree
	 */
	exitParametroMatriz?: (ctx: ParametroMatrizContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.comando`.
	 * @param ctx the parse tree
	 */
	enterComando?: (ctx: ComandoContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.comando`.
	 * @param ctx the parse tree
	 */
	exitComando?: (ctx: ComandoContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.atribuicao`.
	 * @param ctx the parse tree
	 */
	enterAtribuicao?: (ctx: AtribuicaoContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.atribuicao`.
	 * @param ctx the parse tree
	 */
	exitAtribuicao?: (ctx: AtribuicaoContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.atribuicaoComposta`.
	 * @param ctx the parse tree
	 */
	enterAtribuicaoComposta?: (ctx: AtribuicaoCompostaContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.atribuicaoComposta`.
	 * @param ctx the parse tree
	 */
	exitAtribuicaoComposta?: (ctx: AtribuicaoCompostaContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.retorne`.
	 * @param ctx the parse tree
	 */
	enterRetorne?: (ctx: RetorneContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.retorne`.
	 * @param ctx the parse tree
	 */
	exitRetorne?: (ctx: RetorneContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.se`.
	 * @param ctx the parse tree
	 */
	enterSe?: (ctx: SeContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.se`.
	 * @param ctx the parse tree
	 */
	exitSe?: (ctx: SeContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.senao`.
	 * @param ctx the parse tree
	 */
	enterSenao?: (ctx: SenaoContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.senao`.
	 * @param ctx the parse tree
	 */
	exitSenao?: (ctx: SenaoContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.enquanto`.
	 * @param ctx the parse tree
	 */
	enterEnquanto?: (ctx: EnquantoContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.enquanto`.
	 * @param ctx the parse tree
	 */
	exitEnquanto?: (ctx: EnquantoContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.facaEnquanto`.
	 * @param ctx the parse tree
	 */
	enterFacaEnquanto?: (ctx: FacaEnquantoContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.facaEnquanto`.
	 * @param ctx the parse tree
	 */
	exitFacaEnquanto?: (ctx: FacaEnquantoContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.para`.
	 * @param ctx the parse tree
	 */
	enterPara?: (ctx: ParaContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.para`.
	 * @param ctx the parse tree
	 */
	exitPara?: (ctx: ParaContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.listaComandos`.
	 * @param ctx the parse tree
	 */
	enterListaComandos?: (ctx: ListaComandosContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.listaComandos`.
	 * @param ctx the parse tree
	 */
	exitListaComandos?: (ctx: ListaComandosContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.inicializacaoPara`.
	 * @param ctx the parse tree
	 */
	enterInicializacaoPara?: (ctx: InicializacaoParaContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.inicializacaoPara`.
	 * @param ctx the parse tree
	 */
	exitInicializacaoPara?: (ctx: InicializacaoParaContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.condicao`.
	 * @param ctx the parse tree
	 */
	enterCondicao?: (ctx: CondicaoContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.condicao`.
	 * @param ctx the parse tree
	 */
	exitCondicao?: (ctx: CondicaoContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.incrementoPara`.
	 * @param ctx the parse tree
	 */
	enterIncrementoPara?: (ctx: IncrementoParaContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.incrementoPara`.
	 * @param ctx the parse tree
	 */
	exitIncrementoPara?: (ctx: IncrementoParaContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.escolha`.
	 * @param ctx the parse tree
	 */
	enterEscolha?: (ctx: EscolhaContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.escolha`.
	 * @param ctx the parse tree
	 */
	exitEscolha?: (ctx: EscolhaContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.caso`.
	 * @param ctx the parse tree
	 */
	enterCaso?: (ctx: CasoContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.caso`.
	 * @param ctx the parse tree
	 */
	exitCaso?: (ctx: CasoContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.pare`.
	 * @param ctx the parse tree
	 */
	enterPare?: (ctx: PareContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.pare`.
	 * @param ctx the parse tree
	 */
	exitPare?: (ctx: PareContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.indiceArray`.
	 * @param ctx the parse tree
	 */
	enterIndiceArray?: (ctx: IndiceArrayContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.indiceArray`.
	 * @param ctx the parse tree
	 */
	exitIndiceArray?: (ctx: IndiceArrayContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	enterExpressao?: (ctx: ExpressaoContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.expressao`.
	 * @param ctx the parse tree
	 */
	exitExpressao?: (ctx: ExpressaoContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.listaExpressoes`.
	 * @param ctx the parse tree
	 */
	enterListaExpressoes?: (ctx: ListaExpressoesContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.listaExpressoes`.
	 * @param ctx the parse tree
	 */
	exitListaExpressoes?: (ctx: ListaExpressoesContext) => void;

	/**
	 * Enter a parse tree produced by `PortugolParser.escopoBiblioteca`.
	 * @param ctx the parse tree
	 */
	enterEscopoBiblioteca?: (ctx: EscopoBibliotecaContext) => void;
	/**
	 * Exit a parse tree produced by `PortugolParser.escopoBiblioteca`.
	 * @param ctx the parse tree
	 */
	exitEscopoBiblioteca?: (ctx: EscopoBibliotecaContext) => void;
}

