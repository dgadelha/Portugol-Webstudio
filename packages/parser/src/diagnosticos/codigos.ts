/**
 * Códigos de diagnóstico, espelhando os do Portugol Studio (`ErroSemantico.<Classe>` /
 * `AvisoSemantico.<Classe>`), mais `ErroWebstudio.*` para o que só existe aqui.
 *
 * Duas divergências deliberadas de formato: aqui todo sufixo de variante é separado por
 * ponto (o Java concatena sem ponto em `ErroSimboloRedeclarado`) e o código sai sempre
 * completo (o Java só o monta junto com a mensagem, e às vezes emite código truncado).
 */
export const CÓDIGOS = {
  // Estrutura do programa
  FUNCAO_INICIO_INEXISTENTE: "ErroSemantico.ErroFuncaoInicioInexistente",
  /**
   * O Portugol Studio emite este erro como um `ErroSemantico` anônimo, sem código.
   */
  FUNCAO_RESERVADA: "ErroSemantico.ErroFuncaoReservada",
  BLOCO_INVALIDO: "ErroSemantico.ErroBlocoInvalido",
  FUNCAO_SEM_RETORNE: "ErroSemantico.ErroFuncaoSemRetorne",

  // Símbolos
  SIMBOLO_NAO_DECLARADO: "ErroSemantico.ErroSimboloNaoDeclarado",
  SIMBOLO_REDECLARADO: "ErroSemantico.ErroSimboloRedeclarado",
  PARAMETRO_REDECLARADO: "ErroSemantico.ErroParametroRedeclarado",
  SIMBOLO_NAO_INICIALIZADO: "ErroSemantico.ErroSimboloNaoInicializado",
  REFERENCIA_INVALIDA: "ErroSemantico.ErroReferenciaInvalida",
  SIMBOLO_GLOBAL_OCULTADO: "AvisoSemantico.AvisoSimboloGlobalOcultado",

  // Constantes
  ATRIBUIR_EM_CONSTANTE: "ErroSemantico.ErroAtribuirEmConstante",
  INICIALIZACAO_CONSTANTE: "ErroSemantico.ErroInicializacaoConstante",

  // Tipos
  TIPOS_INCOMPATIVEIS: "ErroSemantico.ErroTiposIncompativeis",
  VALOR_EXPRESSAO_SERA_CONVERTIDO: "AvisoSemantico.AvisoValorExpressaoSeraConvertido",

  // Chamadas de função
  NUMERO_PARAMETROS_FUNCAO: "ErroSemantico.ErroNumeroParametrosFuncao",
  PARAMETRO_EXCEDENTE: "ErroSemantico.ErroParametroExcedente",
  TIPO_PARAMETRO_INCOMPATIVEL: "ErroSemantico.ErroTipoParametroIncompativel",
  QUANTIFICADOR_PARAMETRO_FUNCAO: "ErroSemantico.ErroQuantificadorParametroFuncao",
  PASSAGEM_PARAMETRO_INVALIDA: "ErroSemantico.ErroPassagemParametroInvalida",

  // Vetores e matrizes
  TAMANHO_VETOR_MATRIZ: "ErroSemantico.ErroTamanhoVetorMatriz",
  TAMANHO_MAXIMO_VETOR: "ErroSemantico.ErroTamanhoMaximoVetor",
  TAMANHO_MAXIMO_MATRIZ: "ErroSemantico.ErroTamanhoMaximoMatriz",
  QUANTIDADE_ELEMENTOS_INICIALIZACAO_VETOR: "ErroSemantico.ErroQuantidadeElementosInicializacaoVetor",
  QUANTIDADE_LINHAS_INICIALIZACAO_MATRIZ: "ErroSemantico.ErroQuantidadeLinhasIncializacaoMatriz",
  QUANTIDADE_ELEMENTOS_COLUNA_INICIALIZACAO_MATRIZ: "ErroSemantico.ErroQuantidadeElementosColunaInicializacaoMatriz",
  DEFINIR_TIPO_DADO_VETOR_LITERAL: "ErroSemantico.ErroDefinirTipoDadoVetorLiteral",
  DEFINIR_TIPO_DADO_MATRIZ_LITERAL: "ErroSemantico.ErroDefinirTipoDadoMatrizLiteral",
  VETOR_PODE_SER_VARIAVEL: "AvisoSemantico.AvisoVetorPodeSerVariavel",
  MATRIZ_PODE_SER_VARIAVEL: "AvisoSemantico.AvisoMatrizPodeSerVariavel",
  MATRIZ_PODE_SER_VETOR: "AvisoSemantico.AvisoMatrizPodeSerVetor",

  // Bibliotecas
  INCLUSAO_BIBLIOTECA: "ErroSemantico.ErroInclusaoBiblioteca",
  BIBLIOTECA_NAO_INSERIDA: "ErroSemantico.ErroBibliotecaNaoInserida",
  ALIAS_INEXISTENTE: "ErroSemantico.ErroAliasInexistente",
  CONSTANTE_NAO_ENCONTRADA_NA_BIBLIOTECA: "ErroSemantico.ErroConstanteNaoEncontradaNaBiblioteca",
  ATRIBUIR_CONSTANTE_BIBLIOTECA: "ErroSemantico.ErroAtribuirConstanteBiblioteca",
  ATRIBUIR_FUNCAO_BIBLIOTECA: "ErroSemantico.ErroAtribuirFuncaoBiblioteca",

  // Atribuições e comandos
  /**
   * Nome herdado do Java: é o código de `ErroAtribuirEmExpressao`.
   */
  OPERACAO_COM_EXPRESSAO_CONSTANTE: "ErroSemantico.ErroOperacaoComExpressaoConstante",
  ATRIBUIR_EM_CHAMADA_FUNCAO: "ErroSemantico.ErroAtribuirEmChamadaFuncao",
  ATRIBUIR_MATRIZ_VETOR_EM_VARIAVEL: "ErroSemantico.ErroAtribuirMatrizVetorEmVariavel",
  INICIALIZACAO_ERRADA: "ErroSemantico.ErroInicializacaoErrada",
  PARA_SEM_EXPRESSAO_ATRIBUICAO: "ErroSemantico.ErroParaSemExpressaoAtribuicao",
  PARA_SEM_EXPRESSAO_COMPARACAO: "ErroSemantico.ErroParaSemExpressaoComparacao",

  // Específicos do Webstudio
  /**
   * No Portugol Studio isto é erro sintático (`ErroSintatico.ErroExpressaoInesperada`); aqui
   * a gramática aceita `pare` em qualquer lugar e o transpilador gera um `break` cru, que
   * fora de laço derruba o programa inteiro com `SyntaxError`.
   */
  PARE_FORA_DE_LACO: "ErroWebstudio.ErroPareForaDeLaco",

  /**
   * Verificação #47: biblioteca que o Portugol Studio conhece mas que o runtime do
   * Webstudio não sabe executar (ver `bibliotecas/suporte.ts`).
   */
  BIBLIOTECA_NAO_SUPORTADA: "ErroWebstudio.ErroBibliotecaNaoSuportada",

  /**
   * Verificação #48: função ou constante de uma biblioteca suportada que o nosso runtime
   * ainda não implementa.
   */
  SIMBOLO_BIBLIOTECA_NAO_SUPORTADO: "ErroWebstudio.ErroSimboloBibliotecaNaoSuportado",

  /**
   * Verificação #49: `sorteia(...)` global. O Portugol Studio a reserva na linguagem; o
   * runtime do Webstudio só tem `Util.sorteia`.
   */
  FUNCAO_RESERVADA_NAO_SUPORTADA: "ErroWebstudio.ErroFuncaoReservadaNaoSuportada",

  /**
   * Verificação #15: avisos de uso (declarada e não usada / só lida / só escrita). O
   * Portugol Studio não os emite; aqui são informativos e podem ser desligados com
   * `checkCode(code, { avisosDeUso: false })`.
   */
  SIMBOLO_NAO_UTILIZADO: "InfoWebstudio.SimboloNaoUtilizado",
} as const;

/**
 * Prefixos dos códigos que não existem no Portugol Studio. O teste diferencial e a
 * ferramenta de corpus os excluem da comparação, então uma categoria nova basta somar aqui.
 */
export const PREFIXOS_WEBSTUDIO = ["ErroWebstudio.", "AvisoWebstudio.", "InfoWebstudio."] as const;

export function éDoWebstudio(código: string | undefined): boolean {
  return PREFIXOS_WEBSTUDIO.some(prefixo => código?.startsWith(prefixo) ?? false);
}

/**
 * Sufixos de variante de `ErroSimboloRedeclarado`, `ErroSimboloNaoDeclarado`,
 * `ErroReferenciaInvalida` e `ErroSimboloNaoInicializado`, indexados pela classe do
 * símbolo. Os números vêm dos `código += "..."` do Java.
 */
export const SUFIXO_CLASSE_SIMBOLO = {
  vetor: "1",
  matriz: "2",
  variável: "3",
  função: "4",
} as const;

/**
 * Sufixos da segunda metade do código de `ErroReferenciaInvalida`: a forma como o símbolo
 * foi *usado*.
 */
export const SUFIXO_FORMA_REFERENCIA = {
  variável: "1",
  matriz: "2",
  vetor: "3",
  função: "4",
} as const;

/**
 * Sufixos da dica de `ErroBlocoInvalido` — atenção: a numeração do Java aqui **não** é a
 * mesma de `SUFIXO_FORMA_REFERENCIA` (vetor e matriz estão trocados).
 */
export const SUFIXO_BLOCO_INVALIDO_REFERENCIA = {
  variável: "1",
  vetor: "2",
  matriz: "3",
} as const;

/**
 * Indexado pela forma da referência, e não pela classe do símbolo (que nem existe nesse
 * caso). No Java são duas tabelas cuja numeração coincide — se uma mudar lá, separe de novo.
 */
export const SUFIXO_NAO_DECLARADO = SUFIXO_CLASSE_SIMBOLO;

/**
 * Um por variante de `analise/semantica/erros/ErroTiposIncompativeis.java`. `BITWISE_BINARIO`
 * e `BITWISE_NEGACAO` não existem lá: o construtor de mensagem não tem visitante para
 * `NoOperacaoBitwiseE/Ou/XOR` nem `NoBitwiseNao` e estoura `UnsupportedOperationException`.
 */
export const SUFIXO_TIPOS_INCOMPATIVEIS = {
  ATRIBUICAO: "1",
  SHIFT: "1",
  MENOS_UNARIO: "2",
  NEGACAO: "3",
  DIFERENCA: "4",
  DIVISAO: "5",
  E_LOGICO: "6",
  IGUALDADE: "7",
  MAIOR: "8",
  MAIOR_IGUAL: "9",
  MENOR: "10",
  MENOR_IGUAL: "11",
  MODULO: "12",
  MULTIPLICACAO: "13",
  OU_LOGICO: "14",
  SOMA: "15",
  SUBTRACAO: "16",
  ESCOLHA: "17",
  CASO: "18",
  SE: "19",
  ENQUANTO: "20",
  FACA_ENQUANTO: "21",
  PARA: "22",
  INDICE_MATRIZ: "23",
  INDICE_VETOR: "24",
  RETORNE: "25",
  BITWISE_BINARIO: "26",
  BITWISE_NEGACAO: "27",
} as const;

export function código(base: string, ...sufixos: string[]): string {
  return sufixos.length > 0 ? `${base}.${sufixos.join("")}` : base;
}
