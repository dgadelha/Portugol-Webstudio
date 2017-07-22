var running = false, editor, input = "", output, socket;

function scrollDown() {
	var r = output.session.getLength() - 1;
	var c = output.session.getLine(r).length;
	output.gotoLine(r + 1, c);
}

$(window).bind("load", function() {
	editor = ace.edit("editor");
	editor.$blockScrolling = Infinity;
	editor.setTheme("ace/theme/portugol");
	editor.setFontSize(14);
	editor.getSession().setMode("ace/mode/portugol");
	editor.setShowPrintMargin(false);
	editor.getSession().setUseSoftTabs(true);

	var found = false;
	if (ecid != "") {
		if (window.parent.portugol.codes[ecid]) {
			found = true;
			editor.getSession().setValue(window.parent.portugol.codes[ecid]);
			delete window.parent.portugol.codes[ecid];
		}
	}

	if (!found) {
		editor.getSession().setValue("programa {\n\tfuncao inicio() {\n\t\t\n\t}\n}");
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
		handleKeyboard: function(data, hash, keyString, keyCode, event) {
			console.log("handleKeyboard(data = '" + data + "', hash = '" + hash + "', keyString = '" + keyString + "', keyCode = '" + keyCode + "', event = '" + event + "')");

			if (running == false) {
				console.log("-> Evento de Keyboard IGNORADO - o programa não está em execução!");
				return;
			}

			if (keyCode == 13 || keyString == "return") { // enter
				// Enviar os dados de input pro socket
				if (input != "") {
					console.log("Input: " + input);
					socket.emit("response", input.trim() + "\r");
					output.getSession().setValue(output.getSession().getValue() + "\n");
					scrollDown();
				}
			} else if (keyCode == 8 || keyString == "backspace") { // backspace
				if (input.length >= 1) {
					input = input.substring(0, input.length - 1);
					output.getSession().setValue(output.getSession().getValue().substring(0, output.getSession().getValue().length - 1));
					scrollDown();
				}
			} else if (typeof event == 'undefined' && !event) {
				if (keyString != "" && keyString != "\n" && keyString != "\r\n" && keyString != "\r") {
					input += keyString;
					output.getSession().setValue(output.getSession().getValue() + keyString);
					scrollDown();
				} else {
					// @TODO: keyCode -> HEX
					// input += "\xHEX";
					console.log("-> Evento de Keyboard IGNORADO - keyString vazia e suporte a HEX não concluído");
				}
			}
		}
	});

	socket = io.connect(location.protocol + "//" + document.domain + ":" + location.port);

	socket.on("output", function(data) {
		console.log("socket.onOutput: " + data);

		if (input != "" && data.indexOf(input) > -1) {
			console.log("Ajeitando output...");
			data = data.substring(input.length + 4); /* ficar de olho nesse 4 aí, pode dar merda em alguma coisa! */
			input = "";
			console.log("Output novo: " + data);
		}

		if (data.includes("~|^!+LIMPAR+!^|~")) {
			data = data.substring(data.indexOf("~|^!+LIMPAR+!^|~") + 16);
			output.getSession().setValue("");
		}

		output.getSession().setValue(output.getSession().getValue() + data);
		scrollDown();
	});

	socket.on("hide-response", function(data) {
		console.log("socket.onHideResponse: " + data);
		running = false;
		editor.setReadOnly(false);
		$("#submit-btn").removeAttr("disabled");
		scrollDown();
	});

	socket.on("show-response", function(data) {
		console.log("socket.onShowResponse: " + data);
		running = true;
		editor.setReadOnly(true);
		$("#submit-btn").attr("disabled", "disabled");
		scrollDown();
	});

	$("#save-btn").bind("click", function() {
		var textEncoder = new TextEncoder("iso-8859-1", { NONSTANDARD_allowLegacyEncoding: true });
		var contentEncoded = textEncoder.encode([editor.getSession().getValue()]);

		var blob = new Blob([contentEncoded], {
			type: "application/octet-stream; charset=ISO-8859-1",
		});

		if (!efnam) {
			efnam = "Sem título";
		}

		if (efnam.indexOf(".por") == (-1)) {
			efnam += ".por";
		}

		saveAs(blob, efnam, false);
	});

	$("#submit-btn").bind("click", function() {
		if (running) return;

		running = true;
		editor.setReadOnly(true);
		$("#submit-btn").attr("disabled", "disabled");
		output.getSession().setValue("");
		scrollDown();

		socket.emit("input", editor.getSession().getValue() + "\r");
	});

	$("#layout").ax5layout({
		onResize: function() {
			editor.resize();
			output.resize();
		}
	});
});
