import { PortugolCodeDiagnostic, PortugolDiagnosticSeverity } from "@portugol-webstudio/antlr";

import { getAllChildrenFromNode } from "../helpers/nodes.js";
import { TipoPrimitivo } from "../helpers/Tipo.js";
import { Arquivo } from "../nodes/Arquivo.js";
import { RetorneCmd } from "../nodes/RetorneCmd.js";

export function* checarFunçãoInício(arquivo: Arquivo): Generator<PortugolCodeDiagnostic> {
  const funcInicio = arquivo.funções.find(func => func.nome === "inicio");

  if (funcInicio) {
    if (funcInicio.parâmetros.length > 0) {
      yield PortugolCodeDiagnostic.fromContext(
        funcInicio.ctx,
        "A função 'inicio' não deve receber parâmetros",
        PortugolDiagnosticSeverity.Error,
      );
    }

    if (funcInicio.retorno.primitivo !== TipoPrimitivo.VAZIO) {
      yield PortugolCodeDiagnostic.fromContext(
        funcInicio.ctx,
        "A função 'inicio' não deve retornar valores",
        PortugolDiagnosticSeverity.Error,
      );
    }
  } else {
    yield PortugolCodeDiagnostic.fromContext(
      arquivo.ctx,
      "O programa deve conter uma função chamada 'inicio'",
      PortugolDiagnosticSeverity.Error,
    );
  }
}

export function* checarFunçõesComRetorno(arquivo: Arquivo) {
  for (const func of arquivo.funções) {
    if (func.retorno.primitivo !== TipoPrimitivo.VAZIO) {
      if (!getAllChildrenFromNode(func).some(instrução => instrução instanceof RetorneCmd)) {
        yield PortugolCodeDiagnostic.fromContext(
          func.ctx,
          `A função '${func.nome}' deve retornar um valor`,
          PortugolDiagnosticSeverity.Error,
        );
      }
    }
  }
}
