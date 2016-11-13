$(window).bind("load", function() {
	$("[data-ax5layout]").ax5layout({
		onResize: function(){
			d.editor.resize();
			d.output.resize();
			d.input.resize();
		}
	});

	d.editor = ace.edit("editor");
	d.editor.$blockScrolling = Infinity;
	d.editor.setTheme("ace/theme/tomorrow_night_eighties");
	d.editor.getSession().setMode("ace/mode/portugol");
	d.editor.getSession().setValue("programa {\n\tfuncao inicio() {\n\t\t\n\t}\n}");
	d.editor.setShowPrintMargin(false);
	d.editor.getSession().setUseSoftTabs(true);
	d.editor.gotoLine(3);
	d.editor.selection.moveTo(2, 2);
	d.editor.focus();

	d.input = ace.edit("input");
	d.input.$blockScrolling = Infinity;
	d.input.setTheme("ace/theme/twilight");
	d.input.getSession().setUseSoftTabs(true);
	d.input.setShowPrintMargin(false);
	d.input.renderer.setShowGutter(false);

	d.output = ace.edit("output");
	d.output.$blockScrolling = Infinity;
	d.output.setTheme("ace/theme/tomorrow_night_eighties");
	d.output.getSession().setMode("ace/mode/sh");
	d.output.getSession().setValue("$ ");
	d.output.setShowPrintMargin(false);
	d.output.renderer.setShowGutter(false);
	d.output.setReadOnly(true);
	d.output.selection.moveTo(0, 2);

	$("#submit").bind("click", function() {
		if (d.running) return;

		d.running = true;
		d.editor.setReadOnly(true);
		d.input.setReadOnly(true);
		$("#submit").attr("disabled", "disabled");
		d.output.getSession().setValue(d.output.getSession().getValue() + "java -jar portugol-console.jar codigo.por\n");
		d.scrollDown();

		$.ajax({
			async: true,
			cache: false,
			crossDomain: true,
			data: { codigo: d.editor.getSession().getValue(), entrada: d.input.getSession().getValue() },
			dataType: 'json',
			method: 'POST',
			processData: true,
			timeout: 60000,
			url: d.ajaxUrl,

			error: function(jqXHR, textStatus, errorThrown) {
				d.output.getSession().setValue(d.output.getSession().getValue() + "Falha ao enviar o código para o servidor:\n" + textStatus + " " + errorThrown + "\n\n$ ");
				d.running = false;
				d.editor.setReadOnly(false);
				d.input.setReadOnly(false);
				$("#submit").removeAttr("disabled");
				d.scrollDown();
			},

			success: function(data, textStatus, jqXHR) {
				d.output.getSession().setValue(d.output.getSession().getValue() + data.output + "\n\n$ ");
				d.running = false;
				d.editor.setReadOnly(false);
				d.input.setReadOnly(false);
				$("#submit").removeAttr("disabled");
				d.scrollDown();
			}
		});
	});
});
