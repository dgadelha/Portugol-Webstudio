// Generated from src/Portugol.g4 by ANTLR 4.13.1

import * as antlr from "antlr4ng";
import { Token } from "antlr4ng";


export class PortugolLexer extends antlr.Lexer {
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

    public static readonly channelNames = [
        "DEFAULT_TOKEN_CHANNEL", "HIDDEN"
    ];

    public static readonly literalNames = [
        null, "'('", "')'", "'['", "']'", "'{'", "'}'", null, "'faca'", 
        "'enquanto'", "'para'", "'se'", "'senao'", "'const'", "'funcao'", 
        "'programa'", "'escolha'", "'caso'", "'contrario'", "'pare'", "'retorne'", 
        "'inclua'", "'biblioteca'", "'nao'", "'e'", "'ou'", "'-'", "'+'", 
        "'*'", "'/'", "'%'", "'='", "'=='", "'!='", "'>'", "'<'", "'<='", 
        "'>='", "'++'", "'--'", "'<<'", "'>>'", "'^'", "'|'", "'~'", "'-->'", 
        "'&'", "'+='", "'-='", "'*='", "'/='", null, "'verdadeiro'", "'falso'", 
        null, null, null, null, null, null, null, null, null, "'.'", "','", 
        "';'", "':'"
    ];

    public static readonly symbolicNames = [
        null, "ABRE_PARENTESES", "FECHA_PARENTESES", "ABRE_COLCHETES", "FECHA_COLCHETES", 
        "ABRE_CHAVES", "FECHA_CHAVES", "TIPO", "FACA", "ENQUANTO", "PARA", 
        "SE", "SENAO", "CONSTANTE", "FUNCAO", "PROGRAMA", "ESCOLHA", "CASO", 
        "CONTRARIO", "PARE", "RETORNE", "INCLUA", "BIBLIOTECA", "OP_NAO", 
        "OP_E_LOGICO", "OP_OU_LOGICO", "OP_SUBTRACAO", "OP_ADICAO", "OP_MULTIPLICACAO", 
        "OP_DIVISAO", "OP_MOD", "OP_ATRIBUICAO", "OP_IGUALDADE", "OP_DIFERENCA", 
        "OP_MAIOR", "OP_MENOR", "OP_MENOR_IGUAL", "OP_MAIOR_IGUAL", "OP_INCREMENTO_UNARIO", 
        "OP_DECREMENTO_UNARIO", "OP_SHIFT_LEFT", "OP_SHIFT_RIGHT", "OP_XOR", 
        "OP_OU_BITWISE", "OP_NOT_BITWISE", "OP_ALIAS_BIBLIOTECA", "E_COMERCIAL", 
        "OP_MAIS_IGUAL", "OP_MENOS_IGUAL", "OP_MULTIPLICACAO_IGUAL", "OP_DIVISAO_IGUAL", 
        "LOGICO", "VERDADEIRO", "FALSO", "CARACTER", "STRING", "ID", "REAL", 
        "INT", "HEXADECIMAL", "COMENTARIO", "COMENTARIO_SIMPLES", "WS", 
        "PONTO", "VIRGULA", "PONTOVIRGULA", "DOISPONTOS"
    ];

    public static readonly modeNames = [
        "DEFAULT_MODE",
    ];

    public static readonly ruleNames = [
        "ABRE_PARENTESES", "FECHA_PARENTESES", "ABRE_COLCHETES", "FECHA_COLCHETES", 
        "ABRE_CHAVES", "FECHA_CHAVES", "TIPO", "FACA", "ENQUANTO", "PARA", 
        "SE", "SENAO", "CONSTANTE", "FUNCAO", "PROGRAMA", "ESCOLHA", "CASO", 
        "CONTRARIO", "PARE", "RETORNE", "INCLUA", "BIBLIOTECA", "OP_NAO", 
        "OP_E_LOGICO", "OP_OU_LOGICO", "OP_SUBTRACAO", "OP_ADICAO", "OP_MULTIPLICACAO", 
        "OP_DIVISAO", "OP_MOD", "OP_ATRIBUICAO", "OP_IGUALDADE", "OP_DIFERENCA", 
        "OP_MAIOR", "OP_MENOR", "OP_MENOR_IGUAL", "OP_MAIOR_IGUAL", "OP_INCREMENTO_UNARIO", 
        "OP_DECREMENTO_UNARIO", "OP_SHIFT_LEFT", "OP_SHIFT_RIGHT", "OP_XOR", 
        "OP_OU_BITWISE", "OP_NOT_BITWISE", "OP_ALIAS_BIBLIOTECA", "E_COMERCIAL", 
        "OP_MAIS_IGUAL", "OP_MENOS_IGUAL", "OP_MULTIPLICACAO_IGUAL", "OP_DIVISAO_IGUAL", 
        "LOGICO", "VERDADEIRO", "FALSO", "CARACTER", "SEQ_ESC", "ESC_OCTAL", 
        "ESC_UNICODE", "ESC_CARACTER", "DIGIT_HEX", "STRING", "ID", "LETRA", 
        "REAL", "DIGITO", "INT", "HEXADECIMAL", "SIMBOLO_HEXADECIMAL", "COMENTARIO", 
        "COMENTARIO_SIMPLES", "WS", "PONTO", "VIRGULA", "PONTOVIRGULA", 
        "DOISPONTOS",
    ];


    public constructor(input: antlr.CharStream) {
        super(input);
        this.interpreter = new antlr.LexerATNSimulator(this, PortugolLexer._ATN, PortugolLexer.decisionsToDFA, new antlr.PredictionContextCache());
    }

    public get grammarFileName(): string { return "Portugol.g4"; }

    public get literalNames(): (string | null)[] { return PortugolLexer.literalNames; }
    public get symbolicNames(): (string | null)[] { return PortugolLexer.symbolicNames; }
    public get ruleNames(): string[] { return PortugolLexer.ruleNames; }

    public get serializedATN(): number[] { return PortugolLexer._serializedATN; }

    public get channelNames(): string[] { return PortugolLexer.channelNames; }

    public get modeNames(): string[] { return PortugolLexer.modeNames; }

    public override action(localContext: antlr.ParserRuleContext | null, ruleIndex: number, actionIndex: number): void {
        switch (ruleIndex) {
        case 64:
            this.INT_action(localContext, actionIndex);
            break;
        }
    }
    private INT_action(localContext: antlr.ParserRuleContext | null, actionIndex: number): void {
        switch (actionIndex) {
        case 0:
             
                if (isNaN(parseInt(this.text))) {
                  throw new Error(`Dígito inválido: ${this.text}`);
                }

            break;
        }
    }

    public static readonly _serializedATN: number[] = [
        4,0,66,552,6,-1,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,
        2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,
        13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,2,19,7,
        19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,24,2,25,7,25,2,
        26,7,26,2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,31,7,31,2,32,7,
        32,2,33,7,33,2,34,7,34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,7,38,2,
        39,7,39,2,40,7,40,2,41,7,41,2,42,7,42,2,43,7,43,2,44,7,44,2,45,7,
        45,2,46,7,46,2,47,7,47,2,48,7,48,2,49,7,49,2,50,7,50,2,51,7,51,2,
        52,7,52,2,53,7,53,2,54,7,54,2,55,7,55,2,56,7,56,2,57,7,57,2,58,7,
        58,2,59,7,59,2,60,7,60,2,61,7,61,2,62,7,62,2,63,7,63,2,64,7,64,2,
        65,7,65,2,66,7,66,2,67,7,67,2,68,7,68,2,69,7,69,2,70,7,70,2,71,7,
        71,2,72,7,72,2,73,7,73,1,0,1,0,1,1,1,1,1,2,1,2,1,3,1,3,1,4,1,4,1,
        5,1,5,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,
        6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,
        6,1,6,1,6,1,6,1,6,1,6,3,6,198,8,6,1,7,1,7,1,7,1,7,1,7,1,8,1,8,1,
        8,1,8,1,8,1,8,1,8,1,8,1,8,1,9,1,9,1,9,1,9,1,9,1,10,1,10,1,10,1,11,
        1,11,1,11,1,11,1,11,1,11,1,12,1,12,1,12,1,12,1,12,1,12,1,13,1,13,
        1,13,1,13,1,13,1,13,1,13,1,14,1,14,1,14,1,14,1,14,1,14,1,14,1,14,
        1,14,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,16,1,16,1,16,1,16,
        1,16,1,17,1,17,1,17,1,17,1,17,1,17,1,17,1,17,1,17,1,17,1,18,1,18,
        1,18,1,18,1,18,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,20,1,20,
        1,20,1,20,1,20,1,20,1,20,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,
        1,21,1,21,1,21,1,22,1,22,1,22,1,22,1,23,1,23,1,24,1,24,1,24,1,25,
        1,25,1,26,1,26,1,27,1,27,1,28,1,28,1,29,1,29,1,30,1,30,1,31,1,31,
        1,31,1,32,1,32,1,32,1,33,1,33,1,34,1,34,1,35,1,35,1,35,1,36,1,36,
        1,36,1,37,1,37,1,37,1,38,1,38,1,38,1,39,1,39,1,39,1,40,1,40,1,40,
        1,41,1,41,1,42,1,42,1,43,1,43,1,44,1,44,1,44,1,44,1,45,1,45,1,46,
        1,46,1,46,1,47,1,47,1,47,1,48,1,48,1,48,1,49,1,49,1,49,1,50,1,50,
        3,50,379,8,50,1,51,1,51,1,51,1,51,1,51,1,51,1,51,1,51,1,51,1,51,
        1,51,1,52,1,52,1,52,1,52,1,52,1,52,1,53,1,53,1,53,3,53,401,8,53,
        1,53,1,53,1,54,1,54,1,54,1,54,3,54,409,8,54,1,55,1,55,1,55,1,55,
        1,55,1,55,1,55,1,55,1,55,3,55,420,8,55,1,56,1,56,1,56,1,56,1,56,
        1,56,1,56,1,57,1,57,1,57,3,57,432,8,57,1,58,1,58,1,59,1,59,1,59,
        5,59,439,8,59,10,59,12,59,442,9,59,1,59,1,59,1,60,1,60,3,60,448,
        8,60,1,60,1,60,5,60,452,8,60,10,60,12,60,455,9,60,1,61,1,61,1,62,
        4,62,460,8,62,11,62,12,62,461,1,62,1,62,5,62,466,8,62,10,62,12,62,
        469,9,62,1,62,1,62,4,62,473,8,62,11,62,12,62,474,3,62,477,8,62,1,
        63,1,63,1,64,4,64,482,8,64,11,64,12,64,483,1,64,1,64,1,65,1,65,1,
        65,1,65,1,65,1,65,1,65,1,65,3,65,496,8,65,3,65,498,8,65,3,65,500,
        8,65,3,65,502,8,65,3,65,504,8,65,1,66,1,66,3,66,508,8,66,1,67,1,
        67,1,67,1,67,5,67,514,8,67,10,67,12,67,517,9,67,1,67,1,67,1,67,1,
        67,1,67,1,68,1,68,1,68,1,68,5,68,528,8,68,10,68,12,68,531,9,68,1,
        68,3,68,534,8,68,1,68,1,68,1,69,4,69,539,8,69,11,69,12,69,540,1,
        69,1,69,1,70,1,70,1,71,1,71,1,72,1,72,1,73,1,73,3,440,515,529,0,
        74,1,1,3,2,5,3,7,4,9,5,11,6,13,7,15,8,17,9,19,10,21,11,23,12,25,
        13,27,14,29,15,31,16,33,17,35,18,37,19,39,20,41,21,43,22,45,23,47,
        24,49,25,51,26,53,27,55,28,57,29,59,30,61,31,63,32,65,33,67,34,69,
        35,71,36,73,37,75,38,77,39,79,40,81,41,83,42,85,43,87,44,89,45,91,
        46,93,47,95,48,97,49,99,50,101,51,103,52,105,53,107,54,109,0,111,
        0,113,0,115,0,117,0,119,55,121,56,123,0,125,57,127,0,129,58,131,
        59,133,0,135,60,137,61,139,62,141,63,143,64,145,65,147,66,1,0,10,
        1,0,39,39,7,0,34,34,92,92,98,98,102,102,110,110,114,114,116,116,
        3,0,48,57,65,70,97,102,2,0,48,57,95,95,2,0,65,90,97,122,1,0,48,57,
        2,0,88,88,120,120,2,0,65,70,97,102,1,1,10,10,3,0,9,10,13,13,32,32,
        574,0,1,1,0,0,0,0,3,1,0,0,0,0,5,1,0,0,0,0,7,1,0,0,0,0,9,1,0,0,0,
        0,11,1,0,0,0,0,13,1,0,0,0,0,15,1,0,0,0,0,17,1,0,0,0,0,19,1,0,0,0,
        0,21,1,0,0,0,0,23,1,0,0,0,0,25,1,0,0,0,0,27,1,0,0,0,0,29,1,0,0,0,
        0,31,1,0,0,0,0,33,1,0,0,0,0,35,1,0,0,0,0,37,1,0,0,0,0,39,1,0,0,0,
        0,41,1,0,0,0,0,43,1,0,0,0,0,45,1,0,0,0,0,47,1,0,0,0,0,49,1,0,0,0,
        0,51,1,0,0,0,0,53,1,0,0,0,0,55,1,0,0,0,0,57,1,0,0,0,0,59,1,0,0,0,
        0,61,1,0,0,0,0,63,1,0,0,0,0,65,1,0,0,0,0,67,1,0,0,0,0,69,1,0,0,0,
        0,71,1,0,0,0,0,73,1,0,0,0,0,75,1,0,0,0,0,77,1,0,0,0,0,79,1,0,0,0,
        0,81,1,0,0,0,0,83,1,0,0,0,0,85,1,0,0,0,0,87,1,0,0,0,0,89,1,0,0,0,
        0,91,1,0,0,0,0,93,1,0,0,0,0,95,1,0,0,0,0,97,1,0,0,0,0,99,1,0,0,0,
        0,101,1,0,0,0,0,103,1,0,0,0,0,105,1,0,0,0,0,107,1,0,0,0,0,119,1,
        0,0,0,0,121,1,0,0,0,0,125,1,0,0,0,0,129,1,0,0,0,0,131,1,0,0,0,0,
        135,1,0,0,0,0,137,1,0,0,0,0,139,1,0,0,0,0,141,1,0,0,0,0,143,1,0,
        0,0,0,145,1,0,0,0,0,147,1,0,0,0,1,149,1,0,0,0,3,151,1,0,0,0,5,153,
        1,0,0,0,7,155,1,0,0,0,9,157,1,0,0,0,11,159,1,0,0,0,13,197,1,0,0,
        0,15,199,1,0,0,0,17,204,1,0,0,0,19,213,1,0,0,0,21,218,1,0,0,0,23,
        221,1,0,0,0,25,227,1,0,0,0,27,233,1,0,0,0,29,240,1,0,0,0,31,249,
        1,0,0,0,33,257,1,0,0,0,35,262,1,0,0,0,37,272,1,0,0,0,39,277,1,0,
        0,0,41,285,1,0,0,0,43,292,1,0,0,0,45,303,1,0,0,0,47,307,1,0,0,0,
        49,309,1,0,0,0,51,312,1,0,0,0,53,314,1,0,0,0,55,316,1,0,0,0,57,318,
        1,0,0,0,59,320,1,0,0,0,61,322,1,0,0,0,63,324,1,0,0,0,65,327,1,0,
        0,0,67,330,1,0,0,0,69,332,1,0,0,0,71,334,1,0,0,0,73,337,1,0,0,0,
        75,340,1,0,0,0,77,343,1,0,0,0,79,346,1,0,0,0,81,349,1,0,0,0,83,352,
        1,0,0,0,85,354,1,0,0,0,87,356,1,0,0,0,89,358,1,0,0,0,91,362,1,0,
        0,0,93,364,1,0,0,0,95,367,1,0,0,0,97,370,1,0,0,0,99,373,1,0,0,0,
        101,378,1,0,0,0,103,380,1,0,0,0,105,391,1,0,0,0,107,397,1,0,0,0,
        109,408,1,0,0,0,111,419,1,0,0,0,113,421,1,0,0,0,115,431,1,0,0,0,
        117,433,1,0,0,0,119,435,1,0,0,0,121,447,1,0,0,0,123,456,1,0,0,0,
        125,476,1,0,0,0,127,478,1,0,0,0,129,481,1,0,0,0,131,487,1,0,0,0,
        133,507,1,0,0,0,135,509,1,0,0,0,137,523,1,0,0,0,139,538,1,0,0,0,
        141,544,1,0,0,0,143,546,1,0,0,0,145,548,1,0,0,0,147,550,1,0,0,0,
        149,150,5,40,0,0,150,2,1,0,0,0,151,152,5,41,0,0,152,4,1,0,0,0,153,
        154,5,91,0,0,154,6,1,0,0,0,155,156,5,93,0,0,156,8,1,0,0,0,157,158,
        5,123,0,0,158,10,1,0,0,0,159,160,5,125,0,0,160,12,1,0,0,0,161,162,
        5,114,0,0,162,163,5,101,0,0,163,164,5,97,0,0,164,198,5,108,0,0,165,
        166,5,105,0,0,166,167,5,110,0,0,167,168,5,116,0,0,168,169,5,101,
        0,0,169,170,5,105,0,0,170,171,5,114,0,0,171,198,5,111,0,0,172,173,
        5,118,0,0,173,174,5,97,0,0,174,175,5,122,0,0,175,176,5,105,0,0,176,
        198,5,111,0,0,177,178,5,108,0,0,178,179,5,111,0,0,179,180,5,103,
        0,0,180,181,5,105,0,0,181,182,5,99,0,0,182,198,5,111,0,0,183,184,
        5,99,0,0,184,185,5,97,0,0,185,186,5,100,0,0,186,187,5,101,0,0,187,
        188,5,105,0,0,188,198,5,97,0,0,189,190,5,99,0,0,190,191,5,97,0,0,
        191,192,5,114,0,0,192,193,5,97,0,0,193,194,5,99,0,0,194,195,5,116,
        0,0,195,196,5,101,0,0,196,198,5,114,0,0,197,161,1,0,0,0,197,165,
        1,0,0,0,197,172,1,0,0,0,197,177,1,0,0,0,197,183,1,0,0,0,197,189,
        1,0,0,0,198,14,1,0,0,0,199,200,5,102,0,0,200,201,5,97,0,0,201,202,
        5,99,0,0,202,203,5,97,0,0,203,16,1,0,0,0,204,205,5,101,0,0,205,206,
        5,110,0,0,206,207,5,113,0,0,207,208,5,117,0,0,208,209,5,97,0,0,209,
        210,5,110,0,0,210,211,5,116,0,0,211,212,5,111,0,0,212,18,1,0,0,0,
        213,214,5,112,0,0,214,215,5,97,0,0,215,216,5,114,0,0,216,217,5,97,
        0,0,217,20,1,0,0,0,218,219,5,115,0,0,219,220,5,101,0,0,220,22,1,
        0,0,0,221,222,5,115,0,0,222,223,5,101,0,0,223,224,5,110,0,0,224,
        225,5,97,0,0,225,226,5,111,0,0,226,24,1,0,0,0,227,228,5,99,0,0,228,
        229,5,111,0,0,229,230,5,110,0,0,230,231,5,115,0,0,231,232,5,116,
        0,0,232,26,1,0,0,0,233,234,5,102,0,0,234,235,5,117,0,0,235,236,5,
        110,0,0,236,237,5,99,0,0,237,238,5,97,0,0,238,239,5,111,0,0,239,
        28,1,0,0,0,240,241,5,112,0,0,241,242,5,114,0,0,242,243,5,111,0,0,
        243,244,5,103,0,0,244,245,5,114,0,0,245,246,5,97,0,0,246,247,5,109,
        0,0,247,248,5,97,0,0,248,30,1,0,0,0,249,250,5,101,0,0,250,251,5,
        115,0,0,251,252,5,99,0,0,252,253,5,111,0,0,253,254,5,108,0,0,254,
        255,5,104,0,0,255,256,5,97,0,0,256,32,1,0,0,0,257,258,5,99,0,0,258,
        259,5,97,0,0,259,260,5,115,0,0,260,261,5,111,0,0,261,34,1,0,0,0,
        262,263,5,99,0,0,263,264,5,111,0,0,264,265,5,110,0,0,265,266,5,116,
        0,0,266,267,5,114,0,0,267,268,5,97,0,0,268,269,5,114,0,0,269,270,
        5,105,0,0,270,271,5,111,0,0,271,36,1,0,0,0,272,273,5,112,0,0,273,
        274,5,97,0,0,274,275,5,114,0,0,275,276,5,101,0,0,276,38,1,0,0,0,
        277,278,5,114,0,0,278,279,5,101,0,0,279,280,5,116,0,0,280,281,5,
        111,0,0,281,282,5,114,0,0,282,283,5,110,0,0,283,284,5,101,0,0,284,
        40,1,0,0,0,285,286,5,105,0,0,286,287,5,110,0,0,287,288,5,99,0,0,
        288,289,5,108,0,0,289,290,5,117,0,0,290,291,5,97,0,0,291,42,1,0,
        0,0,292,293,5,98,0,0,293,294,5,105,0,0,294,295,5,98,0,0,295,296,
        5,108,0,0,296,297,5,105,0,0,297,298,5,111,0,0,298,299,5,116,0,0,
        299,300,5,101,0,0,300,301,5,99,0,0,301,302,5,97,0,0,302,44,1,0,0,
        0,303,304,5,110,0,0,304,305,5,97,0,0,305,306,5,111,0,0,306,46,1,
        0,0,0,307,308,5,101,0,0,308,48,1,0,0,0,309,310,5,111,0,0,310,311,
        5,117,0,0,311,50,1,0,0,0,312,313,5,45,0,0,313,52,1,0,0,0,314,315,
        5,43,0,0,315,54,1,0,0,0,316,317,5,42,0,0,317,56,1,0,0,0,318,319,
        5,47,0,0,319,58,1,0,0,0,320,321,5,37,0,0,321,60,1,0,0,0,322,323,
        5,61,0,0,323,62,1,0,0,0,324,325,5,61,0,0,325,326,5,61,0,0,326,64,
        1,0,0,0,327,328,5,33,0,0,328,329,5,61,0,0,329,66,1,0,0,0,330,331,
        5,62,0,0,331,68,1,0,0,0,332,333,5,60,0,0,333,70,1,0,0,0,334,335,
        5,60,0,0,335,336,5,61,0,0,336,72,1,0,0,0,337,338,5,62,0,0,338,339,
        5,61,0,0,339,74,1,0,0,0,340,341,5,43,0,0,341,342,5,43,0,0,342,76,
        1,0,0,0,343,344,5,45,0,0,344,345,5,45,0,0,345,78,1,0,0,0,346,347,
        5,60,0,0,347,348,5,60,0,0,348,80,1,0,0,0,349,350,5,62,0,0,350,351,
        5,62,0,0,351,82,1,0,0,0,352,353,5,94,0,0,353,84,1,0,0,0,354,355,
        5,124,0,0,355,86,1,0,0,0,356,357,5,126,0,0,357,88,1,0,0,0,358,359,
        5,45,0,0,359,360,5,45,0,0,360,361,5,62,0,0,361,90,1,0,0,0,362,363,
        5,38,0,0,363,92,1,0,0,0,364,365,5,43,0,0,365,366,5,61,0,0,366,94,
        1,0,0,0,367,368,5,45,0,0,368,369,5,61,0,0,369,96,1,0,0,0,370,371,
        5,42,0,0,371,372,5,61,0,0,372,98,1,0,0,0,373,374,5,47,0,0,374,375,
        5,61,0,0,375,100,1,0,0,0,376,379,3,103,51,0,377,379,3,105,52,0,378,
        376,1,0,0,0,378,377,1,0,0,0,379,102,1,0,0,0,380,381,5,118,0,0,381,
        382,5,101,0,0,382,383,5,114,0,0,383,384,5,100,0,0,384,385,5,97,0,
        0,385,386,5,100,0,0,386,387,5,101,0,0,387,388,5,105,0,0,388,389,
        5,114,0,0,389,390,5,111,0,0,390,104,1,0,0,0,391,392,5,102,0,0,392,
        393,5,97,0,0,393,394,5,108,0,0,394,395,5,115,0,0,395,396,5,111,0,
        0,396,106,1,0,0,0,397,400,5,39,0,0,398,401,3,115,57,0,399,401,8,
        0,0,0,400,398,1,0,0,0,400,399,1,0,0,0,401,402,1,0,0,0,402,403,5,
        39,0,0,403,108,1,0,0,0,404,405,5,92,0,0,405,409,7,1,0,0,406,409,
        3,113,56,0,407,409,3,111,55,0,408,404,1,0,0,0,408,406,1,0,0,0,408,
        407,1,0,0,0,409,110,1,0,0,0,410,411,5,92,0,0,411,412,2,48,51,0,412,
        413,2,48,55,0,413,420,2,48,55,0,414,415,5,92,0,0,415,416,2,48,55,
        0,416,420,2,48,55,0,417,418,5,92,0,0,418,420,2,48,55,0,419,410,1,
        0,0,0,419,414,1,0,0,0,419,417,1,0,0,0,420,112,1,0,0,0,421,422,5,
        92,0,0,422,423,5,117,0,0,423,424,3,117,58,0,424,425,3,117,58,0,425,
        426,3,117,58,0,426,427,3,117,58,0,427,114,1,0,0,0,428,432,3,109,
        54,0,429,430,5,92,0,0,430,432,5,39,0,0,431,428,1,0,0,0,431,429,1,
        0,0,0,432,116,1,0,0,0,433,434,7,2,0,0,434,118,1,0,0,0,435,440,5,
        34,0,0,436,439,3,109,54,0,437,439,9,0,0,0,438,436,1,0,0,0,438,437,
        1,0,0,0,439,442,1,0,0,0,440,441,1,0,0,0,440,438,1,0,0,0,441,443,
        1,0,0,0,442,440,1,0,0,0,443,444,5,34,0,0,444,120,1,0,0,0,445,448,
        3,123,61,0,446,448,5,95,0,0,447,445,1,0,0,0,447,446,1,0,0,0,448,
        453,1,0,0,0,449,452,3,123,61,0,450,452,7,3,0,0,451,449,1,0,0,0,451,
        450,1,0,0,0,452,455,1,0,0,0,453,451,1,0,0,0,453,454,1,0,0,0,454,
        122,1,0,0,0,455,453,1,0,0,0,456,457,7,4,0,0,457,124,1,0,0,0,458,
        460,3,127,63,0,459,458,1,0,0,0,460,461,1,0,0,0,461,459,1,0,0,0,461,
        462,1,0,0,0,462,463,1,0,0,0,463,467,5,46,0,0,464,466,3,127,63,0,
        465,464,1,0,0,0,466,469,1,0,0,0,467,465,1,0,0,0,467,468,1,0,0,0,
        468,477,1,0,0,0,469,467,1,0,0,0,470,472,5,46,0,0,471,473,3,127,63,
        0,472,471,1,0,0,0,473,474,1,0,0,0,474,472,1,0,0,0,474,475,1,0,0,
        0,475,477,1,0,0,0,476,459,1,0,0,0,476,470,1,0,0,0,477,126,1,0,0,
        0,478,479,7,5,0,0,479,128,1,0,0,0,480,482,3,127,63,0,481,480,1,0,
        0,0,482,483,1,0,0,0,483,481,1,0,0,0,483,484,1,0,0,0,484,485,1,0,
        0,0,485,486,6,64,0,0,486,130,1,0,0,0,487,488,5,48,0,0,488,489,7,
        6,0,0,489,503,3,133,66,0,490,501,3,133,66,0,491,499,3,133,66,0,492,
        497,3,133,66,0,493,495,3,133,66,0,494,496,3,133,66,0,495,494,1,0,
        0,0,495,496,1,0,0,0,496,498,1,0,0,0,497,493,1,0,0,0,497,498,1,0,
        0,0,498,500,1,0,0,0,499,492,1,0,0,0,499,500,1,0,0,0,500,502,1,0,
        0,0,501,491,1,0,0,0,501,502,1,0,0,0,502,504,1,0,0,0,503,490,1,0,
        0,0,503,504,1,0,0,0,504,132,1,0,0,0,505,508,3,127,63,0,506,508,7,
        7,0,0,507,505,1,0,0,0,507,506,1,0,0,0,508,134,1,0,0,0,509,510,5,
        47,0,0,510,511,5,42,0,0,511,515,1,0,0,0,512,514,9,0,0,0,513,512,
        1,0,0,0,514,517,1,0,0,0,515,516,1,0,0,0,515,513,1,0,0,0,516,518,
        1,0,0,0,517,515,1,0,0,0,518,519,5,42,0,0,519,520,5,47,0,0,520,521,
        1,0,0,0,521,522,6,67,1,0,522,136,1,0,0,0,523,524,5,47,0,0,524,525,
        5,47,0,0,525,529,1,0,0,0,526,528,9,0,0,0,527,526,1,0,0,0,528,531,
        1,0,0,0,529,530,1,0,0,0,529,527,1,0,0,0,530,533,1,0,0,0,531,529,
        1,0,0,0,532,534,7,8,0,0,533,532,1,0,0,0,534,535,1,0,0,0,535,536,
        6,68,1,0,536,138,1,0,0,0,537,539,7,9,0,0,538,537,1,0,0,0,539,540,
        1,0,0,0,540,538,1,0,0,0,540,541,1,0,0,0,541,542,1,0,0,0,542,543,
        6,69,1,0,543,140,1,0,0,0,544,545,5,46,0,0,545,142,1,0,0,0,546,547,
        5,44,0,0,547,144,1,0,0,0,548,549,5,59,0,0,549,146,1,0,0,0,550,551,
        5,58,0,0,551,148,1,0,0,0,27,0,197,378,400,408,419,431,438,440,447,
        451,453,461,467,474,476,483,495,497,499,501,503,507,515,529,533,
        540,2,1,64,0,0,1,0
    ];

    private static __ATN: antlr.ATN;
    public static get _ATN(): antlr.ATN {
        if (!PortugolLexer.__ATN) {
            PortugolLexer.__ATN = new antlr.ATNDeserializer().deserialize(PortugolLexer._serializedATN);
        }

        return PortugolLexer.__ATN;
    }


    private static readonly vocabulary = new antlr.Vocabulary(PortugolLexer.literalNames, PortugolLexer.symbolicNames, []);

    public override get vocabulary(): antlr.Vocabulary {
        return PortugolLexer.vocabulary;
    }

    private static readonly decisionsToDFA = PortugolLexer._ATN.decisionToState.map( (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index) );
}