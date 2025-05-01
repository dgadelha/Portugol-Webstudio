import { Expressão } from "../nodes/Expressão.js";
import {
  CadeiaExpr,
  CaractereExpr,
  ChamadaFunçãoExpr,
  DecrementoUnárioPrefixadoExpr,
  DecrementoUnárioPósfixadoExpr,
  DivisãoExpr,
  ExpressãoEntreParênteses,
  ExpressãoUnária,
  IncrementoUnárioPrefixadoExpr,
  IncrementoUnárioPósfixadoExpr,
  InteiroExpr,
  LógicoExpr,
  MaisUnárioExpr,
  MenosUnárioExpr,
  MultiplicaçãoExpr,
  MóduloExpr,
  NegaçãoBitwiseExpr,
  NegaçãoExpr,
  OperaçãoAndBitwiseExpr,
  OperaçãoAndLógicoExpr,
  OperaçãoDiferençaExpr,
  OperaçãoIgualdadeExpr,
  OperaçãoMaiorOuIgualQueExpr,
  OperaçãoMaiorQueExpr,
  OperaçãoMenorOuIgualQueExpr,
  OperaçãoMenorQueExpr,
  OperaçãoOrBitwiseExpr,
  OperaçãoOrLógicoExpr,
  OperaçãoShiftLeftExpr,
  OperaçãoShiftRightExpr,
  OperaçãoXorExpr,
  RealExpr,
  ReferênciaArrayExpr,
  ReferênciaMatrizExpr,
  ReferênciaVarExpr,
  SomaExpr,
  SubtraçãoExpr,
  VazioExpr,
} from "../nodes/index.js";
import { Escopo } from "./Escopo.js";
import { ParseError } from "./ParseError.js";
import { TipoPrimitivo } from "./Tipo.js";
import {
  ResultadoCompatibilidade,
  TabelaCompatibilidadeBitwise,
  TabelaCompatibilidadeDiferençaIgualdade,
  TabelaCompatibilidadeDivisãoMultiplicaçãoSubtração,
  TabelaCompatibilidadeEOu,
  TabelaCompatibilidadeModulo,
  TabelaCompatibilidadeSoma,
} from "./compatibilidade.js";

export function resolverResultadoExpressão(expressão: Expressão | undefined, escopo: Escopo): TipoPrimitivo {
  if (!expressão) {
    return TipoPrimitivo.VAZIO;
  }

  switch (expressão.constructor) {
    case CadeiaExpr: {
      return TipoPrimitivo.CADEIA;
    }

    case CaractereExpr: {
      return TipoPrimitivo.CARACTER;
    }

    case InteiroExpr: {
      return TipoPrimitivo.INTEIRO;
    }

    case LógicoExpr: {
      return TipoPrimitivo.LÓGICO;
    }

    case RealExpr: {
      return TipoPrimitivo.REAL;
    }

    case VazioExpr: {
      return TipoPrimitivo.VAZIO;
    }

    case DivisãoExpr:
    case MultiplicaçãoExpr:
    case SubtraçãoExpr: {
      const div = expressão as DivisãoExpr | MultiplicaçãoExpr | SubtraçãoExpr;
      const divesq = resolverResultadoExpressão(div.esquerda, escopo);
      const divdir = resolverResultadoExpressão(div.direita, escopo);
      const result = TabelaCompatibilidadeDivisãoMultiplicaçãoSubtração[divesq][divdir];

      if (Array.isArray(result)) {
        return result[1];
      }

      if (result === ResultadoCompatibilidade.INCOMPATÍVEL) {
        throw new ParseError(
          `Não é possível realizar uma operação de divisão, multiplicação ou subtração entre expressões dos tipos '${divesq}' e '${divdir}'`,
          expressão?.ctx,
        );
      }

      return divesq === TipoPrimitivo.REAL || divdir === TipoPrimitivo.REAL
        ? TipoPrimitivo.REAL
        : TipoPrimitivo.INTEIRO;
    }

    case SomaExpr: {
      const soma = expressão as SomaExpr;
      const somaesq = resolverResultadoExpressão(soma.esquerda, escopo);
      const somadir = resolverResultadoExpressão(soma.direita, escopo);
      const resultSoma = TabelaCompatibilidadeSoma[somaesq][somadir];

      if (Array.isArray(resultSoma)) {
        return resultSoma[1];
      }

      if (resultSoma === ResultadoCompatibilidade.INCOMPATÍVEL) {
        throw new ParseError(
          `Não é possível realizar uma operação de soma entre expressões dos tipos '${somaesq}' e '${somadir}'`,
          expressão?.ctx,
        );
      }

      if (somaesq === TipoPrimitivo.CADEIA || somadir === TipoPrimitivo.CADEIA) {
        return TipoPrimitivo.CADEIA;
      }

      if (somaesq === TipoPrimitivo.REAL || somadir === TipoPrimitivo.REAL) {
        return TipoPrimitivo.REAL;
      }

      return TipoPrimitivo.INTEIRO;
    }

    case MóduloExpr: {
      const mod = expressão as MóduloExpr;
      const modesq = resolverResultadoExpressão(mod.esquerda, escopo);
      const moddir = resolverResultadoExpressão(mod.direita, escopo);

      if (TabelaCompatibilidadeModulo[modesq][moddir] === ResultadoCompatibilidade.INCOMPATÍVEL) {
        throw new ParseError(
          `Não é possível realizar uma operação de módulo entre expressões dos tipos '${modesq}' e '${moddir}'`,
          expressão?.ctx,
        );
      }

      if (modesq === TipoPrimitivo.REAL || moddir === TipoPrimitivo.REAL) {
        return TipoPrimitivo.REAL;
      }

      return TipoPrimitivo.INTEIRO;
    }

    case IncrementoUnárioPrefixadoExpr:
    case IncrementoUnárioPósfixadoExpr:
    case DecrementoUnárioPrefixadoExpr:
    case DecrementoUnárioPósfixadoExpr: {
      return resolverResultadoExpressão((expressão as ExpressãoUnária<any>).variável, escopo);
    }

    case ExpressãoEntreParênteses: {
      return resolverResultadoExpressão((expressão as ExpressãoEntreParênteses).expressão, escopo);
    }

    case ReferênciaVarExpr: {
      const ref = expressão as ReferênciaVarExpr;
      const svar = escopo.getVariável(ref.nome);

      if (!svar) {
        throw new ParseError(`Variável não declarada: ${ref.nome}`, expressão?.ctx);
      }

      return svar.primitivo;
    }

    case ReferênciaArrayExpr:
    case ReferênciaMatrizExpr: {
      const refarr = expressão as ReferênciaArrayExpr | ReferênciaMatrizExpr;
      const vararr = escopo.getVariável(refarr.variável.nome);

      if (!vararr) {
        throw new ParseError(`Variável não declarada: ${refarr.variável.nome}`, expressão?.ctx);
      }

      return vararr.primitivo;
    }

    case OperaçãoIgualdadeExpr:
    case OperaçãoDiferençaExpr: {
      const eq = expressão as OperaçãoIgualdadeExpr | OperaçãoDiferençaExpr;
      const eqesq = resolverResultadoExpressão(eq.esquerda, escopo);
      const eqdir = resolverResultadoExpressão(eq.direita, escopo);
      const result = TabelaCompatibilidadeDiferençaIgualdade[eqesq][eqdir];

      if (result === ResultadoCompatibilidade.INCOMPATÍVEL) {
        throw new ParseError(
          `Não é possível realizar uma operação de igualdade ou diferença entre expressões dos tipos '${eqesq}' e '${eqdir}'`,
          expressão?.ctx,
        );
      }

      if (Array.isArray(result)) {
        return result[1];
      }

      return TipoPrimitivo.LÓGICO;
    }

    case OperaçãoAndLógicoExpr:
    case OperaçãoOrLógicoExpr: {
      const log = expressão as OperaçãoAndLógicoExpr | OperaçãoOrLógicoExpr;
      const logesq = resolverResultadoExpressão(log.esquerda, escopo);
      const logdir = resolverResultadoExpressão(log.direita, escopo);

      if (TabelaCompatibilidadeEOu[logesq][logdir] === ResultadoCompatibilidade.INCOMPATÍVEL) {
        throw new ParseError(
          `Não é possível realizar uma operação de 'e' ou 'ou' entre expressões dos tipos '${logesq}' e '${logdir}'`,
          expressão?.ctx,
        );
      }

      return TipoPrimitivo.LÓGICO;
    }

    case OperaçãoMaiorQueExpr:
    case OperaçãoMaiorOuIgualQueExpr:
    case OperaçãoMenorQueExpr:
    case OperaçãoMenorOuIgualQueExpr: {
      return TipoPrimitivo.LÓGICO;
    }

    case OperaçãoOrBitwiseExpr:
    case OperaçãoAndBitwiseExpr:
    case OperaçãoShiftLeftExpr:
    case OperaçãoShiftRightExpr:
    case OperaçãoXorExpr: {
      const bit = expressão as OperaçãoOrBitwiseExpr | OperaçãoAndBitwiseExpr;
      const bitesq = resolverResultadoExpressão(bit.esquerda, escopo);
      const bitdir = resolverResultadoExpressão(bit.direita, escopo);

      if (TabelaCompatibilidadeBitwise[bitesq][bitdir] === ResultadoCompatibilidade.INCOMPATÍVEL) {
        throw new ParseError(
          `Não é possível realizar uma operação bitwise entre expressões dos tipos '${bitesq}' e '${bitdir}'`,
          expressão?.ctx,
        );
      }

      return bitesq === TipoPrimitivo.REAL || bitdir === TipoPrimitivo.REAL
        ? TipoPrimitivo.REAL
        : TipoPrimitivo.INTEIRO;
    }

    case NegaçãoBitwiseExpr:
    case NegaçãoExpr: {
      return resolverResultadoExpressão((expressão as NegaçãoBitwiseExpr | NegaçãoExpr).expressão, escopo);
    }

    case MaisUnárioExpr:
    case MenosUnárioExpr: {
      const un = expressão as MaisUnárioExpr | MenosUnárioExpr;
      const unvar = resolverResultadoExpressão(un.valor, escopo);

      if (unvar === TipoPrimitivo.REAL) {
        return TipoPrimitivo.REAL;
      }

      return TipoPrimitivo.INTEIRO;
    }

    case ChamadaFunçãoExpr: {
      const chamada = expressão as ChamadaFunçãoExpr;
      const fun = escopo.getFunção(chamada.nome);

      if (chamada.escopoBiblioteca) {
        throw new ParseError("TODO", expressão?.ctx); // TODO
      }

      if (!fun) {
        throw new ParseError(`Função não declarada: ${chamada.nome}`, expressão?.ctx);
      }

      return fun.primitivo;
    }

    default: {
      return TipoPrimitivo.VAZIO;
    }
  }
}
