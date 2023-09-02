// Generated from src/antlr/Portugol.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN.js";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer.js";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException.js";
import { NotNull } from "antlr4ts/Decorators.js";
import { NoViableAltException } from "antlr4ts/NoViableAltException.js";
import { Override } from "antlr4ts/Decorators.js";
import { Parser } from "antlr4ts/Parser.js";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext.js";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator.js";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener.js";
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor.js";
import { RecognitionException } from "antlr4ts/RecognitionException.js";
import { RuleContext } from "antlr4ts/RuleContext.js";
//import { RuleVersion } from "antlr4ts/RuleVersion.js";
import { TerminalNode } from "antlr4ts/tree/TerminalNode.js";
import { Token } from "antlr4ts/Token.js";
import { TokenStream } from "antlr4ts/TokenStream.js";
import { Vocabulary } from "antlr4ts/Vocabulary.js";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl.js";

import * as Utils from "antlr4ts/misc/Utils.js";

import { PortugolListener } from "./PortugolListener.js";
import { PortugolVisitor } from "./PortugolVisitor.js";


export class PortugolParser extends Parser {
	public static readonly ABRE_PARENTESES = 1;
	public static readonly FECHA_PARENTESES = 2;
	public static readonly ABRE_COLCHETES = 3;
	public static readonly FECHA_COLCHETES = 4;
	public static readonly ABRE_CHAVES = 5;
	public static readonly FECHA_CHAVES = 6;
	public static readonly TIPO = 7;
	public static readonly FACA = 8;
	public static readonly ENQUANTO = 9;
	public static readonly PARA = 10;
	public static readonly SE = 11;
	public static readonly SENAO = 12;
	public static readonly CONSTANTE = 13;
	public static readonly FUNCAO = 14;
	public static readonly PROGRAMA = 15;
	public static readonly ESCOLHA = 16;
	public static readonly CASO = 17;
	public static readonly CONTRARIO = 18;
	public static readonly PARE = 19;
	public static readonly RETORNE = 20;
	public static readonly INCLUA = 21;
	public static readonly BIBLIOTECA = 22;
	public static readonly OP_NAO = 23;
	public static readonly OP_E_LOGICO = 24;
	public static readonly OP_OU_LOGICO = 25;
	public static readonly OP_SUBTRACAO = 26;
	public static readonly OP_ADICAO = 27;
	public static readonly OP_MULTIPLICACAO = 28;
	public static readonly OP_DIVISAO = 29;
	public static readonly OP_MOD = 30;
	public static readonly OP_ATRIBUICAO = 31;
	public static readonly OP_IGUALDADE = 32;
	public static readonly OP_DIFERENCA = 33;
	public static readonly OP_MAIOR = 34;
	public static readonly OP_MENOR = 35;
	public static readonly OP_MENOR_IGUAL = 36;
	public static readonly OP_MAIOR_IGUAL = 37;
	public static readonly OP_INCREMENTO_UNARIO = 38;
	public static readonly OP_DECREMENTO_UNARIO = 39;
	public static readonly OP_SHIFT_LEFT = 40;
	public static readonly OP_SHIFT_RIGHT = 41;
	public static readonly OP_XOR = 42;
	public static readonly OP_OU_BITWISE = 43;
	public static readonly OP_NOT_BITWISE = 44;
	public static readonly OP_ALIAS_BIBLIOTECA = 45;
	public static readonly E_COMERCIAL = 46;
	public static readonly OP_MAIS_IGUAL = 47;
	public static readonly OP_MENOS_IGUAL = 48;
	public static readonly OP_MULTIPLICACAO_IGUAL = 49;
	public static readonly OP_DIVISAO_IGUAL = 50;
	public static readonly LOGICO = 51;
	public static readonly VERDADEIRO = 52;
	public static readonly FALSO = 53;
	public static readonly CARACTER = 54;
	public static readonly STRING = 55;
	public static readonly ID = 56;
	public static readonly REAL = 57;
	public static readonly INT = 58;
	public static readonly HEXADECIMAL = 59;
	public static readonly COMENTARIO = 60;
	public static readonly COMENTARIO_SIMPLES = 61;
	public static readonly WS = 62;
	public static readonly PONTO = 63;
	public static readonly VIRGULA = 64;
	public static readonly PONTOVIRGULA = 65;
	public static readonly DOISPONTOS = 66;
	public static readonly RULE_arquivo = 0;
	public static readonly RULE_inclusaoBiblioteca = 1;
	public static readonly RULE_listaDeclaracoes = 2;
	public static readonly RULE_declaracao = 3;
	public static readonly RULE_declaracaoVariavel = 4;
	public static readonly RULE_declaracaoMatriz = 5;
	public static readonly RULE_inicializacaoMatriz = 6;
	public static readonly RULE_linhaMatriz = 7;
	public static readonly RULE_colunaMatriz = 8;
	public static readonly RULE_declaracaoArray = 9;
	public static readonly RULE_inicializacaoArray = 10;
	public static readonly RULE_tamanhoArray = 11;
	public static readonly RULE_declaracaoFuncao = 12;
	public static readonly RULE_parametroFuncao = 13;
	public static readonly RULE_listaParametros = 14;
	public static readonly RULE_parametro = 15;
	public static readonly RULE_parametroArray = 16;
	public static readonly RULE_parametroMatriz = 17;
	public static readonly RULE_comando = 18;
	public static readonly RULE_atribuicao = 19;
	public static readonly RULE_atribuicaoComposta = 20;
	public static readonly RULE_retorne = 21;
	public static readonly RULE_se = 22;
	public static readonly RULE_senao = 23;
	public static readonly RULE_enquanto = 24;
	public static readonly RULE_facaEnquanto = 25;
	public static readonly RULE_para = 26;
	public static readonly RULE_listaComandos = 27;
	public static readonly RULE_inicializacaoPara = 28;
	public static readonly RULE_condicao = 29;
	public static readonly RULE_incrementoPara = 30;
	public static readonly RULE_escolha = 31;
	public static readonly RULE_caso = 32;
	public static readonly RULE_pare = 33;
	public static readonly RULE_indiceArray = 34;
	public static readonly RULE_expressao = 35;
	public static readonly RULE_listaExpressoes = 36;
	public static readonly RULE_escopoBiblioteca = 37;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"arquivo", "inclusaoBiblioteca", "listaDeclaracoes", "declaracao", "declaracaoVariavel",
		"declaracaoMatriz", "inicializacaoMatriz", "linhaMatriz", "colunaMatriz",
		"declaracaoArray", "inicializacaoArray", "tamanhoArray", "declaracaoFuncao",
		"parametroFuncao", "listaParametros", "parametro", "parametroArray", "parametroMatriz",
		"comando", "atribuicao", "atribuicaoComposta", "retorne", "se", "senao",
		"enquanto", "facaEnquanto", "para", "listaComandos", "inicializacaoPara",
		"condicao", "incrementoPara", "escolha", "caso", "pare", "indiceArray",
		"expressao", "listaExpressoes", "escopoBiblioteca",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'('", "')'", "'['", "']'", "'{'", "'}'", undefined, "'faca'",
		"'enquanto'", "'para'", "'se'", "'senao'", "'const'", "'funcao'", "'programa'",
		"'escolha'", "'caso'", "'contrario'", "'pare'", "'retorne'", "'inclua'",
		"'biblioteca'", "'nao'", "'e'", "'ou'", "'-'", "'+'", "'*'", "'/'", "'%'",
		"'='", "'=='", "'!='", "'>'", "'<'", "'<='", "'>='", "'++'", "'--'", "'<<'",
		"'>>'", "'^'", "'|'", "'~'", "'-->'", "'&'", "'+='", "'-='", "'*='", "'/='",
		undefined, "'verdadeiro'", "'falso'", undefined, undefined, undefined,
		undefined, undefined, undefined, undefined, undefined, undefined, "'.'",
		"','", "';'", "':'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "ABRE_PARENTESES", "FECHA_PARENTESES", "ABRE_COLCHETES", "FECHA_COLCHETES",
		"ABRE_CHAVES", "FECHA_CHAVES", "TIPO", "FACA", "ENQUANTO", "PARA", "SE",
		"SENAO", "CONSTANTE", "FUNCAO", "PROGRAMA", "ESCOLHA", "CASO", "CONTRARIO",
		"PARE", "RETORNE", "INCLUA", "BIBLIOTECA", "OP_NAO", "OP_E_LOGICO", "OP_OU_LOGICO",
		"OP_SUBTRACAO", "OP_ADICAO", "OP_MULTIPLICACAO", "OP_DIVISAO", "OP_MOD",
		"OP_ATRIBUICAO", "OP_IGUALDADE", "OP_DIFERENCA", "OP_MAIOR", "OP_MENOR",
		"OP_MENOR_IGUAL", "OP_MAIOR_IGUAL", "OP_INCREMENTO_UNARIO", "OP_DECREMENTO_UNARIO",
		"OP_SHIFT_LEFT", "OP_SHIFT_RIGHT", "OP_XOR", "OP_OU_BITWISE", "OP_NOT_BITWISE",
		"OP_ALIAS_BIBLIOTECA", "E_COMERCIAL", "OP_MAIS_IGUAL", "OP_MENOS_IGUAL",
		"OP_MULTIPLICACAO_IGUAL", "OP_DIVISAO_IGUAL", "LOGICO", "VERDADEIRO",
		"FALSO", "CARACTER", "STRING", "ID", "REAL", "INT", "HEXADECIMAL", "COMENTARIO",
		"COMENTARIO_SIMPLES", "WS", "PONTO", "VIRGULA", "PONTOVIRGULA", "DOISPONTOS",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(PortugolParser._LITERAL_NAMES, PortugolParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return PortugolParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "Portugol.g4"; }

	// @Override
	public get ruleNames(): string[] { return PortugolParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return PortugolParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(PortugolParser._ATN, this);
	}
	// @RuleVersion(0)
	public arquivo(): ArquivoContext {
		let _localctx: ArquivoContext = new ArquivoContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, PortugolParser.RULE_arquivo);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 76;
			this.match(PortugolParser.PROGRAMA);
			this.state = 77;
			this.match(PortugolParser.ABRE_CHAVES);
			this.state = 81;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === PortugolParser.INCLUA) {
				{
				{
				this.state = 78;
				this.inclusaoBiblioteca();
				}
				}
				this.state = 83;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 88;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << PortugolParser.TIPO) | (1 << PortugolParser.CONSTANTE) | (1 << PortugolParser.FUNCAO))) !== 0)) {
				{
				this.state = 86;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case PortugolParser.FUNCAO:
					{
					this.state = 84;
					this.declaracaoFuncao();
					}
					break;
				case PortugolParser.TIPO:
				case PortugolParser.CONSTANTE:
					{
					this.state = 85;
					this.listaDeclaracoes();
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				this.state = 90;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 91;
			this.match(PortugolParser.FECHA_CHAVES);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public inclusaoBiblioteca(): InclusaoBibliotecaContext {
		let _localctx: InclusaoBibliotecaContext = new InclusaoBibliotecaContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, PortugolParser.RULE_inclusaoBiblioteca);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 93;
			this.match(PortugolParser.INCLUA);
			this.state = 94;
			this.match(PortugolParser.BIBLIOTECA);
			this.state = 95;
			this.match(PortugolParser.ID);
			this.state = 98;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === PortugolParser.OP_ALIAS_BIBLIOTECA) {
				{
				this.state = 96;
				this.match(PortugolParser.OP_ALIAS_BIBLIOTECA);
				this.state = 97;
				this.match(PortugolParser.ID);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public listaDeclaracoes(): ListaDeclaracoesContext {
		let _localctx: ListaDeclaracoesContext = new ListaDeclaracoesContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, PortugolParser.RULE_listaDeclaracoes);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 101;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === PortugolParser.CONSTANTE) {
				{
				this.state = 100;
				this.match(PortugolParser.CONSTANTE);
				}
			}

			this.state = 103;
			this.match(PortugolParser.TIPO);
			this.state = 104;
			this.declaracao();
			this.state = 109;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === PortugolParser.VIRGULA) {
				{
				{
				this.state = 105;
				this.match(PortugolParser.VIRGULA);
				this.state = 106;
				this.declaracao();
				}
				}
				this.state = 111;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public declaracao(): DeclaracaoContext {
		let _localctx: DeclaracaoContext = new DeclaracaoContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, PortugolParser.RULE_declaracao);
		try {
			this.state = 115;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 6, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 112;
				this.declaracaoVariavel();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 113;
				this.declaracaoArray();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 114;
				this.declaracaoMatriz();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public declaracaoVariavel(): DeclaracaoVariavelContext {
		let _localctx: DeclaracaoVariavelContext = new DeclaracaoVariavelContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, PortugolParser.RULE_declaracaoVariavel);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 117;
			this.match(PortugolParser.ID);
			this.state = 120;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === PortugolParser.OP_ATRIBUICAO) {
				{
				this.state = 118;
				this.match(PortugolParser.OP_ATRIBUICAO);
				this.state = 119;
				this.expressao(0);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public declaracaoMatriz(): DeclaracaoMatrizContext {
		let _localctx: DeclaracaoMatrizContext = new DeclaracaoMatrizContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, PortugolParser.RULE_declaracaoMatriz);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 122;
			this.match(PortugolParser.ID);
			this.state = 123;
			this.match(PortugolParser.ABRE_COLCHETES);
			this.state = 125;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << PortugolParser.ABRE_PARENTESES) | (1 << PortugolParser.OP_NAO) | (1 << PortugolParser.OP_SUBTRACAO) | (1 << PortugolParser.OP_ADICAO))) !== 0) || ((((_la - 38)) & ~0x1F) === 0 && ((1 << (_la - 38)) & ((1 << (PortugolParser.OP_INCREMENTO_UNARIO - 38)) | (1 << (PortugolParser.OP_DECREMENTO_UNARIO - 38)) | (1 << (PortugolParser.OP_NOT_BITWISE - 38)) | (1 << (PortugolParser.LOGICO - 38)) | (1 << (PortugolParser.CARACTER - 38)) | (1 << (PortugolParser.STRING - 38)) | (1 << (PortugolParser.ID - 38)) | (1 << (PortugolParser.REAL - 38)) | (1 << (PortugolParser.INT - 38)) | (1 << (PortugolParser.HEXADECIMAL - 38)))) !== 0)) {
				{
				this.state = 124;
				this.linhaMatriz();
				}
			}

			this.state = 127;
			this.match(PortugolParser.FECHA_COLCHETES);
			this.state = 128;
			this.match(PortugolParser.ABRE_COLCHETES);
			this.state = 130;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << PortugolParser.ABRE_PARENTESES) | (1 << PortugolParser.OP_NAO) | (1 << PortugolParser.OP_SUBTRACAO) | (1 << PortugolParser.OP_ADICAO))) !== 0) || ((((_la - 38)) & ~0x1F) === 0 && ((1 << (_la - 38)) & ((1 << (PortugolParser.OP_INCREMENTO_UNARIO - 38)) | (1 << (PortugolParser.OP_DECREMENTO_UNARIO - 38)) | (1 << (PortugolParser.OP_NOT_BITWISE - 38)) | (1 << (PortugolParser.LOGICO - 38)) | (1 << (PortugolParser.CARACTER - 38)) | (1 << (PortugolParser.STRING - 38)) | (1 << (PortugolParser.ID - 38)) | (1 << (PortugolParser.REAL - 38)) | (1 << (PortugolParser.INT - 38)) | (1 << (PortugolParser.HEXADECIMAL - 38)))) !== 0)) {
				{
				this.state = 129;
				this.colunaMatriz();
				}
			}

			this.state = 132;
			this.match(PortugolParser.FECHA_COLCHETES);
			this.state = 135;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === PortugolParser.OP_ATRIBUICAO) {
				{
				this.state = 133;
				this.match(PortugolParser.OP_ATRIBUICAO);
				this.state = 134;
				this.inicializacaoMatriz();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public inicializacaoMatriz(): InicializacaoMatrizContext {
		let _localctx: InicializacaoMatrizContext = new InicializacaoMatrizContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, PortugolParser.RULE_inicializacaoMatriz);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 137;
			this.match(PortugolParser.ABRE_CHAVES);
			this.state = 138;
			this.inicializacaoArray();
			this.state = 143;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === PortugolParser.VIRGULA) {
				{
				{
				this.state = 139;
				this.match(PortugolParser.VIRGULA);
				this.state = 140;
				this.inicializacaoArray();
				}
				}
				this.state = 145;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 146;
			this.match(PortugolParser.FECHA_CHAVES);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public linhaMatriz(): LinhaMatrizContext {
		let _localctx: LinhaMatrizContext = new LinhaMatrizContext(this._ctx, this.state);
		this.enterRule(_localctx, 14, PortugolParser.RULE_linhaMatriz);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 148;
			this.tamanhoArray();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public colunaMatriz(): ColunaMatrizContext {
		let _localctx: ColunaMatrizContext = new ColunaMatrizContext(this._ctx, this.state);
		this.enterRule(_localctx, 16, PortugolParser.RULE_colunaMatriz);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 150;
			this.tamanhoArray();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public declaracaoArray(): DeclaracaoArrayContext {
		let _localctx: DeclaracaoArrayContext = new DeclaracaoArrayContext(this._ctx, this.state);
		this.enterRule(_localctx, 18, PortugolParser.RULE_declaracaoArray);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 152;
			this.match(PortugolParser.ID);
			this.state = 153;
			this.match(PortugolParser.ABRE_COLCHETES);
			this.state = 155;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << PortugolParser.ABRE_PARENTESES) | (1 << PortugolParser.OP_NAO) | (1 << PortugolParser.OP_SUBTRACAO) | (1 << PortugolParser.OP_ADICAO))) !== 0) || ((((_la - 38)) & ~0x1F) === 0 && ((1 << (_la - 38)) & ((1 << (PortugolParser.OP_INCREMENTO_UNARIO - 38)) | (1 << (PortugolParser.OP_DECREMENTO_UNARIO - 38)) | (1 << (PortugolParser.OP_NOT_BITWISE - 38)) | (1 << (PortugolParser.LOGICO - 38)) | (1 << (PortugolParser.CARACTER - 38)) | (1 << (PortugolParser.STRING - 38)) | (1 << (PortugolParser.ID - 38)) | (1 << (PortugolParser.REAL - 38)) | (1 << (PortugolParser.INT - 38)) | (1 << (PortugolParser.HEXADECIMAL - 38)))) !== 0)) {
				{
				this.state = 154;
				this.tamanhoArray();
				}
			}

			this.state = 157;
			this.match(PortugolParser.FECHA_COLCHETES);
			this.state = 160;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === PortugolParser.OP_ATRIBUICAO) {
				{
				this.state = 158;
				this.match(PortugolParser.OP_ATRIBUICAO);
				this.state = 159;
				this.inicializacaoArray();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public inicializacaoArray(): InicializacaoArrayContext {
		let _localctx: InicializacaoArrayContext = new InicializacaoArrayContext(this._ctx, this.state);
		this.enterRule(_localctx, 20, PortugolParser.RULE_inicializacaoArray);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 162;
			this.match(PortugolParser.ABRE_CHAVES);
			this.state = 164;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << PortugolParser.ABRE_PARENTESES) | (1 << PortugolParser.OP_NAO) | (1 << PortugolParser.OP_SUBTRACAO) | (1 << PortugolParser.OP_ADICAO))) !== 0) || ((((_la - 38)) & ~0x1F) === 0 && ((1 << (_la - 38)) & ((1 << (PortugolParser.OP_INCREMENTO_UNARIO - 38)) | (1 << (PortugolParser.OP_DECREMENTO_UNARIO - 38)) | (1 << (PortugolParser.OP_NOT_BITWISE - 38)) | (1 << (PortugolParser.LOGICO - 38)) | (1 << (PortugolParser.CARACTER - 38)) | (1 << (PortugolParser.STRING - 38)) | (1 << (PortugolParser.ID - 38)) | (1 << (PortugolParser.REAL - 38)) | (1 << (PortugolParser.INT - 38)) | (1 << (PortugolParser.HEXADECIMAL - 38)))) !== 0)) {
				{
				this.state = 163;
				this.listaExpressoes();
				}
			}

			this.state = 166;
			this.match(PortugolParser.FECHA_CHAVES);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public tamanhoArray(): TamanhoArrayContext {
		let _localctx: TamanhoArrayContext = new TamanhoArrayContext(this._ctx, this.state);
		this.enterRule(_localctx, 22, PortugolParser.RULE_tamanhoArray);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 168;
			this.expressao(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public declaracaoFuncao(): DeclaracaoFuncaoContext {
		let _localctx: DeclaracaoFuncaoContext = new DeclaracaoFuncaoContext(this._ctx, this.state);
		this.enterRule(_localctx, 24, PortugolParser.RULE_declaracaoFuncao);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 170;
			this.match(PortugolParser.FUNCAO);
			this.state = 172;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === PortugolParser.TIPO) {
				{
				this.state = 171;
				this.match(PortugolParser.TIPO);
				}
			}

			this.state = 174;
			this.match(PortugolParser.ID);
			this.state = 175;
			this.parametroFuncao();
			this.state = 176;
			this.match(PortugolParser.ABRE_CHAVES);
			this.state = 180;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << PortugolParser.ABRE_PARENTESES) | (1 << PortugolParser.TIPO) | (1 << PortugolParser.FACA) | (1 << PortugolParser.ENQUANTO) | (1 << PortugolParser.PARA) | (1 << PortugolParser.SE) | (1 << PortugolParser.CONSTANTE) | (1 << PortugolParser.ESCOLHA) | (1 << PortugolParser.PARE) | (1 << PortugolParser.RETORNE) | (1 << PortugolParser.OP_NAO) | (1 << PortugolParser.OP_SUBTRACAO) | (1 << PortugolParser.OP_ADICAO))) !== 0) || ((((_la - 38)) & ~0x1F) === 0 && ((1 << (_la - 38)) & ((1 << (PortugolParser.OP_INCREMENTO_UNARIO - 38)) | (1 << (PortugolParser.OP_DECREMENTO_UNARIO - 38)) | (1 << (PortugolParser.OP_NOT_BITWISE - 38)) | (1 << (PortugolParser.LOGICO - 38)) | (1 << (PortugolParser.CARACTER - 38)) | (1 << (PortugolParser.STRING - 38)) | (1 << (PortugolParser.ID - 38)) | (1 << (PortugolParser.REAL - 38)) | (1 << (PortugolParser.INT - 38)) | (1 << (PortugolParser.HEXADECIMAL - 38)))) !== 0)) {
				{
				{
				this.state = 177;
				this.comando();
				}
				}
				this.state = 182;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 183;
			this.match(PortugolParser.FECHA_CHAVES);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public parametroFuncao(): ParametroFuncaoContext {
		let _localctx: ParametroFuncaoContext = new ParametroFuncaoContext(this._ctx, this.state);
		this.enterRule(_localctx, 26, PortugolParser.RULE_parametroFuncao);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 185;
			this.match(PortugolParser.ABRE_PARENTESES);
			this.state = 187;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === PortugolParser.TIPO) {
				{
				this.state = 186;
				this.listaParametros();
				}
			}

			this.state = 189;
			this.match(PortugolParser.FECHA_PARENTESES);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public listaParametros(): ListaParametrosContext {
		let _localctx: ListaParametrosContext = new ListaParametrosContext(this._ctx, this.state);
		this.enterRule(_localctx, 28, PortugolParser.RULE_listaParametros);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 191;
			this.parametro();
			this.state = 196;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === PortugolParser.VIRGULA) {
				{
				{
				this.state = 192;
				this.match(PortugolParser.VIRGULA);
				this.state = 193;
				this.parametro();
				}
				}
				this.state = 198;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public parametro(): ParametroContext {
		let _localctx: ParametroContext = new ParametroContext(this._ctx, this.state);
		this.enterRule(_localctx, 30, PortugolParser.RULE_parametro);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 199;
			this.match(PortugolParser.TIPO);
			this.state = 201;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === PortugolParser.E_COMERCIAL) {
				{
				this.state = 200;
				this.match(PortugolParser.E_COMERCIAL);
				}
			}

			this.state = 203;
			this.match(PortugolParser.ID);
			this.state = 206;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 20, this._ctx) ) {
			case 1:
				{
				this.state = 204;
				this.parametroArray();
				}
				break;

			case 2:
				{
				this.state = 205;
				this.parametroMatriz();
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public parametroArray(): ParametroArrayContext {
		let _localctx: ParametroArrayContext = new ParametroArrayContext(this._ctx, this.state);
		this.enterRule(_localctx, 32, PortugolParser.RULE_parametroArray);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 208;
			this.match(PortugolParser.ABRE_COLCHETES);
			this.state = 209;
			this.match(PortugolParser.FECHA_COLCHETES);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public parametroMatriz(): ParametroMatrizContext {
		let _localctx: ParametroMatrizContext = new ParametroMatrizContext(this._ctx, this.state);
		this.enterRule(_localctx, 34, PortugolParser.RULE_parametroMatriz);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 211;
			this.match(PortugolParser.ABRE_COLCHETES);
			this.state = 212;
			this.match(PortugolParser.FECHA_COLCHETES);
			this.state = 213;
			this.match(PortugolParser.ABRE_COLCHETES);
			this.state = 214;
			this.match(PortugolParser.FECHA_COLCHETES);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public comando(): ComandoContext {
		let _localctx: ComandoContext = new ComandoContext(this._ctx, this.state);
		this.enterRule(_localctx, 36, PortugolParser.RULE_comando);
		try {
			this.state = 227;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 21, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 216;
				this.listaDeclaracoes();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 217;
				this.se();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 218;
				this.enquanto();
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 219;
				this.facaEnquanto();
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 220;
				this.para();
				}
				break;

			case 6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 221;
				this.escolha();
				}
				break;

			case 7:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 222;
				this.retorne();
				}
				break;

			case 8:
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 223;
				this.pare();
				}
				break;

			case 9:
				this.enterOuterAlt(_localctx, 9);
				{
				this.state = 224;
				this.atribuicao();
				}
				break;

			case 10:
				this.enterOuterAlt(_localctx, 10);
				{
				this.state = 225;
				this.atribuicaoComposta();
				}
				break;

			case 11:
				this.enterOuterAlt(_localctx, 11);
				{
				this.state = 226;
				this.expressao(0);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public atribuicao(): AtribuicaoContext {
		let _localctx: AtribuicaoContext = new AtribuicaoContext(this._ctx, this.state);
		this.enterRule(_localctx, 38, PortugolParser.RULE_atribuicao);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 229;
			this.expressao(0);
			this.state = 230;
			this.match(PortugolParser.OP_ATRIBUICAO);
			this.state = 231;
			this.expressao(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public atribuicaoComposta(): AtribuicaoCompostaContext {
		let _localctx: AtribuicaoCompostaContext = new AtribuicaoCompostaContext(this._ctx, this.state);
		this.enterRule(_localctx, 40, PortugolParser.RULE_atribuicaoComposta);
		try {
			this.state = 249;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 22, this._ctx) ) {
			case 1:
				_localctx = new AtribuicaoCompostaSomaContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 233;
				this.expressao(0);
				this.state = 234;
				this.match(PortugolParser.OP_MAIS_IGUAL);
				this.state = 235;
				this.expressao(0);
				}
				break;

			case 2:
				_localctx = new AtribuicaoCompostaSubtracaoContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 237;
				this.expressao(0);
				this.state = 238;
				this.match(PortugolParser.OP_MENOS_IGUAL);
				this.state = 239;
				this.expressao(0);
				}
				break;

			case 3:
				_localctx = new AtribuicaoCompostaMultiplicacaoContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 241;
				this.expressao(0);
				this.state = 242;
				this.match(PortugolParser.OP_MULTIPLICACAO_IGUAL);
				this.state = 243;
				this.expressao(0);
				}
				break;

			case 4:
				_localctx = new AtribuicaoCompostaDivisaoContext(_localctx);
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 245;
				this.expressao(0);
				this.state = 246;
				this.match(PortugolParser.OP_DIVISAO_IGUAL);
				this.state = 247;
				this.expressao(0);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public retorne(): RetorneContext {
		let _localctx: RetorneContext = new RetorneContext(this._ctx, this.state);
		this.enterRule(_localctx, 42, PortugolParser.RULE_retorne);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 251;
			this.match(PortugolParser.RETORNE);
			this.state = 253;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 23, this._ctx) ) {
			case 1:
				{
				this.state = 252;
				this.expressao(0);
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public se(): SeContext {
		let _localctx: SeContext = new SeContext(this._ctx, this.state);
		this.enterRule(_localctx, 44, PortugolParser.RULE_se);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 255;
			this.match(PortugolParser.SE);
			this.state = 256;
			this.match(PortugolParser.ABRE_PARENTESES);
			this.state = 257;
			this.expressao(0);
			this.state = 258;
			this.match(PortugolParser.FECHA_PARENTESES);
			this.state = 259;
			this.listaComandos();
			this.state = 261;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 24, this._ctx) ) {
			case 1:
				{
				this.state = 260;
				this.senao();
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public senao(): SenaoContext {
		let _localctx: SenaoContext = new SenaoContext(this._ctx, this.state);
		this.enterRule(_localctx, 46, PortugolParser.RULE_senao);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 263;
			this.match(PortugolParser.SENAO);
			this.state = 264;
			this.listaComandos();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public enquanto(): EnquantoContext {
		let _localctx: EnquantoContext = new EnquantoContext(this._ctx, this.state);
		this.enterRule(_localctx, 48, PortugolParser.RULE_enquanto);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 266;
			this.match(PortugolParser.ENQUANTO);
			this.state = 267;
			this.match(PortugolParser.ABRE_PARENTESES);
			this.state = 268;
			this.expressao(0);
			this.state = 269;
			this.match(PortugolParser.FECHA_PARENTESES);
			this.state = 270;
			this.listaComandos();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public facaEnquanto(): FacaEnquantoContext {
		let _localctx: FacaEnquantoContext = new FacaEnquantoContext(this._ctx, this.state);
		this.enterRule(_localctx, 50, PortugolParser.RULE_facaEnquanto);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 272;
			this.match(PortugolParser.FACA);
			this.state = 273;
			this.listaComandos();
			this.state = 274;
			this.match(PortugolParser.ENQUANTO);
			this.state = 275;
			this.match(PortugolParser.ABRE_PARENTESES);
			this.state = 276;
			this.expressao(0);
			this.state = 277;
			this.match(PortugolParser.FECHA_PARENTESES);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public para(): ParaContext {
		let _localctx: ParaContext = new ParaContext(this._ctx, this.state);
		this.enterRule(_localctx, 52, PortugolParser.RULE_para);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 279;
			this.match(PortugolParser.PARA);
			this.state = 280;
			this.match(PortugolParser.ABRE_PARENTESES);
			this.state = 282;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << PortugolParser.ABRE_PARENTESES) | (1 << PortugolParser.TIPO) | (1 << PortugolParser.CONSTANTE) | (1 << PortugolParser.OP_NAO) | (1 << PortugolParser.OP_SUBTRACAO) | (1 << PortugolParser.OP_ADICAO))) !== 0) || ((((_la - 38)) & ~0x1F) === 0 && ((1 << (_la - 38)) & ((1 << (PortugolParser.OP_INCREMENTO_UNARIO - 38)) | (1 << (PortugolParser.OP_DECREMENTO_UNARIO - 38)) | (1 << (PortugolParser.OP_NOT_BITWISE - 38)) | (1 << (PortugolParser.LOGICO - 38)) | (1 << (PortugolParser.CARACTER - 38)) | (1 << (PortugolParser.STRING - 38)) | (1 << (PortugolParser.ID - 38)) | (1 << (PortugolParser.REAL - 38)) | (1 << (PortugolParser.INT - 38)) | (1 << (PortugolParser.HEXADECIMAL - 38)))) !== 0)) {
				{
				this.state = 281;
				this.inicializacaoPara();
				}
			}

			this.state = 284;
			this.match(PortugolParser.PONTOVIRGULA);
			this.state = 285;
			this.condicao();
			this.state = 286;
			this.match(PortugolParser.PONTOVIRGULA);
			this.state = 287;
			this.incrementoPara();
			this.state = 288;
			this.match(PortugolParser.FECHA_PARENTESES);
			this.state = 289;
			this.listaComandos();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public listaComandos(): ListaComandosContext {
		let _localctx: ListaComandosContext = new ListaComandosContext(this._ctx, this.state);
		this.enterRule(_localctx, 54, PortugolParser.RULE_listaComandos);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 300;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case PortugolParser.ABRE_CHAVES:
				{
				this.state = 291;
				this.match(PortugolParser.ABRE_CHAVES);
				this.state = 295;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << PortugolParser.ABRE_PARENTESES) | (1 << PortugolParser.TIPO) | (1 << PortugolParser.FACA) | (1 << PortugolParser.ENQUANTO) | (1 << PortugolParser.PARA) | (1 << PortugolParser.SE) | (1 << PortugolParser.CONSTANTE) | (1 << PortugolParser.ESCOLHA) | (1 << PortugolParser.PARE) | (1 << PortugolParser.RETORNE) | (1 << PortugolParser.OP_NAO) | (1 << PortugolParser.OP_SUBTRACAO) | (1 << PortugolParser.OP_ADICAO))) !== 0) || ((((_la - 38)) & ~0x1F) === 0 && ((1 << (_la - 38)) & ((1 << (PortugolParser.OP_INCREMENTO_UNARIO - 38)) | (1 << (PortugolParser.OP_DECREMENTO_UNARIO - 38)) | (1 << (PortugolParser.OP_NOT_BITWISE - 38)) | (1 << (PortugolParser.LOGICO - 38)) | (1 << (PortugolParser.CARACTER - 38)) | (1 << (PortugolParser.STRING - 38)) | (1 << (PortugolParser.ID - 38)) | (1 << (PortugolParser.REAL - 38)) | (1 << (PortugolParser.INT - 38)) | (1 << (PortugolParser.HEXADECIMAL - 38)))) !== 0)) {
					{
					{
					this.state = 292;
					this.comando();
					}
					}
					this.state = 297;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 298;
				this.match(PortugolParser.FECHA_CHAVES);
				}
				break;
			case PortugolParser.ABRE_PARENTESES:
			case PortugolParser.TIPO:
			case PortugolParser.FACA:
			case PortugolParser.ENQUANTO:
			case PortugolParser.PARA:
			case PortugolParser.SE:
			case PortugolParser.CONSTANTE:
			case PortugolParser.ESCOLHA:
			case PortugolParser.PARE:
			case PortugolParser.RETORNE:
			case PortugolParser.OP_NAO:
			case PortugolParser.OP_SUBTRACAO:
			case PortugolParser.OP_ADICAO:
			case PortugolParser.OP_INCREMENTO_UNARIO:
			case PortugolParser.OP_DECREMENTO_UNARIO:
			case PortugolParser.OP_NOT_BITWISE:
			case PortugolParser.LOGICO:
			case PortugolParser.CARACTER:
			case PortugolParser.STRING:
			case PortugolParser.ID:
			case PortugolParser.REAL:
			case PortugolParser.INT:
			case PortugolParser.HEXADECIMAL:
				{
				this.state = 299;
				this.comando();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public inicializacaoPara(): InicializacaoParaContext {
		let _localctx: InicializacaoParaContext = new InicializacaoParaContext(this._ctx, this.state);
		this.enterRule(_localctx, 56, PortugolParser.RULE_inicializacaoPara);
		try {
			this.state = 305;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 28, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 302;
				this.atribuicao();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 303;
				this.listaDeclaracoes();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 304;
				this.match(PortugolParser.ID);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public condicao(): CondicaoContext {
		let _localctx: CondicaoContext = new CondicaoContext(this._ctx, this.state);
		this.enterRule(_localctx, 58, PortugolParser.RULE_condicao);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 307;
			this.expressao(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public incrementoPara(): IncrementoParaContext {
		let _localctx: IncrementoParaContext = new IncrementoParaContext(this._ctx, this.state);
		this.enterRule(_localctx, 60, PortugolParser.RULE_incrementoPara);
		try {
			this.state = 312;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 29, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 309;
				this.expressao(0);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 310;
				this.atribuicaoComposta();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 311;
				this.atribuicao();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public escolha(): EscolhaContext {
		let _localctx: EscolhaContext = new EscolhaContext(this._ctx, this.state);
		this.enterRule(_localctx, 62, PortugolParser.RULE_escolha);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 314;
			this.match(PortugolParser.ESCOLHA);
			this.state = 315;
			this.match(PortugolParser.ABRE_PARENTESES);
			this.state = 316;
			this.expressao(0);
			this.state = 317;
			this.match(PortugolParser.FECHA_PARENTESES);
			this.state = 318;
			this.match(PortugolParser.ABRE_CHAVES);
			this.state = 322;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === PortugolParser.CASO) {
				{
				{
				this.state = 319;
				this.caso();
				}
				}
				this.state = 324;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 325;
			this.match(PortugolParser.FECHA_CHAVES);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public caso(): CasoContext {
		let _localctx: CasoContext = new CasoContext(this._ctx, this.state);
		this.enterRule(_localctx, 64, PortugolParser.RULE_caso);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 327;
			this.match(PortugolParser.CASO);
			this.state = 330;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case PortugolParser.CONTRARIO:
				{
				this.state = 328;
				this.match(PortugolParser.CONTRARIO);
				}
				break;
			case PortugolParser.ABRE_PARENTESES:
			case PortugolParser.OP_NAO:
			case PortugolParser.OP_SUBTRACAO:
			case PortugolParser.OP_ADICAO:
			case PortugolParser.OP_INCREMENTO_UNARIO:
			case PortugolParser.OP_DECREMENTO_UNARIO:
			case PortugolParser.OP_NOT_BITWISE:
			case PortugolParser.LOGICO:
			case PortugolParser.CARACTER:
			case PortugolParser.STRING:
			case PortugolParser.ID:
			case PortugolParser.REAL:
			case PortugolParser.INT:
			case PortugolParser.HEXADECIMAL:
				{
				this.state = 329;
				this.expressao(0);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 332;
			this.match(PortugolParser.DOISPONTOS);
			this.state = 347;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case PortugolParser.ABRE_PARENTESES:
			case PortugolParser.FECHA_CHAVES:
			case PortugolParser.TIPO:
			case PortugolParser.FACA:
			case PortugolParser.ENQUANTO:
			case PortugolParser.PARA:
			case PortugolParser.SE:
			case PortugolParser.CONSTANTE:
			case PortugolParser.ESCOLHA:
			case PortugolParser.CASO:
			case PortugolParser.PARE:
			case PortugolParser.RETORNE:
			case PortugolParser.OP_NAO:
			case PortugolParser.OP_SUBTRACAO:
			case PortugolParser.OP_ADICAO:
			case PortugolParser.OP_INCREMENTO_UNARIO:
			case PortugolParser.OP_DECREMENTO_UNARIO:
			case PortugolParser.OP_NOT_BITWISE:
			case PortugolParser.LOGICO:
			case PortugolParser.CARACTER:
			case PortugolParser.STRING:
			case PortugolParser.ID:
			case PortugolParser.REAL:
			case PortugolParser.INT:
			case PortugolParser.HEXADECIMAL:
				{
				this.state = 336;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 32, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 333;
						this.comando();
						}
						}
					}
					this.state = 338;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 32, this._ctx);
				}
				}
				break;
			case PortugolParser.ABRE_CHAVES:
				{
				this.state = 339;
				this.match(PortugolParser.ABRE_CHAVES);
				this.state = 343;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << PortugolParser.ABRE_PARENTESES) | (1 << PortugolParser.TIPO) | (1 << PortugolParser.FACA) | (1 << PortugolParser.ENQUANTO) | (1 << PortugolParser.PARA) | (1 << PortugolParser.SE) | (1 << PortugolParser.CONSTANTE) | (1 << PortugolParser.ESCOLHA) | (1 << PortugolParser.PARE) | (1 << PortugolParser.RETORNE) | (1 << PortugolParser.OP_NAO) | (1 << PortugolParser.OP_SUBTRACAO) | (1 << PortugolParser.OP_ADICAO))) !== 0) || ((((_la - 38)) & ~0x1F) === 0 && ((1 << (_la - 38)) & ((1 << (PortugolParser.OP_INCREMENTO_UNARIO - 38)) | (1 << (PortugolParser.OP_DECREMENTO_UNARIO - 38)) | (1 << (PortugolParser.OP_NOT_BITWISE - 38)) | (1 << (PortugolParser.LOGICO - 38)) | (1 << (PortugolParser.CARACTER - 38)) | (1 << (PortugolParser.STRING - 38)) | (1 << (PortugolParser.ID - 38)) | (1 << (PortugolParser.REAL - 38)) | (1 << (PortugolParser.INT - 38)) | (1 << (PortugolParser.HEXADECIMAL - 38)))) !== 0)) {
					{
					{
					this.state = 340;
					this.comando();
					}
					}
					this.state = 345;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 346;
				this.match(PortugolParser.FECHA_CHAVES);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this.state = 350;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === PortugolParser.PARE) {
				{
				this.state = 349;
				this.pare();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public pare(): PareContext {
		let _localctx: PareContext = new PareContext(this._ctx, this.state);
		this.enterRule(_localctx, 66, PortugolParser.RULE_pare);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 352;
			this.match(PortugolParser.PARE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public indiceArray(): IndiceArrayContext {
		let _localctx: IndiceArrayContext = new IndiceArrayContext(this._ctx, this.state);
		this.enterRule(_localctx, 68, PortugolParser.RULE_indiceArray);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 354;
			this.match(PortugolParser.ABRE_COLCHETES);
			this.state = 355;
			this.expressao(0);
			this.state = 356;
			this.match(PortugolParser.FECHA_COLCHETES);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public expressao(): ExpressaoContext;
	public expressao(_p: number): ExpressaoContext;
	// @RuleVersion(0)
	public expressao(_p?: number): ExpressaoContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let _localctx: ExpressaoContext = new ExpressaoContext(this._ctx, _parentState);
		let _prevctx: ExpressaoContext = _localctx;
		let _startState: number = 70;
		this.enterRecursionRule(_localctx, 70, PortugolParser.RULE_expressao, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 434;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 50, this._ctx) ) {
			case 1:
				{
				_localctx = new ChamadaFuncaoContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 360;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 36, this._ctx) ) {
				case 1:
					{
					this.state = 359;
					this.escopoBiblioteca();
					}
					break;
				}
				this.state = 362;
				this.match(PortugolParser.ID);
				this.state = 363;
				this.match(PortugolParser.ABRE_PARENTESES);
				this.state = 365;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << PortugolParser.ABRE_PARENTESES) | (1 << PortugolParser.OP_NAO) | (1 << PortugolParser.OP_SUBTRACAO) | (1 << PortugolParser.OP_ADICAO))) !== 0) || ((((_la - 38)) & ~0x1F) === 0 && ((1 << (_la - 38)) & ((1 << (PortugolParser.OP_INCREMENTO_UNARIO - 38)) | (1 << (PortugolParser.OP_DECREMENTO_UNARIO - 38)) | (1 << (PortugolParser.OP_NOT_BITWISE - 38)) | (1 << (PortugolParser.LOGICO - 38)) | (1 << (PortugolParser.CARACTER - 38)) | (1 << (PortugolParser.STRING - 38)) | (1 << (PortugolParser.ID - 38)) | (1 << (PortugolParser.REAL - 38)) | (1 << (PortugolParser.INT - 38)) | (1 << (PortugolParser.HEXADECIMAL - 38)))) !== 0)) {
					{
					this.state = 364;
					this.listaExpressoes();
					}
				}

				this.state = 367;
				this.match(PortugolParser.FECHA_PARENTESES);
				}
				break;

			case 2:
				{
				_localctx = new ReferenciaArrayContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 369;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 38, this._ctx) ) {
				case 1:
					{
					this.state = 368;
					this.escopoBiblioteca();
					}
					break;
				}
				this.state = 371;
				this.match(PortugolParser.ID);
				this.state = 372;
				this.indiceArray();
				}
				break;

			case 3:
				{
				_localctx = new ReferenciaMatrizContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 374;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 39, this._ctx) ) {
				case 1:
					{
					this.state = 373;
					this.escopoBiblioteca();
					}
					break;
				}
				this.state = 376;
				this.match(PortugolParser.ID);
				this.state = 377;
				this.indiceArray();
				this.state = 379;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 40, this._ctx) ) {
				case 1:
					{
					this.state = 378;
					this.indiceArray();
					}
					break;
				}
				}
				break;

			case 4:
				{
				_localctx = new MenosUnarioContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 381;
				this.match(PortugolParser.OP_SUBTRACAO);
				this.state = 382;
				this.expressao(33);
				}
				break;

			case 5:
				{
				_localctx = new MaisUnarioContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 383;
				this.match(PortugolParser.OP_ADICAO);
				this.state = 384;
				this.expressao(32);
				}
				break;

			case 6:
				{
				_localctx = new NegacaoContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 385;
				this.match(PortugolParser.OP_NAO);
				this.state = 386;
				this.expressao(31);
				}
				break;

			case 7:
				{
				_localctx = new NegacaoBitwiseContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 387;
				this.match(PortugolParser.OP_NOT_BITWISE);
				this.state = 388;
				this.expressao(30);
				}
				break;

			case 8:
				{
				_localctx = new IncrementoUnarioPosfixadoContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 389;
				this.match(PortugolParser.ID);
				this.state = 394;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === PortugolParser.ABRE_COLCHETES) {
					{
					this.state = 390;
					this.indiceArray();
					this.state = 392;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la === PortugolParser.ABRE_COLCHETES) {
						{
						this.state = 391;
						this.indiceArray();
						}
					}

					}
				}

				this.state = 396;
				this.match(PortugolParser.OP_INCREMENTO_UNARIO);
				}
				break;

			case 9:
				{
				_localctx = new DecrementoUnarioPosfixadoContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 397;
				this.match(PortugolParser.ID);
				this.state = 402;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === PortugolParser.ABRE_COLCHETES) {
					{
					this.state = 398;
					this.indiceArray();
					this.state = 400;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la === PortugolParser.ABRE_COLCHETES) {
						{
						this.state = 399;
						this.indiceArray();
						}
					}

					}
				}

				this.state = 404;
				this.match(PortugolParser.OP_DECREMENTO_UNARIO);
				}
				break;

			case 10:
				{
				_localctx = new IncrementoUnarioPrefixadoContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 405;
				this.match(PortugolParser.OP_INCREMENTO_UNARIO);
				this.state = 406;
				this.match(PortugolParser.ID);
				this.state = 411;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 46, this._ctx) ) {
				case 1:
					{
					this.state = 407;
					this.indiceArray();
					this.state = 409;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 45, this._ctx) ) {
					case 1:
						{
						this.state = 408;
						this.indiceArray();
						}
						break;
					}
					}
					break;
				}
				}
				break;

			case 11:
				{
				_localctx = new DecrementoUnarioPrefixadoContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 413;
				this.match(PortugolParser.OP_DECREMENTO_UNARIO);
				this.state = 414;
				this.match(PortugolParser.ID);
				this.state = 419;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 48, this._ctx) ) {
				case 1:
					{
					this.state = 415;
					this.indiceArray();
					this.state = 417;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 47, this._ctx) ) {
					case 1:
						{
						this.state = 416;
						this.indiceArray();
						}
						break;
					}
					}
					break;
				}
				}
				break;

			case 12:
				{
				_localctx = new ReferenciaParaVariavelContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 422;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 49, this._ctx) ) {
				case 1:
					{
					this.state = 421;
					this.escopoBiblioteca();
					}
					break;
				}
				this.state = 424;
				this.match(PortugolParser.ID);
				}
				break;

			case 13:
				{
				_localctx = new NumeroInteiroContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 425;
				_la = this._input.LA(1);
				if (!(_la === PortugolParser.INT || _la === PortugolParser.HEXADECIMAL)) {
				this._errHandler.recoverInline(this);
				} else {
					if (this._input.LA(1) === Token.EOF) {
						this.matchedEOF = true;
					}

					this._errHandler.reportMatch(this);
					this.consume();
				}
				}
				break;

			case 14:
				{
				_localctx = new NumeroRealContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 426;
				this.match(PortugolParser.REAL);
				}
				break;

			case 15:
				{
				_localctx = new ValorLogicoContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 427;
				this.match(PortugolParser.LOGICO);
				}
				break;

			case 16:
				{
				_localctx = new CaracterContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 428;
				this.match(PortugolParser.CARACTER);
				}
				break;

			case 17:
				{
				_localctx = new StringContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 429;
				this.match(PortugolParser.STRING);
				}
				break;

			case 18:
				{
				_localctx = new ExpressaoEntreParentesesContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 430;
				this.match(PortugolParser.ABRE_PARENTESES);
				this.state = 431;
				this.expressao(0);
				this.state = 432;
				this.match(PortugolParser.FECHA_PARENTESES);
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 492;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 52, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 490;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 51, this._ctx) ) {
					case 1:
						{
						_localctx = new MultiplicacaoContext(new ExpressaoContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, PortugolParser.RULE_expressao);
						this.state = 436;
						if (!(this.precpred(this._ctx, 25))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 25)");
						}
						this.state = 437;
						this.match(PortugolParser.OP_MULTIPLICACAO);
						this.state = 438;
						this.expressao(26);
						}
						break;

					case 2:
						{
						_localctx = new DivisaoContext(new ExpressaoContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, PortugolParser.RULE_expressao);
						this.state = 439;
						if (!(this.precpred(this._ctx, 24))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 24)");
						}
						this.state = 440;
						this.match(PortugolParser.OP_DIVISAO);
						this.state = 441;
						this.expressao(25);
						}
						break;

					case 3:
						{
						_localctx = new ModuloContext(new ExpressaoContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, PortugolParser.RULE_expressao);
						this.state = 442;
						if (!(this.precpred(this._ctx, 23))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 23)");
						}
						this.state = 443;
						this.match(PortugolParser.OP_MOD);
						this.state = 444;
						this.expressao(24);
						}
						break;

					case 4:
						{
						_localctx = new AdicaoContext(new ExpressaoContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, PortugolParser.RULE_expressao);
						this.state = 445;
						if (!(this.precpred(this._ctx, 22))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 22)");
						}
						this.state = 446;
						this.match(PortugolParser.OP_ADICAO);
						this.state = 447;
						this.expressao(23);
						}
						break;

					case 5:
						{
						_localctx = new SubtracaoContext(new ExpressaoContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, PortugolParser.RULE_expressao);
						this.state = 448;
						if (!(this.precpred(this._ctx, 21))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 21)");
						}
						this.state = 449;
						this.match(PortugolParser.OP_SUBTRACAO);
						this.state = 450;
						this.expressao(22);
						}
						break;

					case 6:
						{
						_localctx = new OperacaoIgualdadeContext(new ExpressaoContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, PortugolParser.RULE_expressao);
						this.state = 451;
						if (!(this.precpred(this._ctx, 20))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 20)");
						}
						this.state = 452;
						this.match(PortugolParser.OP_IGUALDADE);
						this.state = 453;
						this.expressao(21);
						}
						break;

					case 7:
						{
						_localctx = new OperacaoDiferencaContext(new ExpressaoContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, PortugolParser.RULE_expressao);
						this.state = 454;
						if (!(this.precpred(this._ctx, 19))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 19)");
						}
						this.state = 455;
						this.match(PortugolParser.OP_DIFERENCA);
						this.state = 456;
						this.expressao(20);
						}
						break;

					case 8:
						{
						_localctx = new OperacaoMaiorContext(new ExpressaoContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, PortugolParser.RULE_expressao);
						this.state = 457;
						if (!(this.precpred(this._ctx, 18))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 18)");
						}
						this.state = 458;
						this.match(PortugolParser.OP_MAIOR);
						this.state = 459;
						this.expressao(19);
						}
						break;

					case 9:
						{
						_localctx = new OperacaoMenorContext(new ExpressaoContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, PortugolParser.RULE_expressao);
						this.state = 460;
						if (!(this.precpred(this._ctx, 17))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 17)");
						}
						this.state = 461;
						this.match(PortugolParser.OP_MENOR);
						this.state = 462;
						this.expressao(18);
						}
						break;

					case 10:
						{
						_localctx = new OperacaoMenorIgualContext(new ExpressaoContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, PortugolParser.RULE_expressao);
						this.state = 463;
						if (!(this.precpred(this._ctx, 16))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 16)");
						}
						this.state = 464;
						this.match(PortugolParser.OP_MENOR_IGUAL);
						this.state = 465;
						this.expressao(17);
						}
						break;

					case 11:
						{
						_localctx = new OperacaoMaiorIgualContext(new ExpressaoContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, PortugolParser.RULE_expressao);
						this.state = 466;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 467;
						this.match(PortugolParser.OP_MAIOR_IGUAL);
						this.state = 468;
						this.expressao(16);
						}
						break;

					case 12:
						{
						_localctx = new OperacaoELogicoContext(new ExpressaoContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, PortugolParser.RULE_expressao);
						this.state = 469;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 470;
						this.match(PortugolParser.OP_E_LOGICO);
						this.state = 471;
						this.expressao(15);
						}
						break;

					case 13:
						{
						_localctx = new OperacaoOuLogicoContext(new ExpressaoContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, PortugolParser.RULE_expressao);
						this.state = 472;
						if (!(this.precpred(this._ctx, 13))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 13)");
						}
						this.state = 473;
						this.match(PortugolParser.OP_OU_LOGICO);
						this.state = 474;
						this.expressao(14);
						}
						break;

					case 14:
						{
						_localctx = new OperacaoXorContext(new ExpressaoContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, PortugolParser.RULE_expressao);
						this.state = 475;
						if (!(this.precpred(this._ctx, 12))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
						}
						this.state = 476;
						this.match(PortugolParser.OP_XOR);
						this.state = 477;
						this.expressao(13);
						}
						break;

					case 15:
						{
						_localctx = new OperacaoShiftLeftContext(new ExpressaoContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, PortugolParser.RULE_expressao);
						this.state = 478;
						if (!(this.precpred(this._ctx, 11))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 11)");
						}
						this.state = 479;
						this.match(PortugolParser.OP_SHIFT_LEFT);
						this.state = 480;
						this.expressao(12);
						}
						break;

					case 16:
						{
						_localctx = new OperacaoShiftRightContext(new ExpressaoContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, PortugolParser.RULE_expressao);
						this.state = 481;
						if (!(this.precpred(this._ctx, 10))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 10)");
						}
						this.state = 482;
						this.match(PortugolParser.OP_SHIFT_RIGHT);
						this.state = 483;
						this.expressao(11);
						}
						break;

					case 17:
						{
						_localctx = new OperacaoAndBitwiseContext(new ExpressaoContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, PortugolParser.RULE_expressao);
						this.state = 484;
						if (!(this.precpred(this._ctx, 9))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 9)");
						}
						this.state = 485;
						this.match(PortugolParser.E_COMERCIAL);
						this.state = 486;
						this.expressao(10);
						}
						break;

					case 18:
						{
						_localctx = new OperacaoOrBitwiseContext(new ExpressaoContext(_parentctx, _parentState));
						this.pushNewRecursionContext(_localctx, _startState, PortugolParser.RULE_expressao);
						this.state = 487;
						if (!(this.precpred(this._ctx, 8))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 8)");
						}
						this.state = 488;
						this.match(PortugolParser.OP_OU_BITWISE);
						this.state = 489;
						this.expressao(9);
						}
						break;
					}
					}
				}
				this.state = 494;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 52, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public listaExpressoes(): ListaExpressoesContext {
		let _localctx: ListaExpressoesContext = new ListaExpressoesContext(this._ctx, this.state);
		this.enterRule(_localctx, 72, PortugolParser.RULE_listaExpressoes);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 498;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 53, this._ctx) ) {
			case 1:
				{
				this.state = 495;
				this.expressao(0);
				}
				break;

			case 2:
				{
				this.state = 496;
				this.atribuicaoComposta();
				}
				break;

			case 3:
				{
				this.state = 497;
				this.atribuicao();
				}
				break;
			}
			this.state = 508;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === PortugolParser.VIRGULA) {
				{
				{
				this.state = 500;
				this.match(PortugolParser.VIRGULA);
				this.state = 504;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 54, this._ctx) ) {
				case 1:
					{
					this.state = 501;
					this.expressao(0);
					}
					break;

				case 2:
					{
					this.state = 502;
					this.atribuicaoComposta();
					}
					break;

				case 3:
					{
					this.state = 503;
					this.atribuicao();
					}
					break;
				}
				}
				}
				this.state = 510;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public escopoBiblioteca(): EscopoBibliotecaContext {
		let _localctx: EscopoBibliotecaContext = new EscopoBibliotecaContext(this._ctx, this.state);
		this.enterRule(_localctx, 74, PortugolParser.RULE_escopoBiblioteca);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			{
			this.state = 511;
			this.match(PortugolParser.ID);
			this.state = 512;
			this.match(PortugolParser.PONTO);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 35:
			return this.expressao_sempred(_localctx as ExpressaoContext, predIndex);
		}
		return true;
	}
	private expressao_sempred(_localctx: ExpressaoContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 25);

		case 1:
			return this.precpred(this._ctx, 24);

		case 2:
			return this.precpred(this._ctx, 23);

		case 3:
			return this.precpred(this._ctx, 22);

		case 4:
			return this.precpred(this._ctx, 21);

		case 5:
			return this.precpred(this._ctx, 20);

		case 6:
			return this.precpred(this._ctx, 19);

		case 7:
			return this.precpred(this._ctx, 18);

		case 8:
			return this.precpred(this._ctx, 17);

		case 9:
			return this.precpred(this._ctx, 16);

		case 10:
			return this.precpred(this._ctx, 15);

		case 11:
			return this.precpred(this._ctx, 14);

		case 12:
			return this.precpred(this._ctx, 13);

		case 13:
			return this.precpred(this._ctx, 12);

		case 14:
			return this.precpred(this._ctx, 11);

		case 15:
			return this.precpred(this._ctx, 10);

		case 16:
			return this.precpred(this._ctx, 9);

		case 17:
			return this.precpred(this._ctx, 8);
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03D\u0205\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17\x04" +
		"\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x04\x1C\t\x1C\x04" +
		"\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04 \t \x04!\t!\x04\"\t\"\x04#" +
		"\t#\x04$\t$\x04%\t%\x04&\t&\x04\'\t\'\x03\x02\x03\x02\x03\x02\x07\x02" +
		"R\n\x02\f\x02\x0E\x02U\v\x02\x03\x02\x03\x02\x07\x02Y\n\x02\f\x02\x0E" +
		"\x02\\\v\x02\x03\x02\x03\x02\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x05" +
		"\x03e\n\x03\x03\x04\x05\x04h\n\x04\x03\x04\x03\x04\x03\x04\x03\x04\x07" +
		"\x04n\n\x04\f\x04\x0E\x04q\v\x04\x03\x05\x03\x05\x03\x05\x05\x05v\n\x05" +
		"\x03\x06\x03\x06\x03\x06\x05\x06{\n\x06\x03\x07\x03\x07\x03\x07\x05\x07" +
		"\x80\n\x07\x03\x07\x03\x07\x03\x07\x05\x07\x85\n\x07\x03\x07\x03\x07\x03" +
		"\x07\x05\x07\x8A\n\x07\x03\b\x03\b\x03\b\x03\b\x07\b\x90\n\b\f\b\x0E\b" +
		"\x93\v\b\x03\b\x03\b\x03\t\x03\t\x03\n\x03\n\x03\v\x03\v\x03\v\x05\v\x9E" +
		"\n\v\x03\v\x03\v\x03\v\x05\v\xA3\n\v\x03\f\x03\f\x05\f\xA7\n\f\x03\f\x03" +
		"\f\x03\r\x03\r\x03\x0E\x03\x0E\x05\x0E\xAF\n\x0E\x03\x0E\x03\x0E\x03\x0E" +
		"\x03\x0E\x07\x0E\xB5\n\x0E\f\x0E\x0E\x0E\xB8\v\x0E\x03\x0E\x03\x0E\x03" +
		"\x0F\x03\x0F\x05\x0F\xBE\n\x0F\x03\x0F\x03\x0F\x03\x10\x03\x10\x03\x10" +
		"\x07\x10\xC5\n\x10\f\x10\x0E\x10\xC8\v\x10\x03\x11\x03\x11\x05\x11\xCC" +
		"\n\x11\x03\x11\x03\x11\x03\x11\x05\x11\xD1\n\x11\x03\x12\x03\x12\x03\x12" +
		"\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x14\x03\x14\x03\x14\x03\x14" +
		"\x03\x14\x03\x14\x03\x14\x03\x14\x03\x14\x03\x14\x03\x14\x05\x14\xE6\n" +
		"\x14\x03\x15\x03\x15\x03\x15\x03\x15\x03\x16\x03\x16\x03\x16\x03\x16\x03" +
		"\x16\x03\x16\x03\x16\x03\x16\x03\x16\x03\x16\x03\x16\x03\x16\x03\x16\x03" +
		"\x16\x03\x16\x03\x16\x05\x16\xFC\n\x16\x03\x17\x03\x17\x05\x17\u0100\n" +
		"\x17\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x05\x18\u0108\n\x18" +
		"\x03\x19\x03\x19\x03\x19\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A" +
		"\x03\x1B\x03\x1B\x03\x1B\x03\x1B\x03\x1B\x03\x1B\x03\x1B\x03\x1C\x03\x1C" +
		"\x03\x1C\x05\x1C\u011D\n\x1C\x03\x1C\x03\x1C\x03\x1C\x03\x1C\x03\x1C\x03" +
		"\x1C\x03\x1C\x03\x1D\x03\x1D\x07\x1D\u0128\n\x1D\f\x1D\x0E\x1D\u012B\v" +
		"\x1D\x03\x1D\x03\x1D\x05\x1D\u012F\n\x1D\x03\x1E\x03\x1E\x03\x1E\x05\x1E" +
		"\u0134\n\x1E\x03\x1F\x03\x1F\x03 \x03 \x03 \x05 \u013B\n \x03!\x03!\x03" +
		"!\x03!\x03!\x03!\x07!\u0143\n!\f!\x0E!\u0146\v!\x03!\x03!\x03\"\x03\"" +
		"\x03\"\x05\"\u014D\n\"\x03\"\x03\"\x07\"\u0151\n\"\f\"\x0E\"\u0154\v\"" +
		"\x03\"\x03\"\x07\"\u0158\n\"\f\"\x0E\"\u015B\v\"\x03\"\x05\"\u015E\n\"" +
		"\x03\"\x05\"\u0161\n\"\x03#\x03#\x03$\x03$\x03$\x03$\x03%\x03%\x05%\u016B" +
		"\n%\x03%\x03%\x03%\x05%\u0170\n%\x03%\x03%\x05%\u0174\n%\x03%\x03%\x03" +
		"%\x05%\u0179\n%\x03%\x03%\x03%\x05%\u017E\n%\x03%\x03%\x03%\x03%\x03%" +
		"\x03%\x03%\x03%\x03%\x03%\x03%\x05%\u018B\n%\x05%\u018D\n%\x03%\x03%\x03" +
		"%\x03%\x05%\u0193\n%\x05%\u0195\n%\x03%\x03%\x03%\x03%\x03%\x05%\u019C" +
		"\n%\x05%\u019E\n%\x03%\x03%\x03%\x03%\x05%\u01A4\n%\x05%\u01A6\n%\x03" +
		"%\x05%\u01A9\n%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x05" +
		"%\u01B5\n%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03" +
		"%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03" +
		"%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03" +
		"%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03%\x03" +
		"%\x07%\u01ED\n%\f%\x0E%\u01F0\v%\x03&\x03&\x03&\x05&\u01F5\n&\x03&\x03" +
		"&\x03&\x03&\x05&\u01FB\n&\x07&\u01FD\n&\f&\x0E&\u0200\v&\x03\'\x03\'\x03" +
		"\'\x03\'\x02\x02\x03H(\x02\x02\x04\x02\x06\x02\b\x02\n\x02\f\x02\x0E\x02" +
		"\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A\x02\x1C\x02\x1E\x02 \x02" +
		"\"\x02$\x02&\x02(\x02*\x02,\x02.\x020\x022\x024\x026\x028\x02:\x02<\x02" +
		">\x02@\x02B\x02D\x02F\x02H\x02J\x02L\x02\x02\x03\x03\x02<=\x02\u0247\x02" +
		"N\x03\x02\x02\x02\x04_\x03\x02\x02\x02\x06g\x03\x02\x02\x02\bu\x03\x02" +
		"\x02\x02\nw\x03\x02\x02\x02\f|\x03\x02\x02\x02\x0E\x8B\x03\x02\x02\x02" +
		"\x10\x96\x03\x02\x02\x02\x12\x98\x03\x02\x02\x02\x14\x9A\x03\x02\x02\x02" +
		"\x16\xA4\x03\x02\x02\x02\x18\xAA\x03\x02\x02\x02\x1A\xAC\x03\x02\x02\x02" +
		"\x1C\xBB\x03\x02\x02\x02\x1E\xC1\x03\x02\x02\x02 \xC9\x03\x02\x02\x02" +
		"\"\xD2\x03\x02\x02\x02$\xD5\x03\x02\x02\x02&\xE5\x03\x02\x02\x02(\xE7" +
		"\x03\x02\x02\x02*\xFB\x03\x02\x02\x02,\xFD\x03\x02\x02\x02.\u0101\x03" +
		"\x02\x02\x020\u0109\x03\x02\x02\x022\u010C\x03\x02\x02\x024\u0112\x03" +
		"\x02\x02\x026\u0119\x03\x02\x02\x028\u012E\x03\x02\x02\x02:\u0133\x03" +
		"\x02\x02\x02<\u0135\x03\x02\x02\x02>\u013A\x03\x02\x02\x02@\u013C\x03" +
		"\x02\x02\x02B\u0149\x03\x02\x02\x02D\u0162\x03\x02\x02\x02F\u0164\x03" +
		"\x02\x02\x02H\u01B4\x03\x02\x02\x02J\u01F4\x03\x02\x02\x02L\u0201\x03" +
		"\x02\x02\x02NO\x07\x11\x02\x02OS\x07\x07\x02\x02PR\x05\x04\x03\x02QP\x03" +
		"\x02\x02\x02RU\x03\x02\x02\x02SQ\x03\x02\x02\x02ST\x03\x02\x02\x02TZ\x03" +
		"\x02\x02\x02US\x03\x02\x02\x02VY\x05\x1A\x0E\x02WY\x05\x06\x04\x02XV\x03" +
		"\x02\x02\x02XW\x03\x02\x02\x02Y\\\x03\x02\x02\x02ZX\x03\x02\x02\x02Z[" +
		"\x03\x02\x02\x02[]\x03\x02\x02\x02\\Z\x03\x02\x02\x02]^\x07\b\x02\x02" +
		"^\x03\x03\x02\x02\x02_`\x07\x17\x02\x02`a\x07\x18\x02\x02ad\x07:\x02\x02" +
		"bc\x07/\x02\x02ce\x07:\x02\x02db\x03\x02\x02\x02de\x03\x02\x02\x02e\x05" +
		"\x03\x02\x02\x02fh\x07\x0F\x02\x02gf\x03\x02\x02\x02gh\x03\x02\x02\x02" +
		"hi\x03\x02\x02\x02ij\x07\t\x02\x02jo\x05\b\x05\x02kl\x07B\x02\x02ln\x05" +
		"\b\x05\x02mk\x03\x02\x02\x02nq\x03\x02\x02\x02om\x03\x02\x02\x02op\x03" +
		"\x02\x02\x02p\x07\x03\x02\x02\x02qo\x03\x02\x02\x02rv\x05\n\x06\x02sv" +
		"\x05\x14\v\x02tv\x05\f\x07\x02ur\x03\x02\x02\x02us\x03\x02\x02\x02ut\x03" +
		"\x02\x02\x02v\t\x03\x02\x02\x02wz\x07:\x02\x02xy\x07!\x02\x02y{\x05H%" +
		"\x02zx\x03\x02\x02\x02z{\x03\x02\x02\x02{\v\x03\x02\x02\x02|}\x07:\x02" +
		"\x02}\x7F\x07\x05\x02\x02~\x80\x05\x10\t\x02\x7F~\x03\x02\x02\x02\x7F" +
		"\x80\x03\x02\x02\x02\x80\x81\x03\x02\x02\x02\x81\x82\x07\x06\x02\x02\x82" +
		"\x84\x07\x05\x02\x02\x83\x85\x05\x12\n\x02\x84\x83\x03\x02\x02\x02\x84" +
		"\x85\x03\x02\x02\x02\x85\x86\x03\x02\x02\x02\x86\x89\x07\x06\x02\x02\x87" +
		"\x88\x07!\x02\x02\x88\x8A\x05\x0E\b\x02\x89\x87\x03\x02\x02\x02\x89\x8A" +
		"\x03\x02\x02\x02\x8A\r\x03\x02\x02\x02\x8B\x8C\x07\x07\x02\x02\x8C\x91" +
		"\x05\x16\f\x02\x8D\x8E\x07B\x02\x02\x8E\x90\x05\x16\f\x02\x8F\x8D\x03" +
		"\x02\x02\x02\x90\x93\x03\x02\x02\x02\x91\x8F\x03\x02\x02\x02\x91\x92\x03" +
		"\x02\x02\x02\x92\x94\x03\x02\x02\x02\x93\x91\x03\x02\x02\x02\x94\x95\x07" +
		"\b\x02\x02\x95\x0F\x03\x02\x02\x02\x96\x97\x05\x18\r\x02\x97\x11\x03\x02" +
		"\x02\x02\x98\x99\x05\x18\r\x02\x99\x13\x03\x02\x02\x02\x9A\x9B\x07:\x02" +
		"\x02\x9B\x9D\x07\x05\x02\x02\x9C\x9E\x05\x18\r\x02\x9D\x9C\x03\x02\x02" +
		"\x02\x9D\x9E\x03\x02\x02\x02\x9E\x9F\x03\x02\x02\x02\x9F\xA2\x07\x06\x02" +
		"\x02\xA0\xA1\x07!\x02\x02\xA1\xA3\x05\x16\f\x02\xA2\xA0\x03\x02\x02\x02" +
		"\xA2\xA3\x03\x02\x02\x02\xA3\x15\x03\x02\x02\x02\xA4\xA6\x07\x07\x02\x02" +
		"\xA5\xA7\x05J&\x02\xA6\xA5\x03\x02\x02\x02\xA6\xA7\x03\x02\x02\x02\xA7" +
		"\xA8\x03\x02\x02\x02\xA8\xA9\x07\b\x02\x02\xA9\x17\x03\x02\x02\x02\xAA" +
		"\xAB\x05H%\x02\xAB\x19\x03\x02\x02\x02\xAC\xAE\x07\x10\x02\x02\xAD\xAF" +
		"\x07\t\x02\x02\xAE\xAD\x03\x02\x02\x02\xAE\xAF\x03\x02\x02\x02\xAF\xB0" +
		"\x03\x02\x02\x02\xB0\xB1\x07:\x02\x02\xB1\xB2\x05\x1C\x0F\x02\xB2\xB6" +
		"\x07\x07\x02\x02\xB3\xB5\x05&\x14\x02\xB4\xB3\x03\x02\x02\x02\xB5\xB8" +
		"\x03\x02\x02\x02\xB6\xB4\x03\x02\x02\x02\xB6\xB7\x03\x02\x02\x02\xB7\xB9" +
		"\x03\x02\x02\x02\xB8\xB6\x03\x02\x02\x02\xB9\xBA\x07\b\x02\x02\xBA\x1B" +
		"\x03\x02\x02\x02\xBB\xBD\x07\x03\x02\x02\xBC\xBE\x05\x1E\x10\x02\xBD\xBC" +
		"\x03\x02\x02\x02\xBD\xBE\x03\x02\x02\x02\xBE\xBF\x03\x02\x02\x02\xBF\xC0" +
		"\x07\x04\x02\x02\xC0\x1D\x03\x02\x02\x02\xC1\xC6\x05 \x11\x02\xC2\xC3" +
		"\x07B\x02\x02\xC3\xC5\x05 \x11\x02\xC4\xC2\x03\x02\x02\x02\xC5\xC8\x03" +
		"\x02\x02\x02\xC6\xC4\x03\x02\x02\x02\xC6\xC7\x03\x02\x02\x02\xC7\x1F\x03" +
		"\x02\x02\x02\xC8\xC6\x03\x02\x02\x02\xC9\xCB\x07\t\x02\x02\xCA\xCC\x07" +
		"0\x02\x02\xCB\xCA\x03\x02\x02\x02\xCB\xCC\x03\x02\x02\x02\xCC\xCD\x03" +
		"\x02\x02\x02\xCD\xD0\x07:\x02\x02\xCE\xD1\x05\"\x12\x02\xCF\xD1\x05$\x13" +
		"\x02\xD0\xCE\x03\x02\x02\x02\xD0\xCF\x03\x02\x02\x02\xD0\xD1\x03\x02\x02" +
		"\x02\xD1!\x03\x02\x02\x02\xD2\xD3\x07\x05\x02\x02\xD3\xD4\x07\x06\x02" +
		"\x02\xD4#\x03\x02\x02\x02\xD5\xD6\x07\x05\x02\x02\xD6\xD7\x07\x06\x02" +
		"\x02\xD7\xD8\x07\x05\x02\x02\xD8\xD9\x07\x06\x02\x02\xD9%\x03\x02\x02" +
		"\x02\xDA\xE6\x05\x06\x04\x02\xDB\xE6\x05.\x18\x02\xDC\xE6\x052\x1A\x02" +
		"\xDD\xE6\x054\x1B\x02\xDE\xE6\x056\x1C\x02\xDF\xE6\x05@!\x02\xE0\xE6\x05" +
		",\x17\x02\xE1\xE6\x05D#\x02\xE2\xE6\x05(\x15\x02\xE3\xE6\x05*\x16\x02" +
		"\xE4\xE6\x05H%\x02\xE5\xDA\x03\x02\x02\x02\xE5\xDB\x03\x02\x02\x02\xE5" +
		"\xDC\x03\x02\x02\x02\xE5\xDD\x03\x02\x02\x02\xE5\xDE\x03\x02\x02\x02\xE5" +
		"\xDF\x03\x02\x02\x02\xE5\xE0\x03\x02\x02\x02\xE5\xE1\x03\x02\x02\x02\xE5" +
		"\xE2\x03\x02\x02\x02\xE5\xE3\x03\x02\x02\x02\xE5\xE4\x03\x02\x02\x02\xE6" +
		"\'\x03\x02\x02\x02\xE7\xE8\x05H%\x02\xE8\xE9\x07!\x02\x02\xE9\xEA\x05" +
		"H%\x02\xEA)\x03\x02\x02\x02\xEB\xEC\x05H%\x02\xEC\xED\x071\x02\x02\xED" +
		"\xEE\x05H%\x02\xEE\xFC\x03\x02\x02\x02\xEF\xF0\x05H%\x02\xF0\xF1\x072" +
		"\x02\x02\xF1\xF2\x05H%\x02\xF2\xFC\x03\x02\x02\x02\xF3\xF4\x05H%\x02\xF4" +
		"\xF5\x073\x02\x02\xF5\xF6\x05H%\x02\xF6\xFC\x03\x02\x02\x02\xF7\xF8\x05" +
		"H%\x02\xF8\xF9\x074\x02\x02\xF9\xFA\x05H%\x02\xFA\xFC\x03\x02\x02\x02" +
		"\xFB\xEB\x03\x02\x02\x02\xFB\xEF\x03\x02\x02\x02\xFB\xF3\x03\x02\x02\x02" +
		"\xFB\xF7\x03\x02\x02\x02\xFC+\x03\x02\x02\x02\xFD\xFF\x07\x16\x02\x02" +
		"\xFE\u0100\x05H%\x02\xFF\xFE\x03\x02\x02\x02\xFF\u0100\x03\x02\x02\x02" +
		"\u0100-\x03\x02\x02\x02\u0101\u0102\x07\r\x02\x02\u0102\u0103\x07\x03" +
		"\x02\x02\u0103\u0104\x05H%\x02\u0104\u0105\x07\x04\x02\x02\u0105\u0107" +
		"\x058\x1D\x02\u0106\u0108\x050\x19\x02\u0107\u0106\x03\x02\x02\x02\u0107" +
		"\u0108\x03\x02\x02\x02\u0108/\x03\x02\x02\x02\u0109\u010A\x07\x0E\x02" +
		"\x02\u010A\u010B\x058\x1D\x02\u010B1\x03\x02\x02\x02\u010C\u010D\x07\v" +
		"\x02\x02\u010D\u010E\x07\x03\x02\x02\u010E\u010F\x05H%\x02\u010F\u0110" +
		"\x07\x04\x02\x02\u0110\u0111\x058\x1D\x02\u01113\x03\x02\x02\x02\u0112" +
		"\u0113\x07\n\x02\x02\u0113\u0114\x058\x1D\x02\u0114\u0115\x07\v\x02\x02" +
		"\u0115\u0116\x07\x03\x02\x02\u0116\u0117\x05H%\x02\u0117\u0118\x07\x04" +
		"\x02\x02\u01185\x03\x02\x02\x02\u0119\u011A\x07\f\x02\x02\u011A\u011C" +
		"\x07\x03\x02\x02\u011B\u011D\x05:\x1E\x02\u011C\u011B\x03\x02\x02\x02" +
		"\u011C\u011D\x03\x02\x02\x02\u011D\u011E\x03\x02\x02\x02\u011E\u011F\x07" +
		"C\x02\x02\u011F\u0120\x05<\x1F\x02\u0120\u0121\x07C\x02\x02\u0121\u0122" +
		"\x05> \x02\u0122\u0123\x07\x04\x02\x02\u0123\u0124\x058\x1D\x02\u0124" +
		"7\x03\x02\x02\x02\u0125\u0129\x07\x07\x02\x02\u0126\u0128\x05&\x14\x02" +
		"\u0127\u0126\x03\x02\x02\x02\u0128\u012B\x03\x02\x02\x02\u0129\u0127\x03" +
		"\x02\x02\x02\u0129\u012A\x03\x02\x02\x02\u012A\u012C\x03\x02\x02\x02\u012B" +
		"\u0129\x03\x02\x02\x02\u012C\u012F\x07\b\x02\x02\u012D\u012F\x05&\x14" +
		"\x02\u012E\u0125\x03\x02\x02\x02\u012E\u012D\x03\x02\x02\x02\u012F9\x03" +
		"\x02\x02\x02\u0130\u0134\x05(\x15\x02\u0131\u0134\x05\x06\x04\x02\u0132" +
		"\u0134\x07:\x02\x02\u0133\u0130\x03\x02\x02\x02\u0133\u0131\x03\x02\x02" +
		"\x02\u0133\u0132\x03\x02\x02\x02\u0134;\x03\x02\x02\x02\u0135\u0136\x05" +
		"H%\x02\u0136=\x03\x02\x02\x02\u0137\u013B\x05H%\x02\u0138\u013B\x05*\x16" +
		"\x02\u0139\u013B\x05(\x15\x02\u013A\u0137\x03\x02\x02\x02\u013A\u0138" +
		"\x03\x02\x02\x02\u013A\u0139\x03\x02\x02\x02\u013B?\x03\x02\x02\x02\u013C" +
		"\u013D\x07\x12\x02\x02\u013D\u013E\x07\x03\x02\x02\u013E\u013F\x05H%\x02" +
		"\u013F\u0140\x07\x04\x02\x02\u0140\u0144\x07\x07\x02\x02\u0141\u0143\x05" +
		"B\"\x02\u0142\u0141\x03\x02\x02\x02\u0143\u0146\x03\x02\x02\x02\u0144" +
		"\u0142\x03\x02\x02\x02\u0144\u0145\x03\x02\x02\x02\u0145\u0147\x03\x02" +
		"\x02\x02\u0146\u0144\x03\x02\x02\x02\u0147\u0148\x07\b\x02\x02\u0148A" +
		"\x03\x02\x02\x02\u0149\u014C\x07\x13\x02\x02\u014A\u014D\x07\x14\x02\x02" +
		"\u014B\u014D\x05H%\x02\u014C\u014A\x03\x02\x02\x02\u014C\u014B\x03\x02" +
		"\x02\x02\u014D\u014E\x03\x02\x02\x02\u014E\u015D\x07D\x02\x02\u014F\u0151" +
		"\x05&\x14\x02\u0150\u014F\x03\x02\x02\x02\u0151\u0154\x03\x02\x02\x02" +
		"\u0152\u0150\x03\x02\x02\x02\u0152\u0153\x03\x02\x02\x02\u0153\u015E\x03" +
		"\x02\x02\x02\u0154\u0152\x03\x02\x02\x02\u0155\u0159\x07\x07\x02\x02\u0156" +
		"\u0158\x05&\x14\x02\u0157\u0156\x03\x02\x02\x02\u0158\u015B\x03\x02\x02" +
		"\x02\u0159\u0157\x03\x02\x02\x02\u0159\u015A\x03\x02\x02\x02\u015A\u015C" +
		"\x03\x02\x02\x02\u015B\u0159\x03\x02\x02\x02\u015C\u015E\x07\b\x02\x02" +
		"\u015D\u0152\x03\x02\x02\x02\u015D\u0155\x03\x02\x02\x02\u015E\u0160\x03" +
		"\x02\x02\x02\u015F\u0161\x05D#\x02\u0160\u015F\x03\x02\x02\x02\u0160\u0161" +
		"\x03\x02\x02\x02\u0161C\x03\x02\x02\x02\u0162\u0163\x07\x15\x02\x02\u0163" +
		"E\x03\x02\x02\x02\u0164\u0165\x07\x05\x02\x02\u0165\u0166\x05H%\x02\u0166" +
		"\u0167\x07\x06\x02\x02\u0167G\x03\x02\x02\x02\u0168\u016A\b%\x01\x02\u0169" +
		"\u016B\x05L\'\x02\u016A\u0169\x03\x02\x02\x02\u016A\u016B\x03\x02\x02" +
		"\x02\u016B\u016C\x03\x02\x02\x02\u016C\u016D\x07:\x02\x02\u016D\u016F" +
		"\x07\x03\x02\x02\u016E\u0170\x05J&\x02\u016F\u016E\x03\x02\x02\x02\u016F" +
		"\u0170\x03\x02\x02\x02\u0170\u0171\x03\x02\x02\x02\u0171\u01B5\x07\x04" +
		"\x02\x02\u0172\u0174\x05L\'\x02\u0173\u0172\x03\x02\x02\x02\u0173\u0174" +
		"\x03\x02\x02\x02\u0174\u0175\x03\x02\x02\x02\u0175\u0176\x07:\x02\x02" +
		"\u0176\u01B5\x05F$\x02\u0177\u0179\x05L\'\x02\u0178\u0177\x03\x02\x02" +
		"\x02\u0178\u0179\x03\x02\x02\x02\u0179\u017A\x03\x02\x02\x02\u017A\u017B" +
		"\x07:\x02\x02\u017B\u017D\x05F$\x02\u017C\u017E\x05F$\x02\u017D\u017C" +
		"\x03\x02\x02\x02\u017D\u017E\x03\x02\x02\x02\u017E\u01B5\x03\x02\x02\x02" +
		"\u017F\u0180\x07\x1C\x02\x02\u0180\u01B5\x05H%#\u0181\u0182\x07\x1D\x02" +
		"\x02\u0182\u01B5\x05H%\"\u0183\u0184\x07\x19\x02\x02\u0184\u01B5\x05H" +
		"%!\u0185\u0186\x07.\x02\x02\u0186\u01B5\x05H% \u0187\u018C\x07:\x02\x02" +
		"\u0188\u018A\x05F$\x02\u0189\u018B\x05F$\x02\u018A\u0189\x03\x02\x02\x02" +
		"\u018A\u018B\x03\x02\x02\x02\u018B\u018D\x03\x02\x02\x02\u018C\u0188\x03" +
		"\x02\x02\x02\u018C\u018D\x03\x02\x02\x02\u018D\u018E\x03\x02\x02\x02\u018E" +
		"\u01B5\x07(\x02\x02\u018F\u0194\x07:\x02\x02\u0190\u0192\x05F$\x02\u0191" +
		"\u0193\x05F$\x02\u0192\u0191\x03\x02\x02\x02\u0192\u0193\x03\x02\x02\x02" +
		"\u0193\u0195\x03\x02\x02\x02\u0194\u0190\x03\x02\x02\x02\u0194\u0195\x03" +
		"\x02\x02\x02\u0195\u0196\x03\x02\x02\x02\u0196\u01B5\x07)\x02\x02\u0197" +
		"\u0198\x07(\x02\x02\u0198\u019D\x07:\x02\x02\u0199\u019B\x05F$\x02\u019A" +
		"\u019C\x05F$\x02\u019B\u019A\x03\x02\x02\x02\u019B\u019C\x03\x02\x02\x02" +
		"\u019C\u019E\x03\x02\x02\x02\u019D\u0199\x03\x02\x02\x02\u019D\u019E\x03" +
		"\x02\x02\x02\u019E\u01B5\x03\x02\x02\x02\u019F\u01A0\x07)\x02\x02\u01A0" +
		"\u01A5\x07:\x02\x02\u01A1\u01A3\x05F$\x02\u01A2\u01A4\x05F$\x02\u01A3" +
		"\u01A2\x03\x02\x02\x02\u01A3\u01A4\x03\x02\x02\x02\u01A4\u01A6\x03\x02" +
		"\x02\x02\u01A5\u01A1\x03\x02\x02\x02\u01A5\u01A6\x03\x02\x02\x02\u01A6" +
		"\u01B5\x03\x02\x02\x02\u01A7\u01A9\x05L\'\x02\u01A8\u01A7\x03\x02\x02" +
		"\x02\u01A8\u01A9\x03\x02\x02\x02\u01A9\u01AA\x03\x02\x02\x02\u01AA\u01B5" +
		"\x07:\x02\x02\u01AB\u01B5\t\x02\x02\x02\u01AC\u01B5\x07;\x02\x02\u01AD" +
		"\u01B5\x075\x02\x02\u01AE\u01B5\x078\x02\x02\u01AF\u01B5\x079\x02\x02" +
		"\u01B0\u01B1\x07\x03\x02\x02\u01B1\u01B2\x05H%\x02\u01B2\u01B3\x07\x04" +
		"\x02\x02\u01B3\u01B5\x03\x02\x02\x02\u01B4\u0168\x03\x02\x02\x02\u01B4" +
		"\u0173\x03\x02\x02\x02\u01B4\u0178\x03\x02\x02\x02\u01B4\u017F\x03\x02" +
		"\x02\x02\u01B4\u0181\x03\x02\x02\x02\u01B4\u0183\x03\x02\x02\x02\u01B4" +
		"\u0185\x03\x02\x02\x02\u01B4\u0187\x03\x02\x02\x02\u01B4\u018F\x03\x02" +
		"\x02\x02\u01B4\u0197\x03\x02\x02\x02\u01B4\u019F\x03\x02\x02\x02\u01B4" +
		"\u01A8\x03\x02\x02\x02\u01B4\u01AB\x03\x02\x02\x02\u01B4\u01AC\x03\x02" +
		"\x02\x02\u01B4\u01AD\x03\x02\x02\x02\u01B4\u01AE\x03\x02\x02\x02\u01B4" +
		"\u01AF\x03\x02\x02\x02\u01B4\u01B0\x03\x02\x02\x02\u01B5\u01EE\x03\x02" +
		"\x02\x02\u01B6\u01B7\f\x1B\x02\x02\u01B7\u01B8\x07\x1E\x02\x02\u01B8\u01ED" +
		"\x05H%\x1C\u01B9\u01BA\f\x1A\x02\x02\u01BA\u01BB\x07\x1F\x02\x02\u01BB" +
		"\u01ED\x05H%\x1B\u01BC\u01BD\f\x19\x02\x02\u01BD\u01BE\x07 \x02\x02\u01BE" +
		"\u01ED\x05H%\x1A\u01BF\u01C0\f\x18\x02\x02\u01C0\u01C1\x07\x1D\x02\x02" +
		"\u01C1\u01ED\x05H%\x19\u01C2\u01C3\f\x17\x02\x02\u01C3\u01C4\x07\x1C\x02" +
		"\x02\u01C4\u01ED\x05H%\x18\u01C5\u01C6\f\x16\x02\x02\u01C6\u01C7\x07\"" +
		"\x02\x02\u01C7\u01ED\x05H%\x17\u01C8\u01C9\f\x15\x02\x02\u01C9\u01CA\x07" +
		"#\x02\x02\u01CA\u01ED\x05H%\x16\u01CB\u01CC\f\x14\x02\x02\u01CC\u01CD" +
		"\x07$\x02\x02\u01CD\u01ED\x05H%\x15\u01CE\u01CF\f\x13\x02\x02\u01CF\u01D0" +
		"\x07%\x02\x02\u01D0\u01ED\x05H%\x14\u01D1\u01D2\f\x12\x02\x02\u01D2\u01D3" +
		"\x07&\x02\x02\u01D3\u01ED\x05H%\x13\u01D4\u01D5\f\x11\x02\x02\u01D5\u01D6" +
		"\x07\'\x02\x02\u01D6\u01ED\x05H%\x12\u01D7\u01D8\f\x10\x02\x02\u01D8\u01D9" +
		"\x07\x1A\x02\x02\u01D9\u01ED\x05H%\x11\u01DA\u01DB\f\x0F\x02\x02\u01DB" +
		"\u01DC\x07\x1B\x02\x02\u01DC\u01ED\x05H%\x10\u01DD\u01DE\f\x0E\x02\x02" +
		"\u01DE\u01DF\x07,\x02\x02\u01DF\u01ED\x05H%\x0F\u01E0\u01E1\f\r\x02\x02" +
		"\u01E1\u01E2\x07*\x02\x02\u01E2\u01ED\x05H%\x0E\u01E3\u01E4\f\f\x02\x02" +
		"\u01E4\u01E5\x07+\x02\x02\u01E5\u01ED\x05H%\r\u01E6\u01E7\f\v\x02\x02" +
		"\u01E7\u01E8\x070\x02\x02\u01E8\u01ED\x05H%\f\u01E9\u01EA\f\n\x02\x02" +
		"\u01EA\u01EB\x07-\x02\x02\u01EB\u01ED\x05H%\v\u01EC\u01B6\x03\x02\x02" +
		"\x02\u01EC\u01B9\x03\x02\x02\x02\u01EC\u01BC\x03\x02\x02\x02\u01EC\u01BF" +
		"\x03\x02\x02\x02\u01EC\u01C2\x03\x02\x02\x02\u01EC\u01C5\x03\x02\x02\x02" +
		"\u01EC\u01C8\x03\x02\x02\x02\u01EC\u01CB\x03\x02\x02\x02\u01EC\u01CE\x03" +
		"\x02\x02\x02\u01EC\u01D1\x03\x02\x02\x02\u01EC\u01D4\x03\x02\x02\x02\u01EC" +
		"\u01D7\x03\x02\x02\x02\u01EC\u01DA\x03\x02\x02\x02\u01EC\u01DD\x03\x02" +
		"\x02\x02\u01EC\u01E0\x03\x02\x02\x02\u01EC\u01E3\x03\x02\x02\x02\u01EC" +
		"\u01E6\x03\x02\x02\x02\u01EC\u01E9\x03\x02\x02\x02\u01ED\u01F0\x03\x02" +
		"\x02\x02\u01EE\u01EC\x03\x02\x02\x02\u01EE\u01EF\x03\x02\x02\x02\u01EF" +
		"I\x03\x02\x02\x02\u01F0\u01EE\x03\x02\x02\x02\u01F1\u01F5\x05H%\x02\u01F2" +
		"\u01F5\x05*\x16\x02\u01F3\u01F5\x05(\x15\x02\u01F4\u01F1\x03\x02\x02\x02" +
		"\u01F4\u01F2\x03\x02\x02\x02\u01F4\u01F3\x03\x02\x02\x02\u01F5\u01FE\x03" +
		"\x02\x02\x02\u01F6\u01FA\x07B\x02\x02\u01F7\u01FB\x05H%\x02\u01F8\u01FB" +
		"\x05*\x16\x02\u01F9\u01FB\x05(\x15\x02\u01FA\u01F7\x03\x02\x02\x02\u01FA" +
		"\u01F8\x03\x02\x02\x02\u01FA\u01F9\x03\x02\x02\x02\u01FB\u01FD\x03\x02" +
		"\x02\x02\u01FC\u01F6\x03\x02\x02\x02\u01FD\u0200\x03\x02\x02\x02\u01FE" +
		"\u01FC\x03\x02\x02\x02\u01FE\u01FF\x03\x02\x02\x02\u01FFK\x03\x02\x02" +
		"\x02\u0200\u01FE\x03\x02\x02\x02\u0201\u0202\x07:\x02\x02\u0202\u0203" +
		"\x07A\x02\x02\u0203M\x03\x02\x02\x02:SXZdgouz\x7F\x84\x89\x91\x9D\xA2" +
		"\xA6\xAE\xB6\xBD\xC6\xCB\xD0\xE5\xFB\xFF\u0107\u011C\u0129\u012E\u0133" +
		"\u013A\u0144\u014C\u0152\u0159\u015D\u0160\u016A\u016F\u0173\u0178\u017D" +
		"\u018A\u018C\u0192\u0194\u019B\u019D\u01A3\u01A5\u01A8\u01B4\u01EC\u01EE" +
		"\u01F4\u01FA\u01FE";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!PortugolParser.__ATN) {
			PortugolParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(PortugolParser._serializedATN));
		}

		return PortugolParser.__ATN;
	}

}

export class ArquivoContext extends ParserRuleContext {
	public PROGRAMA(): TerminalNode { return this.getToken(PortugolParser.PROGRAMA, 0); }
	public ABRE_CHAVES(): TerminalNode { return this.getToken(PortugolParser.ABRE_CHAVES, 0); }
	public FECHA_CHAVES(): TerminalNode { return this.getToken(PortugolParser.FECHA_CHAVES, 0); }
	public inclusaoBiblioteca(): InclusaoBibliotecaContext[];
	public inclusaoBiblioteca(i: number): InclusaoBibliotecaContext;
	public inclusaoBiblioteca(i?: number): InclusaoBibliotecaContext | InclusaoBibliotecaContext[] {
		if (i === undefined) {
			return this.getRuleContexts(InclusaoBibliotecaContext);
		} else {
			return this.getRuleContext(i, InclusaoBibliotecaContext);
		}
	}
	public declaracaoFuncao(): DeclaracaoFuncaoContext[];
	public declaracaoFuncao(i: number): DeclaracaoFuncaoContext;
	public declaracaoFuncao(i?: number): DeclaracaoFuncaoContext | DeclaracaoFuncaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(DeclaracaoFuncaoContext);
		} else {
			return this.getRuleContext(i, DeclaracaoFuncaoContext);
		}
	}
	public listaDeclaracoes(): ListaDeclaracoesContext[];
	public listaDeclaracoes(i: number): ListaDeclaracoesContext;
	public listaDeclaracoes(i?: number): ListaDeclaracoesContext | ListaDeclaracoesContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ListaDeclaracoesContext);
		} else {
			return this.getRuleContext(i, ListaDeclaracoesContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_arquivo; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterArquivo) {
			listener.enterArquivo(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitArquivo) {
			listener.exitArquivo(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitArquivo) {
			return visitor.visitArquivo(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class InclusaoBibliotecaContext extends ParserRuleContext {
	public INCLUA(): TerminalNode { return this.getToken(PortugolParser.INCLUA, 0); }
	public BIBLIOTECA(): TerminalNode { return this.getToken(PortugolParser.BIBLIOTECA, 0); }
	public ID(): TerminalNode[];
	public ID(i: number): TerminalNode;
	public ID(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(PortugolParser.ID);
		} else {
			return this.getToken(PortugolParser.ID, i);
		}
	}
	public OP_ALIAS_BIBLIOTECA(): TerminalNode | undefined { return this.tryGetToken(PortugolParser.OP_ALIAS_BIBLIOTECA, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_inclusaoBiblioteca; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterInclusaoBiblioteca) {
			listener.enterInclusaoBiblioteca(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitInclusaoBiblioteca) {
			listener.exitInclusaoBiblioteca(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitInclusaoBiblioteca) {
			return visitor.visitInclusaoBiblioteca(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ListaDeclaracoesContext extends ParserRuleContext {
	public TIPO(): TerminalNode { return this.getToken(PortugolParser.TIPO, 0); }
	public declaracao(): DeclaracaoContext[];
	public declaracao(i: number): DeclaracaoContext;
	public declaracao(i?: number): DeclaracaoContext | DeclaracaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(DeclaracaoContext);
		} else {
			return this.getRuleContext(i, DeclaracaoContext);
		}
	}
	public CONSTANTE(): TerminalNode | undefined { return this.tryGetToken(PortugolParser.CONSTANTE, 0); }
	public VIRGULA(): TerminalNode[];
	public VIRGULA(i: number): TerminalNode;
	public VIRGULA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(PortugolParser.VIRGULA);
		} else {
			return this.getToken(PortugolParser.VIRGULA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_listaDeclaracoes; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterListaDeclaracoes) {
			listener.enterListaDeclaracoes(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitListaDeclaracoes) {
			listener.exitListaDeclaracoes(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitListaDeclaracoes) {
			return visitor.visitListaDeclaracoes(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DeclaracaoContext extends ParserRuleContext {
	public declaracaoVariavel(): DeclaracaoVariavelContext | undefined {
		return this.tryGetRuleContext(0, DeclaracaoVariavelContext);
	}
	public declaracaoArray(): DeclaracaoArrayContext | undefined {
		return this.tryGetRuleContext(0, DeclaracaoArrayContext);
	}
	public declaracaoMatriz(): DeclaracaoMatrizContext | undefined {
		return this.tryGetRuleContext(0, DeclaracaoMatrizContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_declaracao; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterDeclaracao) {
			listener.enterDeclaracao(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitDeclaracao) {
			listener.exitDeclaracao(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitDeclaracao) {
			return visitor.visitDeclaracao(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DeclaracaoVariavelContext extends ParserRuleContext {
	public ID(): TerminalNode { return this.getToken(PortugolParser.ID, 0); }
	public OP_ATRIBUICAO(): TerminalNode | undefined { return this.tryGetToken(PortugolParser.OP_ATRIBUICAO, 0); }
	public expressao(): ExpressaoContext | undefined {
		return this.tryGetRuleContext(0, ExpressaoContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_declaracaoVariavel; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterDeclaracaoVariavel) {
			listener.enterDeclaracaoVariavel(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitDeclaracaoVariavel) {
			listener.exitDeclaracaoVariavel(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitDeclaracaoVariavel) {
			return visitor.visitDeclaracaoVariavel(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DeclaracaoMatrizContext extends ParserRuleContext {
	public ID(): TerminalNode { return this.getToken(PortugolParser.ID, 0); }
	public ABRE_COLCHETES(): TerminalNode[];
	public ABRE_COLCHETES(i: number): TerminalNode;
	public ABRE_COLCHETES(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(PortugolParser.ABRE_COLCHETES);
		} else {
			return this.getToken(PortugolParser.ABRE_COLCHETES, i);
		}
	}
	public FECHA_COLCHETES(): TerminalNode[];
	public FECHA_COLCHETES(i: number): TerminalNode;
	public FECHA_COLCHETES(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(PortugolParser.FECHA_COLCHETES);
		} else {
			return this.getToken(PortugolParser.FECHA_COLCHETES, i);
		}
	}
	public linhaMatriz(): LinhaMatrizContext | undefined {
		return this.tryGetRuleContext(0, LinhaMatrizContext);
	}
	public colunaMatriz(): ColunaMatrizContext | undefined {
		return this.tryGetRuleContext(0, ColunaMatrizContext);
	}
	public OP_ATRIBUICAO(): TerminalNode | undefined { return this.tryGetToken(PortugolParser.OP_ATRIBUICAO, 0); }
	public inicializacaoMatriz(): InicializacaoMatrizContext | undefined {
		return this.tryGetRuleContext(0, InicializacaoMatrizContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_declaracaoMatriz; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterDeclaracaoMatriz) {
			listener.enterDeclaracaoMatriz(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitDeclaracaoMatriz) {
			listener.exitDeclaracaoMatriz(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitDeclaracaoMatriz) {
			return visitor.visitDeclaracaoMatriz(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class InicializacaoMatrizContext extends ParserRuleContext {
	public ABRE_CHAVES(): TerminalNode { return this.getToken(PortugolParser.ABRE_CHAVES, 0); }
	public inicializacaoArray(): InicializacaoArrayContext[];
	public inicializacaoArray(i: number): InicializacaoArrayContext;
	public inicializacaoArray(i?: number): InicializacaoArrayContext | InicializacaoArrayContext[] {
		if (i === undefined) {
			return this.getRuleContexts(InicializacaoArrayContext);
		} else {
			return this.getRuleContext(i, InicializacaoArrayContext);
		}
	}
	public FECHA_CHAVES(): TerminalNode { return this.getToken(PortugolParser.FECHA_CHAVES, 0); }
	public VIRGULA(): TerminalNode[];
	public VIRGULA(i: number): TerminalNode;
	public VIRGULA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(PortugolParser.VIRGULA);
		} else {
			return this.getToken(PortugolParser.VIRGULA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_inicializacaoMatriz; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterInicializacaoMatriz) {
			listener.enterInicializacaoMatriz(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitInicializacaoMatriz) {
			listener.exitInicializacaoMatriz(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitInicializacaoMatriz) {
			return visitor.visitInicializacaoMatriz(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LinhaMatrizContext extends ParserRuleContext {
	public tamanhoArray(): TamanhoArrayContext {
		return this.getRuleContext(0, TamanhoArrayContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_linhaMatriz; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterLinhaMatriz) {
			listener.enterLinhaMatriz(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitLinhaMatriz) {
			listener.exitLinhaMatriz(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitLinhaMatriz) {
			return visitor.visitLinhaMatriz(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ColunaMatrizContext extends ParserRuleContext {
	public tamanhoArray(): TamanhoArrayContext {
		return this.getRuleContext(0, TamanhoArrayContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_colunaMatriz; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterColunaMatriz) {
			listener.enterColunaMatriz(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitColunaMatriz) {
			listener.exitColunaMatriz(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitColunaMatriz) {
			return visitor.visitColunaMatriz(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DeclaracaoArrayContext extends ParserRuleContext {
	public ID(): TerminalNode { return this.getToken(PortugolParser.ID, 0); }
	public ABRE_COLCHETES(): TerminalNode { return this.getToken(PortugolParser.ABRE_COLCHETES, 0); }
	public FECHA_COLCHETES(): TerminalNode { return this.getToken(PortugolParser.FECHA_COLCHETES, 0); }
	public tamanhoArray(): TamanhoArrayContext | undefined {
		return this.tryGetRuleContext(0, TamanhoArrayContext);
	}
	public OP_ATRIBUICAO(): TerminalNode | undefined { return this.tryGetToken(PortugolParser.OP_ATRIBUICAO, 0); }
	public inicializacaoArray(): InicializacaoArrayContext | undefined {
		return this.tryGetRuleContext(0, InicializacaoArrayContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_declaracaoArray; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterDeclaracaoArray) {
			listener.enterDeclaracaoArray(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitDeclaracaoArray) {
			listener.exitDeclaracaoArray(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitDeclaracaoArray) {
			return visitor.visitDeclaracaoArray(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class InicializacaoArrayContext extends ParserRuleContext {
	public ABRE_CHAVES(): TerminalNode { return this.getToken(PortugolParser.ABRE_CHAVES, 0); }
	public FECHA_CHAVES(): TerminalNode { return this.getToken(PortugolParser.FECHA_CHAVES, 0); }
	public listaExpressoes(): ListaExpressoesContext | undefined {
		return this.tryGetRuleContext(0, ListaExpressoesContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_inicializacaoArray; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterInicializacaoArray) {
			listener.enterInicializacaoArray(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitInicializacaoArray) {
			listener.exitInicializacaoArray(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitInicializacaoArray) {
			return visitor.visitInicializacaoArray(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TamanhoArrayContext extends ParserRuleContext {
	public expressao(): ExpressaoContext {
		return this.getRuleContext(0, ExpressaoContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_tamanhoArray; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterTamanhoArray) {
			listener.enterTamanhoArray(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitTamanhoArray) {
			listener.exitTamanhoArray(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitTamanhoArray) {
			return visitor.visitTamanhoArray(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DeclaracaoFuncaoContext extends ParserRuleContext {
	public FUNCAO(): TerminalNode { return this.getToken(PortugolParser.FUNCAO, 0); }
	public ID(): TerminalNode { return this.getToken(PortugolParser.ID, 0); }
	public parametroFuncao(): ParametroFuncaoContext {
		return this.getRuleContext(0, ParametroFuncaoContext);
	}
	public ABRE_CHAVES(): TerminalNode { return this.getToken(PortugolParser.ABRE_CHAVES, 0); }
	public FECHA_CHAVES(): TerminalNode { return this.getToken(PortugolParser.FECHA_CHAVES, 0); }
	public TIPO(): TerminalNode | undefined { return this.tryGetToken(PortugolParser.TIPO, 0); }
	public comando(): ComandoContext[];
	public comando(i: number): ComandoContext;
	public comando(i?: number): ComandoContext | ComandoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ComandoContext);
		} else {
			return this.getRuleContext(i, ComandoContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_declaracaoFuncao; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterDeclaracaoFuncao) {
			listener.enterDeclaracaoFuncao(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitDeclaracaoFuncao) {
			listener.exitDeclaracaoFuncao(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitDeclaracaoFuncao) {
			return visitor.visitDeclaracaoFuncao(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParametroFuncaoContext extends ParserRuleContext {
	public ABRE_PARENTESES(): TerminalNode { return this.getToken(PortugolParser.ABRE_PARENTESES, 0); }
	public FECHA_PARENTESES(): TerminalNode { return this.getToken(PortugolParser.FECHA_PARENTESES, 0); }
	public listaParametros(): ListaParametrosContext | undefined {
		return this.tryGetRuleContext(0, ListaParametrosContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_parametroFuncao; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterParametroFuncao) {
			listener.enterParametroFuncao(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitParametroFuncao) {
			listener.exitParametroFuncao(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitParametroFuncao) {
			return visitor.visitParametroFuncao(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ListaParametrosContext extends ParserRuleContext {
	public parametro(): ParametroContext[];
	public parametro(i: number): ParametroContext;
	public parametro(i?: number): ParametroContext | ParametroContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ParametroContext);
		} else {
			return this.getRuleContext(i, ParametroContext);
		}
	}
	public VIRGULA(): TerminalNode[];
	public VIRGULA(i: number): TerminalNode;
	public VIRGULA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(PortugolParser.VIRGULA);
		} else {
			return this.getToken(PortugolParser.VIRGULA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_listaParametros; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterListaParametros) {
			listener.enterListaParametros(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitListaParametros) {
			listener.exitListaParametros(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitListaParametros) {
			return visitor.visitListaParametros(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParametroContext extends ParserRuleContext {
	public TIPO(): TerminalNode { return this.getToken(PortugolParser.TIPO, 0); }
	public ID(): TerminalNode { return this.getToken(PortugolParser.ID, 0); }
	public E_COMERCIAL(): TerminalNode | undefined { return this.tryGetToken(PortugolParser.E_COMERCIAL, 0); }
	public parametroArray(): ParametroArrayContext | undefined {
		return this.tryGetRuleContext(0, ParametroArrayContext);
	}
	public parametroMatriz(): ParametroMatrizContext | undefined {
		return this.tryGetRuleContext(0, ParametroMatrizContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_parametro; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterParametro) {
			listener.enterParametro(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitParametro) {
			listener.exitParametro(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitParametro) {
			return visitor.visitParametro(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParametroArrayContext extends ParserRuleContext {
	public ABRE_COLCHETES(): TerminalNode { return this.getToken(PortugolParser.ABRE_COLCHETES, 0); }
	public FECHA_COLCHETES(): TerminalNode { return this.getToken(PortugolParser.FECHA_COLCHETES, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_parametroArray; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterParametroArray) {
			listener.enterParametroArray(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitParametroArray) {
			listener.exitParametroArray(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitParametroArray) {
			return visitor.visitParametroArray(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParametroMatrizContext extends ParserRuleContext {
	public ABRE_COLCHETES(): TerminalNode[];
	public ABRE_COLCHETES(i: number): TerminalNode;
	public ABRE_COLCHETES(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(PortugolParser.ABRE_COLCHETES);
		} else {
			return this.getToken(PortugolParser.ABRE_COLCHETES, i);
		}
	}
	public FECHA_COLCHETES(): TerminalNode[];
	public FECHA_COLCHETES(i: number): TerminalNode;
	public FECHA_COLCHETES(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(PortugolParser.FECHA_COLCHETES);
		} else {
			return this.getToken(PortugolParser.FECHA_COLCHETES, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_parametroMatriz; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterParametroMatriz) {
			listener.enterParametroMatriz(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitParametroMatriz) {
			listener.exitParametroMatriz(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitParametroMatriz) {
			return visitor.visitParametroMatriz(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ComandoContext extends ParserRuleContext {
	public listaDeclaracoes(): ListaDeclaracoesContext | undefined {
		return this.tryGetRuleContext(0, ListaDeclaracoesContext);
	}
	public se(): SeContext | undefined {
		return this.tryGetRuleContext(0, SeContext);
	}
	public enquanto(): EnquantoContext | undefined {
		return this.tryGetRuleContext(0, EnquantoContext);
	}
	public facaEnquanto(): FacaEnquantoContext | undefined {
		return this.tryGetRuleContext(0, FacaEnquantoContext);
	}
	public para(): ParaContext | undefined {
		return this.tryGetRuleContext(0, ParaContext);
	}
	public escolha(): EscolhaContext | undefined {
		return this.tryGetRuleContext(0, EscolhaContext);
	}
	public retorne(): RetorneContext | undefined {
		return this.tryGetRuleContext(0, RetorneContext);
	}
	public pare(): PareContext | undefined {
		return this.tryGetRuleContext(0, PareContext);
	}
	public atribuicao(): AtribuicaoContext | undefined {
		return this.tryGetRuleContext(0, AtribuicaoContext);
	}
	public atribuicaoComposta(): AtribuicaoCompostaContext | undefined {
		return this.tryGetRuleContext(0, AtribuicaoCompostaContext);
	}
	public expressao(): ExpressaoContext | undefined {
		return this.tryGetRuleContext(0, ExpressaoContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_comando; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterComando) {
			listener.enterComando(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitComando) {
			listener.exitComando(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitComando) {
			return visitor.visitComando(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class AtribuicaoContext extends ParserRuleContext {
	public expressao(): ExpressaoContext[];
	public expressao(i: number): ExpressaoContext;
	public expressao(i?: number): ExpressaoContext | ExpressaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressaoContext);
		} else {
			return this.getRuleContext(i, ExpressaoContext);
		}
	}
	public OP_ATRIBUICAO(): TerminalNode { return this.getToken(PortugolParser.OP_ATRIBUICAO, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_atribuicao; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterAtribuicao) {
			listener.enterAtribuicao(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitAtribuicao) {
			listener.exitAtribuicao(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitAtribuicao) {
			return visitor.visitAtribuicao(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class AtribuicaoCompostaContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_atribuicaoComposta; }
	public copyFrom(ctx: AtribuicaoCompostaContext): void {
		super.copyFrom(ctx);
	}
}
export class AtribuicaoCompostaSomaContext extends AtribuicaoCompostaContext {
	public expressao(): ExpressaoContext[];
	public expressao(i: number): ExpressaoContext;
	public expressao(i?: number): ExpressaoContext | ExpressaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressaoContext);
		} else {
			return this.getRuleContext(i, ExpressaoContext);
		}
	}
	public OP_MAIS_IGUAL(): TerminalNode { return this.getToken(PortugolParser.OP_MAIS_IGUAL, 0); }
	constructor(ctx: AtribuicaoCompostaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterAtribuicaoCompostaSoma) {
			listener.enterAtribuicaoCompostaSoma(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitAtribuicaoCompostaSoma) {
			listener.exitAtribuicaoCompostaSoma(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitAtribuicaoCompostaSoma) {
			return visitor.visitAtribuicaoCompostaSoma(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class AtribuicaoCompostaSubtracaoContext extends AtribuicaoCompostaContext {
	public expressao(): ExpressaoContext[];
	public expressao(i: number): ExpressaoContext;
	public expressao(i?: number): ExpressaoContext | ExpressaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressaoContext);
		} else {
			return this.getRuleContext(i, ExpressaoContext);
		}
	}
	public OP_MENOS_IGUAL(): TerminalNode { return this.getToken(PortugolParser.OP_MENOS_IGUAL, 0); }
	constructor(ctx: AtribuicaoCompostaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterAtribuicaoCompostaSubtracao) {
			listener.enterAtribuicaoCompostaSubtracao(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitAtribuicaoCompostaSubtracao) {
			listener.exitAtribuicaoCompostaSubtracao(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitAtribuicaoCompostaSubtracao) {
			return visitor.visitAtribuicaoCompostaSubtracao(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class AtribuicaoCompostaMultiplicacaoContext extends AtribuicaoCompostaContext {
	public expressao(): ExpressaoContext[];
	public expressao(i: number): ExpressaoContext;
	public expressao(i?: number): ExpressaoContext | ExpressaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressaoContext);
		} else {
			return this.getRuleContext(i, ExpressaoContext);
		}
	}
	public OP_MULTIPLICACAO_IGUAL(): TerminalNode { return this.getToken(PortugolParser.OP_MULTIPLICACAO_IGUAL, 0); }
	constructor(ctx: AtribuicaoCompostaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterAtribuicaoCompostaMultiplicacao) {
			listener.enterAtribuicaoCompostaMultiplicacao(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitAtribuicaoCompostaMultiplicacao) {
			listener.exitAtribuicaoCompostaMultiplicacao(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitAtribuicaoCompostaMultiplicacao) {
			return visitor.visitAtribuicaoCompostaMultiplicacao(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class AtribuicaoCompostaDivisaoContext extends AtribuicaoCompostaContext {
	public expressao(): ExpressaoContext[];
	public expressao(i: number): ExpressaoContext;
	public expressao(i?: number): ExpressaoContext | ExpressaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressaoContext);
		} else {
			return this.getRuleContext(i, ExpressaoContext);
		}
	}
	public OP_DIVISAO_IGUAL(): TerminalNode { return this.getToken(PortugolParser.OP_DIVISAO_IGUAL, 0); }
	constructor(ctx: AtribuicaoCompostaContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterAtribuicaoCompostaDivisao) {
			listener.enterAtribuicaoCompostaDivisao(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitAtribuicaoCompostaDivisao) {
			listener.exitAtribuicaoCompostaDivisao(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitAtribuicaoCompostaDivisao) {
			return visitor.visitAtribuicaoCompostaDivisao(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class RetorneContext extends ParserRuleContext {
	public RETORNE(): TerminalNode { return this.getToken(PortugolParser.RETORNE, 0); }
	public expressao(): ExpressaoContext | undefined {
		return this.tryGetRuleContext(0, ExpressaoContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_retorne; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterRetorne) {
			listener.enterRetorne(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitRetorne) {
			listener.exitRetorne(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitRetorne) {
			return visitor.visitRetorne(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SeContext extends ParserRuleContext {
	public SE(): TerminalNode { return this.getToken(PortugolParser.SE, 0); }
	public ABRE_PARENTESES(): TerminalNode { return this.getToken(PortugolParser.ABRE_PARENTESES, 0); }
	public expressao(): ExpressaoContext {
		return this.getRuleContext(0, ExpressaoContext);
	}
	public FECHA_PARENTESES(): TerminalNode { return this.getToken(PortugolParser.FECHA_PARENTESES, 0); }
	public listaComandos(): ListaComandosContext {
		return this.getRuleContext(0, ListaComandosContext);
	}
	public senao(): SenaoContext | undefined {
		return this.tryGetRuleContext(0, SenaoContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_se; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterSe) {
			listener.enterSe(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitSe) {
			listener.exitSe(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitSe) {
			return visitor.visitSe(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SenaoContext extends ParserRuleContext {
	public SENAO(): TerminalNode { return this.getToken(PortugolParser.SENAO, 0); }
	public listaComandos(): ListaComandosContext {
		return this.getRuleContext(0, ListaComandosContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_senao; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterSenao) {
			listener.enterSenao(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitSenao) {
			listener.exitSenao(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitSenao) {
			return visitor.visitSenao(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class EnquantoContext extends ParserRuleContext {
	public ENQUANTO(): TerminalNode { return this.getToken(PortugolParser.ENQUANTO, 0); }
	public ABRE_PARENTESES(): TerminalNode { return this.getToken(PortugolParser.ABRE_PARENTESES, 0); }
	public expressao(): ExpressaoContext {
		return this.getRuleContext(0, ExpressaoContext);
	}
	public FECHA_PARENTESES(): TerminalNode { return this.getToken(PortugolParser.FECHA_PARENTESES, 0); }
	public listaComandos(): ListaComandosContext {
		return this.getRuleContext(0, ListaComandosContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_enquanto; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterEnquanto) {
			listener.enterEnquanto(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitEnquanto) {
			listener.exitEnquanto(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitEnquanto) {
			return visitor.visitEnquanto(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FacaEnquantoContext extends ParserRuleContext {
	public FACA(): TerminalNode { return this.getToken(PortugolParser.FACA, 0); }
	public listaComandos(): ListaComandosContext {
		return this.getRuleContext(0, ListaComandosContext);
	}
	public ENQUANTO(): TerminalNode { return this.getToken(PortugolParser.ENQUANTO, 0); }
	public ABRE_PARENTESES(): TerminalNode { return this.getToken(PortugolParser.ABRE_PARENTESES, 0); }
	public expressao(): ExpressaoContext {
		return this.getRuleContext(0, ExpressaoContext);
	}
	public FECHA_PARENTESES(): TerminalNode { return this.getToken(PortugolParser.FECHA_PARENTESES, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_facaEnquanto; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterFacaEnquanto) {
			listener.enterFacaEnquanto(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitFacaEnquanto) {
			listener.exitFacaEnquanto(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitFacaEnquanto) {
			return visitor.visitFacaEnquanto(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParaContext extends ParserRuleContext {
	public PARA(): TerminalNode { return this.getToken(PortugolParser.PARA, 0); }
	public ABRE_PARENTESES(): TerminalNode { return this.getToken(PortugolParser.ABRE_PARENTESES, 0); }
	public PONTOVIRGULA(): TerminalNode[];
	public PONTOVIRGULA(i: number): TerminalNode;
	public PONTOVIRGULA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(PortugolParser.PONTOVIRGULA);
		} else {
			return this.getToken(PortugolParser.PONTOVIRGULA, i);
		}
	}
	public condicao(): CondicaoContext {
		return this.getRuleContext(0, CondicaoContext);
	}
	public incrementoPara(): IncrementoParaContext {
		return this.getRuleContext(0, IncrementoParaContext);
	}
	public FECHA_PARENTESES(): TerminalNode { return this.getToken(PortugolParser.FECHA_PARENTESES, 0); }
	public listaComandos(): ListaComandosContext {
		return this.getRuleContext(0, ListaComandosContext);
	}
	public inicializacaoPara(): InicializacaoParaContext | undefined {
		return this.tryGetRuleContext(0, InicializacaoParaContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_para; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterPara) {
			listener.enterPara(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitPara) {
			listener.exitPara(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitPara) {
			return visitor.visitPara(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ListaComandosContext extends ParserRuleContext {
	public ABRE_CHAVES(): TerminalNode | undefined { return this.tryGetToken(PortugolParser.ABRE_CHAVES, 0); }
	public FECHA_CHAVES(): TerminalNode | undefined { return this.tryGetToken(PortugolParser.FECHA_CHAVES, 0); }
	public comando(): ComandoContext[];
	public comando(i: number): ComandoContext;
	public comando(i?: number): ComandoContext | ComandoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ComandoContext);
		} else {
			return this.getRuleContext(i, ComandoContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_listaComandos; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterListaComandos) {
			listener.enterListaComandos(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitListaComandos) {
			listener.exitListaComandos(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitListaComandos) {
			return visitor.visitListaComandos(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class InicializacaoParaContext extends ParserRuleContext {
	public atribuicao(): AtribuicaoContext | undefined {
		return this.tryGetRuleContext(0, AtribuicaoContext);
	}
	public listaDeclaracoes(): ListaDeclaracoesContext | undefined {
		return this.tryGetRuleContext(0, ListaDeclaracoesContext);
	}
	public ID(): TerminalNode | undefined { return this.tryGetToken(PortugolParser.ID, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_inicializacaoPara; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterInicializacaoPara) {
			listener.enterInicializacaoPara(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitInicializacaoPara) {
			listener.exitInicializacaoPara(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitInicializacaoPara) {
			return visitor.visitInicializacaoPara(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class CondicaoContext extends ParserRuleContext {
	public expressao(): ExpressaoContext {
		return this.getRuleContext(0, ExpressaoContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_condicao; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterCondicao) {
			listener.enterCondicao(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitCondicao) {
			listener.exitCondicao(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitCondicao) {
			return visitor.visitCondicao(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IncrementoParaContext extends ParserRuleContext {
	public expressao(): ExpressaoContext | undefined {
		return this.tryGetRuleContext(0, ExpressaoContext);
	}
	public atribuicaoComposta(): AtribuicaoCompostaContext | undefined {
		return this.tryGetRuleContext(0, AtribuicaoCompostaContext);
	}
	public atribuicao(): AtribuicaoContext | undefined {
		return this.tryGetRuleContext(0, AtribuicaoContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_incrementoPara; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterIncrementoPara) {
			listener.enterIncrementoPara(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitIncrementoPara) {
			listener.exitIncrementoPara(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitIncrementoPara) {
			return visitor.visitIncrementoPara(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class EscolhaContext extends ParserRuleContext {
	public ESCOLHA(): TerminalNode { return this.getToken(PortugolParser.ESCOLHA, 0); }
	public ABRE_PARENTESES(): TerminalNode { return this.getToken(PortugolParser.ABRE_PARENTESES, 0); }
	public expressao(): ExpressaoContext {
		return this.getRuleContext(0, ExpressaoContext);
	}
	public FECHA_PARENTESES(): TerminalNode { return this.getToken(PortugolParser.FECHA_PARENTESES, 0); }
	public ABRE_CHAVES(): TerminalNode { return this.getToken(PortugolParser.ABRE_CHAVES, 0); }
	public FECHA_CHAVES(): TerminalNode { return this.getToken(PortugolParser.FECHA_CHAVES, 0); }
	public caso(): CasoContext[];
	public caso(i: number): CasoContext;
	public caso(i?: number): CasoContext | CasoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(CasoContext);
		} else {
			return this.getRuleContext(i, CasoContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_escolha; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterEscolha) {
			listener.enterEscolha(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitEscolha) {
			listener.exitEscolha(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitEscolha) {
			return visitor.visitEscolha(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class CasoContext extends ParserRuleContext {
	public CASO(): TerminalNode { return this.getToken(PortugolParser.CASO, 0); }
	public DOISPONTOS(): TerminalNode { return this.getToken(PortugolParser.DOISPONTOS, 0); }
	public CONTRARIO(): TerminalNode | undefined { return this.tryGetToken(PortugolParser.CONTRARIO, 0); }
	public expressao(): ExpressaoContext | undefined {
		return this.tryGetRuleContext(0, ExpressaoContext);
	}
	public ABRE_CHAVES(): TerminalNode | undefined { return this.tryGetToken(PortugolParser.ABRE_CHAVES, 0); }
	public FECHA_CHAVES(): TerminalNode | undefined { return this.tryGetToken(PortugolParser.FECHA_CHAVES, 0); }
	public pare(): PareContext | undefined {
		return this.tryGetRuleContext(0, PareContext);
	}
	public comando(): ComandoContext[];
	public comando(i: number): ComandoContext;
	public comando(i?: number): ComandoContext | ComandoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ComandoContext);
		} else {
			return this.getRuleContext(i, ComandoContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_caso; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterCaso) {
			listener.enterCaso(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitCaso) {
			listener.exitCaso(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitCaso) {
			return visitor.visitCaso(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class PareContext extends ParserRuleContext {
	public PARE(): TerminalNode { return this.getToken(PortugolParser.PARE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_pare; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterPare) {
			listener.enterPare(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitPare) {
			listener.exitPare(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitPare) {
			return visitor.visitPare(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IndiceArrayContext extends ParserRuleContext {
	public ABRE_COLCHETES(): TerminalNode { return this.getToken(PortugolParser.ABRE_COLCHETES, 0); }
	public expressao(): ExpressaoContext {
		return this.getRuleContext(0, ExpressaoContext);
	}
	public FECHA_COLCHETES(): TerminalNode { return this.getToken(PortugolParser.FECHA_COLCHETES, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_indiceArray; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterIndiceArray) {
			listener.enterIndiceArray(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitIndiceArray) {
			listener.exitIndiceArray(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitIndiceArray) {
			return visitor.visitIndiceArray(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExpressaoContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_expressao; }
	public copyFrom(ctx: ExpressaoContext): void {
		super.copyFrom(ctx);
	}
}
export class ChamadaFuncaoContext extends ExpressaoContext {
	public ID(): TerminalNode { return this.getToken(PortugolParser.ID, 0); }
	public ABRE_PARENTESES(): TerminalNode { return this.getToken(PortugolParser.ABRE_PARENTESES, 0); }
	public FECHA_PARENTESES(): TerminalNode { return this.getToken(PortugolParser.FECHA_PARENTESES, 0); }
	public escopoBiblioteca(): EscopoBibliotecaContext | undefined {
		return this.tryGetRuleContext(0, EscopoBibliotecaContext);
	}
	public listaExpressoes(): ListaExpressoesContext | undefined {
		return this.tryGetRuleContext(0, ListaExpressoesContext);
	}
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterChamadaFuncao) {
			listener.enterChamadaFuncao(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitChamadaFuncao) {
			listener.exitChamadaFuncao(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitChamadaFuncao) {
			return visitor.visitChamadaFuncao(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ReferenciaArrayContext extends ExpressaoContext {
	public ID(): TerminalNode { return this.getToken(PortugolParser.ID, 0); }
	public indiceArray(): IndiceArrayContext {
		return this.getRuleContext(0, IndiceArrayContext);
	}
	public escopoBiblioteca(): EscopoBibliotecaContext | undefined {
		return this.tryGetRuleContext(0, EscopoBibliotecaContext);
	}
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterReferenciaArray) {
			listener.enterReferenciaArray(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitReferenciaArray) {
			listener.exitReferenciaArray(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitReferenciaArray) {
			return visitor.visitReferenciaArray(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ReferenciaMatrizContext extends ExpressaoContext {
	public ID(): TerminalNode { return this.getToken(PortugolParser.ID, 0); }
	public indiceArray(): IndiceArrayContext[];
	public indiceArray(i: number): IndiceArrayContext;
	public indiceArray(i?: number): IndiceArrayContext | IndiceArrayContext[] {
		if (i === undefined) {
			return this.getRuleContexts(IndiceArrayContext);
		} else {
			return this.getRuleContext(i, IndiceArrayContext);
		}
	}
	public escopoBiblioteca(): EscopoBibliotecaContext | undefined {
		return this.tryGetRuleContext(0, EscopoBibliotecaContext);
	}
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterReferenciaMatriz) {
			listener.enterReferenciaMatriz(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitReferenciaMatriz) {
			listener.exitReferenciaMatriz(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitReferenciaMatriz) {
			return visitor.visitReferenciaMatriz(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class MenosUnarioContext extends ExpressaoContext {
	public OP_SUBTRACAO(): TerminalNode { return this.getToken(PortugolParser.OP_SUBTRACAO, 0); }
	public expressao(): ExpressaoContext {
		return this.getRuleContext(0, ExpressaoContext);
	}
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterMenosUnario) {
			listener.enterMenosUnario(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitMenosUnario) {
			listener.exitMenosUnario(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitMenosUnario) {
			return visitor.visitMenosUnario(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class MaisUnarioContext extends ExpressaoContext {
	public OP_ADICAO(): TerminalNode { return this.getToken(PortugolParser.OP_ADICAO, 0); }
	public expressao(): ExpressaoContext {
		return this.getRuleContext(0, ExpressaoContext);
	}
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterMaisUnario) {
			listener.enterMaisUnario(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitMaisUnario) {
			listener.exitMaisUnario(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitMaisUnario) {
			return visitor.visitMaisUnario(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class NegacaoContext extends ExpressaoContext {
	public OP_NAO(): TerminalNode { return this.getToken(PortugolParser.OP_NAO, 0); }
	public expressao(): ExpressaoContext {
		return this.getRuleContext(0, ExpressaoContext);
	}
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterNegacao) {
			listener.enterNegacao(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitNegacao) {
			listener.exitNegacao(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitNegacao) {
			return visitor.visitNegacao(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class NegacaoBitwiseContext extends ExpressaoContext {
	public OP_NOT_BITWISE(): TerminalNode { return this.getToken(PortugolParser.OP_NOT_BITWISE, 0); }
	public expressao(): ExpressaoContext {
		return this.getRuleContext(0, ExpressaoContext);
	}
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterNegacaoBitwise) {
			listener.enterNegacaoBitwise(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitNegacaoBitwise) {
			listener.exitNegacaoBitwise(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitNegacaoBitwise) {
			return visitor.visitNegacaoBitwise(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class IncrementoUnarioPosfixadoContext extends ExpressaoContext {
	public ID(): TerminalNode { return this.getToken(PortugolParser.ID, 0); }
	public OP_INCREMENTO_UNARIO(): TerminalNode { return this.getToken(PortugolParser.OP_INCREMENTO_UNARIO, 0); }
	public indiceArray(): IndiceArrayContext[];
	public indiceArray(i: number): IndiceArrayContext;
	public indiceArray(i?: number): IndiceArrayContext | IndiceArrayContext[] {
		if (i === undefined) {
			return this.getRuleContexts(IndiceArrayContext);
		} else {
			return this.getRuleContext(i, IndiceArrayContext);
		}
	}
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterIncrementoUnarioPosfixado) {
			listener.enterIncrementoUnarioPosfixado(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitIncrementoUnarioPosfixado) {
			listener.exitIncrementoUnarioPosfixado(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitIncrementoUnarioPosfixado) {
			return visitor.visitIncrementoUnarioPosfixado(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class DecrementoUnarioPosfixadoContext extends ExpressaoContext {
	public ID(): TerminalNode { return this.getToken(PortugolParser.ID, 0); }
	public OP_DECREMENTO_UNARIO(): TerminalNode { return this.getToken(PortugolParser.OP_DECREMENTO_UNARIO, 0); }
	public indiceArray(): IndiceArrayContext[];
	public indiceArray(i: number): IndiceArrayContext;
	public indiceArray(i?: number): IndiceArrayContext | IndiceArrayContext[] {
		if (i === undefined) {
			return this.getRuleContexts(IndiceArrayContext);
		} else {
			return this.getRuleContext(i, IndiceArrayContext);
		}
	}
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterDecrementoUnarioPosfixado) {
			listener.enterDecrementoUnarioPosfixado(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitDecrementoUnarioPosfixado) {
			listener.exitDecrementoUnarioPosfixado(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitDecrementoUnarioPosfixado) {
			return visitor.visitDecrementoUnarioPosfixado(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class IncrementoUnarioPrefixadoContext extends ExpressaoContext {
	public OP_INCREMENTO_UNARIO(): TerminalNode { return this.getToken(PortugolParser.OP_INCREMENTO_UNARIO, 0); }
	public ID(): TerminalNode { return this.getToken(PortugolParser.ID, 0); }
	public indiceArray(): IndiceArrayContext[];
	public indiceArray(i: number): IndiceArrayContext;
	public indiceArray(i?: number): IndiceArrayContext | IndiceArrayContext[] {
		if (i === undefined) {
			return this.getRuleContexts(IndiceArrayContext);
		} else {
			return this.getRuleContext(i, IndiceArrayContext);
		}
	}
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterIncrementoUnarioPrefixado) {
			listener.enterIncrementoUnarioPrefixado(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitIncrementoUnarioPrefixado) {
			listener.exitIncrementoUnarioPrefixado(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitIncrementoUnarioPrefixado) {
			return visitor.visitIncrementoUnarioPrefixado(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class DecrementoUnarioPrefixadoContext extends ExpressaoContext {
	public OP_DECREMENTO_UNARIO(): TerminalNode { return this.getToken(PortugolParser.OP_DECREMENTO_UNARIO, 0); }
	public ID(): TerminalNode { return this.getToken(PortugolParser.ID, 0); }
	public indiceArray(): IndiceArrayContext[];
	public indiceArray(i: number): IndiceArrayContext;
	public indiceArray(i?: number): IndiceArrayContext | IndiceArrayContext[] {
		if (i === undefined) {
			return this.getRuleContexts(IndiceArrayContext);
		} else {
			return this.getRuleContext(i, IndiceArrayContext);
		}
	}
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterDecrementoUnarioPrefixado) {
			listener.enterDecrementoUnarioPrefixado(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitDecrementoUnarioPrefixado) {
			listener.exitDecrementoUnarioPrefixado(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitDecrementoUnarioPrefixado) {
			return visitor.visitDecrementoUnarioPrefixado(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class MultiplicacaoContext extends ExpressaoContext {
	public expressao(): ExpressaoContext[];
	public expressao(i: number): ExpressaoContext;
	public expressao(i?: number): ExpressaoContext | ExpressaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressaoContext);
		} else {
			return this.getRuleContext(i, ExpressaoContext);
		}
	}
	public OP_MULTIPLICACAO(): TerminalNode { return this.getToken(PortugolParser.OP_MULTIPLICACAO, 0); }
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterMultiplicacao) {
			listener.enterMultiplicacao(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitMultiplicacao) {
			listener.exitMultiplicacao(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitMultiplicacao) {
			return visitor.visitMultiplicacao(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class DivisaoContext extends ExpressaoContext {
	public expressao(): ExpressaoContext[];
	public expressao(i: number): ExpressaoContext;
	public expressao(i?: number): ExpressaoContext | ExpressaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressaoContext);
		} else {
			return this.getRuleContext(i, ExpressaoContext);
		}
	}
	public OP_DIVISAO(): TerminalNode { return this.getToken(PortugolParser.OP_DIVISAO, 0); }
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterDivisao) {
			listener.enterDivisao(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitDivisao) {
			listener.exitDivisao(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitDivisao) {
			return visitor.visitDivisao(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ModuloContext extends ExpressaoContext {
	public expressao(): ExpressaoContext[];
	public expressao(i: number): ExpressaoContext;
	public expressao(i?: number): ExpressaoContext | ExpressaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressaoContext);
		} else {
			return this.getRuleContext(i, ExpressaoContext);
		}
	}
	public OP_MOD(): TerminalNode { return this.getToken(PortugolParser.OP_MOD, 0); }
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterModulo) {
			listener.enterModulo(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitModulo) {
			listener.exitModulo(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitModulo) {
			return visitor.visitModulo(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class AdicaoContext extends ExpressaoContext {
	public expressao(): ExpressaoContext[];
	public expressao(i: number): ExpressaoContext;
	public expressao(i?: number): ExpressaoContext | ExpressaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressaoContext);
		} else {
			return this.getRuleContext(i, ExpressaoContext);
		}
	}
	public OP_ADICAO(): TerminalNode { return this.getToken(PortugolParser.OP_ADICAO, 0); }
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterAdicao) {
			listener.enterAdicao(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitAdicao) {
			listener.exitAdicao(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitAdicao) {
			return visitor.visitAdicao(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class SubtracaoContext extends ExpressaoContext {
	public expressao(): ExpressaoContext[];
	public expressao(i: number): ExpressaoContext;
	public expressao(i?: number): ExpressaoContext | ExpressaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressaoContext);
		} else {
			return this.getRuleContext(i, ExpressaoContext);
		}
	}
	public OP_SUBTRACAO(): TerminalNode { return this.getToken(PortugolParser.OP_SUBTRACAO, 0); }
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterSubtracao) {
			listener.enterSubtracao(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitSubtracao) {
			listener.exitSubtracao(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitSubtracao) {
			return visitor.visitSubtracao(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class OperacaoIgualdadeContext extends ExpressaoContext {
	public expressao(): ExpressaoContext[];
	public expressao(i: number): ExpressaoContext;
	public expressao(i?: number): ExpressaoContext | ExpressaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressaoContext);
		} else {
			return this.getRuleContext(i, ExpressaoContext);
		}
	}
	public OP_IGUALDADE(): TerminalNode { return this.getToken(PortugolParser.OP_IGUALDADE, 0); }
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterOperacaoIgualdade) {
			listener.enterOperacaoIgualdade(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitOperacaoIgualdade) {
			listener.exitOperacaoIgualdade(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitOperacaoIgualdade) {
			return visitor.visitOperacaoIgualdade(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class OperacaoDiferencaContext extends ExpressaoContext {
	public expressao(): ExpressaoContext[];
	public expressao(i: number): ExpressaoContext;
	public expressao(i?: number): ExpressaoContext | ExpressaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressaoContext);
		} else {
			return this.getRuleContext(i, ExpressaoContext);
		}
	}
	public OP_DIFERENCA(): TerminalNode { return this.getToken(PortugolParser.OP_DIFERENCA, 0); }
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterOperacaoDiferenca) {
			listener.enterOperacaoDiferenca(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitOperacaoDiferenca) {
			listener.exitOperacaoDiferenca(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitOperacaoDiferenca) {
			return visitor.visitOperacaoDiferenca(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class OperacaoMaiorContext extends ExpressaoContext {
	public expressao(): ExpressaoContext[];
	public expressao(i: number): ExpressaoContext;
	public expressao(i?: number): ExpressaoContext | ExpressaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressaoContext);
		} else {
			return this.getRuleContext(i, ExpressaoContext);
		}
	}
	public OP_MAIOR(): TerminalNode { return this.getToken(PortugolParser.OP_MAIOR, 0); }
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterOperacaoMaior) {
			listener.enterOperacaoMaior(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitOperacaoMaior) {
			listener.exitOperacaoMaior(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitOperacaoMaior) {
			return visitor.visitOperacaoMaior(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class OperacaoMenorContext extends ExpressaoContext {
	public expressao(): ExpressaoContext[];
	public expressao(i: number): ExpressaoContext;
	public expressao(i?: number): ExpressaoContext | ExpressaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressaoContext);
		} else {
			return this.getRuleContext(i, ExpressaoContext);
		}
	}
	public OP_MENOR(): TerminalNode { return this.getToken(PortugolParser.OP_MENOR, 0); }
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterOperacaoMenor) {
			listener.enterOperacaoMenor(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitOperacaoMenor) {
			listener.exitOperacaoMenor(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitOperacaoMenor) {
			return visitor.visitOperacaoMenor(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class OperacaoMenorIgualContext extends ExpressaoContext {
	public expressao(): ExpressaoContext[];
	public expressao(i: number): ExpressaoContext;
	public expressao(i?: number): ExpressaoContext | ExpressaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressaoContext);
		} else {
			return this.getRuleContext(i, ExpressaoContext);
		}
	}
	public OP_MENOR_IGUAL(): TerminalNode { return this.getToken(PortugolParser.OP_MENOR_IGUAL, 0); }
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterOperacaoMenorIgual) {
			listener.enterOperacaoMenorIgual(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitOperacaoMenorIgual) {
			listener.exitOperacaoMenorIgual(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitOperacaoMenorIgual) {
			return visitor.visitOperacaoMenorIgual(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class OperacaoMaiorIgualContext extends ExpressaoContext {
	public expressao(): ExpressaoContext[];
	public expressao(i: number): ExpressaoContext;
	public expressao(i?: number): ExpressaoContext | ExpressaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressaoContext);
		} else {
			return this.getRuleContext(i, ExpressaoContext);
		}
	}
	public OP_MAIOR_IGUAL(): TerminalNode { return this.getToken(PortugolParser.OP_MAIOR_IGUAL, 0); }
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterOperacaoMaiorIgual) {
			listener.enterOperacaoMaiorIgual(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitOperacaoMaiorIgual) {
			listener.exitOperacaoMaiorIgual(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitOperacaoMaiorIgual) {
			return visitor.visitOperacaoMaiorIgual(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class OperacaoELogicoContext extends ExpressaoContext {
	public expressao(): ExpressaoContext[];
	public expressao(i: number): ExpressaoContext;
	public expressao(i?: number): ExpressaoContext | ExpressaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressaoContext);
		} else {
			return this.getRuleContext(i, ExpressaoContext);
		}
	}
	public OP_E_LOGICO(): TerminalNode { return this.getToken(PortugolParser.OP_E_LOGICO, 0); }
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterOperacaoELogico) {
			listener.enterOperacaoELogico(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitOperacaoELogico) {
			listener.exitOperacaoELogico(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitOperacaoELogico) {
			return visitor.visitOperacaoELogico(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class OperacaoOuLogicoContext extends ExpressaoContext {
	public expressao(): ExpressaoContext[];
	public expressao(i: number): ExpressaoContext;
	public expressao(i?: number): ExpressaoContext | ExpressaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressaoContext);
		} else {
			return this.getRuleContext(i, ExpressaoContext);
		}
	}
	public OP_OU_LOGICO(): TerminalNode { return this.getToken(PortugolParser.OP_OU_LOGICO, 0); }
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterOperacaoOuLogico) {
			listener.enterOperacaoOuLogico(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitOperacaoOuLogico) {
			listener.exitOperacaoOuLogico(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitOperacaoOuLogico) {
			return visitor.visitOperacaoOuLogico(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class OperacaoXorContext extends ExpressaoContext {
	public expressao(): ExpressaoContext[];
	public expressao(i: number): ExpressaoContext;
	public expressao(i?: number): ExpressaoContext | ExpressaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressaoContext);
		} else {
			return this.getRuleContext(i, ExpressaoContext);
		}
	}
	public OP_XOR(): TerminalNode { return this.getToken(PortugolParser.OP_XOR, 0); }
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterOperacaoXor) {
			listener.enterOperacaoXor(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitOperacaoXor) {
			listener.exitOperacaoXor(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitOperacaoXor) {
			return visitor.visitOperacaoXor(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class OperacaoShiftLeftContext extends ExpressaoContext {
	public expressao(): ExpressaoContext[];
	public expressao(i: number): ExpressaoContext;
	public expressao(i?: number): ExpressaoContext | ExpressaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressaoContext);
		} else {
			return this.getRuleContext(i, ExpressaoContext);
		}
	}
	public OP_SHIFT_LEFT(): TerminalNode { return this.getToken(PortugolParser.OP_SHIFT_LEFT, 0); }
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterOperacaoShiftLeft) {
			listener.enterOperacaoShiftLeft(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitOperacaoShiftLeft) {
			listener.exitOperacaoShiftLeft(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitOperacaoShiftLeft) {
			return visitor.visitOperacaoShiftLeft(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class OperacaoShiftRightContext extends ExpressaoContext {
	public expressao(): ExpressaoContext[];
	public expressao(i: number): ExpressaoContext;
	public expressao(i?: number): ExpressaoContext | ExpressaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressaoContext);
		} else {
			return this.getRuleContext(i, ExpressaoContext);
		}
	}
	public OP_SHIFT_RIGHT(): TerminalNode { return this.getToken(PortugolParser.OP_SHIFT_RIGHT, 0); }
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterOperacaoShiftRight) {
			listener.enterOperacaoShiftRight(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitOperacaoShiftRight) {
			listener.exitOperacaoShiftRight(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitOperacaoShiftRight) {
			return visitor.visitOperacaoShiftRight(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class OperacaoAndBitwiseContext extends ExpressaoContext {
	public expressao(): ExpressaoContext[];
	public expressao(i: number): ExpressaoContext;
	public expressao(i?: number): ExpressaoContext | ExpressaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressaoContext);
		} else {
			return this.getRuleContext(i, ExpressaoContext);
		}
	}
	public E_COMERCIAL(): TerminalNode { return this.getToken(PortugolParser.E_COMERCIAL, 0); }
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterOperacaoAndBitwise) {
			listener.enterOperacaoAndBitwise(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitOperacaoAndBitwise) {
			listener.exitOperacaoAndBitwise(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitOperacaoAndBitwise) {
			return visitor.visitOperacaoAndBitwise(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class OperacaoOrBitwiseContext extends ExpressaoContext {
	public expressao(): ExpressaoContext[];
	public expressao(i: number): ExpressaoContext;
	public expressao(i?: number): ExpressaoContext | ExpressaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressaoContext);
		} else {
			return this.getRuleContext(i, ExpressaoContext);
		}
	}
	public OP_OU_BITWISE(): TerminalNode { return this.getToken(PortugolParser.OP_OU_BITWISE, 0); }
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterOperacaoOrBitwise) {
			listener.enterOperacaoOrBitwise(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitOperacaoOrBitwise) {
			listener.exitOperacaoOrBitwise(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitOperacaoOrBitwise) {
			return visitor.visitOperacaoOrBitwise(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ReferenciaParaVariavelContext extends ExpressaoContext {
	public ID(): TerminalNode { return this.getToken(PortugolParser.ID, 0); }
	public escopoBiblioteca(): EscopoBibliotecaContext | undefined {
		return this.tryGetRuleContext(0, EscopoBibliotecaContext);
	}
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterReferenciaParaVariavel) {
			listener.enterReferenciaParaVariavel(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitReferenciaParaVariavel) {
			listener.exitReferenciaParaVariavel(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitReferenciaParaVariavel) {
			return visitor.visitReferenciaParaVariavel(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class NumeroInteiroContext extends ExpressaoContext {
	public INT(): TerminalNode | undefined { return this.tryGetToken(PortugolParser.INT, 0); }
	public HEXADECIMAL(): TerminalNode | undefined { return this.tryGetToken(PortugolParser.HEXADECIMAL, 0); }
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterNumeroInteiro) {
			listener.enterNumeroInteiro(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitNumeroInteiro) {
			listener.exitNumeroInteiro(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitNumeroInteiro) {
			return visitor.visitNumeroInteiro(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class NumeroRealContext extends ExpressaoContext {
	public REAL(): TerminalNode { return this.getToken(PortugolParser.REAL, 0); }
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterNumeroReal) {
			listener.enterNumeroReal(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitNumeroReal) {
			listener.exitNumeroReal(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitNumeroReal) {
			return visitor.visitNumeroReal(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ValorLogicoContext extends ExpressaoContext {
	public LOGICO(): TerminalNode { return this.getToken(PortugolParser.LOGICO, 0); }
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterValorLogico) {
			listener.enterValorLogico(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitValorLogico) {
			listener.exitValorLogico(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitValorLogico) {
			return visitor.visitValorLogico(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class CaracterContext extends ExpressaoContext {
	public CARACTER(): TerminalNode { return this.getToken(PortugolParser.CARACTER, 0); }
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterCaracter) {
			listener.enterCaracter(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitCaracter) {
			listener.exitCaracter(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitCaracter) {
			return visitor.visitCaracter(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class StringContext extends ExpressaoContext {
	public STRING(): TerminalNode { return this.getToken(PortugolParser.STRING, 0); }
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterString) {
			listener.enterString(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitString) {
			listener.exitString(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitString) {
			return visitor.visitString(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ExpressaoEntreParentesesContext extends ExpressaoContext {
	public ABRE_PARENTESES(): TerminalNode { return this.getToken(PortugolParser.ABRE_PARENTESES, 0); }
	public expressao(): ExpressaoContext {
		return this.getRuleContext(0, ExpressaoContext);
	}
	public FECHA_PARENTESES(): TerminalNode { return this.getToken(PortugolParser.FECHA_PARENTESES, 0); }
	constructor(ctx: ExpressaoContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterExpressaoEntreParenteses) {
			listener.enterExpressaoEntreParenteses(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitExpressaoEntreParenteses) {
			listener.exitExpressaoEntreParenteses(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitExpressaoEntreParenteses) {
			return visitor.visitExpressaoEntreParenteses(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ListaExpressoesContext extends ParserRuleContext {
	public expressao(): ExpressaoContext[];
	public expressao(i: number): ExpressaoContext;
	public expressao(i?: number): ExpressaoContext | ExpressaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressaoContext);
		} else {
			return this.getRuleContext(i, ExpressaoContext);
		}
	}
	public atribuicaoComposta(): AtribuicaoCompostaContext[];
	public atribuicaoComposta(i: number): AtribuicaoCompostaContext;
	public atribuicaoComposta(i?: number): AtribuicaoCompostaContext | AtribuicaoCompostaContext[] {
		if (i === undefined) {
			return this.getRuleContexts(AtribuicaoCompostaContext);
		} else {
			return this.getRuleContext(i, AtribuicaoCompostaContext);
		}
	}
	public atribuicao(): AtribuicaoContext[];
	public atribuicao(i: number): AtribuicaoContext;
	public atribuicao(i?: number): AtribuicaoContext | AtribuicaoContext[] {
		if (i === undefined) {
			return this.getRuleContexts(AtribuicaoContext);
		} else {
			return this.getRuleContext(i, AtribuicaoContext);
		}
	}
	public VIRGULA(): TerminalNode[];
	public VIRGULA(i: number): TerminalNode;
	public VIRGULA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(PortugolParser.VIRGULA);
		} else {
			return this.getToken(PortugolParser.VIRGULA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_listaExpressoes; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterListaExpressoes) {
			listener.enterListaExpressoes(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitListaExpressoes) {
			listener.exitListaExpressoes(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitListaExpressoes) {
			return visitor.visitListaExpressoes(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class EscopoBibliotecaContext extends ParserRuleContext {
	public ID(): TerminalNode | undefined { return this.tryGetToken(PortugolParser.ID, 0); }
	public PONTO(): TerminalNode | undefined { return this.tryGetToken(PortugolParser.PONTO, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return PortugolParser.RULE_escopoBiblioteca; }
	// @Override
	public enterRule(listener: PortugolListener): void {
		if (listener.enterEscopoBiblioteca) {
			listener.enterEscopoBiblioteca(this);
		}
	}
	// @Override
	public exitRule(listener: PortugolListener): void {
		if (listener.exitEscopoBiblioteca) {
			listener.exitEscopoBiblioteca(this);
		}
	}
	// @Override
	public accept<Result>(visitor: PortugolVisitor<Result>): Result {
		if (visitor.visitEscopoBiblioteca) {
			return visitor.visitEscopoBiblioteca(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


