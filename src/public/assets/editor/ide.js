window.portugol = {
  codes: {},
  fileNames: {},

  abrirExemplo: function (codigo, arquivo) {
    arquivo = arquivo.substring(arquivo.lastIndexOf("/") + 1);
    addTab(arquivo, codigo);
  },

  abrirArquivo: function () {
    openFile();
  },

  abrirAjuda: function () {
    abrirAjuda();
  },
};

const lut = [];

for (let i = 0; i < 256; i++) {
  lut[i] = (i < 16 ? "0" : "") + i.toString(16);
}

function e7() {
  /* ! @see: http://stackoverflow.com/a/21963136 !*/
  const d0 = (Math.random() * 0xffffffff) | 0;
  const d1 = (Math.random() * 0xffffffff) | 0;
  const d2 = (Math.random() * 0xffffffff) | 0;
  const d3 = (Math.random() * 0xffffffff) | 0;

  return `${lut[d0 & 0xff] + lut[(d0 >> 8) & 0xff] + lut[(d0 >> 16) & 0xff] + lut[(d0 >> 24) & 0xff]}-${
    lut[d1 & 0xff]
  }${lut[(d1 >> 8) & 0xff]}-${lut[((d1 >> 16) & 0x0f) | 0x40]}${lut[(d1 >> 24) & 0xff]}-${lut[(d2 & 0x3f) | 0x80]}${
    lut[(d2 >> 8) & 0xff]
  }-${lut[(d2 >> 16) & 0xff]}${lut[(d2 >> 24) & 0xff]}${lut[d3 & 0xff]}${lut[(d3 >> 8) & 0xff]}${
    lut[(d3 >> 16) & 0xff]
  }${lut[(d3 >> 24) & 0xff]}`;
}

let fileName = "";

function openFile() {
  $("#special").html('<input type="file" id="file-input" />');
  $("#file-input").trigger("click");

  document.getElementById("file-input").addEventListener(
    "change",
    e => {
      const file = e.target.files[0];

      if (!file) {
        return;
      }

      const reader = new FileReader();

      fileName = file.name; // .replace(/\.[^/.]+$/, "");

      reader.onload = function (e) {
        const contents = e.target.result;

        addTab(fileName, contents);
      };

      reader.readAsText(file, "ISO-8859-1");
    },
    false,
  );
}

function limparCodigo(content) {
  const inicioComentario = content.indexOf("/* $$$ Portugol Studio $$$ ");

  if (inicioComentario != -1) {
    fimComentario = content.indexOf("*/", inicioComentario + 1);

    if (fimComentario != -1) {
      content = content.substring(0, inicioComentario - 1) + content.substring(fimComentario + 2);
    }
  }

  return content;
}

function addTab(name = "Sem título", content = "") {
  const id = `t${e7()}`;
  const nid = id.replace(/-/g, "");

  $("#tab-add").before(
    `<li class="secondary secondary-file"><a href="#tab-${id}" id="anchor-${id}"><span class="portugol-icon"></span> <span class="name">${name}</span> <span title="Fechar aba" class="close-icon"></span></a></li>`,
  );

  if (content != "") {
    window.portugol.codes[nid] = content;
  }

  window.portugol.fileNames[nid] = name;

  let tpl = `<div id="tab-${id}" class="tab">`;

  tpl += `<iframe src="${d.baseUrl}editor?fnam=${encodeURIComponent(name)}&cid=${encodeURIComponent(nid)}"></iframe>`;
  tpl += "</div>";

  $("#ide").append(tpl);
  bindHTML($(`#anchor-${id}`));
  $(`#anchor-${id}`).trigger("click");

  $(`#anchor-${id} .close-icon`).bind("click", function (e) {
    e.preventDefault();
    const id = $(this).parent().attr("id").substr(7);

    $(this).parent().parent().remove();
    $(`#tab-${id}`).remove();
    $("#anchor-inicio").trigger("click");
  });
}

function bindHTML(tag) {
  tag.bind("click", function (e) {
    e.preventDefault();

    const ttid = $(this.hash).attr("id");
    const nid = ttid.substring(4).replace(/-/g, "");

    if ($(this).hasClass("active") && $(this).parent().hasClass("secondary-file")) {
      const name = prompt("Informe o novo nome:", $(this).children(".name").text());

      if (name) {
        $(this).children(".name").text(name);
        window.portugol.fileNames[nid] = name;
      }
    }

    $("ul.tabs a.active").removeClass("active");
    $(".tab").hide();

    $(this).addClass("active");
    $(this.hash).show();

    console.log(`Exibindo: ${ttid}`);

    $(window).trigger("resize");
    $(".ax5layout").trigger("resize");
  });
}

function abrirAjuda() {
  if ($("#anchor-ajuda")[0]) {
    $("#anchor-ajuda").trigger("click");
  } else {
    $("#tab-add").before(
      '<li class="secondary"><a href="#tab-ajuda" id="anchor-ajuda"><span class="help-icon"></span> Ajuda <span title="Fechar aba" class="close-icon"></span></a></li>',
    );

    let tpl = '<div id="tab-ajuda" class="tab">';

    tpl += `<iframe src="${d.baseUrl}ajuda"></iframe>`;
    tpl += "</div>";

    $("#ide").append(tpl);
    bindHTML($("#anchor-ajuda"));

    $("#anchor-ajuda").trigger("click");
    $("#anchor-ajuda .close-icon").bind("click", function (e) {
      e.preventDefault();
      $(this).parent().parent().remove();
      $("#tab-ajuda").remove();
      $("#anchor-inicio").trigger("click");
    });
  }
}

$(window).bind("load", () => {
  bindHTML($("#anchor-inicio"));
  $("#anchor-inicio").trigger("click");
  $("#ax1").ax5layout();

  $(".alert-res-close a").bind("click", e => {
    e.preventDefault();
    e.defaultPrevented = true;

    $(".alert-res").remove();
    $("#ide").removeClass("hidden-xs");
    $(window).trigger("resize");
  });

  if (document.location.hash.length > 8) {
    const key = document.location.hash.substring(7);

    $.get(`/ide/editor/share/${key}`, data => {
      if (data && data.key && data.data) {
        addTab(`Código compartilhado (#${data.key})`, data.data);
      }
    });
  }

  $.get("/recursos/exemplos/index.json", data => {
    $(".jstree")
      .on("changed.jstree", (e, data) => {
        if (data.changed.selected.length == 0) {
          return;
        }

        const sid = data.changed.selected[0];
        const file = $(`#${sid}`).attr("data-file");

        if (file != null && file != "") {
          d.exemplo.nome = file.substring(file.lastIndexOf("/") + 1);
          $.get(`${d.baseUrl}resp?file=${file}`, data => {
            data = limparCodigo(data);
            d.exemplo.codigo = data;
            $("#exemplo-desc").text($(`#${sid}`).attr("data-description"));
            $("#exemplo-go").removeClass("hide");
          });
        } else {
          d.exemplo.nome = false;
          d.exemplo.codigo = false;
          $("#exemplo-go").addClass("hide");
          $("#exemplo-desc").text("Selecione um exemplo ao lado para ver a descrição.");
        }
      })
      .dblclick(abrirArquivoParaEdicao)
      .jstree(data);
  });

  $(".action-open").bind("click", e => {
    e.preventDefault();
    e.defaultPrevented = true;
    openFile();
  });

  $(".action-add").bind("click", e => {
    e.preventDefault();
    e.defaultPrevented = true;
    addTab();
  });

  $(".action-ajuda").bind("click", e => {
    e.preventDefault();
    e.defaultPrevented = true;
    abrirAjuda();
  });

  $("#exemplo-go").bind("click", abrirArquivoParaEdicao);

  function abrirArquivoParaEdicao(e) {
    e.preventDefault();
    e.defaultPrevented = true;

    if (d.exemplo.nome && d.exemplo.codigo) {
      addTab(d.exemplo.nome, d.exemplo.codigo);
    }
  }
});
