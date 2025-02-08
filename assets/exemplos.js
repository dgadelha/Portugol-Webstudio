/* eslint-disable */

/*
 * Função que permite executar loops de forma assíncrona e executar
 * uma função de callback ao final do loop
 */
function asyncLoop(iterations, func, callback) {
  let index = 0;
  let done = false;
  var loop = {
    next: function () {
      loop.index = index;

      if (done) {
        return;
      }

      if (index < iterations) {
        index++;
        func(loop);
      } else {
        done = true;
        callback();
      }
    },

    iteration: function () {
      return index - 1;
    },

    break: function () {
      done = true;
      callback();
    },
  };

  loop.next();

  return loop;
}

// @ts-expect-error
String.prototype.escapeHtml = function () {
  return this.replace(/&/g, "&amp;")
    .replace(/>/g, "&gt;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

function obterExemplos() {
  const exemplos = [];

  // @ts-expect-error
  $(".codigo-portugol").each((indice, elemento) => {
    exemplos.push({ div: elemento, caminho: elemento.dataset.file });
  });

  return exemplos;
}

function carregarExemplos(callback) {
  const exemplos = obterExemplos();

  asyncLoop(
    exemplos.length,
    loop => {
      // @ts-expect-error
      $.get(
        exemplos[loop.index].caminho,
        content => {
          exemplos[loop.index].codigo = content;
          loop.next();
        },
        "text",
      );
    },
    () => {
      callback(exemplos);
    },
  );
}

// @ts-expect-error
$(document).ready(() => {
  carregarExemplos(exemplos => {
    asyncLoop(
      exemplos.length,
      loop => {
        const exemplo = exemplos[loop.index];
        const { codigo } = exemplo;
        const { div } = exemplo;
        const titulo = div.dataset.title;
        const tipo = div.dataset.type;

        const htmlCabecalho = `<div>${titulo.escapeHtml()}</div>`;

        // @ts-expect-error
        const cabecalho = $(htmlCabecalho).attr({
          class: "cabecalho-codigo-portugol",
          style: "color:white",
        });

        // @ts-expect-error
        $(div)
          .append(cabecalho)
          .append(
            // @ts-expect-error
            $(`<pre>${codigo.escapeHtml()}</pre>`).attr({
              name: "code",
              class: "portugol:nocontrols",
            }),
          );

        if (tipo == "exemplo") {
          // @ts-expect-error
          $(div).after(
            // @ts-expect-error
            $("<a>Tente você mesmo</a>").attr({
              class: "botao-codigo-fonte",
              href: "#",
              id: `tvml${loop.index}`,
              "data-file": exemplo.caminho,
            }),
          );

          // @ts-expect-error
          $(`#tvml${loop.index}`).bind("click", function (e) {
            e.preventDefault();
            e.defaultPrevented = true;

            // @ts-expect-error
            window.parent.portugol.abrirExemplo(codigo, $(this).data("file").split("/").pop());
          });
        }

        loop.next();
      },
      () => {
        // @ts-expect-error
        dp.SyntaxHighlighter.HighlightAll("code");
      },
    );
  });
});
