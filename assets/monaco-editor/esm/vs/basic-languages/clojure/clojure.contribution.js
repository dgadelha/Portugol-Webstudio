/*!-----------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Version: 0.54.0(7c2310116c57517348bbd868a21139f32454be22)
 * Released under the MIT license
 * https://github.com/microsoft/monaco-editor/blob/main/LICENSE.txt
 *-----------------------------------------------------------------------------*/


// src/basic-languages/clojure/clojure.contribution.ts
import { registerLanguage } from "../_.contribution.js";
registerLanguage({
  id: "clojure",
  extensions: [".clj", ".cljs", ".cljc", ".edn"],
  aliases: ["clojure", "Clojure"],
  loader: () => {
    if (false) {
      return new Promise((resolve, reject) => {
        __require(["vs/basic-languages/clojure/clojure"], resolve, reject);
      });
    } else {
      return import("./clojure.js");
    }
  }
});
