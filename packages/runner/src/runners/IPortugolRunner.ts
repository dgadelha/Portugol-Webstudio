import { ArquivoContext, PortugolCodeError } from "@portugol-webstudio/antlr";
import { Observable, Subject } from "rxjs";

export type PortugolEvent =
  | { type: "start" }
  | { type: "clear" }
  | { type: "stdIn" }
  | { type: "error"; error: Error }
  | { type: "parseError"; errors: PortugolCodeError[] }
  | { type: "finish"; time: number };

export abstract class IPortugolRunner {
  constructor(private tree: ArquivoContext) {}

  abstract byteCode: string;

  abstract stdIn: Subject<string>;
  abstract stdOut$: Observable<string>;

  abstract waitingForInput: boolean;
  abstract waitingForInput$: Observable<boolean>;

  abstract running: boolean;
  abstract running$: Observable<boolean>;

  abstract run(): Observable<PortugolEvent>;
  abstract destroy(): void;
}
