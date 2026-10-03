import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const tipo = z.object({
  primitivo: z.enum(["cadeia", "caracter", "inteiro", "logico", "real", "vazio", "*"]).describe("Tipo primitivo"),
  dimensão: z.enum(["vetor", "matriz"]).optional().describe("Dimensão do tipo, vazio caso escalar"),
});

const constante = z.object({
  nome: z.string().describe("Nome da constante"),
  valor: z.any().describe("Valor da constante"),
  descrição: z.string().describe("Descrição da constante, suporta valor em markdown"),
  tipo: tipo.describe("Tipo da constante"),
  referência: z.string().optional().describe("Referência da função"),
});

const parâmetro = z.object({
  nome: z.string().describe("Nome do parâmetro"),
  tipo: tipo.describe("Tipo do parâmetro"),
  descrição: z.string().describe("Descrição do parâmetro, suporta valor em markdown"),
});

const retorno = z.object({
  tipo: tipo.describe("Tipo de retorno da função"),
  descrição: z.string().optional().describe("Descrição do retorno da função, suporta valor em markdown"),
});

const função = z.object({
  nome: z.string().describe("Nome da função"),
  descrição: z.string().describe("Descrição da função, suporta valor em markdown"),
  retorno,
  parâmetros: z.array(parâmetro),
  referência: z.string().optional().describe("Referência da função"),
});

const biblioteca = z.object({
  nome: z.string().describe("Nome da biblioteca (ex: Texto)"),
  descrição: z.string().describe("Descrição da biblioteca"),
  metadados: z.record(z.string(), z.string()).optional().describe("Metadados da biblioteca"),
  constantes: z.array(constante),
  funções: z.array(função),
});

export const schema = z.object({
  $schema: z.string().optional(),
  bibliotecas: z.array(biblioteca),
});

const jsonSchema = schema.toJSONSchema();
const baseDirectory = path.join(import.meta.dirname, "..");

// eslint-disable-next-line unicorn/no-top-level-side-effects
await fs.writeFile(
  path.join(baseDirectory, "bibliotecas.schema.json"),
  JSON.stringify(jsonSchema, undefined, 2) + "\n",
);
