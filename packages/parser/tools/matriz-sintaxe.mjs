//
// Uma grade de erros de sintaxe: cada engano de um estudante (um operando faltando, um `(` sem
// fechar, um `=` no lugar de `==`...) escrito em cada lugar do programa onde ele cabe (numa
// atribuição, na condição de um `se`, num índice, no cabeçalho de um `para`...). O mesmo engano
// deveria ter a mesma mensagem em todos os lugares.
//
// Usada por `tests/corpus/matriz-sintaxe.test.ts`, que compara o erro de cada caso com
// `tests/fixtures/matriz-sintaxe.txt`.
//

const DECLARAÇÕES = `    inteiro a = 1, b = 2, i = 0\n    inteiro v[3] = {1, 2, 3}\n    inteiro m[2][2] = {{1, 2}, {3, 4}}`;
/**
 * Um programa completo, com variáveis e uma função auxiliar para os enganos usarem.
 *
 * @param {string} globais
 * @param {string} corpo
 * @param {string} [extras]
 */
const montar = (globais, corpo, extras = "") =>
  `programa {\n  inclua biblioteca Util\n${globais}  funcao inicio() {\n${DECLARAÇÕES}\n${corpo}\n  }\n  funcao inteiro f2(inteiro x, inteiro y) {\n    retorne x + y\n  }\n${extras}}\n`;

// Lugares onde cabe um comando: `<<S>>` é trocado pelo engano.
const LUGARES_DE_COMANDO = {
  func: montar("", "    <<S>>\n    escreva(a)"),
  funcFim: montar("", "    escreva(a)\n    <<S>>"),
  aninhado: montar(
    "",
    "    enquanto (a < 3) {\n      se (a > 0) {\n        para (i = 0; i < 2; i++) {\n          <<S>>\n          escreva(a)\n        }\n      }\n    }",
  ),
  senaoSe: montar("", "    se (a > 0) {\n    } senao se (a < 0) {\n      <<S>>\n      escreva(a)\n    }"),
  caso: montar("", "    escolha (a) {\n      caso 1:\n        <<S>>\n        escreva(a)\n        pare\n    }"),
  contrario: montar("", "    escolha (a) {\n      caso contrario:\n        <<S>>\n        escreva(a)\n    }"),
  funcRet: montar(
    "",
    "    escreva(a)",
    "  funcao inteiro f3(inteiro &r, real w[], inteiro z[][]) {\n    <<S>>\n    retorne 1\n  }\n",
  ),
  globalTopo: montar("  <<S>>\n", "    escreva(a)"),
  globalEntre: montar("", "    escreva(a)", "  <<S>>\n  funcao f4() {\n  }\n"),
  globalFim: montar("", "    escreva(a)", "  <<S>>\n"),
};

// Lugares onde cabe uma expressão: `<<E>>` é trocado pelo engano.
const LUGARES_DE_EXPRESSÃO = {
  atrib: montar("", "    a = <<E>>\n    escreva(a)"),
  decl: montar("", "    inteiro c = <<E>>\n    escreva(a)"),
  declMulti: montar("", "    inteiro c = 1, d = <<E>>\n    escreva(a)"),
  declGlobal: montar("  inteiro g = <<E>>\n", "    escreva(a)"),
  const: montar("  const inteiro K = <<E>>\n", "    escreva(a)"),
  retorne: montar("", "    escreva(a)", "  funcao inteiro f3() {\n    retorne <<E>>\n  }\n"),
  escreva: montar("", "    escreva(<<E>>)\n    escreva(a)"),
  escreva2: montar("", "    escreva(1, <<E>>)\n    escreva(a)"),
  chamada: montar("", "    a = f2(<<E>>, 1)\n    escreva(a)"),
  lib: montar("", "    a = Util.sorteia(<<E>>, 5)\n    escreva(a)"),
  se: montar("", "    se (<<E>>) {\n      escreva(a)\n    }"),
  senaoSe: montar("", "    se (a > 0) {\n    } senao se (<<E>>) {\n      escreva(a)\n    }"),
  enquanto: montar("", "    enquanto (<<E>>) {\n      escreva(a)\n    }"),
  facaEnq: montar("", "    faca {\n      escreva(a)\n    } enquanto (<<E>>)\n    escreva(a)"),
  paraInit: montar("", "    para (i = <<E>>; i < 3; i++) {\n      escreva(a)\n    }"),
  paraDecl: montar("", "    para (inteiro j = <<E>>; j < 3; j++) {\n      escreva(a)\n    }"),
  paraCond: montar("", "    para (i = 0; <<E>>; i++) {\n      escreva(a)\n    }"),
  paraInc: montar("", "    para (i = 0; i < 3; i = <<E>>) {\n      escreva(a)\n    }"),
  escolha: montar("", "    escolha (<<E>>) {\n      caso 1:\n        pare\n    }"),
  caso: montar("", "    escolha (a) {\n      caso <<E>>:\n        pare\n    }"),
  indice: montar("", "    a = v[<<E>>]\n    escreva(a)"),
  indice2: montar("", "    a = m[0][<<E>>]\n    escreva(a)"),
  indiceEsq: montar("", "    v[<<E>>] = 1\n    escreva(a)"),
  vetInit: montar("", "    inteiro w[] = {<<E>>, 2}\n    escreva(a)"),
  vetInitFim: montar("", "    inteiro w[] = {1, <<E>>}\n    escreva(a)"),
  matInit: montar("", "    inteiro n[][] = {{1, <<E>>}, {3, 4}}\n    escreva(a)"),
  parens: montar("", "    a = (<<E>>) * 2\n    escreva(a)"),
};

const EXPRESSÕES_ERRADAS = {
  opFalta: "a b",
  opFaltaNum: "1 2",
  atribCond: "a = 1",
  incLit: "++1",
  opFinal: "a +",
  parenAberto: "(a + 1",
  parenSobra: "a + 1)",
  colAberto: "v[1",
  colSobra: "v[1]]",
  cadeiaAberta: '"abc',
  charAberto: "'a",
  pontoSolto: "a.",
  realVirgula: "2,5",
  vazio: "",
  eC: "a && b",
  ouC: "a || b",
  naoC: "!a",
  menorIgualInv: "a =< b",
  diferenteC: "a <> b",
  igualTriplo: "a === b",
  metodo: "a.b(1)",
  potencia: "a ** 2",
  eFinal: "verdadeiro e",
  ternario: "a > 1 ? 1 : 2",
  chamadaSemFechar: "f2(1, 2",
  virgulaDupla: "f2(1,, 2)",
  igualIgual: "a == = 1",
};

const COMANDOS_ERRADOS = {
  if: "if (a > 1) { escreva(a) }",
  while: "while (a < 1) { }",
  for: "for (i = 0; i < 3; i++) { }",
  intDecl: "int x;",
  plusEq: "a += 1;",
  iPlusPlus: "i++;",
  printf: 'printf("a");',
  funcaoDentro: "funcao g() { }",
  programaDentro: "programa { }",
  incluaDentro: "inclua biblioteca Matematica",
  casoFora: "caso 1:",
  contrarioFora: "caso contrario:",
  contrarioSo: "contrario:",
  senaoAposEnq: "enquanto (a < 0) { } senao { }",
  chaveAbre: "{",
  chaveFecha: "}",
  atribLiteral: "1 = a",
  atribExpr: "a + 1 = 2",
  escrevaPonto: "escreva.",
  metodo: "a.b(1)",
  colados: 'escreva("a")escreva("b")',
  doisNomes: "a b",
  declDoisNomes: "inteiro c d",
  tipoDuplo: "inteiro real c",
  casoSemDoisPontos: "escolha (a) { caso 1 escreva(1) }",
  pascal: "a := 1",
  visualg: "a <- 1",
  seEntao: "se a > 1 entao escreva(a) fimse",
  escrevaSemParen: 'escreva "a"',
  leiaSemParen: "leia a",
  javaArray: "inteiro[] w = {1}",
  vetInitSemFechar: "inteiro w[] = {1, 2",
  matSemVirgula: "inteiro n[2][2] = {{1, 2} {3, 4}}",
  matSemFechar: "inteiro n[2][2] = {{1, 2}, {3, 4}",
  vetTamAberto: "inteiro w[3 = {1, 2, 3}",
  String: 'String s = "a"',
  cadeiaAbertaCmd: 'escreva("abc)',
  pare: "pare",
  constSemValor: "const inteiro K",
  declVirgulaFinal: "inteiro c = 1,",
  declVirgulaDupla: "inteiro c, , d",
  facaSemEnquanto: "faca { }",
  enquantoSemParen: "enquanto a < 3 { }",
  paraSemParen: "para i = 0; i < 3; i++ { }",
  paraVirgulas: "para (i = 0, i < 3, i++) { }",
  paraDoisPartes: "para (i = 0; i < 3) { }",
  paraDoisPontoVirgula: "para (;;) { }",
  escolhaSemParen: "escolha a { caso 1: pare }",
  senaoSeSemParen: "se (a > 0) { } senao se a < 0 { }",
  seVazio: "se () { }",
  else: "se (a > 0) { } else { }",
  elseIf: "se (a > 0) { } else if (a < 0) { }",
  seSemCorpo: "se (a > 0)",
  incLit: "++1",
  litInc: "1++",
  ptvDuplo: "escreva(a);;",
  atribDecl: "inteiro c == 2",
  vetIdx: "v[0 = 1",
  matIdx: "m[0][1 = 2",
  vetIdxSobra: "v[0]] = 1",
  retorneFora: "retorne",
  enquantoSemCorpo: "enquanto (a < 0)",
  escrevaPontoVirgulaDentro: "escreva(a; b)",
  escolhaSemCaso: "escolha (a) { escreva(a) }",
  casoDuplo: "escolha (a) { caso 1: caso 2: pare }",
  casoVirgula: "escolha (a) { caso 1, 2: pare }",
};

const COMANDOS_ERRADOS_2 = {
  senaoComCond: "se (a > 1) { escreva(1) } senao (a < 1) { escreva(2) }",
  senaoComCondLinhas: "se (a > 1) {\n      escreva(1)\n    } senao (a < 1) {\n      escreva(2)\n    }",
  seEntaoChave: "se (a > 1) entao { escreva(1) }",
  senaose: "se (a > 1) { } senaose (a < 1) { }",
  senaoAcento: "se (a > 1) { } senão { }",
  naoAcento: "se (não (a > 1)) { }",
  entaoAcento: "se (a > 1) então { }",
  seVirgula: "se (a > 1;) { }",
  sePtv: "se (a > 1); { escreva(1) }",
  enquantoPtv: "enquanto (a < 0); { }",
  paraPtv: "para (i = 0; i < 2; i++); { }",
  escrevaSoma: 'escreva("a" + )',
  escrevaVirg: "escreva(a,)",
  leiaAberto: "leia(a",
  leiaVazio: "a = leia()",
  realPonto: "real x = 1.",
  realPontoIni: "real x = .5",
  casoSemDp2: "escolha (a) { caso 1: pare caso 2 pare }",
  contrarioSemDp: "escolha (a) { caso 1: pare caso contrario escreva(1) }",
  casoString: 'escolha (a) { caso "x": pare }',
  vetorSemTam: "inteiro w[]",
  vetorTamVar: "inteiro w[a]",
  matrizVirg: "inteiro n[2,2]",
  acessoVirg: "a = m[0,1]",
  seSemFecharCond: "se (a > 1 { escreva(1) }",
  enquantoSemFecharCond: "enquanto (a > 1 { escreva(1) }",
  paraSemFecharCond: "para (i = 0; i < 2; i++ { escreva(1) }",
  escolhaSemFechar: "escolha (a { caso 1: pare }",
  chamadaSemFecharBloco: "se (a > 1) { escreva(a }",
  funcaoAcento: "função",
  menorMaior: "se (1 < a < 3) { }",
  eMinusculo: "se (a > 1 and a < 3) { }",
  igualSo: "se (a = = 1) { }",
  atribDupla: "a == 1",
  incrementoEsp: "i + + ",
  retorneValor: "retorne 1 2",
  chaveExtraBloco: "se (a > 1) { { escreva(1) } }",
  doisPontosFora: "a = 1:",
  cadeiaSimples: "cadeia s = 'texto'",
};

const FUNÇÕES_ERRADAS = {
  semTipo: "funcao f(x) { }",
  semNomeParam: "funcao f(inteiro) { }",
  virgulaFinal: "funcao f(inteiro x,) { }",
  semVirgula: "funcao f(inteiro x inteiro y) { }",
  tipoCompartilhado: "funcao f(inteiro x, y) { }",
  vetAberto: "funcao f(inteiro x[) { }",
  vetSobra: "funcao f(inteiro x[]]) { }",
  matAberto: "funcao f(inteiro x[][) { }",
  refAntes: "funcao f(&inteiro x) { }",
  padrao: "funcao f(inteiro x = 1) { }",
  pontoVirgula: "funcao f(inteiro x; inteiro y) { }",
  semParens: "funcao f { }",
  parenAberto: "funcao f( { }",
  parenSobra: "funcao f()) { }",
  semNome: "funcao (inteiro x) { }",
  tipoSemNome: "funcao inteiro() { }",
  semChave: "funcao f()\n    escreva(1)\n  }",
  semFechar: "funcao f() {\n    escreva(1)",
  retornoVetor: "funcao inteiro[] f() { }",
  vazioParam: "funcao f(vazio) { }",
  void: "void f() { }",
  semFuncao: "inteiro f() { }",
  nomeReservado: "funcao se() { }",
  funcaoDupla: "funcao funcao f() { }",
  tipoDepois: "funcao f() inteiro { }",
  javaVetParam: "funcao f(inteiro[] x) { }",
  cadeiaAbertaNome: 'funcao f() { escreva("a) }',
};

const LUGARES_DE_FUNÇÃO = {
  antes: montar("  <<H>>\n", "    escreva(a)"),
  depois: montar("", "    escreva(a)", "  <<H>>\n  funcao f4() {\n  }\n"),
  ultimo: montar("", "    escreva(a)", "  <<H>>\n"),
};

const INCLUSÕES_ERRADAS = {
  incompleto: "inclua biblioteca",
  semBiblioteca: "inclua Util",
  pontoVirgula: "inclua biblioteca Matematica;",
  aliasVazio: "inclua biblioteca Matematica -->",
  aliasNum: "inclua biblioteca Matematica --> 1",
  aliasSeta: "inclua biblioteca Matematica -> m",
  import: "import Matematica",
  include: "#include <stdio.h>",
  dupla: "inclua biblioteca Matematica, Texto",
  aspas: 'inclua biblioteca "Matematica"',
};

const LUGARES_DE_INCLUSÃO = {
  topo: "programa {\n  <<I>>\n  funcao inicio() {\n    escreva(1)\n  }\n}\n",
  aposInclua: "programa {\n  inclua biblioteca Util\n  <<I>>\n  funcao inicio() {\n    escreva(1)\n  }\n}\n",
  aposGlobal: "programa {\n  inteiro g = 1\n  <<I>>\n  funcao inicio() {\n    escreva(1)\n  }\n}\n",
  aposFuncao: "programa {\n  funcao inicio() {\n    escreva(1)\n  }\n  <<I>>\n}\n",
};

// Enganos que envolvem o programa inteiro, e não cabem num lugar só.
const PROGRAMAS_INTEIROS = {
  semFecharFuncao: "programa {\n  funcao inicio() {\n    escreva(1)\n\n  funcao f() {\n    escreva(2)\n  }\n}\n",
  semFecharFuncaoUltima: "programa {\n  funcao inicio() {\n    escreva(1)\n  }\n  funcao f() {\n    escreva(2)\n\n}\n",
  semFecharSe:
    "programa {\n  funcao inicio() {\n    se (1 > 0) {\n      escreva(1)\n    escreva(2)\n  }\n  funcao f() {\n  }\n}\n",
  semFecharEnquantoUltimo: "programa {\n  funcao inicio() {\n    enquanto (1 > 0) {\n      escreva(1)\n  }\n}\n",
  programaDuplo: "programa {\n  funcao inicio() {\n  }\n}\nprograma {\n  funcao f() {\n  }\n}\n",
  chaveSobraFim: "programa {\n  funcao inicio() {\n  }\n}\n}\n",
  chaveSobraEntre: "programa {\n  funcao inicio() {\n  }\n  }\n  funcao f() {\n  }\n}\n",
  chaveSobraDentro: "programa {\n  funcao inicio() {\n    escreva(1)\n    }\n    escreva(2)\n  }\n}\n",
  semFecharPrograma: "programa {\n  funcao inicio() {\n  }\n",
  semAbrirPrograma: "programa\n  funcao inicio() {\n  }\n}\n",
  semAbrirFuncao: "programa {\n  funcao inicio()\n    escreva(1)\n  }\n}\n",
  semAbrirSe: "programa {\n  funcao inicio() {\n    se (1 > 0)\n      escreva(1)\n    }\n  }\n}\n",
  semAbrirEnquanto: "programa {\n  funcao inicio() {\n    enquanto (1 > 0)\n      escreva(1)\n    }\n  }\n}\n",
  semAbrirPara:
    "programa {\n  funcao inicio() {\n    inteiro i\n    para (i = 0; i < 2; i++)\n      escreva(1)\n    }\n  }\n}\n",
  semAbrirEscolha: "programa {\n  funcao inicio() {\n    escolha (1)\n      caso 1:\n        pare\n    }\n  }\n}\n",
  semAbrirFaca: "programa {\n  funcao inicio() {\n    faca\n      escreva(1)\n    } enquanto (1 > 0)\n  }\n}\n",
  semAbrirSenao: "programa {\n  funcao inicio() {\n    se (1 > 0) {\n    } senao\n      escreva(1)\n    }\n  }\n}\n",
  programaMinusculo: "Programa {\n  funcao inicio() {\n  }\n}\n",
  inicioMaiusculo: "programa {\n  Funcao inicio() {\n  }\n}\n",
  codigoAntes: "inteiro a = 1\nprograma {\n  funcao inicio() {\n  }\n}\n",
  incluaAntes: "inclua biblioteca Util\nprograma {\n  funcao inicio() {\n  }\n}\n",
  vazio: "",
  soComentario: "// oi\n",
  semInicio: "programa {\n}\n",
  cadeiaMultilinha: 'programa {\n  funcao inicio() {\n    escreva("abc\n    def")\n  }\n}\n',
  cadeiaAbertaUltima: 'programa {\n  funcao inicio() {\n    escreva("abc)\n  }\n}',
  charLongo: "programa {\n  funcao inicio() {\n    caracter c = 'ab'\n  }\n}\n",
  charVazio: "programa {\n  funcao inicio() {\n    caracter c = ''\n  }\n}\n",
  comentarioAberto: "programa {\n  funcao inicio() {\n    /* oi\n    escreva(1)\n  }\n}\n",
  escapeInvalido: 'programa {\n  funcao inicio() {\n    escreva("a\\qb")\n  }\n}\n',
};

/**
 * @typedef {{ nome: string; código: string }} Caso
 */

/**
 * Todos os casos da grade, numa ordem fixa: por engano, e dentro dele por lugar.
 *
 * @returns {Caso[]}
 */
export function gerarMatriz() {
  /**
   * @type {Caso[]}
   */
  const casos = [];

  /**
   * @param {string} prefixo
   * @param {Record<string, string>} enganos
   * @param {Record<string, string>} lugares
   * @param {string} marcador
   */
  const cruzar = (prefixo, enganos, lugares, marcador) => {
    for (const [engano, trecho] of Object.entries(enganos)) {
      for (const [lugar, programa] of Object.entries(lugares)) {
        casos.push({ nome: `${prefixo}.${engano}.${lugar}`, código: programa.replace(marcador, trecho) });
      }
    }
  };

  cruzar("comando", { ...COMANDOS_ERRADOS, ...COMANDOS_ERRADOS_2 }, LUGARES_DE_COMANDO, "<<S>>");
  cruzar("expressao", EXPRESSÕES_ERRADAS, LUGARES_DE_EXPRESSÃO, "<<E>>");
  cruzar("funcao", FUNÇÕES_ERRADAS, LUGARES_DE_FUNÇÃO, "<<H>>");
  cruzar("inclusao", INCLUSÕES_ERRADAS, LUGARES_DE_INCLUSÃO, "<<I>>");

  for (const [nome, código] of Object.entries(PROGRAMAS_INTEIROS)) {
    casos.push({ nome: `programa.${nome}`, código });
  }

  // Sem engano nenhum: não pode haver erro.
  casos.push(
    { nome: "certo.comando", código: LUGARES_DE_COMANDO.func.replace("<<S>>", "escreva(1)") },
    { nome: "certo.expressao", código: LUGARES_DE_EXPRESSÃO.atrib.replace("<<E>>", "1") },
  );

  return casos;
}
