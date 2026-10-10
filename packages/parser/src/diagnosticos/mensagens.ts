import { type PortugolCodeDiagnostic, PortugolDiagnosticSeverity } from "@portugol-webstudio/antlr";

import type { ClasseSímbolo, Símbolo } from "../analise/Símbolo.js";
import { BIBLIOTECAS_IMPLEMENTADAS } from "../bibliotecas/suporte.js";
import { descreverTipo, TipoOperando, TipoPrimitivo } from "../analise/TipoDado.js";
import {
  código,
  CÓDIGOS,
  SUFIXO_BLOCO_INVALIDO_REFERENCIA,
  SUFIXO_CLASSE_SIMBOLO,
  SUFIXO_FORMA_REFERENCIA,
  SUFIXO_NAO_DECLARADO,
  SUFIXO_TIPOS_INCOMPATIVEIS,
} from "./codigos.js";
import { aviso, diagnósticoEntre, erro, informação, Origem, textoDe } from "./posição.js";

const INCOMPATÍVEIS = "Tipos incompatíveis! ";

const CLASSE_INDEFINIDA: Readonly<Record<ClasseSímbolo, string>> = {
  função: "uma função",
  matriz: "uma matriz",
  variável: "uma variável",
  vetor: "um vetor",
};

const CLASSE_DEFINIDA: Readonly<Record<ClasseSímbolo, string>> = {
  função: "A função",
  matriz: "A matriz",
  variável: "A variável",
  vetor: "O vetor",
};

/**
 * Gênero de cada classe, para concordância nos particípios ("declarado" × "declarada").
 */
const MASCULINO: Readonly<Record<ClasseSímbolo, boolean>> = {
  função: false,
  matriz: false,
  variável: false,
  vetor: true,
};

function listarEmPortuguês(itens: readonly string[]): string {
  return itens.length < 2 ? (itens[0] ?? "") : `${itens.slice(0, -1).join(", ")} e ${itens.at(-1)}`;
}

function tiposIncompatíveis(origem: Origem, sufixo: string, mensagem: string): PortugolCodeDiagnostic {
  return erro(origem, INCOMPATÍVEIS + mensagem, código(CÓDIGOS.TIPOS_INCOMPATIVEIS, sufixo));
}

// ---------------------------------------------------------------------------------------
// Estrutura do programa
// ---------------------------------------------------------------------------------------

export function erroFunçãoInícioInexistente(origem: Origem): PortugolCodeDiagnostic {
  return erro(
    origem,
    'A função "inicio" não existe no seu código. Ela é necessária pois será a primeira a ser chamada na execução do código',
    CÓDIGOS.FUNCAO_INICIO_INEXISTENTE,
  );
}

export function erroFunçãoReservada(origem: Origem, nome: string): PortugolCodeDiagnostic {
  return erro(origem, `A função ${nome} é reservada para a linguagem`, CÓDIGOS.FUNCAO_RESERVADA);
}

export function erroFunçãoSemRetorne(origem: Origem, nome: string): PortugolCodeDiagnostic {
  return erro(
    origem,
    `A função "${nome}" possui situações que não retornam nenhum valor. Verifique se todos os desvios condicionais, laços de repetição e casos do comando "escolha" possuem o comando "retorne". Você também pode incluir o comando "retorne" no final da função`,
    CÓDIGOS.FUNCAO_SEM_RETORNE,
  );
}

/**
 * `ErroBlocoInvalido`: a variante vem da classe do nó, não do tipo resolvido — expressões
 * lógicas (comparações, `e`/`ou`, `verdadeiro`/`falso`) ganham `.1`, todo o resto `.2`.
 */
export function erroBlocoInválido(
  origem: Origem,
  forma: { tipo: "expressão" } | { tipo: "lógica"; referênciaEsquerda?: { forma: FormaReferência; nome: string } },
): PortugolCodeDiagnostic {
  if (forma.tipo === "expressão") {
    return erro(
      origem,
      "Esta expressão não faz sentido se estiver sozinha no código. Você pode atribuir a expressão a uma variável, vetor, matriz ou passá-la como parâmetro em uma chamada de função",
      código(CÓDIGOS.BLOCO_INVALIDO, "2"),
    );
  }

  let mensagem =
    "Esta expressão lógica não faz sentido se estiver sozinha no código. Você pode utilizar a expressão como condição em um dos seguintes comandos: 'se', 'enquanto', 'faca-enquanto'";
  const sufixos = ["1"];
  const referência = forma.referênciaEsquerda;

  // O Java só acrescenta a dica quando o operando esquerdo é referência a variável, vetor ou matriz.
  if (referência && referência.forma !== "função") {
    const alvos = { matriz: "à matriz", variável: "à variável", vetor: "ao vetor" };

    mensagem += `. Se você estiver tentando atribuir um valor ou expressão ${alvos[referência.forma]} "${referência.nome}", utilize o operador '=' ao invés do operador '=='`;
    sufixos.push(SUFIXO_BLOCO_INVALIDO_REFERENCIA[referência.forma]);
  }

  return erro(origem, mensagem, código(CÓDIGOS.BLOCO_INVALIDO, ...sufixos));
}

// ---------------------------------------------------------------------------------------
// Símbolos
// ---------------------------------------------------------------------------------------

/**
 * A forma como um nome foi *usado*, e não a classe com que foi declarado.
 */
export type FormaReferência = ClasseSímbolo;

export function erroSímboloNãoDeclarado(
  origem: Origem,
  nome: string,
  forma: FormaReferência,
  biblioteca?: string,
): PortugolCodeDiagnostic {
  // O ramo de biblioteca do Java não acrescenta o sufixo de variante ao código, e cita o
  // escopo como o usuário escreveu (o alias, quando há um).
  if (biblioteca !== undefined && forma === "função") {
    return erro(origem, `A função "${nome}" não existe na biblioteca "${biblioteca}"`, CÓDIGOS.SIMBOLO_NAO_DECLARADO);
  }

  const mensagens: Readonly<Record<FormaReferência, string>> = {
    função: `A função "${nome}" não foi declarada no programa`,
    matriz: `A matriz "${nome}" não foi declarada neste escopo.`,
    variável: `A variável "${nome}" não foi declarada neste escopo.`,
    vetor: `O vetor "${nome}" não foi declarado neste escopo.`,
  };

  return erro(origem, mensagens[forma], código(CÓDIGOS.SIMBOLO_NAO_DECLARADO, SUFIXO_NAO_DECLARADO[forma]));
}

export function erroSímboloRedeclarado(origem: Origem, nome: string, existente: Símbolo): PortugolCodeDiagnostic {
  let mensagem = `O símbolo "${nome}" já foi declarado como ${CLASSE_INDEFINIDA[existente.classe]}`;

  // Funções reservadas da linguagem não têm token de nome, e aí o Java omite a posição.
  if (existente.nomeToken) {
    mensagem += ` na linha: ${existente.nomeToken.line}, coluna: ${existente.nomeToken.column}.`;
  }

  return erro(origem, mensagem, código(CÓDIGOS.SIMBOLO_REDECLARADO, SUFIXO_CLASSE_SIMBOLO[existente.classe]));
}

export function erroParâmetroRedeclarado(origem: Origem, nome: string, função: string): PortugolCodeDiagnostic {
  return erro(origem, `O parâmetro "${nome}" já foi declarado na função "${função}".`, CÓDIGOS.PARAMETRO_REDECLARADO);
}

export function avisoSímboloGlobalOcultado(
  origem: Origem,
  nome: string,
  classeLocal: ClasseSímbolo,
  classeGlobal: ClasseSímbolo,
): PortugolCodeDiagnostic {
  return aviso(
    origem,
    `${CLASSE_DEFINIDA[classeLocal]} "${nome}" está ocultando ${CLASSE_INDEFINIDA[classeGlobal]} do escopo global.`,
    CÓDIGOS.SIMBOLO_GLOBAL_OCULTADO,
  );
}

/**
 * O Portugol Studio sorteia o valor do exemplo (`GeradorDeExemplosDeInicializacao`), o que
 * tornaria a mensagem não determinística.
 */
const VALOR_DE_EXEMPLO: Readonly<Record<TipoPrimitivo, string>> = {
  [TipoPrimitivo.CADEIA]: '"texto"',
  [TipoPrimitivo.CARACTER]: "'a'",
  [TipoPrimitivo.INTEIRO]: "0",
  [TipoPrimitivo.LÓGICO]: "verdadeiro",
  [TipoPrimitivo.REAL]: "0.0",
  [TipoPrimitivo.VAZIO]: "0",
};

function exemploDeInicialização(símbolo: Símbolo): string {
  const valor = VALOR_DE_EXEMPLO[símbolo.tipo];

  switch (símbolo.classe) {
    case "vetor": {
      return `${símbolo.tipo} ${símbolo.nome}[4] = {${Array.from({ length: 4 }, () => valor).join(", ")}}`;
    }

    case "matriz": {
      const linha = `{${Array.from({ length: 3 }, () => valor).join(", ")}}`;

      return `${símbolo.tipo} ${símbolo.nome}[3][3] = {${Array.from({ length: 3 }, () => linha).join(", ")}}`;
    }

    default: {
      return `${símbolo.tipo} ${símbolo.nome} = ${valor}`;
    }
  }
}

export function erroSímboloNãoInicializado(origem: Origem, símbolo: Símbolo): PortugolCodeDiagnostic {
  const exemplo = exemploDeInicialização(símbolo);
  const tipo = símbolo.tipo;
  let mensagem: string;

  switch (símbolo.classe) {
    case "vetor": {
      mensagem =
        `O vetor "${símbolo.nome}" não foi inicializado. Você deve inicializar o vetor antes de poder utilizá-lo no programa. ` +
        `Você pode inicializar o vetor atribuindo valores do tipo "${tipo}". Exemplo: ${exemplo}. ` +
        `Você também pode usar a função "leia" para ler valores digitados pelo usuário. Exemplo: leia(${símbolo.nome}[0])`;
      break;
    }

    case "matriz": {
      mensagem =
        `A matriz "${símbolo.nome}" não foi inicializada. Você deve inicializar a matriz antes de poder utilizá-la no programa. ` +
        `Você pode inicializar a matriz atribuindo valores do tipo "${tipo}". Exemplo: ${exemplo}. ` +
        `Você também pode usar a função "leia" para ler valores digitados pelo usuário. Exemplo: leia(${símbolo.nome}[0][0])`;
      break;
    }

    default: {
      mensagem =
        `A variável "${símbolo.nome}" não foi inicializada. Você deve inicializar a variável antes de poder utilizá-la no programa. ` +
        `Você pode inicializar a variável atribuindo um valor do tipo "${tipo}". Exemplo: ${exemplo}. ` +
        `Você também pode usar a função "leia" para ler um valor digitado pelo usuário. Exemplo: leia(${símbolo.nome})`;
      break;
    }
  }

  return erro(origem, mensagem, código(CÓDIGOS.SIMBOLO_NAO_INICIALIZADO, SUFIXO_CLASSE_SIMBOLO[símbolo.classe]));
}

export function erroReferênciaInválida(
  origem: Origem,
  símbolo: Símbolo,
  forma: FormaReferência,
): PortugolCodeDiagnostic {
  const utilizado = MASCULINO[símbolo.classe] ? "utilizado" : "utilizada";

  return erro(
    origem,
    `${CLASSE_DEFINIDA[símbolo.classe]} '${símbolo.nome}' está sendo ${utilizado} como ${CLASSE_INDEFINIDA[forma]}`,
    código(CÓDIGOS.REFERENCIA_INVALIDA, SUFIXO_CLASSE_SIMBOLO[símbolo.classe], SUFIXO_FORMA_REFERENCIA[forma]),
  );
}

// ---------------------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------------------

export function erroAtribuirEmConstante(origem: Origem, símbolo: Símbolo): PortugolCodeDiagnostic {
  const mensagens: Readonly<Record<ClasseSímbolo, string>> = {
    função: `"${símbolo.nome}" é uma constante, e portanto, não pode ter seu valor alterado após a inicialização`,
    matriz: `A matriz "${símbolo.nome}" é constante e, portanto, não pode ter seu valor alterado após a inicialização`,
    variável: `"${símbolo.nome}" é uma constante, e portanto, não pode ter seu valor alterado após a inicialização`,
    vetor: `O vetor "${símbolo.nome}" é constante e, portanto, não pode ter seus valores alterados após a inicialização`,
  };

  return erro(
    origem,
    mensagens[símbolo.classe],
    código(CÓDIGOS.ATRIBUIR_EM_CONSTANTE, SUFIXO_CLASSE_SIMBOLO[símbolo.classe]),
  );
}

export function erroInicializaçãoConstante(
  origem: Origem,
  nome: string,
  posição?: { índice: number } | { coluna: number; linha: number },
): PortugolCodeDiagnostic {
  if (!posição) {
    return erro(
      origem,
      `A constante "${nome}" deve ser inicializada com um valor ao invés de uma expressão`,
      código(CÓDIGOS.INICIALIZACAO_CONSTANTE, "1"),
    );
  }

  if ("índice" in posição) {
    return erro(
      origem,
      `O elemento no índice [${posição.índice}] do vetor constante "${nome}" deve ser inicializado com um valor ao invés de uma expressão`,
      código(CÓDIGOS.INICIALIZACAO_CONSTANTE, "2"),
    );
  }

  return erro(
    origem,
    `O elemento na posição [${posição.linha}][${posição.coluna}] da matriz constante "${nome}" deve ser inicializado com um valor ao invés de uma expressão`,
    código(CÓDIGOS.INICIALIZACAO_CONSTANTE, "3"),
  );
}

// ---------------------------------------------------------------------------------------
// Atribuições e comandos
// ---------------------------------------------------------------------------------------

/**
 * O Java tem uma terceira variante, para chamada de função (sufixo `2`), mas ela é
 * inalcançável: `f() = 1` cai antes em `ErroAtribuirEmChamadaFuncao`.
 */
export function erroAtribuirEmExpressão(origem: Origem, forma: "expressão" | "literal"): PortugolCodeDiagnostic {
  const alvos = { expressão: "uma expressão.", literal: "um valor literal." };
  const sufixos = { literal: "1", expressão: "3" };

  return erro(
    origem,
    `Não é possível realizar uma atribuição à ${alvos[forma]} Você só pode realizar atribuições à variáveis, vetores ou matrizes que não tenham sido declarados como constantes. Se você estiver tentando comparar a igualdade de duas expressões, utilize o operador '==' ao invés do operador '='`,
    código(CÓDIGOS.OPERACAO_COM_EXPRESSAO_CONSTANTE, sufixos[forma]),
  );
}

export function erroAtribuirEmChamadaFunção(origem: Origem): PortugolCodeDiagnostic {
  return erro(
    origem,
    "Não é possível atribuir uma expressão a uma chamada de função.",
    CÓDIGOS.ATRIBUIR_EM_CHAMADA_FUNCAO,
  );
}

export function erroParaSemExpressãoAtribuição(origem: Origem): PortugolCodeDiagnostic {
  return erro(
    origem,
    "O comando 'para' quando há uma atribuição utiliza uma das seguintes sintaxes: i=i+1 / i++ / i+=1",
    CÓDIGOS.PARA_SEM_EXPRESSAO_ATRIBUICAO,
  );
}

export function erroEscapeÚnico(origem: Origem): PortugolCodeDiagnostic {
  return erro(
    origem,
    "Variáveis do tipo cadeias e caracter com o símbolo '\\' devem utiliza-lo como: '\\\\'.\nIsso se deve ao símbolo '\\' ser utilizado em casos como '\\t' e '\\n' onde ele passa por uma reinterpretação do seu significado, se tornando uma tabulação e um pular linha respectivamente",
    CÓDIGOS.ESCAPE_UNICO,
  );
}

export function erroLinhaPuladaEmCadeia(origem: Origem): PortugolCodeDiagnostic {
  return erro(
    origem,
    "Você pulou uma linha ao escrever uma cadeia. Cadeias apenas podem ser escritas em uma mesma linha",
    CÓDIGOS.LINHA_PULADA_EM_STRING,
  );
}

export function erroPareForaDeLaço(origem: Origem): PortugolCodeDiagnostic {
  return erro(
    origem,
    "O comando 'pare' apenas pode ser utilizado dentro de laços (como para, enquanto e faca-enquanto) ou dentro de um escolha-caso",
    CÓDIGOS.PARE_FORA_DE_LACO,
  );
}

// ---------------------------------------------------------------------------------------
// ErroTiposIncompativeis
// ---------------------------------------------------------------------------------------

export function erroTiposAtribuição(
  origem: Origem,
  esquerdo: TipoOperando,
  direito: TipoOperando,
): PortugolCodeDiagnostic {
  return tiposIncompatíveis(
    origem,
    SUFIXO_TIPOS_INCOMPATIVEIS.ATRIBUICAO,
    `Não é possível atribuir uma expressão do tipo "${descreverTipo(direito)}" à uma expressão do tipo "${descreverTipo(esquerdo)}".`,
  );
}

/**
 * `bitwiseE`, `bitwiseOu` e `bitwiseXor` são divergência nossa: o Portugol Studio não tem
 * mensagem para eles e estoura `UnsupportedOperationException`.
 */
export type OperadorBinário =
  | "bitwiseE"
  | "bitwiseOu"
  | "bitwiseXor"
  | "diferença"
  | "divisão"
  | "eLógico"
  | "igualdade"
  | "maior"
  | "maiorIgual"
  | "menor"
  | "menorIgual"
  | "multiplicação"
  | "módulo"
  | "ouLógico"
  | "soma"
  | "subtração";

export function erroTiposOperaçãoBinária(
  origem: Origem,
  operador: OperadorBinário,
  esquerdo: TipoOperando,
  direito: TipoOperando,
): PortugolCodeDiagnostic {
  const e = descreverTipo(esquerdo);
  const d = descreverTipo(direito);
  const comparação = `Não é possível comparar uma expressão do tipo "${e}" com uma expressão do tipo "${d}".`;
  const s = SUFIXO_TIPOS_INCOMPATIVEIS;

  const variantes: Readonly<Record<OperadorBinário, { mensagem: string; sufixo: string }>> = {
    soma: {
      sufixo: s.SOMA,
      mensagem: `Não é possível somar uma expressão do tipo "${d}" à uma expressão do tipo "${e}".`,
    },
    subtração: {
      sufixo: s.SUBTRACAO,
      mensagem: `Não é possível subtrair uma expressão do tipo "${d}" de uma expressão do tipo "${e}".`,
    },
    multiplicação: {
      sufixo: s.MULTIPLICACAO,
      mensagem: `Não é possível multiplicar uma expressão do tipo "${e}" por uma expressão do tipo "${d}".`,
    },
    divisão: {
      sufixo: s.DIVISAO,
      mensagem: `Não é possível dividir uma expressão do tipo "${e}" por uma expressão do tipo "${d}".`,
    },
    módulo: {
      sufixo: s.MODULO,
      mensagem: `Não é possível obter o módulo entre uma expressão do tipo "${e}" e uma expressão do tipo "${d}".`,
    },
    igualdade: {
      sufixo: s.IGUALDADE,
      mensagem: `Não é possível comparar a igualdade entre uma expressão do tipo "${e}" e uma expressão do tipo "${d}".`,
    },
    diferença: {
      sufixo: s.DIFERENCA,
      mensagem: `Não é possível comparar a diferença entre uma expressão do tipo "${e}" e uma expressão do tipo "${d}".`,
    },
    maior: { sufixo: s.MAIOR, mensagem: comparação },
    maiorIgual: { sufixo: s.MAIOR_IGUAL, mensagem: comparação },
    menor: { sufixo: s.MENOR, mensagem: comparação },
    menorIgual: { sufixo: s.MENOR_IGUAL, mensagem: comparação },
    eLógico: {
      sufixo: s.E_LOGICO,
      mensagem: `Não é possível executar a operação lógica E entre uma expressão do tipo "${e}" e uma expressão do tipo "${d}".`,
    },
    ouLógico: {
      sufixo: s.OU_LOGICO,
      mensagem: `Não é possível executar a operação lógica OU entre uma expressão do tipo "${e}" e uma expressão do tipo "${d}".`,
    },
    bitwiseE: { sufixo: s.BITWISE_BINARIO, mensagem: mensagemBitwise("E", e, d) },
    bitwiseOu: { sufixo: s.BITWISE_BINARIO, mensagem: mensagemBitwise("OU", e, d) },
    bitwiseXor: { sufixo: s.BITWISE_BINARIO, mensagem: mensagemBitwise("XOR", e, d) },
  };

  const variante = variantes[operador];

  return tiposIncompatíveis(origem, variante.sufixo, variante.mensagem);
}

function mensagemBitwise(nome: string, esquerdo: string, direito: string): string {
  return `Não é possível executar a operação bit a bit ${nome} entre uma expressão do tipo "${esquerdo}" e uma expressão do tipo "${direito}". Ambos os operandos precisam ser do tipo "inteiro".`;
}

/**
 * O Portugol Studio reporta a posição do operando que não é inteiro, não a da operação.
 */
export function erroTiposDeslocamentoBits(
  origem: Origem,
  operador: "<<" | ">>",
  esquerdo: TipoOperando,
  direito: TipoOperando,
  textoEsquerdo: string,
): PortugolCodeDiagnostic {
  const partes: string[] = [];

  if (esquerdo !== TipoPrimitivo.INTEIRO) {
    partes.push("Não é possível deslocar os bits de um valor não inteiro.");
  }

  if (direito !== TipoPrimitivo.INTEIRO) {
    partes.push("É necessário um valor inteiro de bits a ser deslocado.");
  }

  const exemplo = esquerdo === TipoPrimitivo.INTEIRO ? textoEsquerdo : "variavel";

  partes.push(`Exemplo: ${exemplo} ${operador} 2`);

  return tiposIncompatíveis(origem, SUFIXO_TIPOS_INCOMPATIVEIS.SHIFT, partes.join(" "));
}

export function erroTiposMenosUnário(início: Origem, fim: Origem, tipo: TipoOperando): PortugolCodeDiagnostic {
  return diagnósticoEntre(
    início,
    fim,
    `${INCOMPATÍVEIS}A operação "menos unário" espera uma expressão do tipo "inteiro" ou "real" mas foi passada uma expressão do tipo "${descreverTipo(tipo)}".`,
    PortugolDiagnosticSeverity.Error,
    código(CÓDIGOS.TIPOS_INCOMPATIVEIS, SUFIXO_TIPOS_INCOMPATIVEIS.MENOS_UNARIO),
  );
}

export function erroTiposNegação(origem: Origem, tipo: TipoOperando): PortugolCodeDiagnostic {
  return tiposIncompatíveis(
    origem,
    SUFIXO_TIPOS_INCOMPATIVEIS.NEGACAO,
    `A operação de negação espera uma expressão do tipo "lógico" mas foi passada uma expressão do tipo "${descreverTipo(tipo)}".`,
  );
}

/**
 * Divergência nossa: para `~` com operando não inteiro o Portugol Studio estoura
 * `UnsupportedOperationException`.
 */
export function erroTiposNegaçãoBitwise(origem: Origem, tipo: TipoOperando): PortugolCodeDiagnostic {
  return tiposIncompatíveis(
    origem,
    SUFIXO_TIPOS_INCOMPATIVEIS.BITWISE_NEGACAO,
    `A operação de negação bit a bit espera uma expressão do tipo "inteiro" mas foi passada uma expressão do tipo "${descreverTipo(tipo)}".`,
  );
}

export function erroTiposEscolha(origem: Origem, tipo: TipoOperando): PortugolCodeDiagnostic {
  return tiposIncompatíveis(
    origem,
    SUFIXO_TIPOS_INCOMPATIVEIS.ESCOLHA,
    `O comando "escolha" espera uma expressão do tipo "inteiro" ou "caracter" mas foi passada uma expressão do tipo "${descreverTipo(tipo)}".`,
  );
}

/**
 * `esperados` tem um tipo quando o `escolha` é `inteiro` ou `caracter` (o `caso` precisa
 * bater com ele) e dois quando o próprio `escolha` já é inválido.
 */
export function erroTiposCaso(
  origem: Origem,
  tipo: TipoOperando,
  esperados: readonly TipoOperando[],
): PortugolCodeDiagnostic {
  const lista = esperados.map(t => `"${descreverTipo(t)}"`).join(" ou ");

  return tiposIncompatíveis(
    origem,
    SUFIXO_TIPOS_INCOMPATIVEIS.CASO,
    `A expressão esperada para esse caso deveria ser do tipo ${lista} mas foi passada uma expressão do tipo "${descreverTipo(tipo)}".`,
  );
}

export type ComandoCondicional = "enquanto" | "faca-enquanto" | "para" | "se";

export function erroTiposCondição(
  origem: Origem,
  comando: ComandoCondicional,
  tipo: TipoOperando,
): PortugolCodeDiagnostic {
  const s = SUFIXO_TIPOS_INCOMPATIVEIS;
  const variantes: Readonly<Record<ComandoCondicional, { início: string; sufixo: string }>> = {
    se: { sufixo: s.SE, início: 'O comando "se" espera' },
    enquanto: { sufixo: s.ENQUANTO, início: 'O comando "enquanto" espera' },
    "faca-enquanto": { sufixo: s.FACA_ENQUANTO, início: 'A condição do comando "faca enquanto" espera' },
    para: { sufixo: s.PARA, início: 'A expressão utilizada na condição do comando "para" espera' },
  };

  const variante = variantes[comando];

  return tiposIncompatíveis(
    origem,
    variante.sufixo,
    `${variante.início} uma expressão do tipo "lógico" mas foi passada uma expressão do tipo "${descreverTipo(tipo)}".`,
  );
}

export function erroTiposÍndiceVetor(origem: Origem, tipo: TipoOperando): PortugolCodeDiagnostic {
  return tiposIncompatíveis(
    origem,
    SUFIXO_TIPOS_INCOMPATIVEIS.INDICE_VETOR,
    `O índice do vetor deve ser uma expressão do tipo "inteiro" mas foi passada uma expressão do tipo "${descreverTipo(tipo)}".`,
  );
}

export function erroTiposÍndiceMatriz(
  origem: Origem,
  tipoLinha: TipoOperando,
  tipoColuna: TipoOperando,
): PortugolCodeDiagnostic {
  return tiposIncompatíveis(
    origem,
    SUFIXO_TIPOS_INCOMPATIVEIS.INDICE_MATRIZ,
    `A linha e coluna da matriz devem ser uma expressão do tipo "inteiro" e "inteiro" mas foi passada uma expressão do tipo "${descreverTipo(tipoLinha)}" e "${descreverTipo(tipoColuna)}".`,
  );
}

export function erroTiposRetorne(
  origem: Origem,
  função: string,
  tipoFunção: TipoOperando,
  tipoExpressão: TipoOperando,
): PortugolCodeDiagnostic {
  return tiposIncompatíveis(
    origem,
    SUFIXO_TIPOS_INCOMPATIVEIS.RETORNE,
    `O retorno da função "${função}" é do tipo "${descreverTipo(tipoFunção)}" mas foi retornada uma expressão do tipo "${descreverTipo(tipoExpressão)}".`,
  );
}

/**
 * Os três contextos vêm de `avisos/ConstrutorMensagem.java`.
 */
export function avisoValorSeráConvertido(
  origem: Origem,
  contexto:
    | { tipo: "atribuição"; literal?: "matriz" | "vetor" }
    | { tipo: "parâmetro"; função: string; parâmetro: string }
    | { tipo: "retorno"; função: string },
  de: TipoOperando,
  para: TipoOperando,
): PortugolCodeDiagnostic {
  const truncado = de === TipoPrimitivo.REAL && para === TipoPrimitivo.INTEIRO;
  const conversão = `de "${descreverTipo(de)}" para "${descreverTipo(para)}"`;
  let sujeito: string;
  let plural = false;

  switch (contexto.tipo) {
    case "parâmetro": {
      sujeito = `O valor da expressão passada para o parâmetro "${contexto.parâmetro}" da função "${contexto.função}"`;
      break;
    }

    case "retorno": {
      sujeito = `O valor da expressão retornada na função "${contexto.função}"`;
      break;
    }

    default: {
      if (contexto.literal) {
        // Plural e concordância como no Java, inclusive o "O valores".
        sujeito = `O valores ${contexto.literal === "vetor" ? "do vetor" : "da matriz"} à direita da atribuição`;
        plural = true;
      } else {
        // O "á" em vez de "à" é assim mesmo no Portugol Studio.
        sujeito = "O valor da expressão á direita da atribuição";
      }

      break;
    }
  }

  const mensagem = truncado
    ? `${sujeito} ${plural ? "serão truncados" : "será truncado"}`
    : `${sujeito} ${plural ? "serão automaticamente convertidos" : "será automaticamente convertido"} ${conversão}`;

  return aviso(origem, mensagem, CÓDIGOS.VALOR_EXPRESSAO_SERA_CONVERTIDO);
}

// ---------------------------------------------------------------------------------------
// Chamadas de função
// ---------------------------------------------------------------------------------------

/**
 * O `Integer.MAX_VALUE` do Java — `escreva` e `leia` aceitam qualquer número, menos zero.
 */
export const PARÂMETROS_ILIMITADOS = Infinity;

export function erroNúmeroParâmetrosFunção(
  origem: Origem,
  nome: string,
  esperados: number,
  passados: number,
): PortugolCodeDiagnostic {
  let mensagem = `A função "${nome}"`;

  if (esperados === 0) {
    mensagem += " não espera nenhum parâmetro, ";
  } else if (esperados === PARÂMETROS_ILIMITADOS) {
    mensagem += " espera ao menos um parâmetro, ";
  } else {
    mensagem += ` espera ${esperados} ${esperados === 1 ? "parâmetro" : "parâmetros"}, `;
  }

  if (passados === 0) {
    mensagem += "mas não foi passado nenhum parâmetro";
  } else {
    mensagem += passados === 1 ? "mas foi passado " : "mas foram passados ";

    if (esperados > passados) {
      mensagem += "apenas ";
    }

    mensagem += `${passados} ${passados === 1 ? "parâmetro." : "parâmetros."}`;
  }

  return erro(origem, mensagem, CÓDIGOS.NUMERO_PARAMETROS_FUNCAO);
}

export function erroParâmetroExcedente(origem: Origem, função: string): PortugolCodeDiagnostic {
  return erro(
    origem,
    `A expressão está sobrando na chamada da função "${função}", pois extrapola o número de parâmetros esperados`,
    CÓDIGOS.PARAMETRO_EXCEDENTE,
  );
}

export function erroTipoParâmetroIncompatível(
  origem: Origem,
  função: string,
  parâmetro: string,
  esperado: TipoOperando,
  passado: TipoOperando,
): PortugolCodeDiagnostic {
  return erro(
    origem,
    `${INCOMPATÍVEIS}O parâmetro "${parâmetro}" da função "${função}" espera uma expressão do tipo "${descreverTipo(esperado)}", mas foi passada uma expressão do tipo "${descreverTipo(passado)}"`,
    CÓDIGOS.TIPO_PARAMETRO_INCOMPATIVEL,
  );
}

/**
 * O Java troca a mensagem inteira neste caso, e só neste: `escreva(f())` com `f` do tipo
 * `vazio`. Quem decide é o chamador (a `escreva` **reservada**), e não o nome da função —
 * uma biblioteca poderia ter uma função homônima.
 */
export function erroEscreverFunçãoSemRetorno(origem: Origem): PortugolCodeDiagnostic {
  return erro(
    origem,
    'Você não pode passar uma função sem retorno para a função "escreva"',
    CÓDIGOS.TIPO_PARAMETRO_INCOMPATIVEL,
  );
}

export type QuantificadorParâmetro = "matriz" | "valor" | "vetor";

const DEFINIÇÃO_QUANTIFICADOR: Readonly<Record<QuantificadorParâmetro, { sufixo: string; texto: string }>> = {
  valor: { texto: "um valor", sufixo: "1" },
  vetor: { texto: "um vetor", sufixo: "2" },
  matriz: { texto: "uma matriz", sufixo: "3" },
};

export function erroQuantificadorParâmetroFunção(
  origem: Origem,
  função: string,
  parâmetro: string,
  esperado: QuantificadorParâmetro,
  passado: QuantificadorParâmetro,
): PortugolCodeDiagnostic {
  const e = DEFINIÇÃO_QUANTIFICADOR[esperado];
  const p = DEFINIÇÃO_QUANTIFICADOR[passado];

  return erro(
    origem,
    `O parâmetro "${parâmetro}" da função "${função}" espera ${e.texto}, mas foi passado ${p.texto}`,
    código(CÓDIGOS.QUANTIFICADOR_PARAMETRO_FUNCAO, e.sufixo, p.sufixo),
  );
}

/**
 * Quem escolhe a frase é o chamador — a `leia` **reservada** contra um parâmetro por
 * referência qualquer —, e não o nome da função: uma biblioteca poderia ter uma homônima.
 */
export function erroPassagemParâmetroInválida(
  origem: Origem,
  destino: { tipo: "leia"; posição: number } | { tipo: "referência"; função: string; parâmetro: string },
): PortugolCodeDiagnostic {
  const mensagem =
    destino.tipo === "leia"
      ? `Não é possível passar um valor literal, constante ou expressão para o parâmetro na posição "${destino.posição + 1}" da função "leia". Tente passar uma variável, vetor ou matriz que não tenha sido declarada como constante`
      : `Não é possível passar uma expressão constante para o parâmetro "${destino.parâmetro}" da função "${destino.função}", pois este parâmetro espera uma referência`;

  return erro(origem, mensagem, CÓDIGOS.PASSAGEM_PARAMETRO_INVALIDA);
}

// ---------------------------------------------------------------------------------------
// Vetores e matrizes
// ---------------------------------------------------------------------------------------

export type DimensãoDeclarada = "colunas" | "linhas" | "vetor";

/**
 * Cobre também `ErroExpressaoTamanhoVetorMatriz`: no Java os dois compartilham código e
 * texto, e só muda a variante que cita a variável que impediu o cálculo.
 */
export function erroTamanhoVetorMatriz(
  origem: Origem,
  nome: string,
  dimensão: DimensãoDeclarada,
  variávelCulpada?: string,
): PortugolCodeDiagnostic {
  const sufixo = dimensão === "vetor" ? "1" : "2";
  let mensagem: string;

  if (variávelCulpada === undefined) {
    mensagem =
      dimensão === "vetor"
        ? `O tamanho do vetor '${nome}' deve ser um valor ou uma constante do tipo inteiro e positivo \n Ex: vetor[3]`
        : `O número de ${dimensão} da matriz '${nome}' deve ser um valor ou uma constante do tipo inteiro e positivo \n Ex: matriz[5][4]`;
  } else {
    mensagem =
      dimensão === "vetor"
        ? `A variavel '${variávelCulpada}' do tamanho do vetor '${nome}' deve ser uma variavel ou valor constante do tipo inteiro e positivo \n Ex: \n const inteiro x = 3 \n vetor[x]`
        : `A variavel '${variávelCulpada}' no número de ${dimensão} da matriz '${nome}' deve ser um valor ou uma constante do tipo inteiro e positivo \n Ex: \n const inteiro x = 3 \n matriz[x][5]`;
  }

  return erro(origem, mensagem, código(CÓDIGOS.TAMANHO_VETOR_MATRIZ, sufixo));
}

export const TAMANHO_MÁXIMO = 16_777_216;

export function erroTamanhoMáximoVetor(origem: Origem, nome: string, tamanho: number): PortugolCodeDiagnostic {
  return erro(
    origem,
    `O vetor '${nome}' está sendo declarado com ${tamanho} posições, porém o tamanho máximo de um vetor é ${TAMANHO_MÁXIMO}. Informe um tamanho entre 1 e ${TAMANHO_MÁXIMO} para corrigir o problema`,
    CÓDIGOS.TAMANHO_MAXIMO_VETOR,
  );
}

export function erroTamanhoMáximoMatriz(
  origem: Origem,
  nome: string,
  linhas: number,
  colunas: number,
): PortugolCodeDiagnostic {
  return erro(
    origem,
    `A matriz '${nome}' está sendo declarada com ${linhas * colunas} posições (${linhas} x ${colunas}), porém o número máximo de posições é ${TAMANHO_MÁXIMO}. Informe tamanhos cujo produto seja menor ou igual a ${TAMANHO_MÁXIMO} para corrigir o problema`,
    CÓDIGOS.TAMANHO_MAXIMO_MATRIZ,
  );
}

function ajusteDeQuantidade(esperados: number, declarados: number, substantivo: "elemento" | "linha"): string {
  const plural = substantivo === "linha" ? "linhas" : "elementos";
  let texto = `${esperados} ${esperados > 1 ? plural : substantivo}`;
  let diferença = 0;

  if (declarados > esperados) {
    diferença = declarados - esperados;
    texto += ". Remova ";
  } else if (declarados < esperados) {
    diferença = esperados - declarados;
    texto += ". Insira mais ";
  }

  texto += `${diferença} ${diferença > 1 ? plural : substantivo} para corrigir o problema`;

  return texto;
}

export function erroQuantidadeElementosVetor(
  origem: Origem,
  nome: string,
  esperados: number,
  declarados: number,
): PortugolCodeDiagnostic {
  return erro(
    origem,
    `A inicialização do vetor "${nome}" deve possuir ${ajusteDeQuantidade(esperados, declarados, "elemento")}`,
    CÓDIGOS.QUANTIDADE_ELEMENTOS_INICIALIZACAO_VETOR,
  );
}

export function erroQuantidadeLinhasMatriz(
  origem: Origem,
  nome: string,
  esperadas: number,
  declaradas: number,
): PortugolCodeDiagnostic {
  return erro(
    origem,
    `A inicialização da matriz "${nome}" deve possuir ${ajusteDeQuantidade(esperadas, declaradas, "linha")}`,
    CÓDIGOS.QUANTIDADE_LINHAS_INICIALIZACAO_MATRIZ,
  );
}

export function erroQuantidadeElementosColunaMatriz(
  origem: Origem,
  nome: string,
  linha: number,
  esperados: number,
  declarados: number,
): PortugolCodeDiagnostic {
  return erro(
    origem,
    `A linha [${linha}] na inicialização da matriz "${nome}" deve possuir ${ajusteDeQuantidade(esperados, declarados, "elemento")}`,
    CÓDIGOS.QUANTIDADE_ELEMENTOS_COLUNA_INICIALIZACAO_MATRIZ,
  );
}

export function erroTipoDadoVetorLiteral(origem: Origem): PortugolCodeDiagnostic {
  return erro(
    origem,
    "A inicialização do vetor possui mais de um tipo de dado",
    CÓDIGOS.DEFINIR_TIPO_DADO_VETOR_LITERAL,
  );
}

export function erroTipoDadoMatrizLiteral(origem: Origem): PortugolCodeDiagnostic {
  return erro(
    origem,
    "A inicialização da matriz possui mais de um tipo de dado",
    CÓDIGOS.DEFINIR_TIPO_DADO_MATRIZ_LITERAL,
  );
}

export function avisoVetorPodeSerVariável(origem: Origem, nome: string, tamanho: number): PortugolCodeDiagnostic {
  return aviso(
    origem,
    `O Vetor ${nome} tem tamanho [${tamanho}] e pode ser substituido por uma variável`,
    CÓDIGOS.VETOR_PODE_SER_VARIAVEL,
  );
}

export function avisoMatrizPodeSerVariável(origem: Origem, nome: string, tamanho: number): PortugolCodeDiagnostic {
  return aviso(
    origem,
    `A matriz ${nome} tem tamanho [${tamanho}][${tamanho}] e pode ser substituida por uma variável`,
    CÓDIGOS.MATRIZ_PODE_SER_VARIAVEL,
  );
}

export function avisoMatrizPodeSerVetor(
  origem: Origem,
  nome: string,
  linhas: number,
  colunas: number,
): PortugolCodeDiagnostic {
  return aviso(
    origem,
    `A matriz ${nome} tem tamanho [${linhas}][${colunas}] e pode ser substituida por um vetor de tamanho [${Math.max(linhas, colunas)}]`,
    CÓDIGOS.MATRIZ_PODE_SER_VETOR,
  );
}

// ---------------------------------------------------------------------------------------
// Bibliotecas
// ---------------------------------------------------------------------------------------

/**
 * `ErroInclusaoBiblioteca` no Java só repassa a mensagem da exceção que o causou.
 */
export function erroInclusãoBiblioteca(
  origem: Origem,
  causa:
    | { tipo: "aliasEmUso"; alias: string; biblioteca: string }
    | { tipo: "inexistente"; nome: string }
    | { tipo: "jáIncluída"; nome: string }
    | { tipo: "nãoIncluída"; escopo: string },
): PortugolCodeDiagnostic {
  let mensagem: string;

  switch (causa.tipo) {
    case "inexistente": {
      mensagem = `Erro ao carregar a biblioteca "${causa.nome}": a biblioteca não foi encontrada`;
      break;
    }

    case "jáIncluída": {
      mensagem = `A biblioteca "${causa.nome}" já foi incluída`;
      break;
    }

    case "aliasEmUso": {
      mensagem = `O alias "${causa.alias}" já está sendo utilizado pela biblioteca "${causa.biblioteca}"`;
      break;
    }

    default: {
      // Aspas simples aqui e duplas em `erroBibliotecaNãoInserida`: é assim no Java.
      mensagem = `A biblioteca '${causa.escopo}' não foi incluída no programa`;
      break;
    }
  }

  return erro(origem, mensagem, CÓDIGOS.INCLUSAO_BIBLIOTECA);
}

export function erroBibliotecaNãoInserida(origem: Origem, escopo: string): PortugolCodeDiagnostic {
  return erro(origem, `A biblioteca "${escopo}" não foi incluída no programa`, CÓDIGOS.BIBLIOTECA_NAO_INSERIDA);
}

export function erroAliasInexistente(origem: Origem, alias: string): PortugolCodeDiagnostic {
  return erro(
    origem,
    `"${alias}." pode ser apenas utilizado ao se referir a uma biblioteca como alias, porém nenhuma biblioteca o utiliza como alias. \nPara utiliza-lo como alias, defina uma biblioteca para ele.\nExemplo: inclua biblioteca Graficos --> "${alias}"`,
    CÓDIGOS.ALIAS_INEXISTENTE,
  );
}

export function erroConstanteNãoEncontradaNaBiblioteca(
  origem: Origem,
  nome: string,
  biblioteca: string,
): PortugolCodeDiagnostic {
  return erro(
    origem,
    `A constante "${nome}" não existe na biblioteca "${biblioteca}"`,
    CÓDIGOS.CONSTANTE_NAO_ENCONTRADA_NA_BIBLIOTECA,
  );
}

export function erroAtribuirConstanteBiblioteca(
  origem: Origem,
  constante: string,
  biblioteca: string,
): PortugolCodeDiagnostic {
  return erro(
    origem,
    `"${constante}" é uma constante da biblioteca "${biblioteca}", e portanto, não pode ter seu valor alterado`,
    CÓDIGOS.ATRIBUIR_CONSTANTE_BIBLIOTECA,
  );
}

export function erroAtribuirFunçãoBiblioteca(origem: Origem, biblioteca: string): PortugolCodeDiagnostic {
  return erro(
    origem,
    `"${biblioteca}" é uma biblioteca e portanto não pode receber valores`,
    CÓDIGOS.ATRIBUIR_FUNCAO_BIBLIOTECA,
  );
}

// ---------------------------------------------------------------------------------------
// Sintaxe
// ---------------------------------------------------------------------------------------

/**
 * Para o Portugol Studio, o lugar de cada erro é o nome de uma regra da gramática
 * (`contextoAtual`); só estes viram nome de escopo, o resto cai em "comando".
 */
const ESCOPOS: Readonly<Record<string, readonly [sufixo: string, nome: string]>> = {
  arquivo: ["1", "do programa"],
  declaracaoFuncao: ["2", "da função"],
  inicializacaoArray: ["3", "do vetor"],
  inicializacaoMatriz: ["4", "da matriz"],
};

/**
 * `ErroExpressaoEsperada`: o comando que esperava a expressão é o contexto pai da regra.
 */
const COMANDOS_COM_EXPRESSÃO: ReadonlyMap<string, readonly [sufixo: string, mensagem: string]> = new Map([
  ["se", ["4", 'O comando "se" espera uma expressão do tipo lógico entre os parênteses']],
  ["enquanto", ["5", 'O comando "enquanto" espera uma expressão do tipo lógico entre os parênteses']],
  ["facaEnquanto", ["6", 'O comando "faca-enquanto" espera uma expressão do tipo lógico entre os parênteses']],
  ["escolha", ["7", 'O comando "escolha" espera um valor ou uma expressão']],
]);

const SÍMBOLO_FALTANDO: Readonly<Record<string, readonly [sufixo: string, nome: string]>> = {
  parametro: ["1", "O nome do parâmetro da função não foi informado"],
  declaracaoFuncao: ["2", "O nome da função não foi informado"],
};

/**
 * Os tipos primitivos que o `AnalisadorSintatico.getTipoToken` do Java reconhece. As outras
 * listas dele (palavras reservadas `PR_*` e operadores literais) nunca batem com os nomes
 * dos tokens da gramática, então todo o resto cai na variante genérica.
 */

/**
 * Sugere a letra sem o acento, quando ela existe: `ç` vira `c`, `ã` vira `a`.
 */
export function erroCaractereEmNome(origem: Origem, caractere: string): PortugolCodeDiagnostic {
  const base = caractere.normalize("NFD").charAt(0);
  const troca = /^[a-z]$/i.test(base) ? `: troque o '${caractere}' por '${base}'` : "";

  return erro(origem, `Nomes não podem ter acentos nem 'ç'${troca}`, CÓDIGOS.EXPRESSAO_INESPERADA);
}

/**
 * Quando a linha acabou sem fechar o que abriu, ou sem o nome que faltava: o erro fica no fim
 * dela, e não no começo da linha seguinte, onde o parser percebeu.
 */
export function erroFaltaNoFimDaLinha(origem: Origem, esperado: string): PortugolCodeDiagnostic {
  return erro(origem, `Era esperado ${esperado} no fim da linha`, CÓDIGOS.PARSING_NAO_TRATADO);
}

/**
 * Uma palavra da linguagem num lugar onde ela não cabe. `caso` e `contrario` (só dentro de um
 * `escolha`) e `inclua` (só no começo do programa) ganham a explicação de onde podem ficar.
 */
export function erroPalavraForaDoLugar(origem: Origem, palavra: string): PortugolCodeDiagnostic {
  const onde: Readonly<Record<string, string>> = {
    caso: ": ela só pode ser usada dentro de um 'escolha'",
    contrario: ": ela só pode ser usada dentro de um 'escolha', depois de 'caso'",
    inclua: ": ela só pode ser usada no começo do programa, antes das variáveis e funções",
  };

  return erro(
    origem,
    `A palavra '${palavra}' não era esperada neste local${onde[palavra] ?? ", remova-a para corrigir o problema"}`,
    CÓDIGOS.EXPRESSAO_INESPERADA,
  );
}

export function erroSenãoComCondição(origem: Origem): PortugolCodeDiagnostic {
  return erro(origem, "O 'senao' não recebe uma condição", CÓDIGOS.SENAO_COM_CONDICAO);
}

export function erroVírgulaEmColchetes(origem: Origem): PortugolCodeDiagnostic {
  return erro(origem, "As posições de uma matriz não são separadas por vírgula", CÓDIGOS.VIRGULA_EM_COLCHETES);
}

export function erroIgualEmComparação(origem: Origem): PortugolCodeDiagnostic {
  return erro(
    origem,
    "Um sinal de igual só, '=', guarda um valor numa variável, e não compara dois valores",
    CÓDIGOS.IGUAL_EM_COMPARACAO,
  );
}

export function erroOperadorInexistente(origem: Origem, escrito: string): PortugolCodeDiagnostic {
  return erro(origem, `O operador '${escrito}' não existe`, CÓDIGOS.OPERADOR_INEXISTENTE);
}

export function erroComparaçãoDeCadeias(origem: Origem, operador: string): PortugolCodeDiagnostic {
  return erro(origem, `Não é possível comparar cadeias com o operador '${operador}'`, CÓDIGOS.COMPARACAO_DE_CADEIAS);
}

export function erroComentárioSemFim(origem: Origem): PortugolCodeDiagnostic {
  return erro(
    origem,
    "O comentário não foi fechado corretamente. Insira os caracteres '*/' no fim do comentário para corrigir o problema",
    CÓDIGOS.COMENTARIO_SEM_FIM,
  );
}

export function erroExpressãoForaEscopoFunção(origem: Origem, token: string): PortugolCodeDiagnostic {
  return erro(
    origem,
    `A expressão '${token}' está fora de um escopo de função e nunca será chamada. Adicione ela a uma função ou remova-a.`,
    CÓDIGOS.EXPRESSAO_FORA_ESCOPO_FUNCAO,
  );
}

export function erroExpressãoInesperada(origem: Origem, token: string): PortugolCodeDiagnostic {
  return erro(
    origem,
    `A expressão '${token}' não era esperada neste local, remova a expressão para corrigir o problema`,
    CÓDIGOS.EXPRESSAO_INESPERADA,
  );
}

export function erroEscopo(origem: Origem, contexto: string): PortugolCodeDiagnostic {
  const [sufixo, nome] = ESCOPOS[contexto] ?? [
    "5",
    `do comando "${contexto.replace("facaEnquanto", "faca-enquanto")}"`,
  ];

  return erro(
    origem,
    `O escopo ${nome} não foi fechado corretamente. Insira o caracter '}' para corrigir o problema`,
    código(CÓDIGOS.ESCOPO, sufixo),
  );
}

export function erroExpressãoEsperada(
  origem: Origem,
  contextoPai: string,
  contextoAvô: string,
): PortugolCodeDiagnostic {
  let sufixo = "8";
  let mensagem = "Era esperada uma expressão";

  if (contextoAvô === "inicializacaoMatriz") {
    sufixo = "3";
    mensagem =
      "O elemento não foi informado na linha da matriz, insira um valor ou uma expressão para corrigir o problema";
  } else if (contextoPai === "inicializacaoArray") {
    sufixo = "2";
    mensagem = "O elemento do vetor não foi informado, insira um valor ou uma expressão para corrigir o problema";
  } else if (COMANDOS_COM_EXPRESSÃO.has(contextoPai)) {
    [sufixo, mensagem] = COMANDOS_COM_EXPRESSÃO.get(contextoPai)!;
  }

  return erro(origem, mensagem, código(CÓDIGOS.EXPRESSAO_ESPERADA, sufixo));
}

export function erroExpressãoIncompleta(origem: Origem): PortugolCodeDiagnostic {
  return erro(
    origem,
    "A expressão está incompleta. Verifique se ambos os operandos direito e esquerdo estão presentes.",
    CÓDIGOS.EXPRESSAO_INCOMPLETA,
  );
}

export function erroRealComVírgula(origem: Origem): PortugolCodeDiagnostic {
  return erro(
    origem,
    "A expressão foi formada utilizando vírgulas. Valores reais devem ser expressados utilizando pontos. ex: 2.75",
    CÓDIGOS.EXPRESSAO_INCOMPLETA,
  );
}

export function erroChaveDeVetorMatrizMalPosicionada(origem: Origem): PortugolCodeDiagnostic {
  return erro(
    origem,
    "O formato de Vetor/Matriz está errado. As chaves devem ser posicionadas no nome da variavel. \nex: inteiro a[] = {2, 3}",
    CÓDIGOS.EXPRESSAO_INCOMPLETA,
  );
}

/**
 * Com `palavraReservada`, o nome foi escrito, mas é uma palavra da linguagem: o Java dá a
 * mesma mensagem de quando não há nome nenhum.
 */
export function erroNomeSímboloEstáFaltando(
  origem: Origem,
  contexto: string,
  palavraReservada?: string,
): PortugolCodeDiagnostic {
  const [sufixo, mensagem] = SÍMBOLO_FALTANDO[contexto] ?? ["3", "O nome da variável não foi informado"];
  const motivo = palavraReservada
    ? `: '${palavraReservada}' é uma palavra reservada da linguagem e não pode ser usada como nome`
    : "";

  return erro(origem, mensagem + motivo, código(CÓDIGOS.NOME_SIMBOLO_ESTA_FALTANDO, sufixo));
}

export function erroSímboloFaltandoOuRealComVírgula(origem: Origem, contexto: string): PortugolCodeDiagnostic {
  const [sufixo, nome] = SÍMBOLO_FALTANDO[contexto] ?? ["3", "O nome da variável não foi informado"];

  return erro(
    origem,
    `Uma vírgula foi mal colocada. ${nome} ou o número real não foi escrito com pontos.`,
    código(CÓDIGOS.NOME_SIMBOLO_ESTA_FALTANDO, sufixo),
  );
}

export function erroParêntese(origem: Origem, tipo: "abertura" | "fechamento"): PortugolCodeDiagnostic {
  const [sufixo, verbo, caractere] = tipo === "abertura" ? ["1", "iniciada", "("] : ["2", "finalizada", ")"];

  return erro(
    origem,
    `A expressão não foi ${verbo} corretamente. Insira o caracter '${caractere}' para corrigir o problema.`,
    código(CÓDIGOS.PARENTESIS, sufixo),
  );
}

/**
 * O Java recebe o nome do token na gramática e o mostra em minúsculas ("está faltando o
 * token 'pontovirgula'"). Aqui quem chama passa o símbolo, quando ele existe.
 */
export function erroTokenFaltando(origem: Origem, símbolo: string): PortugolCodeDiagnostic {
  return erro(
    origem,
    `A expressão está incompleta, está faltando o token '${símbolo}'`,
    código(CÓDIGOS.TOKEN_FALTANDO, "3"),
  );
}

export function erroParaEsperaCondição(origem: Origem): PortugolCodeDiagnostic {
  return erro(
    origem,
    'O comando "para" necessita ao menos de uma condição de parada. Utilize a seguinte construção para corrigir o problema: "para( ; <condicao> ; ){ <comandos> }"',
    CÓDIGOS.PARA_ESPERA_CONDICAO,
  );
}

export function erroComandoEsperado(origem: Origem): PortugolCodeDiagnostic {
  return erro(
    origem,
    "Esta construção espera um comando. Insira um comando ou inicie um novo escopo utilizando os caracteres '{' e '}'.",
    CÓDIGOS.COMANDO_ESPERADO,
  );
}

export function erroTipoDeDadoEstáFaltando(origem: Origem): PortugolCodeDiagnostic {
  return erro(origem, "Você esqueceu de informar o tipo de dado da variável.", CÓDIGOS.TIPO_DE_DADO_ESTA_FALTANDO);
}

export function erroFaltaDoisPontos(origem: Origem): PortugolCodeDiagnostic {
  return erro(origem, "O caracter ':' é necessário após o caso.", CÓDIGOS.FALTA_DOIS_PONTOS);
}

export function erroPalavraReservadaEstáFaltando(origem: Origem, palavra: string): PortugolCodeDiagnostic {
  return erro(
    origem,
    `O algoritmo está incompleto, está faltando a palavra reservada '${palavra}'`,
    CÓDIGOS.PALAVRA_RESERVADA_ESTA_FALTANDO,
  );
}

export function erroExpressõesForaEscopoPrograma(
  origem: Origem,
  trecho: string,
  local: "antes" | "depois",
): PortugolCodeDiagnostic {
  const onde =
    local === "antes" ? "localizado antes da palavra reservada 'programa'" : "localizado após o caracter '}'";

  return erro(
    origem,
    `Não são permitidas expressões fora do escopo do programa. Para corrigir o problema, remova o seguinte trecho de código '${trecho}', que está ${onde}`,
    CÓDIGOS.EXPRESSOES_FORA_ESCOPO_PROGRAMA,
  );
}

export function erroCadeiaIncompleta(origem: Origem): PortugolCodeDiagnostic {
  return erro(
    origem,
    "A expressão do tipo 'cadeia' não foi finalizada corretamente. Insira o caracter '\"' para corrigir o problema.",
    CÓDIGOS.CADEIA_INCOMPLETA,
  );
}

/**
 * Não há equivalente no Java, que mostra o resto da linha como expressão inesperada. A frase
 * segue a de `ErroCadeiaIncompleta`.
 */
export function erroCaracterIncompleto(origem: Origem, vazio: boolean): PortugolCodeDiagnostic {
  return erro(
    origem,
    vazio
      ? "A expressão do tipo 'caracter' está vazia. Escreva um caractere entre as aspas simples para corrigir o problema."
      : "A expressão do tipo 'caracter' não foi finalizada corretamente. Insira o caracter ''' para corrigir o problema.",
    CÓDIGOS.EXPRESSAO_INESPERADA,
  );
}

export function erroInteiroForaDoIntervalo(origem: Origem, número: string): PortugolCodeDiagnostic {
  return erro(
    origem,
    `O número ${número} está fora do intervalo de 32 bits. Digite um número entre: -2147483648 e 2147483647`,
    CÓDIGOS.INTEIRO_FORA_DO_INTERVALO,
  );
}

export function erroSenãoInesperado(origem: Origem): PortugolCodeDiagnostic {
  return erro(
    origem,
    "O token 'senao' não faz sentido neste local. O comando 'senao' deve ser utilizado com o comando 'se' da seguinte maneira:\nse(condicao){\n\n}senao{\n\n}\n\nou então: \n\nse(condicao){\n\n}senao se(condicao2){\n\n}",
    CÓDIGOS.SENAO_INESPERADO,
  );
}

export function erroParâmetrosNãoTipados(origem: Origem): PortugolCodeDiagnostic {
  return erro(
    origem,
    "Os parametros da função, não estão tipados.\nAdicione tipos para cada um dos parametros utilizados ex: funcao nome(inteiro idade, cadeia sobrenome)",
    CÓDIGOS.PARAMETROS_NAO_TIPADOS,
  );
}

export function erroRetornoVetorMatriz(origem: Origem): PortugolCodeDiagnostic {
  return erro(origem, "Não é possível retornar vetores ou matrizes por funções.", CÓDIGOS.RETORNO_VETOR_MATRIZ);
}

/**
 * O Java mostra a mensagem crua do ANTLR, em inglês e com os nomes dos tokens na gramática.
 * Sem `esperado`, o código acabou sem que desse para dizer o que faltava.
 */
export function erroParsingNãoTratado(origem: Origem, esperado?: string, antesDe?: string): PortugolCodeDiagnostic {
  let mensagem = "O código terminou antes do esperado";

  if (esperado) {
    mensagem = `Era esperado ${esperado} ${antesDe === undefined ? "no fim do código" : `antes de '${antesDe}'`}`;
  }

  return erro(origem, mensagem, CÓDIGOS.PARSING_NAO_TRATADO);
}

// ---------------------------------------------------------------------------------------
// Específicos do Webstudio
// ---------------------------------------------------------------------------------------

export function erroBibliotecaNãoSuportada(origem: Origem, nome: string): PortugolCodeDiagnostic {
  const suportadas = listarEmPortuguês(BIBLIOTECAS_IMPLEMENTADAS);

  return erro(
    origem,
    `A biblioteca "${nome}" ainda não é suportada pelo Portugol Webstudio e o programa não pode ser executado. Bibliotecas suportadas: ${suportadas}`,
    CÓDIGOS.BIBLIOTECA_NAO_SUPORTADA,
  );
}

export function erroSímboloBibliotecaNãoSuportado(
  origem: Origem,
  biblioteca: string,
  nome: string,
  forma: "constante" | "função",
): PortugolCodeDiagnostic {
  const sujeito = forma === "função" ? `A função "${nome}"` : `A constante "${nome}"`;

  return erro(
    origem,
    `${sujeito} da biblioteca "${biblioteca}" ainda não é suportada pelo Portugol Webstudio e o programa não pode ser executado`,
    CÓDIGOS.SIMBOLO_BIBLIOTECA_NAO_SUPORTADO,
  );
}

export function avisoIncrementoEmConta(origem: Origem): PortugolCodeDiagnostic {
  const texto = textoDe(origem);

  return aviso(
    origem,
    `Usar '${texto}' dentro de uma conta pode dar um resultado diferente do esperado. Para evitar surpresas, escreva '${texto}' numa linha separada, antes ou depois da conta`,
    CÓDIGOS.INCREMENTO_EM_CONTA,
  );
}

/**
 * Os textos vêm dos checkers antigos, com o substantivo ajustado à classe do símbolo (eles
 * só falavam de "variável").
 */
export function informaçãoSímboloNãoUtilizado(
  origem: Origem,
  símbolo: Símbolo,
  uso: "nuncaEscrito" | "nuncaLido" | "nãoUtilizado",
): PortugolCodeDiagnostic {
  if (símbolo.parâmetro) {
    return informação(origem, `O parâmetro '${símbolo.nome}' não é utilizado`, CÓDIGOS.SIMBOLO_NAO_UTILIZADO);
  }

  // O Portugol Studio não tem esta mensagem, e chamar uma constante de "variável" confundiria.
  const substantivo =
    símbolo.classe === "variável" && símbolo.constante ? "A constante" : CLASSE_DEFINIDA[símbolo.classe];
  const sujeito = `${substantivo} '${símbolo.nome}'`;
  const masculino = MASCULINO[símbolo.classe];

  const mensagens = {
    nãoUtilizado: `${sujeito} é ${masculino ? "declarado" : "declarada"}, mas não é ${masculino ? "utilizado" : "utilizada"}`,
    nuncaLido: `${sujeito} é ${masculino ? "atribuído" : "atribuída"}, mas nunca é ${masculino ? "lido" : "lida"}`,
    nuncaEscrito: `${sujeito} é ${masculino ? "lido" : "lida"}, mas nunca recebe um valor`,
  };

  return informação(origem, mensagens[uso], CÓDIGOS.SIMBOLO_NAO_UTILIZADO);
}
