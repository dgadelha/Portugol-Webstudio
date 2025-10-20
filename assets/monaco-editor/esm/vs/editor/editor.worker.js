/*!-----------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Version: 0.54.0(7c2310116c57517348bbd868a21139f32454be22)
 * Released under the MIT license
 * https://github.com/microsoft/monaco-editor/blob/main/LICENSE.txt
 *-----------------------------------------------------------------------------*/


// src/common/initialize.ts
import * as worker from "./editor.worker.start";
var initialized = false;
function isWorkerInitialized() {
  return initialized;
}
function initialize(callback) {
  initialized = true;
  self.onmessage = (m) => {
    worker.start((ctx) => {
      return callback(ctx, m.data);
    });
  };
}

// src/editor/editor.worker.ts
import * as worker2 from "./editor.worker.start";
self.onmessage = () => {
  if (!isWorkerInitialized()) {
    worker2.start(() => {
      return {};
    });
  } else {
  }
};
export {
  initialize
};
