define("vs/language/json/monaco.contribution", ["require", "exports", "../../editor.api-BhD7pWdi"], (function(require, exports, editor_api) {
  "use strict";
  class LanguageServiceDefaultsImpl {
    constructor(languageId, diagnosticsOptions, modeConfiguration) {
      this._onDidChange = new editor_api.Emitter();
      this._languageId = languageId;
      this.setDiagnosticsOptions(diagnosticsOptions);
      this.setModeConfiguration(modeConfiguration);
    }
    get onDidChange() {
      return this._onDidChange.event;
    }
    get languageId() {
      return this._languageId;
    }
    get modeConfiguration() {
      return this._modeConfiguration;
    }
    get diagnosticsOptions() {
      return this._diagnosticsOptions;
    }
    setDiagnosticsOptions(options) {
      this._diagnosticsOptions = options || /* @__PURE__ */ Object.create(null);
      this._onDidChange.fire(this);
    }
    setModeConfiguration(modeConfiguration) {
      this._modeConfiguration = modeConfiguration || /* @__PURE__ */ Object.create(null);
      this._onDidChange.fire(this);
    }
  }
  const diagnosticDefault = {
    validate: true,
    allowComments: true,
    schemas: [],
    enableSchemaRequest: false,
    schemaRequest: "warning",
    schemaValidation: "warning",
    comments: "error",
    trailingCommas: "error"
  };
  const modeConfigurationDefault = {
    documentFormattingEdits: true,
    documentRangeFormattingEdits: true,
    completionItems: true,
    hovers: true,
    documentSymbols: true,
    tokens: true,
    colors: true,
    foldingRanges: true,
    diagnostics: true,
    selectionRanges: true
  };
  const jsonDefaults = new LanguageServiceDefaultsImpl(
    "json",
    diagnosticDefault,
    modeConfigurationDefault
  );
  const getWorker = () => getMode().then((mode2) => mode2.getWorker());
  editor_api.languages.json = { jsonDefaults, getWorker };
  function getMode() {
    {
      return new Promise((resolve, reject) => require(["../../jsonMode-KHMzkiG2"], resolve, reject));
    }
  }
  editor_api.languages.register({
    id: "json",
    extensions: [".json", ".bowerrc", ".jshintrc", ".jscsrc", ".eslintrc", ".babelrc", ".har"],
    aliases: ["JSON", "json"],
    mimetypes: ["application/json"]
  });
  editor_api.languages.onLanguage("json", () => {
    getMode().then((mode2) => mode2.setupMode(jsonDefaults));
  });
  exports.getWorker = getWorker;
  exports.jsonDefaults = jsonDefaults;
  Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
}));
