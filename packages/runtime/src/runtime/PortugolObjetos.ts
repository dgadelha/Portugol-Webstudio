export const portugolObjetos = /* javascript */ `
// Porta as classes Objeto e CacheObjetos do Portugol Studio, que usam o Jackson
// para ler JSON/XML e um HashMap/ArrayList do Java para guardar as propriedades.
// Cada valor é etiquetado com o tipo Java correspondente porque a biblioteca
// Objetos faz verificações de 'instanceof' estritas ao ler uma propriedade.
class PortugolObjeto {
  static NULO = { tipo: "nulo" };

  static LITERAIS_JSON = [
    ["true", { tipo: "logico", valor: true }],
    ["false", { tipo: "logico", valor: false }],
    ["null", PortugolObjeto.NULO],
  ];

  // Expressões ancoradas (flag 'y') evitam copiar o resto do documento a cada valor
  static PADRAO_NUMERO_JSON = /-?(?:0|[1-9]\\d*)(\\.\\d+)?([eE][+-]?\\d+)?/y;

  static PADRAO_TAG_XML = /<\\s*([^\\s/>]+)((?:[^>"']|"[^"]*"|'[^']*')*?)(\\/?)>/y;

  static PADRAO_FECHAMENTO_XML = /<\\/\\s*([^\\s>]+)\\s*>/y;

  static PADRAO_ENTIDADE_XML = /&(?:(#[0-9]+|#[xX][0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);)?/g;

  // Um objeto criado por criar_objeto() usa um HashMap, cuja ordem de iteração
  // segue o hash das chaves. Um objeto vindo de JSON/XML usa um LinkedHashMap,
  // que preserva a ordem de inserção.
  constructor(propriedades = new Map(), ordenarPorHash = false) {
    // O readValue() do Jackson devolve null para o JSON "null", e o objeto fica
    // com o mapa interno nulo — qualquer acesso a ele derruba o programa
    this.propriedades = propriedades;
    this.ordenarPorHash = ordenarPorHash;
  }

  mapa() {
    if (this.propriedades === null) {
      throw new Error("O objeto não foi construído corretamente e não possui propriedades");
    }

    return this.propriedades;
  }

  static hashJava(texto) {
    let hash = 0;

    for (let i = 0; i < texto.length; i++) {
      hash = (Math.imul(31, hash) + texto.charCodeAt(i)) | 0;
    }

    return hash;
  }

  // Reproduz a ordem de iteração de um HashMap do Java: os baldes são
  // percorridos em ordem crescente e, dentro de cada balde, vale a ordem de
  // inserção. A capacidade dobra sempre que o tamanho passa de 75% dela.
  static ordemHashMap(chaves) {
    let capacidade = 16;

    while (chaves.length > capacidade * 0.75) {
      capacidade *= 2;
    }

    const baldes = new Map();

    for (const chave of chaves) {
      const hash = PortugolObjeto.hashJava(chave);
      const indice = (hash ^ (hash >>> 16)) & (capacidade - 1);

      if (!baldes.has(indice)) {
        baldes.set(indice, []);
      }

      baldes.get(indice).push(chave);
    }

    return [...baldes.keys()].sort((a, b) => a - b).flatMap((indice) => baldes.get(indice));
  }

  chaves() {
    const chaves = [...this.mapa().keys()];

    return this.ordenarPorHash ? PortugolObjeto.ordemHashMap(chaves) : chaves;
  }

  contemPropriedade(propriedade) {
    return this.mapa().has(propriedade);
  }

  atribuirPropriedade(propriedade, valor) {
    this.mapa().set(propriedade, valor);
  }

  static erroTipoIncompativel() {
    throw new Error("O tipo da propriedade informada não corresponde ao tipo identificado na função.\\nAltere a função de chamada para o tipo correto.");
  }

  // Reproduz o criarMensagemPropriedadeInexistente(), incluindo o corte dos dois
  // últimos caracteres quando a mensagem final contém uma vírgula
  erroPropriedadeInexistente(propriedade) {
    let texto = "O objeto não contém a propriedade " + propriedade;
    const chaves = this.chaves();

    if (chaves.length > 0) {
      texto += ". \\nVocê pode acessar as seguintes propriedades: ";

      for (const chave of chaves) {
        texto += chave + ", ";
      }
    }

    if (texto.includes(",")) {
      texto = texto.slice(0, -2);
    }

    throw new Error(texto);
  }

  obterPropriedade(propriedade) {
    if (!this.mapa().has(propriedade)) {
      this.erroPropriedadeInexistente(propriedade);
    }

    return this.propriedades.get(propriedade);
  }

  // Os leitores exigem o tipo Java exato, como no Objeto.java
  static como(valor, tipo) {
    return valor && valor.tipo === tipo ? valor.valor : PortugolObjeto.erroTipoIncompativel();
  }

  // Um Character do Java não é String, então um 'caracter' gravado por
  // atribuir_propriedade não é aceito aqui — apenas cadeias de verdade
  static comoCaracter(valor) {
    const cadeia = PortugolObjeto.como(valor, "cadeia");

    // O charAt(0) do Java estoura numa cadeia vazia, derrubando o programa
    if (cadeia === "") {
      throw new Error("A propriedade informada está vazia e não corresponde a um caracter");
    }

    return cadeia.charAt(0);
  }

  static obterVetor(cache, endereco, propriedade) {
    const valor = cache.obterObjeto(endereco).obterPropriedade(propriedade);

    if (!valor || valor.tipo !== "vetor") {
      throw new Error('A propriedade "' + propriedade + '" não é um vetor.');
    }

    return valor.valor;
  }

  static obterEmVetor(cache, endereco, propriedade, indice) {
    const vetor = PortugolObjeto.obterVetor(cache, endereco, propriedade);

    if (indice < 0 || indice > vetor.length - 1) {
      throw new Error(
        "Você tentou acessar um índice de vetor inválido.\\n" +
        "O índice deve ser menor que o número de elementos que o vetor possui.\\n" +
        "Por exemplo, se foi declarado um vetor com 5 elementos (inteiro vetor[5]), o maior índice possível é 4.\\n" +
        "Além disso, o índice de um vetor não pode ser negativo.",
      );
    }

    return vetor[indice];
  }

  // Reproduz o writerWithDefaultPrettyPrinter() do Jackson: objetos quebram
  // linha com dois espaços por nível e usam " : ", enquanto vetores ficam em
  // uma única linha. Vetores não contam como nível de indentação.
  static serializar(valor, nivel = 0) {
    if (!valor || valor.tipo === "nulo") {
      return "null";
    }

    switch (valor.tipo) {
      case "cadeia":
      case "caracter":
        return JSON.stringify(valor.valor);

      case "logico":
        return valor.valor ? "true" : "false";

      case "real": {
        const real = PortugolVar.realToString(valor.valor);

        // O Jackson escreve NaN e Infinity entre aspas, já que não são JSON válido
        return Number.isFinite(valor.valor) ? real : JSON.stringify(real);
      }

      case "inteiro":
      case "longo":
        return String(valor.valor);

      case "vetor": {
        if (valor.valor.length === 0) {
          return "[ ]";
        }

        return "[ " + valor.valor.map((item) => PortugolObjeto.serializar(item, nivel)).join(", ") + " ]";
      }

      case "objeto": {
        const objeto = valor.valor;

        if (objeto.propriedades === null) {
          return "null";
        }

        const chaves = objeto.chaves();

        if (chaves.length === 0) {
          return "{ }";
        }

        const dentro = "  ".repeat(nivel + 1);
        const fora = "  ".repeat(nivel);

        const entradas = chaves.map(
          (chave) => dentro + JSON.stringify(chave) + " : " + PortugolObjeto.serializar(objeto.propriedades.get(chave), nivel + 1),
        );

        return "{\\n" + entradas.join(",\\n") + "\\n" + fora + "}";
      }

      default:
        return "null";
    }
  }

  // O Jackson distingue inteiros de reais pela forma do literal: um número com
  // ponto ou expoente vira Double, os demais viram Integer (ou Long, quando não
  // cabem em 32 bits, o que os torna ilegíveis pela biblioteca Objetos).
  static lerJson(texto) {
    const leitor = { texto, pos: 0 };

    try {
      PortugolObjeto.pularEspacos(leitor);

      const valor = PortugolObjeto.lerValorJson(leitor);

      PortugolObjeto.pularEspacos(leitor);

      if (leitor.pos !== texto.length) {
        return new PortugolObjeto();
      }

      // Só o JSON "null" desserializa com sucesso para algo que não é um mapa;
      // os demais valores não-objeto quebram o readValue() e viram um mapa vazio
      if (valor.tipo === "nulo") {
        return new PortugolObjeto(null);
      }

      return valor.tipo === "objeto" ? valor.valor : new PortugolObjeto();
    } catch {
      // O Jackson devolve um mapa vazio quando o conteúdo não pode ser lido
      return new PortugolObjeto();
    }
  }

  static pularEspacos(leitor) {
    while (leitor.pos < leitor.texto.length && " \\t\\n\\r".includes(leitor.texto.charAt(leitor.pos))) {
      leitor.pos++;
    }
  }

  static lerValorJson(leitor) {
    const caracter = leitor.texto.charAt(leitor.pos);

    if (caracter === "{") {
      return { tipo: "objeto", valor: PortugolObjeto.lerObjetoJson(leitor) };
    }

    if (caracter === "[") {
      return { tipo: "vetor", valor: PortugolObjeto.lerVetorJson(leitor) };
    }

    if (caracter === '"') {
      return { tipo: "cadeia", valor: PortugolObjeto.lerTextoJson(leitor) };
    }

    for (const [literal, valor] of PortugolObjeto.LITERAIS_JSON) {
      if (leitor.texto.startsWith(literal, leitor.pos)) {
        leitor.pos += literal.length;
        return valor;
      }
    }

    return PortugolObjeto.lerNumeroJson(leitor);
  }

  static lerObjetoJson(leitor) {
    const objeto = new PortugolObjeto();

    leitor.pos++;
    PortugolObjeto.pularEspacos(leitor);

    if (leitor.texto.charAt(leitor.pos) === "}") {
      leitor.pos++;
      return objeto;
    }

    for (;;) {
      PortugolObjeto.pularEspacos(leitor);

      const chave = PortugolObjeto.lerTextoJson(leitor);

      PortugolObjeto.pularEspacos(leitor);

      if (leitor.texto.charAt(leitor.pos) !== ":") {
        throw new Error("JSON inválido");
      }

      leitor.pos++;
      PortugolObjeto.pularEspacos(leitor);
      objeto.atribuirPropriedade(chave, PortugolObjeto.lerValorJson(leitor));
      PortugolObjeto.pularEspacos(leitor);

      const separador = leitor.texto.charAt(leitor.pos++);

      if (separador === "}") {
        return objeto;
      }

      if (separador !== ",") {
        throw new Error("JSON inválido");
      }
    }
  }

  static lerVetorJson(leitor) {
    const itens = [];

    leitor.pos++;
    PortugolObjeto.pularEspacos(leitor);

    if (leitor.texto.charAt(leitor.pos) === "]") {
      leitor.pos++;
      return itens;
    }

    for (;;) {
      PortugolObjeto.pularEspacos(leitor);
      itens.push(PortugolObjeto.lerValorJson(leitor));
      PortugolObjeto.pularEspacos(leitor);

      const separador = leitor.texto.charAt(leitor.pos++);

      if (separador === "]") {
        return itens;
      }

      if (separador !== ",") {
        throw new Error("JSON inválido");
      }
    }
  }

  static lerTextoJson(leitor) {
    if (leitor.texto.charAt(leitor.pos) !== '"') {
      throw new Error("JSON inválido");
    }

    const inicio = leitor.pos++;

    while (leitor.pos < leitor.texto.length) {
      const caracter = leitor.texto.charAt(leitor.pos);

      if (caracter === "\\\\") {
        leitor.pos += 2;
        continue;
      }

      leitor.pos++;

      if (caracter === '"') {
        return JSON.parse(leitor.texto.slice(inicio, leitor.pos));
      }
    }

    throw new Error("JSON inválido");
  }

  static lerNumeroJson(leitor) {
    PortugolObjeto.PADRAO_NUMERO_JSON.lastIndex = leitor.pos;

    const encontrado = PortugolObjeto.PADRAO_NUMERO_JSON.exec(leitor.texto);

    if (!encontrado) {
      throw new Error("JSON inválido");
    }

    leitor.pos = PortugolObjeto.PADRAO_NUMERO_JSON.lastIndex;

    if (encontrado[1] || encontrado[2]) {
      return { tipo: "real", valor: Number(encontrado[0]) };
    }

    // Fora da faixa de 32 bits o Jackson devolve um Long, que a biblioteca
    // Objetos não reconhece como inteiro. O BigInt guarda os dígitos originais,
    // que um Number perderia acima de 2^53.
    const inteiro = BigInt(encontrado[0]);

    if (inteiro >= -2147483648n && inteiro <= 2147483647n) {
      return { tipo: "inteiro", valor: Number(inteiro) };
    }

    return { tipo: "longo", valor: inteiro };
  }

  // O Portugol Studio converte o XML em JSON com o XmlMapper antes de montar o
  // objeto. Na prática: todo valor vira texto, atributos viram propriedades,
  // elementos repetidos se sobrescrevem e elementos vazios viram nulo.
  static lerXml(texto) {
    try {
      const leitor = { texto: texto.replace(/<\\?[^]*?\\?>|<!--[^]*?-->/g, ""), pos: 0 };

      PortugolObjeto.pularEspacos(leitor);

      const raiz = PortugolObjeto.lerElementoXml(leitor);

      if (!raiz || raiz.conteudo.tipo !== "objeto") {
        return new PortugolObjeto();
      }

      return raiz.conteudo.valor;
    } catch {
      return new PortugolObjeto();
    }
  }

  // O XmlMapper resolve as entidades antes de expor o valor
  static decodificarEntidades(texto) {
    return texto.replace(PortugolObjeto.PADRAO_ENTIDADE_XML, (entidade, nome) => {
      const nomeadas = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

      // Um '&' solto ou uma entidade desconhecida invalidam o documento inteiro
      if (nome === undefined) {
        throw new Error("XML inválido");
      }

      if (nomeadas[nome] !== undefined) {
        return nomeadas[nome];
      }

      if (nome.charAt(0) === "#") {
        return String.fromCodePoint(
          nome.charAt(1) === "x" || nome.charAt(1) === "X" ? parseInt(nome.slice(2), 16) : Number(nome.slice(1)),
        );
      }

      // Uma entidade desconhecida invalida o documento inteiro no XmlMapper
      throw new Error("XML inválido");
    });
  }

  static lerElementoXml(leitor) {
    if (leitor.texto.charAt(leitor.pos) !== "<") {
      throw new Error("XML inválido");
    }

    PortugolObjeto.PADRAO_TAG_XML.lastIndex = leitor.pos;

    const abertura = PortugolObjeto.PADRAO_TAG_XML.exec(leitor.texto);

    if (!abertura) {
      throw new Error("XML inválido");
    }

    const [tagCompleta, nome, atributosTexto, autoFechada] = abertura;

    leitor.pos += tagCompleta.length;

    const atributos = new Map();
    const filhos = new Map();
    const expressaoAtributos = /([^\\s=]+)\\s*=\\s*"([^"]*)"|([^\\s=]+)\\s*=\\s*'([^']*)'/g;
    let atributo;

    while ((atributo = expressaoAtributos.exec(atributosTexto)) !== null) {
      atributos.set(atributo[1] ?? atributo[3], {
        tipo: "cadeia",
        valor: PortugolObjeto.decodificarEntidades(atributo[2] ?? atributo[4]),
      });
    }

    let texto = "";

    if (!autoFechada) {
      for (;;) {
        const proximo = leitor.texto.indexOf("<", leitor.pos);

        if (proximo === -1) {
          throw new Error("XML inválido");
        }

        // Só o texto anterior ao primeiro filho é aproveitado; o XmlMapper
        // descarta os trechos que aparecem entre os filhos ou depois deles
        if (filhos.size === 0) {
          texto += PortugolObjeto.decodificarEntidades(leitor.texto.slice(leitor.pos, proximo));
        }

        leitor.pos = proximo;

        if (leitor.texto.startsWith("</", leitor.pos)) {
          PortugolObjeto.PADRAO_FECHAMENTO_XML.lastIndex = leitor.pos;

          const fechamento = PortugolObjeto.PADRAO_FECHAMENTO_XML.exec(leitor.texto);

          if (!fechamento || fechamento[1] !== nome) {
            throw new Error("XML inválido");
          }

          leitor.pos += fechamento[0].length;
          break;
        }

        const filho = PortugolObjeto.lerElementoXml(leitor);

        // Elementos repetidos se sobrescrevem, como no readTree() do XmlMapper
        filhos.set(filho.nome, filho.conteudo);
      }
    }

    if (atributos.size === 0 && filhos.size === 0) {
      // Um elemento sem atributos e sem filhos vira o seu texto, sem qualquer
      // corte de espaços. Já um elemento auto-fechado vira nulo.
      return { nome, conteudo: autoFechada ? PortugolObjeto.NULO : { tipo: "cadeia", valor: texto } };
    }

    const objeto = new PortugolObjeto(atributos);

    if (texto.trim() !== "") {
      objeto.atribuirPropriedade("", { tipo: "cadeia", valor: texto });
    }

    for (const [chave, valor] of filhos) {
      objeto.atribuirPropriedade(chave, valor);
    }

    return { nome, conteudo: { tipo: "objeto", valor: objeto } };
  }

}

// Porta o CacheObjetos: uma lista simples em que o endereço é o índice. Liberar
// um objeto remove o elemento e desloca os endereços seguintes.
class PortugolCacheObjetos {
  objetos = [];

  criarObjeto(objeto) {
    this.objetos.push(objeto);

    return this.objetos.length - 1;
  }

  obterObjeto(endereco) {
    if (endereco < 0 || endereco >= this.objetos.length) {
      throw new Error("O endereço de memória especificado não aponta para um objeto");
    }

    return this.objetos[endereco];
  }

  liberarObjeto(endereco) {
    this.obterObjeto(endereco);
    this.objetos.splice(endereco, 1);
  }

  liberar() {
    this.objetos = [];
  }
}
`;
