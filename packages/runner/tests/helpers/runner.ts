import { PortugolCodeChecker } from "@portugol-webstudio/parser";
import { PortugolJs } from "@portugol-webstudio/runtime";
import childp from "node:child_process";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { PortugolWorkerThreadsRunner } from "../../src";

class NoMoreInputsError extends Error {
  constructor() {
    super("No more inputs available");
    this.name = "NoMoreInputsError";
  }
}

class InputsRemainingError extends Error {
  constructor(remainingInputs: string[], options: ErrorOptions = {}) {
    super(`There are still ${remainingInputs.length} input(s) remaining`, options);
    this.name = "InputsRemainingError";
  }
}

const assetsDir = path.join(import.meta.dirname, "..", "assets");
const portugolConsoleJar = path.join(assetsDir, "portugol-console-2.7.5.jar");
const temPortugolCli = existsSync(portugolConsoleJar);

if (!temPortugolCli) {
  const aviso = `Portugol Console não encontrado em ${portugolConsoleJar}. Execute tests/setup.sh para comparar a saída com a do Portugol Studio.`;

  if (process.env.CI) {
    throw new Error(aviso);
  }

  console.warn(`AVISO: ${aviso}`);
}

async function runCodeInPortugolCli(code: string, inputs: string[] = []) {
  // O Portugol CLI grava o Java gerado em <java.io.tmpdir>/portugol/programas com
  // um nome derivado do relógio, então execuções simultâneas se atropelam sem um
  // diretório próprio para cada uma
  const execDir = path.join(import.meta.dirname, "..", "tmp", randomUUID());
  const codeFilePath = path.join(execDir, "code.por");
  const inputFilePath = path.join(execDir, "input.txt");
  const stdOutFilePath = path.join(execDir, "stdout.txt");
  const stdErrFilePath = path.join(execDir, "stderr.txt");

  await mkdir(execDir, { recursive: true });

  try {
    await Promise.all([writeFile(codeFilePath, code, "utf8"), writeFile(inputFilePath, inputs.join("\n"), "utf8")]);

    const child = childp.spawn(
      "java",
      [
        "-Dfile.encoding=UTF-8",
        `-Djava.io.tmpdir=${execDir}`,
        "-Xms128m",
        "-Xmx512m",
        "-jar",
        portugolConsoleJar,
        codeFilePath,
        "-no-wait",
        `-in=${inputFilePath}`,
        `-out=${stdOutFilePath}`,
        `-err=${stdErrFilePath}`,
      ],
      {
        cwd: assetsDir,
        windowsHide: true,
      },
    );

    const [exitCode] = (await once(child, "close")) as [number | null];

    // Uma falha antes da execução pode deixar de criar os arquivos de saída, e
    // nesse caso o erro de verdade está no código de saída, não no ENOENT
    const ler = (arquivo: string) => readFile(arquivo, "utf8").catch(() => "");
    const [stdOut, stdErr] = await Promise.all([ler(stdOutFilePath), ler(stdErrFilePath)]);

    // O Portugol Studio escreve avisos (AVISO:) e erros de compilação (ERRO:)
    // na saída de erro. Apenas os erros impedem o programa de executar.
    const compileErrors = stdErr
      .split("\n")
      .filter(line => line.trimStart().startsWith("ERRO:"))
      .join("\n");

    if (compileErrors !== "") {
      throw new Error(`Compile errors from Portugol CLI:\n${compileErrors}`);
    }

    if (exitCode !== 0) {
      throw new Error(`Process exited with code ${exitCode}\n${stdErr}`);
    }

    return stdOut;
  } finally {
    await rm(execDir, { force: true, recursive: true });
  }
}

function runCodeInThreadsWorker(code: string, inputs: string[] = []) {
  const hasInputs = inputs.length > 0;

  return new Promise<string>((resolve, reject) => {
    const checkerResult = PortugolCodeChecker.checkCode(code);
    const byteCode = new PortugolJs().visit(checkerResult.tree);
    const runner = new PortugolWorkerThreadsRunner(byteCode!);
    let stdOut = "";

    const _stdOut$ = runner.stdOut$.subscribe(output => {
      stdOut += output;
    });

    const _events$ = runner.run().subscribe(event => {
      switch (event.type) {
        case "stdIn": {
          if (inputs.length === 0) {
            reject(new NoMoreInputsError());
            break;
          }

          runner.stdIn.next(inputs.shift()!);
          break;
        }

        case "clear": {
          stdOut = "";
          break;
        }

        case "parseError": {
          _stdOut$.unsubscribe();
          _events$.unsubscribe();

          reject(new Error("Parse errors", { cause: event.errors }));

          break;
        }

        case "finish": {
          _stdOut$.unsubscribe();
          _events$.unsubscribe();

          if (hasInputs && inputs.length > 0) {
            reject(new InputsRemainingError(inputs));
            return;
          }

          resolve(stdOut);
          break;
        }
      }
    });
  });
}

export async function runPortugolCode(code: string, inputs: string[] = []) {
  const workerOutput = await runCodeInThreadsWorker(code, [...inputs]);
  const cliOutput = temPortugolCli ? await runCodeInPortugolCli(code, [...inputs]) : null;

  if (cliOutput !== null && cliOutput !== workerOutput) {
    throw new Error(`Outputs do not match!\nCLI Output:\n${cliOutput}\nWorker Output:\n${workerOutput}`);
  }

  return workerOutput;
}
