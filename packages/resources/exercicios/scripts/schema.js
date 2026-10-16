import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

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

const verificação = z
  .object({
    descrição,
    alvo: z.literal("escreva").describe("O que é verificado: os valores escritos pelo 'escreva', um por argumento"),
    regra: z
      .enum(["igual", "contém"])
      .describe(
        "'igual': os valores escritos são exatamente estes. 'contém': estes valores aparecem, nesta ordem, entre os escritos",
      ),
    valores: z.array(valor).min(1),
    tolerância: z
      .number()
      .nonnegative()
      .optional()
      .describe("Diferença aceita ao comparar valores do tipo real (padrão: 0.000001)"),
  })
  .strict();

const entradas = z.array(z.string()).describe("O que cada 'leia' recebe, na ordem, como se fosse digitado");

const casoSimples = z
  .object({
    descrição,
    entradas,
    saída: z.string().describe("O texto escrito pela solução de referência (gerado, não editar à mão)"),
  })
  .strict();

const casoAvançado = z
  .object({
    descrição,
    entradas,
    verificações: z.array(verificação).min(1),
  })
  .strict();

const comum = {
  $schema: z.literal(URL_DO_ESQUEMA),
  id: z
    .string()
    .regex(/^pws:[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .describe("Identificador estável: 'pws:<slug>' nos exercícios embutidos. Nunca muda"),
  título: z.string().min(1),
  tópico: z.enum(Object.keys(tópicos)),
  dificuldade: z.union([z.literal(1), z.literal(2), z.literal(3)]).describe("1: fácil, 2: médio, 3: difícil"),
  enunciado: z.string().min(1).describe("Markdown sem HTML; fórmulas entre $ ou $$"),
  códigoInicial: z.string().optional().describe("Código que o aluno recebe ao abrir o exercício"),
  solução: z.string().min(1).describe("Solução de referência: gera as saídas e é conferida no CI"),
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
      modo: z.literal("avançado").describe("Compara os valores escritos, com o tipo"),
      exemplos: z.array(casoAvançado).min(1),
      testes: z.array(casoAvançado).min(1),
    })
    .strict(),
]);

const jsonSchema = {
  $id: URL_DO_ESQUEMA,
  title: "Exercício do Portugol Webstudio",
  ...z.toJSONSchema(schema, { io: "input" }),
};
const esquemaDirectory = path.join(import.meta.dirname, "..", "..", "esquemas", "exercicio");

await fs.mkdir(esquemaDirectory, { recursive: true });
await fs.writeFile(path.join(esquemaDirectory, "v1.json"), JSON.stringify(jsonSchema, undefined, 2) + "\n");
