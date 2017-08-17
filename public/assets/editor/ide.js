var editor;

window.portugol = {
	codes: {},

	abrirExemplo: function(codigo, arquivo) {
		arquivo = arquivo.substring(arquivo.lastIndexOf("/") + 1);
		addTab(arquivo, codigo);
	}
};

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
		fileName = file.name;//.replace(/\.[^/.]+$/, "");

		reader.onload = function(e) {
			var contents = e.target.result;
			addTab(fileName, contents);
		};

		reader.readAsText(file, "ISO-8859-1");
	}, false);
}

function limparCodigo(content) {
	var inicioComentario = content.indexOf("/* $$$ Portugol Studio $$$ ");

	if (inicioComentario != -1) {
		fimComentario = content.indexOf("*/", inicioComentario + 1);

		if (fimComentario != -1) {
			content = content.substring(0, inicioComentario - 1) + content.substring(fimComentario + 2);
		}
	}

	return content;
}

function addTab(name = "Sem título", content = "") {
	var id = "t" + e7();
	var nid = id.replace(/-/g, "");
	$(".tabs").append("<li><a href=\"#tab-" + id + "\" id=\"anchor-" + id + "\"><span class=\"portugol-icon\"></span> " + name + " <span data-toggle='tooltip' data-placement='bottom' title='Fechar aba' class=\"close-icon\"></span></a></li>");
	$('[data-toggle="tooltip"]').tooltip();

	if (content != "") {
		window.portugol.codes[nid] = content;
	}

	var tpl = '<div id="tab-' + id + '" class="tab">';
	tpl += '<iframe src="' + d.baseUrl + 'editor?fnam=' + encodeURIComponent(name) + '&cid=' + encodeURIComponent(nid) + '"></iframe>';
	tpl += '</div>';

	$("#ide").append(tpl);
	bindHTML($("#anchor-" + id));
	$("#anchor-" + id).trigger("click");

	$("#anchor-" + id + " .close-icon").bind("click", function(e) {
		e.preventDefault();
		var id = $(this).parent().attr("id").substr(7);

		$(this).parent().parent().remove();
		$("#tab-" + id).remove();
		$("#anchor-inicio").trigger("click");
	});
}

function bindHTML(tag) {
	tag.bind("click", function(e) {
		e.preventDefault();

		$("ul.tabs a.active").removeClass("active");
		$(".tab").hide();

		$(this).addClass("active");
		$(this.hash).show();

		var ttid = $(this.hash).attr("id");
		console.log("Exibindo: " + ttid);

		if ($(".active").attr("id") == "anchor-inicio") {
			$(".action").addClass("active");
		} else {
			$(".action").removeClass("active");
		}

		$(window).trigger("resize");
		$(".ax5layout").trigger("resize");
	});
}

function abrirAjuda() {
	if ($("#anchor-ajuda")[0]) {
		$("#anchor-ajuda").trigger("click");
	} else {
		$(".tabs").append("<li><a href=\"#tab-ajuda\" id=\"anchor-ajuda\"><span class=\"help-icon\"></span> Ajuda <span class=\"close-icon\"></span></a></li>");

		var tpl = '<div id="tab-ajuda" class="tab">';
		tpl += '<iframe src="' + d.baseUrl + 'ajuda"></iframe>';
		tpl += '</div>';

		$("#ide").append(tpl);
		bindHTML($("#anchor-ajuda"));

		$("#anchor-ajuda").trigger("click");
		$("#anchor-ajuda .close-icon").bind("click", function(e) {
			e.preventDefault();
			$(this).parent().parent().remove();
			$("#tab-ajuda").remove();
			$("#anchor-inicio").trigger("click");
		});
	}
}

$(window).bind("load", function() {
	bindHTML($("#anchor-inicio"));
	$("#anchor-inicio").trigger("click");
	$("#ax1").ax5layout();

	$(".alert-res-close a").bind("click", function(e) {
		e.preventDefault();
		e.defaultPrevented = true;

		$(".alert-res").remove();
		$("#ide").removeClass("hidden-xs");
		$(window).trigger("resize");
	});

	$(".jstree").on("changed.jstree", function(e, data) {
		if (data.changed.selected.length == 0) return;

		var sid = data.changed.selected[0];
		var file = $("#" + sid).attr("data-file");

		if (file != null && file != "") {
			d.exemplo.nome = file.substring(file.lastIndexOf("/") + 1);
			$.get(d.baseUrl + "resp?file=" + file, function(data) {
				data = limparCodigo(data);
				editor.getSession().setValue(data);
				d.exemplo.codigo = data;
				$("#exemplo-desc").text($("#" + sid).attr("data-description"));
				$("#exemplo-go").removeClass("hide");
				$(".row-exemplo-editor").removeClass("hide");
				$(".row-exemplo-editor").height($("#exc-content").height() - $(".row-exemplo-desc").height());
				var nheight = $("#exemplo-desc-holder").height() + 3;
				$("#exemplo-go").height(nheight).css({ "line-height": nheight + "px" });
			});
		} else {
			d.exemplo.nome = false;
			d.exemplo.codigo = false;
			$(".row-exemplo-editor").addClass("hide");
			$("#exemplo-go").addClass("hide");
			$("#exemplo-desc").text("Selecione um exemplo ao lado para ver a descrição.");
		}
	}).jstree({
		"plugins": [ "changed", "types", "wholerow" ],

		"core": {
			"themes": {
				"name": "default-dark",
				"dots": true,
				"icons": true
			},

			"data": [{"text":"Entrada e Sa\u00edda","icon":"icone icone-pasta","children":[{"text":"Ol\u00e1 Mundo","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/entrada_saida\/ola_mundo.por","data-description":"Este exemplo utiliza a sa\u00edda de dados do Portugol para exibir a mensagem \"Ol\u00e1 mundo\"."}},{"text":"N\u00famero Digitado","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/entrada_saida\/numero_digitado.por","data-description":"Este exemplo utiliza a entrada de dados do Portugol para ler e armazenar um n\u00famero inteiro em uma vari\u00e1vel. Logo ap\u00f3s, utiliza a sa\u00edda de dados para exibir o n\u00famero digitado."}},{"text":"Seu Nome","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/entrada_saida\/seu_nome.por","data-description":"Este exemplo utiliza a entrada de dados do Portugol para obter e armazenar o nome do usu\u00e1rio em um vari\u00e1vel. Logo ap\u00f3s, utiliza a sa\u00edda de dados para exibir o nome digitado."}}]},{"text":"Opera\u00e7\u00f5es Aritm\u00e9ticas","icon":"icone icone-pasta","children":[{"text":"Opera\u00e7\u00f5es Simples","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/operacoes_aritmeticas\/operacoes_simples.por","data-description":"Este exemplo pede ao usu\u00e1rio que informe dois n\u00fameros. Logo ap\u00f3s, calcula e exibe: a) A soma entre os n\u00fameros b) A subtra\u00e7\u00e3o entre os n\u00fameros c) A multiplica\u00e7\u00e3o entre os n\u00fameros d) A divis\u00e3o entre os n\u00fameros"}},{"text":"Prioridades","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/operacoes_aritmeticas\/prioridades.por","data-description":"Este exemplo demonstra a prioridade das opera\u00e7\u00f5es aritm\u00e9ticas no Portugol. As opera\u00e7\u00f5es de multiplica\u00e7\u00e3o (*), divis\u00e3o (\/) e m\u00f3dulo (%) t\u00eam prioridade sobre as opera\u00e7\u00f5es de soma (+) e subtra\u00e7\u00e3o (-). Al\u00e9m disso, o exemplo demonstra como os par\u00eanteses podem ser utilizados para alterar esta prioridade, fazendo com que uma opera\u00e7\u00e3o de soma ocorra antes de uma opera\u00e7\u00e3o de multiplica\u00e7\u00e3o."}},{"text":"Divis\u00f5es Inteiras","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/operacoes_aritmeticas\/divisoes_inteiras.por","data-description":"Este exemplo pede ao usu\u00e1rio que informe um n\u00famero inteiro. Logo ap\u00f3s, calcula e exibe: a) O resultado da divis\u00e3o inteira por 2 b) O resto da divis\u00e3o inteira por 3 (mod)"}},{"text":"Potencia e Raiz","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/operacoes_aritmeticas\/potencia_raiz.por","data-description":"Este exemplo pede ao usu\u00e1rio que informe um valor. Logo ap\u00f3s, utiliza a biblioteca \"Matematica\" para calcular e exibir: a) O n\u00famero elevado ao cubo b) A raiz quadrada do n\u00famero"}}]},{"text":"Algoritmos Sequencias","icon":"icone icone-pasta","children":[{"text":"Troca Vari\u00e1veis","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/algoritmos_sequenciais\/troca_variaveis.por","data-description":"Este exemplo pede ao usu\u00e1rio que informe dois valores inteiros e os\tarmazena em duas vari\u00e1veis. Logo ap\u00f3s, o programa troca os valores contidos nas vari\u00e1veis entre si e os exibe ao usu\u00e1rio."}},{"text":"Maioridade Penal","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/algoritmos_sequenciais\/maioridade_penal.por","data-description":"Este exemplo define qual o valor da maior Idade penal usando uma constante. Logo ap\u00f3s, pede ao usu\u00e1rio que informe sua idade e calcula quantos anos faltam para ele atingir a maioridade."}},{"text":"Altura m\u00e9dia","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/algoritmos_sequenciais\/altura_media.por","data-description":"Este exemplo pede ao usu\u00e1rio a altura de 3 pessoas. Logo ap\u00f3s, calcula e exibe a m\u00e9dia das alturas informadas."}},{"text":"Loja de Ferramentas","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/algoritmos_sequenciais\/loja_ferramentas.por","data-description":"Este exemplo pede o nome do usu\u00e1rio e tr\u00eas valores inteiros, os quais representam a quantidade de porcas, parafusos e arruelas compradas. Ap\u00f3s, exibe o nome do usu\u00e1rio seguido da quantidade de cada item comprado e o valor total a ser pago."}},{"text":"Quantos Dias","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/algoritmos_sequenciais\/quantos_dias.por","data-description":"Este exemplo pede ao usu\u00e1rio que informe o ano atual. Logo ap\u00f3s, calcula e exibe a quantidade de dias que se passaram desde o dia 01\/01\/0001 (ano 1 dc)\tat\u00e9 o dia 01\/01 do ano atual."}}]},{"text":"Desvios Condicionais","icon":"icone icone-pasta","children":[{"text":"Vogal","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/desvios_condicionais\/vogal.por","data-description":"Este exemplo pede ao usu\u00e1rio que informe uma letra (tipo caracter). Logo ap\u00f3s verifica se a letra digitada \u00e9 uma vogal ou uma consoante e exibe o resultado ao usu\u00e1rio."}},{"text":"M\u00e9dias","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/desvios_condicionais\/medias.por","data-description":"Este exemplo pede ao usu\u00e1rio que informe tr\u00eas m\u00e9dias. Logo ap\u00f3s, calcula e exibe a m\u00e9dia final destas notas. Por \u00faltimo, verifica se alguma das m\u00e9dias parciais \u00e9 menor que a m\u00e9dia final e a exibe (caso exista)."}},{"text":"Idade do Usu\u00e1rio","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/desvios_condicionais\/idade.por","data-description":"Este exemplo pede ao usu\u00e1rio que informa a sua idade. Logo ap\u00f3s exibe uma mensagem informando se ele for maior ou menor de idade."}},{"text":"M\u00faltiplo de Cinco","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/desvios_condicionais\/multiplo.por","data-description":"Este exemplo pede ao usu\u00e1rio que informe um valor inteiro, logo ap\u00f3s, exibe uma mensagem indicando se o n\u00famero informado \u00e9 m\u00faltiplo de 5 ou n\u00e3o."}},{"text":"N\u00fameros Iguais","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/desvios_condicionais\/numeros_iguais.por","data-description":"Este exemplo pede ao usu\u00e1rio que informe um valor de 0 a 6. Logo ap\u00f3s, o programa sorteia um valor tamb\u00e9m de 0 a 6 e exibe uma mensagem informando se o n\u00famero sorteado e o n\u00famero digitado s\u00e3o iguais."}},{"text":"M\u00e9dia Final","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/desvios_condicionais\/media_final.por","data-description":"Este exemplo pede ao usu\u00e1rio que informe seu nome e tr\u00eas notas. Logo ap\u00f3s, calcula a m\u00e9dia final do usu\u00e1rio e exibe uma mensagem informando se ele foi aprovado ou reprovado."}},{"text":"N\u00famero Inteiro","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/desvios_condicionais\/numero_inteiro.por","data-description":"Este exemplo pede ao usu\u00e1rio que informe um n\u00famero inteiro. Logo ap\u00f3s, exibe uma mensagem indicando se o n\u00famero informado \u00e9 positivo, negativo ou igual a zero."}},{"text":"Tipo de Tri\u00e2ngulo","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/desvios_condicionais\/tipo_triangulo.por","data-description":"Este exemplo pede ao usu\u00e1rio que informe o tamanho dos 3 lados de um tri\u00e2ngulo. Logo ap\u00f3s, compara os lados do tri\u00e2ngulo e exibe ao usu\u00e1rio o tipo de tri\u00e2ngulo informado."}},{"text":"Mini Calculadora","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/desvios_condicionais\/mini_calculadora.por","data-description":"Este exemplo demonstra o uso do desvio condicional para criar uma mini calculadora. O programa pede ao usu\u00e1rio que informe dois n\u00fameros reais e a opera\u00e7\u00e3o a ser executada entre estes n\u00fameros (soma, divis\u00e3o, etc.). Por fim, \u00e9 exibido o valor resultante da opera\u00e7\u00e3o entre os dois n\u00fameros."}},{"text":"Escolha-Caso","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/desvios_condicionais\/escolha_caso.por","data-description":"Este exemplo ilustra o uso da instru\u00e7\u00e3o \"escolha\". Para isso, o programa pede ao usu\u00e1rio que escolha uma op\u00e7\u00e3o e exibe uma frase correspondente \u00e0 op\u00e7\u00e3o escolhida."}}]},{"text":"La\u00e7os de Repeti\u00e7\u00e3o","icon":"icone icone-pasta","children":[{"text":"Contagem Regressiva","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/lacos_repeticao\/contagem_regressiva.por","data-description":"Este exemplo utiliza um la\u00e7o de repeti\u00e7\u00e3o e uma vari\u00e1vel para exibir uma contagem regressiva na tela."}},{"text":"Tabuada","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/lacos_repeticao\/tabuada.por","data-description":"Este exemplo pede ao usu\u00e1rio que informe um n\u00famero inteiro. Logo ap\u00f3s, utiliza um la\u00e7o de repeti\u00e7\u00e3o do tipo \"para\", para calcular e exibir a tabuada do n\u00famero informado."}},{"text":"Consist\u00eancia","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/lacos_repeticao\/consistencia.por","data-description":"Este exemplo ilustra o uso de um la\u00e7o de repeti\u00e7\u00e3o do tipo \"faca-enquanto\" para\tvalidar a entrada dos dados informados pelo usu\u00e1rio."}},{"text":"M\u00e9dia de Dez N\u00fameros","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/lacos_repeticao\/media_dez_numeros.por","data-description":"Este exemplo pede ao usu\u00e1rio que informe 10 n\u00fameros. Logo ap\u00f3s, calcula e\texibe a m\u00e9dia dos n\u00fameros digitados. O exemplo utiliza um la\u00e7o de repeti\u00e7\u00e3o do tipo \"enquanto\" para determinar se todos os 10 valores j\u00e1 foram lidos."}},{"text":"Soma de Um a X","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/lacos_repeticao\/soma_um_x.por","data-description":"Este exemplo pede ao usu\u00e1rio que informe um valor inteiro. Logo ap\u00f3s, calcula e\texibe a soma dos n\u00fameros de 1 e at\u00e9 o n\u00famero digitado."}},{"text":"Fatorial","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/lacos_repeticao\/fatorial.por","data-description":"Este exemplo ilustra o uso do la\u00e7o de repeti\u00e7\u00e3o \"enquanto\". O exemplo pede ao usuario que informe um n\u00famero, logo ap\u00f3s, calcula e exibe o fatorial do n\u00famero digitado."}},{"text":"Elei\u00e7\u00e3o","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/lacos_repeticao\/eleicao.por","data-description":"Este exemplo ilustra o uso do la\u00e7o \"faca-enquanto\", simulando uma elei\u00e7\u00e3o entre\tdois candidatos. O exemplo ilustra tamb\u00e9m o uso do comando \"escolha\" para contabilizar os votos de cada candidato."}}]},{"text":"Vetores e Matrizes","icon":"icone icone-pasta","children":[{"text":"Preenche e Exibe Vetor","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/vetores_matrizes\/preenche_vetor.por","data-description":"Este exemplo cria e preenche um vetor com n\u00fameros aleat\u00f3rios. Logo ap\u00f3s exibe o vetor no console de duas formas diferentes: a) Na ordem em que os n\u00fameros foram preenchidos b) Na ordem inversa em que os n\u00fameros foram preenchidos"}},{"text":"Pesquisa Vetor","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/vetores_matrizes\/pesquisa_vetor.por","data-description":"Este exemplo ilustra o uso dos vetores na linguagem Portugol. Neste exemplo, \u00e9 criado um vetor com valores pr\u00e9-definidos. Logo ap\u00f3s, o programa pede ao usu\u00e1rio que informe um valor e percorre o vetor procurando pelo valor informado. Por \u00faltimo, o programa exibe uma mensagem informando se o valor informado foi encontrado dentro do vetor ou n\u00e3o."}},{"text":"Tabela de Dados","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/vetores_matrizes\/tabela_dados.por","data-description":"Este exemplo ilustra o uso dos vetores da linguagem Portugol. Neste exemplo, s\u00e3o criados dois vetores. O primeiro, \u00e9 do tipo cadeia e armazena os nomes de v\u00e1rias pessoas. O segundo, \u00e9 do tipo real e armazena as alturas destas pessoas. O programa ent\u00e3o percorre cada um dos vetores, montando no console uma tabela dos dados existentes. Cada nome \u00e9 associado \u00e0 sua respectiva altura."}},{"text":"Diagonal Principal","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/vetores_matrizes\/diagonal_principal.por","data-description":"Este exemplo ilustra o uso das matrizes na linguagem Portugol criando uma matriz e preenchendo sua diagonal principal. As matrizes nada mais s\u00e3o do que vetores de duas dimens\u00f5es (bidimensionais). Em outras palavras, a matriz \u00e9 um vetor aonde cada uma de suas posi\u00e7\u00f5es (colunas) armazena um outro vetor (linhas)."}},{"text":"Exibe Matriz","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/vetores_matrizes\/exibe_matriz.por","data-description":"Este exemplo cria e exibe uma matriz para ilustrar o uso das matrizes na linguagem Portugol."}}]},{"text":"Subrotinas","icon":"icone icone-pasta","children":[{"text":"Procedimento e Fun\u00e7\u00e3o","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/subrotinas\/procedimento_funcao.por","data-description":"Este exemplo ilustra o uso das fun\u00e7\u00f5es da linguagem Portugol. Neste exemplo, foi criado um procedimento que formata uma mensagem qualquer e uma fun\u00e7\u00e3o que realiza um c\u00e1lculo matem\u00e1tico entre dois n\u00fameros informados. Para saber mais sobre o fatorial, acesse: http:\/\/www.infoescola.com\/matematica\/fatorial\/"}},{"text":"Anima\u00e7\u00e3o","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/subrotinas\/lagarta.por","data-description":"Este exemplo ilustra o uso das fun\u00e7\u00f5es da linguagem Portugol para criar uma anima\u00e7\u00e3o no console."}},{"text":"Par\u00e2metros por Referencia","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/subrotinas\/parametros_referencia.por","data-description":"Este exemplo ilustra a passagem de par\u00e2metros para uma fun\u00e7\u00e3o. O exemplo demonstra tanto a passagem de par\u00e2metro por valor, quanto a passagem de par\u00e2metro por refer\u00eancia. Quando um par\u00e2metro \u00e9 passado por valor, o seu valor \u00e9 copiado para dentro da fun\u00e7\u00e3o. Desta forma, se a fun\u00e7\u00e3o altera o valor do par\u00e2metro, o valor s\u00f3 \u00e9 alterado dentro da fun\u00e7\u00e3o, mas \u00e9 mantido o valor original fora dela. Por outro lado, quando um par\u00e2metro \u00e9 passado por refer\u00eancia, qualquer altera\u00e7\u00e3o dentro da fun\u00e7\u00e3o \u00e9 imediatamente refletida na vari\u00e1vel fora da fun\u00e7\u00e3o. Isto porque, na verdade, o que a fun\u00e7\u00e3o recebe n\u00e3o \u00e9 uma c\u00f3pia do valor contido na vari\u00e1vel, mas sim, uma refer\u00eancia (um atalho) para a vari\u00e1vel original. No Portugol, a passagem de par\u00e2metro por refer\u00eancia \u00e9 representada pelo operador '&'. Caso n\u00e3o compreenda estes conceitos, experimente depurar o programa e visualizar como o valor das vari\u00e1veis s\u00e3o alterados na \u00e1rvore estrutural \u00e0 esquerda. Se ainda assim tiver dificuldades, pe\u00e7a a ajuda de um professor ou algu\u00e9m experiente em programa\u00e7\u00e3o."}},{"text":"Fatorial Recursivo","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/subrotinas\/fatorial_recursivo.por","data-description":"Este exemplo pede ao usu\u00e1rio que informe um n\u00famero inteiro. Logo ap\u00f3s, calcula e exibe o fatorial do n\u00famero informado. Neste exemplo, o fatorial \u00e9 calculado chamando recursivamente a fun\u00e7\u00e3o \"fatorial\" definida no programa. O fatorial de um n\u00famero \u00e9 calculado multiplicando todos os valores inteiros entre 1 e o pr\u00f3prio n\u00famero."}},{"text":"Fibonacci Recursivo","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/subrotinas\/fibonacci_recursivo.por","data-description":"Este exemplo pede ao usu\u00e1rio que informe um n\u00famero inteiro. Logo ap\u00f3s, calcula e exibe todos os n\u00fameros da sequ\u00eancia de Fibonacci at\u00e9 a posi\u00e7\u00e3o informada pelo usu\u00e1rio. Neste exemplo, os n\u00fameros da sequ\u00eancia de Fibonacci s\u00e3o calculados chamando recursivamente a fun\u00e7\u00e3o \"fibonacci\" definida no programa. A sequ\u00eancia de Fibonacci \u00e9 uma sequ\u00eancia num\u00e9rica especial, na qual cada elemento da sequ\u00eancia \u00e9 calculado somando os dois elementos anteriores."}}]},{"text":"Bibliotecas","icon":"icone icone-pasta","children":[{"text":"Matem\u00e1tica","icon":"icone icone-pasta","children":[{"text":"Raiz de Um N\u00famero","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/bibliotecas\/matematica\/raiz.por","data-description":"Este exemplo demonstra como obter a raiz de um n\u00famero usando a fun\u00e7\u00e3o \"raiz\" da biblioteca \"Matematica\"."}},{"text":"Pot\u00eancia Entre Dois N\u00fameros","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/bibliotecas\/matematica\/potencia.por","data-description":"Este exemplo demonstra como obter a pot\u00eancia de um n\u00famero utilizando a fun\u00e7\u00e3o \"potencia\" da biblioteca \"Matematica\"."}},{"text":"Logaritmo de Um N\u00famero","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/bibliotecas\/matematica\/logaritmo.por","data-description":"Este exemplo utiliza a fun\u00e7\u00e3o \"logaritmo\" da biblioteca \"Matematica\" para calcular o logaritmo de um n\u00famero para uma determinada base. Calcular o logaritmo de um n\u00famero significa encontrar o expoente ao qual a base foi elevada para chegar ao n\u00famero."}},{"text":"Fun\u00e7\u00f5es Trigonom\u00e9tricas","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/bibliotecas\/matematica\/funcoes_trigonometricas.por","data-description":"Este exemplo demonstra o uso das fun\u00e7\u00f5es trigonom\u00e9tricas \"seno\", \"cosseno\", e \"tangente\" da biblioteca \"Matematica\"."}},{"text":"Maior N\u00famero","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/bibliotecas\/matematica\/maior_numero.por","data-description":"Este exemplo demonstra como utilizar a fun\u00e7\u00e3o \"maior_numero\" da biblioteca \"Matematica\" para escolher o maior entre dois n\u00fameros."}},{"text":"Menor N\u00famero","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/bibliotecas\/matematica\/menor_numero.por","data-description":"Este exemplo demonstra como utilizar a fun\u00e7\u00e3o \"menor_numero\" da biblioteca \"Matematica\" para escolher o menor entre dois n\u00fameros."}},{"text":"Valor Absoluto","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/bibliotecas\/matematica\/valor_absoluto.por","data-description":"Este exemplo demonstra como utilizar a fun\u00e7\u00e3o \"valor_absoluto\" da biblioteca \"Matematica\" para obter o valor absoluto de um n\u00famero."}},{"text":"Arredondamento","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/bibliotecas\/matematica\/arredondamento.por","data-description":"Este exemplo demonstra como utilizar a fun\u00e7\u00e3o \"arredondar\" da biblioteca \"Matematica\" para arredondar um n\u00famero qualquer."}},{"text":"\u00c1rea da Circunfer\u00eancia","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/bibliotecas\/matematica\/area_circunferencia.por","data-description":"Este exemplo demonstra o uso da constante \"PI\" da biblioteca \"Matematica\". Neste exemplo, a constante \u00e9 utilizada para calcular a \u00e1rea de uma circunfer\u00eancia."}}]},{"text":"Texto","icon":"icone icone-pasta","children":[{"text":"Tamanho do Texto","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/bibliotecas\/texto\/tamanho.por","data-description":"Este exemplo demonstra como utilizar a fun\u00e7\u00e3o \"numero_caracteres\" da biblioteca \"Texto\" para descobrir o tamanho de um dado do tipo cadeia."}},{"text":"Ler Caracteres","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/bibliotecas\/texto\/caracteres.por","data-description":"Este exemplo demonstra o uso da fun\u00e7\u00e3o \"obter_caracter\" da biblioteca \"Texto\" para obter um caractere espec\u00edfico dentro de um dado do tipo cadeia. Neste exemplo, o usu\u00e1rio deve informar um valor e o programa ir\u00e1 verificar se o valor digitado \u00e9 um n\u00famero bin\u00e1rio v\u00e1lido."}},{"text":"Pesquisar Texto","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/bibliotecas\/texto\/pesquisar.por","data-description":"Este exemplo demonstra o uso da fun\u00e7\u00e3o \"posicao_texto\" da biblioteca \"Texto\" para descobrir se um dado do tipo cadeia cont\u00e9m uma sequ\u00eancia de caracteres."}},{"text":"Extrair Texto","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/bibliotecas\/texto\/subtexto.por","data-description":"Este exemplo demonstra como utilizar a fun\u00e7\u00e3o \"extrair_subtexto\" da biblioteca \"Texto\" para obter uma parte de um texto armazenado em uma vari\u00e1vel do tipo cadeia."}},{"text":"Substituir Texto","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/bibliotecas\/texto\/substituir.por","data-description":"Este exemplo demonstra o uso da fun\u00e7\u00e3o \"substituir\" da biblioteca \"Texto\" para trocar uma sequ\u00eancia de caracteres por outra em um dado do tipo cadeia."}},{"text":"Caixa Alta","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/bibliotecas\/texto\/caixa_alta.por","data-description":"Este exemplo demonstra como utilizar a fun\u00e7\u00e3o \"caixa_alta\" da biblioteca \"Texto\" para transformar os caracteres de um dado do tipo cadeia em caracteres mai\u00fasculos."}},{"text":"Caixa Baixa","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/bibliotecas\/texto\/caixa_baixa.por","data-description":"Este exemplo demonstra como utilizar a fun\u00e7\u00e3o \"caixa_baixa\" da biblioteca \"Texto\" para transformar os caracteres de um dado do tipo cadeia em caracteres min\u00fasculos."}},{"text":"Preencher Texto","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/bibliotecas\/texto\/preencher.por","data-description":"Este exemplo demonstra o uso da fun\u00e7\u00e3o \"preencher_a_esquerda\" da biblioteca \"Texto\" para inserir uma sequ\u00eancia de caracteres em um dado do tipo cadeia."}}]},{"text":"Util","icon":"icone icone-pasta","children":[{"text":"Aguardar Intervalo","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/bibliotecas\/util\/aguarde.por","data-description":"Este exemplo ilustra o uso da fun\u00e7\u00e3o \"aguarde\" da biblioteca \"Util\" simulando uma contagem regressiva. O programa utiliza a fun\u00e7\u00e3o aguarde para fazer com que o programa espere 1 segundo antes de escrever o pr\u00f3ximo n\u00famero da contagem regressiva na tela."}},{"text":"Sorteio de Um N\u00famero","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/bibliotecas\/util\/sorteio.por","data-description":"Este exemplo pede ao usu\u00e1rio que informe um valor inicial, um valor final e uma quantidade de sorteios a ser executada. Logo ap\u00f3s, utiliza a fun\u00e7\u00e3o \"sorteia\" da biblioteca \"Util\" para sortear n\u00fameros entre os dois valores informados pelo usu\u00e1rio."}},{"text":"Tamanho do Vetor","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/bibliotecas\/util\/vetor.por","data-description":"Este exemplo demonstra como descobrir dinamicamente o n\u00famero de elementos contidos em um vetor. Para isto, o programa utiliza a fun\u00e7\u00e3o \"numero_elementos\" da biblioteca \"Matematica\"."}},{"text":"Tamanho da Matriz","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/bibliotecas\/util\/matriz.por","data-description":"Este exemplo demonstra como descobrir dinamicamente as dimens\u00f5es de uma matriz, isto \u00e9, o n\u00famero de linhas e colunas que ela possui. Para isto, o programa utiliza as fun\u00e7\u00f5es \"numero_linhas\" e \"numero_colunas\" da biblioteca \"Util\"."}},{"text":"Controle de Tempo","icon":"icone icone-exemplo","li_attr":{"data-file":"Recursos\/exemplos\/bibliotecas\/util\/tempo.por","data-description":"Este exemplo ilustra como a fun\u00e7\u00e3o \"tempo_decorrido\" da biblioteca \"Util\" pode ser utilizada para realizar medi\u00e7\u00e3o e controle de tempo em um algoritmo sem utilizar a fun\u00e7\u00e3o \"aguarde\"."}}]}]}]
		}
	});

	$(".action-open").bind("click", function(e) {
		e.preventDefault();
		e.defaultPrevented = true;
		openFile();
	});

	$(".action-add").bind("click", function(e) {
		e.preventDefault();
		e.defaultPrevented = true;
		addTab();
	});

	$(".action-ajuda").bind("click", function(e) {
		e.preventDefault();
		e.defaultPrevented = true;
		abrirAjuda();
	});

	$("#exemplo-go").bind("click", function(e) {
		e.preventDefault();
		e.defaultPrevented = true;

		if (d.exemplo.nome && d.exemplo.codigo) {
			addTab(d.exemplo.nome, d.exemplo.codigo);
		}

	});

	editor = ace.edit("exemplo-editor");
	editor.$blockScrolling = Infinity;
	editor.setTheme("ace/theme/portugol");
	editor.setFontSize(14);
	editor.getSession().setMode("ace/mode/portugol");
	editor.setShowPrintMargin(false);
	editor.getSession().setUseSoftTabs(true);
	editor.setReadOnly(true);
});
