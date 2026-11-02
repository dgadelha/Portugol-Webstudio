/**
 * O esquema dos exercícios, em zod: a fonte da verdade do formato. Sem efeitos ao importar, para
 * o IDE validar um exercício compartilhado por link; o `scripts/build.js` gera dele o
 * `esquemas/exercicio/v1.json` e os tipos (`index.d.ts`).
 */
import { z } from "zod";

import { TAMANHO_MAXIMO_DO_ENUNCIADO } from "./limites.js";

export const URL_DO_ESQUEMA = "https://portugol.dev/esquemas/exercicio/v1.json";

/**
 * Os tópicos, na ordem de um curso. O valor é o nome da pasta do tópico em `exercicios/`.
 */
export const tópicos = {
  saida: "Saída",
  "entrada-e-variaveis": "Entrada e variáveis",
  operadores: "Operadores",
  condicionais: "Desvios condicionais",
  escolha: "Escolha",
  lacos: "Laços de repetição",
  vetores: "Vetores",
  matrizes: "Matrizes",
  funcoes: "Funções",
};

const descrição = z
  .string()
  .min(1)
  .optional()
  .describe('Descrição curta, mostrada no resultado: "teste 8 (números negativos)"');

const valor = z
  .discriminatedUnion("tipo", [
    z.object({ tipo: z.literal("inteiro"), valor: z.int() }),
    z.object({ tipo: z.literal("real"), valor: z.number() }),
    z.object({ tipo: z.literal("cadeia"), valor: z.string() }),
    z.object({ tipo: z.literal("caracter"), valor: z.string().length(1) }),
    z.object({ tipo: z.literal("logico"), valor: z.boolean() }),
  ])
  .describe("Um valor escrito pelo programa, com o tipo");

const vetor = z
  .discriminatedUnion("tipo", [
    z.object({ tipo: z.literal("inteiro[]"), valor: z.array(z.int()) }),
    z.object({ tipo: z.literal("real[]"), valor: z.array(z.number()) }),
    z.object({ tipo: z.literal("cadeia[]"), valor: z.array(z.string()) }),
    z.object({ tipo: z.literal("caracter[]"), valor: z.array(z.string().length(1)) }),
    z.object({ tipo: z.literal("logico[]"), valor: z.array(z.boolean()) }),
  ])
  .describe("Um vetor, com o tipo dos elementos");

const tolerância = z
  .number()
  .nonnegative()
  .optional()
  .describe("Diferença aceita ao comparar valores do tipo real (padrão: 0.000001)");

const verificaçãoDoEscreva = z
  .object({
    descrição,
    alvo: z.literal("escreva").describe("O que é verificado: os valores escritos pelo 'escreva', um por argumento"),
    regra: z
      .enum(["igual", "contém"])
      .describe(
        "'igual': os valores escritos são exatamente estes. 'contém': estes valores aparecem, nesta ordem, entre os escritos depois da última leitura (as mensagens antes de cada 'leia' não contam)",
      ),
    valores: z.array(valor).min(1),
    tolerância,
  })
  .strict();

const verificaçãoDeFunção = z
  .object({
    descrição,
    alvo: z
      .literal("função")
      .describe(
        "O que é verificado: o retorno de uma função do programa, chamada sozinha (sem o 'inicio' e sem entradas)",
      ),
    nome: z
      .string()
      .regex(/^[A-Za-z_][A-Za-z0-9_]*$/)
      .describe("O nome da função. A assinatura esperada vem dos tipos dos argumentos e do valor"),
    argumentos: z.array(z.union([valor, vetor])).describe("Os argumentos da chamada, na ordem, com o tipo"),
    regra: z.literal("igual").describe("'igual': a função retorna exatamente este valor"),
    valor: valor.describe("O valor que a função retorna, com o tipo"),
    tolerância,
  })
  .strict();

const verificação = z.discriminatedUnion("alvo", [verificaçãoDoEscreva, verificaçãoDeFunção]);

const entradas = z
  .array(z.string())
  .describe(
    "O que cada 'leia' recebe, na ordem, como se fosse digitado. Só o 'inicio' recebe entradas: as funções conferidas sozinhas não",
  );

const casoSimples = z
  .object({
    descrição,
    entradas,
    saída: z
      .string()
      .describe("O texto escrito pela solução de referência, em <slug>.solucao.por (gerado, não editar à mão)"),
  })
  .strict();

const casoAvançado = z
  .object({
    descrição,
    entradas,
    verificações: z.array(verificação).min(1),
  })
  .strict()
  .refine(caso => caso.entradas.length === 0 || caso.verificações.some(verificação => verificação.alvo !== "função"), {
    message: "Um caso só com verificações de função não executa o 'inicio': as entradas nunca seriam lidas",
    path: ["entradas"],
  });

const comum = {
  $schema: z.literal(URL_DO_ESQUEMA),
  id: z
    .string()
    .regex(/^(?:pws:[a-z0-9]+(?:-[a-z0-9]+)*|share:[a-z0-9]{6,32})$/)
    .describe(
      "Identificador estável: 'pws:<slug>' nos exercícios embutidos, 'share:<id>' nos compartilhados por link. Nunca muda",
    ),
  título: z.string().min(1),
  tópico: z.enum(Object.keys(tópicos)),
  dificuldade: z.union([z.literal(1), z.literal(2), z.literal(3)]).describe("1: fácil, 2: médio, 3: difícil"),
  enunciado: z.string().min(1).max(TAMANHO_MAXIMO_DO_ENUNCIADO).describe("Markdown sem HTML; fórmulas entre $ ou $$"),
  códigoInicial: z.string().optional().describe("Código que o aluno recebe ao abrir o exercício"),
  atribuição: z
    .object({
      fonte: z.string().min(1),
      licença: z.string().min(1),
    })
    .strict()
    .optional()
    .describe("Fonte e licença, quando o exercício foi adaptado de perto de outro"),
};

export const schema = z.discriminatedUnion("modo", [
  z
    .object({
      ...comum,
      modo: z.literal("simples").describe("Compara o texto escrito, linha a linha"),
      exemplos: z.array(casoSimples).min(1),
      testes: z.array(casoSimples).min(1),
    })
    .strict(),
  z
    .object({
      ...comum,
      modo: z.literal("avançado").describe("Compara os valores escritos ou retornados, com o tipo"),
      exemplos: z.array(casoAvançado).min(1),
      testes: z.array(casoAvançado).min(1),
    })
    .strict(),
]);

export const URL_DO_ESQUEMA_DO_RASCUNHO = "https://portugol.dev/esquemas/rascunho-de-exercicio/v1.json";

const verificaçãoDoEscrevaNoRascunho = z
  .object({
    descrição: z.string().optional(),
    alvo: z.literal("escreva"),
    regra: z.enum(["igual", "contém"]),
    valores: z
      .array(valor)
      .describe("Gerados da solução por 'Gerar respostas'; quem cria pode tirar os que o 'contém' não deve exigir"),
    tolerância,
  })
  .strict();

const verificaçãoDeFunçãoNoRascunho = z
  .object({
    descrição: z.string().optional(),
    alvo: z.literal("função"),
    nome: z.string(),
    argumentos: z
      .string()
      .describe(
        "Os argumentos como numa chamada no código, separados por vírgula. Exemplos: 3, 5 / \"abc\", 'a' / {7.0, 8.5}, 2",
      ),
    tipos: z
      .array(z.string())
      .optional()
      .describe(
        "Os tipos dos parâmetros na solução ('real', 'inteiro[]'…), guardados ao gerar: '3' num parâmetro 'real' é o real 3, e a assinatura publicada é a da solução",
      ),
    valor: valor.optional().describe("O retorno da solução, gerado por 'Gerar respostas'"),
    tolerância,
  })
  .strict();

/**
 * O arquivo-fonte de um exercício, que o "Baixar" do criador grava e o "Abrir" lê de volta: o
 * exercício em construção, com a solução (que nunca vai para o link). Pode estar incompleto.
 */
export const esquemaDoRascunho = z
  .object({
    $schema: z.literal(URL_DO_ESQUEMA_DO_RASCUNHO),
    título: z.string(),
    tópico: comum.tópico,
    dificuldade: comum.dificuldade,
    enunciado: z.string().max(TAMANHO_MAXIMO_DO_ENUNCIADO).describe(comum.enunciado.description),
    códigoInicial: z.string(),
    solução: z.string().describe("A solução de referência, de onde saem as respostas esperadas"),
    modo: z.enum(["simples", "avançado"]),
    casos: z.array(
      z
        .object({
          tipo: z.enum(["exemplo", "teste"]),
          descrição: z.string(),
          entradas: z.string().describe("Uma entrada por linha, como se fosse digitada"),
          saída: z.string().optional().describe("A saída da solução no modo simples, gerada por 'Gerar respostas'"),
          verificações: z.array(
            z.discriminatedUnion("alvo", [verificaçãoDoEscrevaNoRascunho, verificaçãoDeFunçãoNoRascunho]),
          ),
          problema: z.string().optional().describe("O que deu errado ao executar a solução neste caso"),
          fechado: z
            .boolean()
            .optional()
            .describe("Recolhido na criação: só o resumo aparece. Não muda o exercício publicado"),
          geradoCom: z
            .string()
            .optional()
            .describe(
              "A impressão digital do que gerou as respostas (a solução, o modo, as entradas e o que cada verificação confere): se mudou depois, as respostas estão desatualizadas",
            ),
        })
        .strict(),
    ),
    compartilhado: z
      .object({
        link: z.string(),
        até: z.iso.date().describe("O último dia em que o link funciona"),
      })
      .strict()
      .optional()
      .describe("O link da última vez que este exercício foi compartilhado; sai quando o exercício muda"),
  })
  .strict();
