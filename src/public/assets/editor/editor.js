let running = false;
let editor;
let input = "";
let output;
let socket;

function scrollDown() {
  const r = output.session.getLength() - 1;
  const c = output.session.getLine(r).length;

  output.gotoLine(r + 1, c);
}

$(window).bind("load", () => {
  $("#splash").slideUp(300, function () {
    $(this).remove();
  });

  editor = ace.edit("editor");
  editor.$blockScrolling = Infinity;
  editor.setTheme("ace/theme/portugol");
  editor.setFontSize(14);
  editor.getSession().setMode("ace/mode/portugol");
  editor.setShowPrintMargin(false);
  editor.getSession().setUseSoftTabs(true);

  let found = false;

  if (ecid != "") {
    if (window.parent.portugol.codes[ecid]) {
      found = true;
      editor.getSession().setValue(window.parent.portugol.codes[ecid]);
      delete window.parent.portugol.codes[ecid];
    }
  }

  if (!found) {
    editor.getSession().setValue("programa {\n\tfuncao inicio() {\n\t\t\n\t}\n}\n");
    editor.gotoLine(3);
    editor.selection.moveTo(2, 2);
  }

  output = ace.edit("output");
  output.$blockScrolling = Infinity;
  output.setTheme("ace/theme/portugol");
  output.setFontSize(14);
  output.getSession().setMode("ace/mode/text");
  output.getSession().setValue("");
  output.setShowPrintMargin(false);
  output.renderer.setShowGutter(false);
  output.setReadOnly(true);
  output.selection.moveTo(0, 2);
  output.keyBinding.addKeyboardHandler({
    handleKeyboard: function (_data, hash, keyString, keyCode, event) {
      console.log(`handleKeyboard(hash = '${hash}', keyString = '${keyString}', keyCode = '${keyCode}')`);

      if (!running) {
        console.log("-> Evento de Keyboard IGNORADO - o programa não está em execução!");
        return null;
      }

      if (keyCode == 13 || keyString == "return") {
        /*
         * enter
         * Enviar os dados de input pro socket
         */
        if (input != "") {
          console.log(`Input: ${input}`);
          socket.emit("response", `${input.trim()}\r`);
          output.getSession().setValue(`${output.getSession().getValue()}\n`);
          scrollDown();
        }
      } else if (keyCode == 8 || keyString == "backspace") {
        // backspace
        if (input.length >= 1) {
          input = input.substring(0, input.length - 1);
          output.getSession().setValue(
            output
              .getSession()
              .getValue()
              .substring(0, output.getSession().getValue().length - 1),
          );
          scrollDown();
        }
      } else if (typeof event === "undefined" && !event) {
        if (keyString != "" && keyString != "\n" && keyString != "\r\n" && keyString != "\r") {
          input += keyString;
          output.getSession().setValue(output.getSession().getValue() + keyString);
          scrollDown();
        } else {
          /*
           * @TODO: keyCode -> HEX
           * input += "\xHEX";
           */
          console.log("-> Evento de Keyboard IGNORADO - keyString vazia e suporte a HEX não concluído");
        }

        return { command: "null" };
      }
    },
  });

  socket = io(`${location.protocol}//${document.domain}:${location.port}`);

  socket.on("output", data => {
    console.log(`socket.onOutput: ${data}`);

    if (input != "" && data.indexOf(input) > -1) {
      console.log("Ajeitando output...");
      data = data.substring(input.length + 2);
      input = "";
      console.log(`Output novo: ${data}`);
    }

    if (data.includes("~|^!+LIMPAR+!^|~")) {
      data = data.substring(data.indexOf("~|^!+LIMPAR+!^|~") + 16);
      output.getSession().setValue("");
    }

    output.getSession().setValue(output.getSession().getValue() + data);
    scrollDown();
  });

  socket.on("hide-response", data => {
    console.log(`socket.onHideResponse: ${data}`);
    running = false;
    output.setReadOnly(true);
    editor.setReadOnly(false);
    $("#submit-btn").removeAttr("disabled");
    $("#stop-btn").attr("disabled", "disabled");
    scrollDown();
  });

  socket.on("show-response", data => {
    console.log(`socket.onShowResponse: ${data}`);
    running = true;
    output.setReadOnly(false);
    editor.setReadOnly(true);
    $("#submit-btn").attr("disabled", "disabled");
    $("#stop-btn").removeAttr("disabled");
    scrollDown();
  });

  $("#save-btn").bind("click", () => {
    const textEncoder = new TextEncoder("iso-8859-1", { NONSTANDARD_allowLegacyEncoding: true });
    const contentEncoded = textEncoder.encode([editor.getSession().getValue()]);

    const blob = new Blob([contentEncoded], {
      type: "application/octet-stream; charset=ISO-8859-1",
    });

    efnam = window.parent.portugol.fileNames[ecid];

    if (!efnam) {
      efnam = "Sem título";
    }

    if (efnam.indexOf(".por") == -1) {
      efnam += ".por";
    }

    saveAs(blob, efnam, false);
  });

  $("#stop-btn").bind("click", () => {
    if (!running) {
      return;
    }

    running = false;
    editor.setReadOnly(false);
    $("#submit-btn").removeAttr("disabled");
    $("#stop-btn").attr("disabled", "disabled");
    socket.disconnect();
    socket.connect();
    output.getSession().setValue(`${output.getSession().getValue()}\nPrograma finalizado.`);
    scrollDown();
  });

  $("#submit-btn").bind("click", () => {
    if (running) {
      return;
    }

    running = true;
    editor.setReadOnly(true);
    $("#submit-btn").attr("disabled", "disabled");
    output.getSession().setValue("");
    scrollDown();

    socket.emit("input", `${editor.getSession().getValue()}\r`);
  });

  $("#open-btn").bind("click", () => {
    window.parent.portugol.abrirArquivo();
  });

  $("#help-btn").bind("click", () => {
    window.parent.portugol.abrirAjuda();
  });

  $("#share-clp-copy").bind("click", () => {
    navigator.clipboard.writeText($("#share-url").val()).then(() => {
      $("#share-ctn-feedback").text("COPIADO");
      setTimeout(() => {
        $("#share-ctn-feedback").text("COPIAR");
      }, 750);
    });
  });

  $("#share-btn").bind("click", () => {
    if ($("#share-btn").attr("disabled") == "disabled") {
      return;
    }

    $("#share-btn").attr("disabled", "disabled");

    $.ajax({
      type: "POST",
      url: "/ide/editor/share",
      contentType: "text/plain; charset=UTF-8",
      data: editor.getSession().getValue(),

      success: function (data) {
        const { key } = data;
        const outUrl = `${document.location
          .toString()
          .substring(0, document.location.toString().indexOf(document.location.pathname))}/ide#share=${key}`;

        $("#share-ctn-feedback").text("COPIAR");
        $("#share-url").val(outUrl);
        $("#share-modal").modal("show");
        $("#share-btn").removeAttr("disabled");
      },

      error: function (jqXHR, textStatus, errorThrown) {
        console.error(errorThrown);
        $("#share-btn").removeAttr("disabled");
        alert("Ocorreu uma falha ao compartilhar o seu código. Por favor, tente novamente mais tarde.");
      },
    });
  });

  $("#layout").ax5layout({
    onResize: function () {
      editor.resize();
      output.resize();
    },
  });
});
