var lut = []; for (var i=0; i<256; i++) { lut[i] = (i<16?'0':'')+(i).toString(16); }
function e7() { /*! @see: http://stackoverflow.com/a/21963136 !*/
	var d0 = Math.random()*0xffffffff|0;
	var d1 = Math.random()*0xffffffff|0;
	var d2 = Math.random()*0xffffffff|0;
	var d3 = Math.random()*0xffffffff|0;
	return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
	lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
	lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
	lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
}

var fileName = "";
function openFile() {
	$("#special").html("<input type=\"file\" id=\"file-input\" />");
	$("#file-input").trigger("click");

	document.getElementById("file-input").addEventListener("change", function(e) {
		var file = e.target.files[0];
		if (!file) return;

		var reader = new FileReader();
		fileName = file.name.replace(/\.[^/.]+$/, "");

		reader.onload = function(e) {
			var contents = e.target.result;
			addTab(fileName, contents);
		};

		reader.readAsText(file);
	}, false);
}

function addTab(name = "Sem título", content = "") {
	var id = "t" + e7();
	$(".tabs").append("<li><a href=\"#tab-" + id + "\" id=\"anchor-" + id + "\"><span class=\"portugol-icon\"></span> " + name + " <span class=\"close-icon\"></span></a></li>");

	var tpl = '<div id="tab-' + id + '" class="tab">';
	tpl += '<div data-ax5layout="' + id + '-ax" data-config="{layout:\'dock-panel\'}" class=\"ide-layout\" id="' + id + '-layout">';
	tpl += '<div class="tbar" data-dock-panel="{dock:\'left\',split:false,height:250,minHeight:250,maxHeight:250,width:64,minWidth:64,maxWidth:64}">';
	tpl += '<button class="tbb submit"><img src="https://raw.githubusercontent.com/UNIVALI-LITE/Portugol-Studio/master/src/br/univali/ps/ui/icones/grande/resultset_next.png"></button>';
	tpl += '<button class="tbb save"><img src="https://raw.githubusercontent.com/UNIVALI-LITE/Portugol-Studio/master/src/br/univali/ps/ui/icones/grande/save_as.png"></button>';
	tpl += '</div>';

	tpl += '<div data-dock-panel="{dock:\'bottom\',split:true,height:150,minHeight:50,maxHeight:300}">';
	tpl += '<pre id="' + id + '-output" class="output"></pre>';
	tpl += '</div>';

	tpl += '<div data-dock-panel="{dock:\'right\',split:true,width:250,minWidth:100,maxWidth:350}">';
	tpl += '<p class="title">Entrada de Dados</p>';
	tpl += '<pre id="' + id + '-input" class="input"></pre>';
	tpl += '</div>';

	tpl += '<div data-dock-panel="{dock:\'center\'}">';
	tpl += '<pre id="' + id + '-editor" class="editor"></pre>';
	tpl += '</div>';
	tpl += '</div>';
	tpl += '</div>';

	$("#ide").append(tpl);
	bindHTML();

	d.tabs[id] = {
		filename: name,
		editor: null,
		input: null,
		output: null,
		running: false
	};

	d.tabs[id].editor = ace.edit(id + "-editor");
	d.tabs[id].editor.$blockScrolling = Infinity;
	d.tabs[id].editor.setTheme("ace/theme/portugol");
	d.tabs[id].editor.setFontSize(14);
	d.tabs[id].editor.getSession().setMode("ace/mode/portugol");
	d.tabs[id].editor.setShowPrintMargin(false);
	d.tabs[id].editor.getSession().setUseSoftTabs(true);
	if (content == "") {
		d.tabs[id].editor.getSession().setValue("programa {\n\tfuncao inicio() {\n\t\t\n\t}\n}");
		d.tabs[id].editor.gotoLine(3);
		d.tabs[id].editor.selection.moveTo(2, 2);
	} else {
		d.tabs[id].editor.getSession().setValue(content);
		//d.scrollDown(id);
	}

	d.tabs[id].input = ace.edit(id + "-input");
	d.tabs[id].input.$blockScrolling = Infinity;
	d.tabs[id].input.setTheme("ace/theme/portugol");
	d.tabs[id].input.setFontSize(14);
	d.tabs[id].input.getSession().setMode("ace/mode/sh");
	d.tabs[id].input.getSession().setUseSoftTabs(true);
	d.tabs[id].input.setShowPrintMargin(false);
	d.tabs[id].input.renderer.setShowGutter(false);

	d.tabs[id].output = ace.edit(id + "-output");
	d.tabs[id].output.$blockScrolling = Infinity;
	d.tabs[id].output.setTheme("ace/theme/portugol");
	d.tabs[id].output.setFontSize(14);
	d.tabs[id].output.getSession().setMode("ace/mode/sh");
	d.tabs[id].output.getSession().setValue("");
	d.tabs[id].output.setShowPrintMargin(false);
	d.tabs[id].output.renderer.setShowGutter(false);
	d.tabs[id].output.setReadOnly(true);
	d.tabs[id].output.selection.moveTo(0, 2);

	d.tabs[id].editor.focus();
	$("#anchor-" + id).trigger("click");

	$("#anchor-" + id + " .close-icon").bind("click", function() {
		var id = $(this).parent().attr("id").substr(7);

		d.tabs[id].editor.destroy();
		d.tabs[id].input.destroy();
		d.tabs[id].output.destroy();

		d.tabs[id] = false;
		delete d.tabs[id];

		$(this).parent().parent().remove();
		$("#tab-" + id).remove();
		$("#anchor-inicio").trigger("click");
	});

	$("#tab-" + id + " .save").bind("click", function() {
		var id = $(this).parent().parent().attr("id");
		id = id.substr(0, id.length - 7);
		if (d.tabs[id].running) return;

		var blob = new Blob([d.tabs[id].editor.getSession().getValue()], {
			type: "text/plain;charset=utf-8;",
		});

		saveAs(blob, d.tabs[id].filename + ".por");
	});

	$("#tab-" + id + " .submit").bind("click", function() {
		var id = $(this).parent().parent().attr("id");
		id = id.substr(0, id.length - 7);
		if (d.tabs[id].running) return;

		d.tabs[id].running = true;
		d.tabs[id].editor.setReadOnly(true);
		d.tabs[id].input.setReadOnly(true);
		$("#tab-" + id + " .submit").attr("disabled", "disabled");
		d.tabs[id].output.getSession().setValue("");
		d.scrollDown(id);

		$.ajax({
			_id: id,
			async: true,
			cache: false,
			crossDomain: true,
			data: { codigo: d.tabs[id].editor.getSession().getValue(), entrada: d.tabs[id].input.getSession().getValue() },
			dataType: 'json',
			method: 'POST',
			processData: true,
			timeout: 60000,
			url: d.ajaxUrl,

			error: function(jqXHR, textStatus, errorThrown) {
				var id = this._id;
				d.tabs[id].output.getSession().setValue(d.output.getSession().getValue() + "Falha ao enviar o código para o servidor:\n" + textStatus + " " + errorThrown + "\n\n$ ");
				d.tabs[id].running = false;
				d.tabs[id].editor.setReadOnly(false);
				d.tabs[id].input.setReadOnly(false);
				$("#tab-" + id + " .submit").removeAttr("disabled");
				d.scrollDown(id);
			},

			success: function(data, textStatus, jqXHR) {
				var id = this._id;
				d.tabs[id].output.getSession().setValue(d.tabs[id].output.getSession().getValue() + data.output);
				d.tabs[id].running = false;
				d.tabs[id].editor.setReadOnly(false);
				d.tabs[id].input.setReadOnly(false);
				$("#tab-" + id + " .submit").removeAttr("disabled");
				d.scrollDown(id);
			}
		});
	});
}

function bindHTML() {
	$("ul.tabs").each(function(){
		var $active, $content, $links = $(this).find("a");

		$active = $($links.filter("[href=\"" + location.hash + "\"]")[0] || $links[0]);
		$active.addClass("active");

		$content = $($active[0].hash);

		$links.not($active).each(function () {
			$(this.hash).hide();
		});

		$(this).on("click", "a", function(e){
			$active.removeClass("active");
			$content.hide();

			$active = $(this);
			$content = $(this.hash);

			$active.addClass("active");
			$content.show();

			var ttid = $content.attr("id");

			if (ttid.startsWith("tab-t")) {
				var id = ttid.substr(4);

				d.tabs[id].editor.resize();
				d.tabs[id].output.resize();
				d.tabs[id].input.resize();

				if (!d.tabs[id].ax5initialized) {
					d.tabs[id].ax5initialized = true;

					$("#" + id + "-layout").ax5layout({
						onResize: function() {
							var id = this.name.substr(0, this.name.length - 3)

							if (id.startsWith("t")) {
								if (!d.tabs[id]) return;

								d.tabs[id].editor.resize();
								d.tabs[id].output.resize();
								d.tabs[id].input.resize();
							}
						}
					});
				}
			}

			e.preventDefault();
		});
	});
}

$(window).bind("load", function() {
	bindHTML();
});
