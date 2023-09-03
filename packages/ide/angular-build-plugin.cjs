module.exports = {
  default: {
    pre() {},
    post() {},
    config(cfg) {
      for (const it of cfg.optimization.minimizer) {
        if (it.constructor.name === "JavaScriptOptimizerPlugin") {
          it.options.keepIdentifierNames = true;
        }
      }

      return cfg;
    },
  },
};
