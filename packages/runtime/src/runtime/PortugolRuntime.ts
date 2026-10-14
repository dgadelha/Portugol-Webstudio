import { portugolLibs } from "../libs/index.js";
import { INVALID_INDEX_MESSAGE, INVALID_INPUT_MESSAGE, STACK_OVERFLOW_MESSAGE } from "./messages.js";

export const portugolRuntime = /* javascript */ `
class PortugolRuntime {
  globalScope = {};
  currentFunction = null;
  debug = false;

  // A linha e a coluna (contada do 0) do comando em execução: um erro de execução diz onde
  // aconteceu
  line = 0;
  column = 0;

  constructor(initScope) {
    this.initScope = initScope;

    this.globalScope = {
      ...this.getScope(initScope),
      libAliases: {},
    };

    this.objetos = new PortugolCacheObjetos();
    this.libs = ${portugolLibs};

    // A 'sorteia' sem biblioteca é a mesma do Portugol Studio que a 'Util.sorteia': o mesmo
    // intervalo e as mesmas mensagens de erro. As outras funções reservadas fazem entrada e
    // saída e vêm de quem executa o programa (initScope).
    this.globalScope.functions.sorteia = (minimo, maximo) => this.libs.Util.sorteia(minimo, maximo);

    // Execução passo a passo: o programa traduzido com a opção de depuração chama o
    // 'step' antes de cada comando, e quem executa recebe as mensagens pelo 'send'.
    // As chamadas das funções do programa, da mais antiga para a mais recente, ficam
    // em 'frames', cada uma com as variáveis dela e um número que a distingue de outra
    // chamada da mesma função.
    this.frames = [];
    this.frameCount = 0;
    this.userFunctions = new Set();

    if (initScope.debug) {
      const breakpoints = initScope.debug.breakpoints ?? [];

      this.debugState = {
        send: initScope.debug.send,
        // Sem pontos de parada, o programa já começa parado no primeiro comando
        mode: breakpoints.length > 0 ? "continue" : "step",
        depth: 0,
        breakpoints: new Set(breakpoints),
        pauseRequested: false,
        ticks: 0,
        lastYield: performance.now(),
        resume: null,
        wake: null,
        channel: new MessageChannel(),
      };

      this.debugState.channel.port1.onmessage = () => this.debugState.wake?.();
    }
  }

  // Chamado pelo programa traduzido antes de cada comando
  position(line, column) {
    this.line = line;
    this.column = column;
  }

  // Onde aconteceu o erro de execução, contando do 1 como o Portugol Studio e o editor, ou
  // nada antes do primeiro comando
  errorPosition() {
    return this.line ? { line: this.line, column: this.column + 1 } : undefined;
  }

  // Chamado no começo de cada função do programa, na depuração: a chamada já está em
  // 'frames' (pelo 'callFunction'), e ganha as variáveis dela
  enterScope(scope, params) {
    const frame = this.frames.at(-1);

    if (frame) {
      frame.scope = scope;
      frame.params = params;
    }
  }

  // Antes de cada comando, na depuração. Quase sempre não há o que esperar e ele volta
  // na hora, sem 'await'; quando precisa pausar ou devolver a vez, guarda a espera em
  // 'stepping' e devolve 'true', e o código gerado faz 'runtime.step(...) && await
  // runtime.stepping'
  step(line, column) {
    const state = this.debugState;

    if (!state) {
      return false;
    }

    const depth = this.frames.length;

    if (this.shouldPause(line, depth)) {
      this.stepping = this.pause(line, column, depth);
      return true;
    }

    // Sem pausar, devolve a vez de tempos em tempos para chegarem os comandos de quem
    // executa, como o Pausar e os pontos de parada novos. O relógio só é lido a cada
    // 1024 comandos
    if ((++state.ticks & 1023) !== 0 || performance.now() - state.lastYield < 16) {
      return false;
    }

    this.stepping = this.yieldToHost(line, column, depth);
    return true;
  }

  async yieldToHost(line, column, depth) {
    const state = this.debugState;

    await new Promise((resolve) => {
      state.wake = resolve;
      state.channel.port2.postMessage(null);
    });

    state.lastYield = performance.now();

    if (state.pauseRequested) {
      await this.pause(line, column, depth);
    }
  }

  async pause(line, column, depth) {
    const state = this.debugState;

    state.pauseRequested = false;

    const mode = await new Promise((resolve) => {
      state.resume = resolve;
      state.send({ type: "paused", pause: this.describePause(line, column) });
    });

    state.resume = null;
    state.mode = mode;
    state.depth = depth;
    state.lastYield = performance.now();
  }

  shouldPause(line, depth) {
    const state = this.debugState;

    if (state.pauseRequested || state.breakpoints.has(line)) {
      return true;
    }

    switch (state.mode) {
      case "step":
        return true;

      // Para de novo na mesma função ou na que a chamou
      case "stepOver":
        return depth <= state.depth;

      // Para só na função que chamou esta
      case "stepOut":
        return depth < state.depth;

      default:
        return false;
    }
  }

  // Os comandos de quem executa: 'step', 'stepOver', 'stepOut' e 'continue' retomam
  // um programa pausado, 'pause' pausa no próximo comando, e 'breakpoints' troca as
  // linhas em que o programa para
  debugCommand(command) {
    const state = this.debugState;

    if (!state) {
      return;
    }

    switch (command.type) {
      case "breakpoints":
        state.breakpoints = new Set(command.lines);
        break;

      case "pause":
        if (!state.resume) {
          state.pauseRequested = true;
        }

        break;

      default:
        state.resume?.(command.type);
    }
  }

  // A pausa vai para outra thread, então leva só dados: a função de cada chamada, da
  // mais recente para a mais antiga, com as variáveis dela, e as variáveis globais
  describePause(line, column) {
    const globals = this.globalScope.variables;

    return {
      line,
      column,
      frames: this.frames
        .map((frame) => ({
          id: frame.id,
          name: frame.name,
          // Cada chamada começa com as variáveis globais: as locais são as outras, e os
          // parâmetros, mesmo um por referência que recebeu a global com o mesmo nome
          variables: this.describeVariables(
            frame.scope?.variables ?? {},
            (name, variable) => globals[name] !== variable || frame.params?.includes(name),
          ),
        }))
        .reverse(),
      globals: this.describeVariables(globals),
    };
  }

  describeVariables(variables, filter) {
    return Object.entries(variables)
      .filter(([name, variable]) => variable instanceof PortugolVar && (!filter || filter(name, variable)))
      .map(([name, variable]) => ({ name, constant: Boolean(variable.isConstant), ...this.describeValue(variable) }));
  }

  describeValue(variable) {
    if (variable.type === "vetor" || variable.type === "matriz") {
      return {
        type: variable.type,
        items: (variable.value ?? []).map((item) => this.describeValue(item)),
      };
    }

    return { type: variable.type, text: variable.value === undefined ? null : variable.toString() };
  }

  DEBUG(...args) {
    if (this.debug) {
      console.log(...args);
    }
  }

  getScope(baseScope) {
    return {
      variables: { ...baseScope.variables },
      functions: { ...baseScope.functions },
    };
  }

  // Ler uma variável no Java copia o valor: a expressão fica com o valor que ela
  // tinha naquele instante. Sem a cópia, tudo o que já foi lido continuaria
  // preso à variável e mudaria junto com ela — em 'escreva(r, ++r)' os dois
  // argumentos sairiam com o valor incrementado.
  value(variable) {
    // Vetores e matrizes viram arrays do Java, que são referências: quem lê um
    // deles fica com o mesmo array, e não com uma cópia dos elementos
    if (!(variable instanceof PortugolVar) || Array.isArray(variable.value)) {
      return variable;
    }

    // Ser constante é da variável, e não do valor: quem lê uma constante fica com
    // um valor comum, que pode ser alterado onde quer que ele vá parar — um
    // elemento de vetor, um parâmetro por valor...
    const copy = new PortugolVar(variable.type, variable.value);

    // O vínculo com a variável de origem sobrevive na cópia para que um
    // parâmetro por referência ainda alcance a variável de quem chamou
    copy.origin = variable;

    return copy;
  }

  // A variável de onde o valor foi lido, ou ele mesmo quando não veio de uma
  // variável — o resultado de uma conta, um literal...
  reference(value) {
    return value?.origin ?? value;
  }

  _raw(variable) {
    if (typeof variable === "object") {
      if (variable.hasOwnProperty("_value")) {
        return variable._;
      }
    }

    return variable;
  }

  declareFunction(name, call) {
    if (this.globalScope.functions.hasOwnProperty(name)) {
      throw new Error("Função já declarada: " + name);
    }

    this.globalScope.functions[name] = call;
    this.userFunctions.add(name);
  }

  async callFunction(name, functionScope = "", args = []) {
    let func;

    if (functionScope) {
      if (!this.globalScope.libAliases.hasOwnProperty(functionScope)) {
        throw new Error("Biblioteca não carregada: " + functionScope);
      }

      if (!this.libs[this.globalScope.libAliases[functionScope]].hasOwnProperty(name)) {
        throw new Error("Função '" + name + "' não existe na biblioteca '" + functionScope + "'");
      }

      func = this.libs[this.globalScope.libAliases[functionScope]][name];
    } else {
      if (!this.globalScope.functions.hasOwnProperty(name)) {
        throw new Error("Função não declarada: " + name);
      }

      func = this.globalScope.functions[name];
    }

    const last = this.currentFunction;

    this.currentFunction = name;

    // Na depuração, cada chamada de uma função do programa entra na pilha de chamadas
    // (uma função de biblioteca pode ter o nome de uma do programa, como 'Matematica.raiz')
    const frame = this.debugState && !functionScope && this.userFunctions.has(name) ? { id: ++this.frameCount, name, scope: null, params: null } : null;

    if (frame) {
      this.frames.push(frame);
    }

    // Depois da chamada, a posição volta a ser a de quem chamou: em 'x = f() / 0', o erro
    // é na linha da divisão, e não na do último comando de 'f'
    const line = this.line;
    const column = this.column;

    let ret;

    try {
      ret = await func(...args);
    } catch (error) {
      // O StackOverflowError do Java vira uma mensagem do Portugol Studio; aqui o
      // estouro chega como RangeError (Chrome, Safari) ou InternalError (Firefox)
      if (
        (error instanceof RangeError && error.message.includes("call stack")) ||
        (error?.name === "InternalError" && error.message.includes("too much recursion"))
      ) {
        throw new Error(${JSON.stringify(STACK_OVERFLOW_MESSAGE)}, { cause: error });
      }

      throw error;
    } finally {
      if (frame) {
        this.frames.pop();
      }
    }

    this.currentFunction = last;
    this.line = line;
    this.column = column;

    return ret;
  }

  // Uma posição de um vetor ('v[i]') ou de uma linha de matriz. Fora dele, o erro é o do
  // Portugol Studio
  item(vector, index) {
    const item = vector.value[index];

    if (item === undefined) {
      throw new Error(${JSON.stringify(INVALID_INDEX_MESSAGE)});
    }

    return item;
  }

  assign(args) {
    let initial = args.shift();

    if (typeof initial === "undefined") {
      throw new Error("Não é possível atribuir valor à uma variável não declarada");
    }

    while (args.length) {
      const arg = args.pop();
      this.DEBUG("assign", { initial, arg });

      if (typeof arg === "undefined") {
        throw new Error("Não é possível atribuir uma variável não declarada a uma variável declarada");
      }

      if (initial.type === "vazio") {
        throw new Error("Não é possível atribuir valor ao tipo vazio");
      }

      if (initial.isConstant) {
        throw new Error("Não é possível alterar o valor de uma constante");
      }

      const value = this.coerceToType(initial.type, arg.value, arg.type);

      initial.value = value;
      initial = arg;
    }

    this.DEBUG("assign.final", { initial });

    return initial;
  }

  loadLibrary(name, alias) {
    if (!this.libs.hasOwnProperty(name)) {
      throw new Error("Biblioteca não existe: " + name);
    }

    this.libs[name].__loadedAt = Date.now();
    this.globalScope.libAliases[alias || name] = name;
  }

  canCoerceType(from, to) {
    return (from === to || from === "inteiro" && to === "real" || from === "real" && to === "inteiro");
  }

  coerceToType(type, value, valueType) {
    if (valueType !== type && !this.canCoerceType(valueType, type)) {
      throw new Error("Tipos incompatíveis! Não é possível atribuir uma expressão do tipo '" + valueType + "' à uma expressão do tipo '" + type + "'.");
    }

    switch (type) {
      // Valores que já são números passam direto: NaN e Infinito são resultados
      // legítimos aqui, e só a conversão a partir de texto pode falhar
      case "inteiro": {
        // A conversão de real para inteiro segue o corte do Java, igual ao
        // usado por Tipos.real_para_inteiro
        if (typeof value === "number") {
          return PortugolVar.realToInt(value);
        }

        const result = parseInt(value, 10);

        if (isNaN(result)) {
          throw new Error("Tipos incompatíveis! Não é possível atribuir o valor '" + value + "' à uma expressão do tipo '" + type + "'.");
        }

        return result;
      }

      case "real": {
        if (typeof value === "number") {
          return value;
        }

        const result = parseFloat(value);

        if (isNaN(result)) {
          throw new Error("Tipos incompatíveis! Não é possível atribuir o valor '" + value + "' à uma expressão do tipo '" + type + "'.");
        }

        return result;
      }

      case "caracter":
        return String(value).charAt(0);

      case "cadeia":
        return String(value);

      case "logico":
        return Boolean(value);

      default:
        return value;
    }
  }

  concat(args) {
    this.DEBUG("concat.preinit", { args });

    let result = "";

    for (const arg of args) {
      result += arg.concatValue();
    }

    this.DEBUG("concat.finish", { result });
    return new PortugolVar("cadeia", result);
  }

  // O que foi digitado num 'leia'. Um valor de outro tipo, ou nenhum valor, para o programa
  // com o erro do Portugol Studio
  readValue(type, text) {
    const invalid = () => new Error(${JSON.stringify(INVALID_INPUT_MESSAGE)}.replace("%s", type));

    switch (type) {
      case "inteiro": {
        const parsed = PortugolVar.parseInteger32(text);

        if (parsed === null) {
          throw invalid();
        }

        return new PortugolVar("inteiro", parsed);
      }

      case "real": {
        const parsed = PortugolVar.parseReal(text);

        if (parsed === null) {
          throw invalid();
        }

        return new PortugolVar("real", parsed);
      }

      case "logico": {
        // O Portugol Studio aceita apenas 'verdadeiro' e 'falso' para o tipo lógico;
        // aqui a lista é maior para não penalizar quem digita na IDE
        const normalized = text.toLowerCase();

        if (!/^(sim|nao|não|true|false|verdadeiro|falso|s|y|n|0|1)$/.test(normalized)) {
          throw invalid();
        }

        return new PortugolVar("logico", ["sim", "true", "verdadeiro", "s", "y", "1"].includes(normalized));
      }

      case "caracter": {
        if (text === "") {
          throw invalid();
        }

        return new PortugolVar("caracter", text.charAt(0));
      }

      default:
        return new PortugolVar(type, text);
    }
  }

  isNumeric(type) {
    return type === "inteiro" || type === "real";
  }

  mathOperation(op, args) {
    this.DEBUG("mathOperation.preinit", { op, args });

    let result = args.shift().clone();

    this.DEBUG("mathOperation.init", { op, args, result });

    const isAddition = op === "+";

    while (args.length) {
      let arg = args.shift().clone();
      this.DEBUG("mathOperation.ongoing", { arg, result });

      if (isAddition && (result.type === "cadeia" || arg.type === "cadeia")) {
        return this.concat([result, arg, ...args]);
      }

      // Entre dois caracteres o '+' soma os códigos, como o char do Java
      if (isAddition && result.type === "caracter" && arg.type === "caracter") {
        result.value = result.value.charCodeAt(0) + arg.value.charCodeAt(0);
        result.type = "inteiro";
        continue;
      }

      // Somado a um número, o 'caracter' também vira o seu código, dos dois lados
      if (isAddition && result.type === "caracter" && this.isNumeric(arg.type)) {
        result.value = result.value.charCodeAt(0);
        result.type = "inteiro";
      }

      if (isAddition && arg.type === "caracter" && this.isNumeric(result.type)) {
        arg.value = arg.value.charCodeAt(0);
        arg.type = "inteiro";
      }

      if (!this.isNumeric(result.type) || !this.isNumeric(arg.type)) {
        const mathOpDesc = {
          "+": ["somar", "à"],
          "-": ["subtrair", "de"],
          "*": ["multiplicar", "por"],
          "/": ["dividir", "por"],
          "%": ["obter o módulo entre", "e"],
        };

        const [verb, preposition] = mathOpDesc[op];

        throw new Error("Tipos incompatíveis! Não é possível " + verb + " uma expressão do tipo '" + result.type + "' (" + result.toString() + ") " + preposition + " uma expressão do tipo '" + arg.type + "' (" + arg.toString() + ").");
      }

      const bothIntegers = result.type === "inteiro" && arg.type === "inteiro";

      switch (op) {
        case "+":
          result.value += arg.value;
          break;

        case "-":
          result.value -= arg.value;
          break;

        case "*":
          // O Math.imul() multiplica em 32 bits sem perder precisão no caminho,
          // como a multiplicação entre inteiros do Java
          result.value = bothIntegers ? Math.imul(result.value, arg.value) : result.value * arg.value;
          break;

        case "/":
          if (bothIntegers) {
            if (arg.value === 0) {
              throw new Error("Foi efetuada uma divisão por zero.");
            }

            result.value = Math.trunc(result.value / arg.value);
          } else {
            result.value /= arg.value;
          }

          break;

        case "%":
          if (bothIntegers && arg.value === 0) {
            throw new Error("Foi efetuada uma divisão por zero.");
          }

          result.value %= arg.value;
          break;

        default:
          throw new Error("Operação matemática inválida: " + op);
      }

      if (bothIntegers) {
        // O 'inteiro' do Portugol tem 32 bits e transborda como o int do Java
        result.value |= 0;
      } else {
        result.type = "real";
      }
    }

    this.DEBUG("mathOperation.finish", { result });
    return result;
  }

  bitwiseOperation(op, args) {
    this.DEBUG("bitwiseOperation.preinit", { op, args });

    let result = args.shift().clone();

    this.DEBUG("bitwiseOperation.init", { op, args, result });

    while (args.length) {
      let arg = args.shift().clone();
      this.DEBUG("bitwiseOperation.ongoing", { arg, result });

      if (arg.type !== "inteiro" || result.type !== "inteiro") {
        const bitwiseOpDesc = {
          "&": ["fazer uma operação bitwise AND (&) em", "para"],
          "|": ["fazer uma operação bitwise OR (|) em", "para"],
          "^": ["fazer uma operação bitwise XOR (^) em", "para"],
          ">>": ["deslocar os bits para a direita de", "para"],
          "<<": ["deslocar os bits para a esquerda de", "para"],
        };

        const [verb, preposition] = bitwiseOpDesc[op];

        throw new Error("Tipos incompatíveis! Não é possível " + verb + " uma expressão do tipo '" + result.type + "' (" + result.toString() + ") " + preposition + " uma expressão do tipo '" + arg.type + "' (" + arg.toString() + ").");
      }

      switch (op) {
        case "&":
          result.value = result.value & arg.value;
          break;

        case "|":
          result.value = result.value | arg.value;
          break;

        case "^":
          result.value = result.value ^ arg.value;
          break;

        case ">>":
          result.value = result.value >> arg.value;
          break;

        case "<<":
          result.value = result.value << arg.value;
          break;

        default:
          throw new Error("Operação bitwise inválida: " + op);
      }
    }

    this.DEBUG("bitwiseOperation.finish", { result });
    return result;
  }

  applyModifier(mod, item) {
    this.DEBUG("applyModifier.init", { mod, item });
    const result = item.clone();

    switch (mod) {
      case "+":
        result.value = +item.value;
        break;

      case "-":
        // O tipo 'inteiro' tem 32 bits, então -(-2147483648) volta a ser negativo
        result.value = item.type === "inteiro" ? -item.value | 0 : -item.value;
        break;

      case "!":
        result.value = !item.value;
        break;

      case "~":
        result.value = ~item.value;
        break;

      default:
        throw new Error("Modificador inválido: " + mod);
    }

    this.DEBUG("applyModifier.finish", { result });
    return result;
  }

  // O Portugol Studio compila 'a == b' entre cadeias como
  // ((a != null) ? a : "").equals(b), o que torna a comparação assimétrica
  // quando um dos lados é uma cadeia nula
  equals(a, b) {
    if (a.type === "cadeia" || b.type === "cadeia") {
      return (a.value ?? "") === b.value;
    }

    return a.value === b.value;
  }

  expectType(fn, param, obj, ...types) {
    // O Portugol Studio trunca um 'real' passado a um parâmetro 'inteiro' da
    // biblioteca, com o (int) do Java. O argumento é sempre uma cópia, vide value()
    if (obj?.type === "real" && typeof obj.value === "number" && types.includes("inteiro") && !types.includes("real")) {
      obj.type = "inteiro";
      obj.value = PortugolVar.realToInt(obj.value);
    }

    if (!obj || !types.includes(obj.type) || obj.value === undefined) {
      let multipleTypesPlural = types.length > 1 ? "s" : "";
      throw new Error("Tipos incompatíveis! O parâmetro '" + param + "' da função '" + fn + "' espera uma expressão do" + multipleTypesPlural + " tipo" + multipleTypesPlural + " " + types.map((c) => "'" + c + "'").join(" ou ") + (obj?.value === undefined ? " com valor" : "") + ", mas foi passada uma expressão do tipo '" + (obj?.type ?? "vazio") + "'" + (obj?.value === undefined ? " vazia" : ""));
    }
  }

  checkArraySize(arr, expectedLength, name) {
    const items = arr.value;

    if (!Array.isArray(items)) {
      return;
    }

    if (expectedLength > 0 && items.length > expectedLength) {
      throw new Error("Você está atribuindo um conjunto de valores (tamanho: " + items.length + ") maior que o tamanho do vetor (" + expectedLength + "): " + name);
    }
  }

  checkMatrixSize(matriz, expectedRows, expectedCols, name) {
    const rows = matriz.value;

    if (!Array.isArray(rows)) {
      return;
    }

    if (expectedRows > 0 && rows.length > expectedRows) {
      throw new Error("Você está atribuindo um conjunto de linhas (tamanho: " + rows.length + ") maior que o tamanho da matriz (" + expectedRows + "): " + name);
    }

    if (expectedCols > 0) {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row && Array.isArray(row.value) && row.value.length > expectedCols) {
          throw new Error("Você está atribuindo um conjunto de colunas (tamanho: " + row.value.length + ") na " + (i + 1) + "ª linha maior que o tamanho da matriz (" + expectedCols + "): " + name);
        }
      }
    }
  }

  checkParams(args, params) {
    if (args.length != params.length) {
      throw new Error("Número de parâmetros inválido! A função '" + this.currentFunction + "' espera " + params.length + " parâmetro" + (params.length > 1 ? "s" : "") + ", mas fo" + (args.length > 1 ? "ram" : "i") + " passado" + (args.length > 1 ? "s" : "") + " " + args.length + ".");
    }

    for (let i = 0; i < args.length; i++) {
      // Um 'inteiro' é convertido automaticamente quando o parâmetro é 'real',
      // mas não em parâmetro por referência, que é vinculado sem conversão
      const compatible =
        args[i].type === params[i].type ||
        (!params[i].reference && params[i].type === "real" && args[i].type === "inteiro");

      if (!compatible) {
        throw new Error("Tipos incompatíveis! O " + (i + 1) + "º parâmetro da função '" + this.currentFunction + "', '" + params[i].name + "', espera uma expressão do tipo '" + params[i].type + "', mas foi passada uma expressão do tipo '" + args[i].type + "'.");
      }
    }
  }

  paramValue(type, arg) {
    if (arg.type === type) {
      return arg.clone();
    }

    return new PortugolVar(type, this.coerceToType(type, arg.value, arg.type));
  }

  returnValue(type, value) {
    if (!type || type === "vazio" || !value || value.type === type) {
      return value;
    }

    return new PortugolVar(type, this.coerceToType(type, value.value, value.type));
  }

  // Como no Portugol Studio, a superfície de desenho existe desde o início do
  // programa: desenhos e cores antes do 'iniciar_modo_grafico' só ficam na fila
  getGraphicsContext() {
    if (!self.graphics) {
      self.graphics = new PortugolGraphicsContext();
    }

    return self.graphics;
  }

  // As funções da janela exigem o modo gráfico iniciado
  assertGraphicsContext() {
    if (!self.graphics?.initialized) {
      throw new Error("O modo gráfico não foi inicializado");
    }
  }

  // O 'renderizar', o 'limpar' e as de texto exigem que a janela tenha sido
  // criada alguma vez, mesmo que o modo gráfico já tenha sido encerrado
  assertGraphicsSurface() {
    if (!self.graphics?.canvas) {
      throw new Error("O modo gráfico não foi inicializado");
    }
  }

  postMessage(message) {
    message.id = Math.random().toString(36).substr(2, 9);

    self.postMessage({
      type: "message",
      message,
    });
  }

  postMessageAndWaitForResponse(message) {
    this.postMessage(message);
    return this.waitForMessageResponse(message);
  }

  async waitForMessageResponse(message) {
    const controller = new AbortController();
    const signal = controller.signal;

    const result = await new Promise((resolve) => {
      self.addEventListener("message", (receivedMessage) => {
        if (
          receivedMessage.data &&
          receivedMessage.data.type === "message-reply" &&
          receivedMessage.data.id === message.id
        ) {
          controller.abort();
          resolve(receivedMessage.data.result);
        }
      }, { signal });
    });

    return result;
  }

  unimplementedMethod(methodName, library) {
    throw new Error("O método '" + methodName + "'" + (library ? " da biblioteca '" + library + "'" : "") + " ainda não foi implementado e não pode ser chamado.");
  }
}
//endregion
`;
