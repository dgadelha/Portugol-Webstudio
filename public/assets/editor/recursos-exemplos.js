// Função que permite executar loops de forma assíncrona e executar
// uma função de callback ao final do loop
function asyncLoop(iterations, func, callback) {
    var index = 0;
    var done = false;
    var loop = {
        next: function() {
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

        iteration: function() {
            return index - 1;
        },

        break: function() {
            done = true;
            callback();
        }
    };

    loop.next();

    return loop;
}

String.prototype.escapeHtml = function() {
    return this.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
};

function obterExemplos() {
    var exemplos = [];

    $(".codigo-portugol").each(function(indice, elemento) {
        exemplos.push({div: elemento, caminho: elemento.dataset.file});
    });

    return exemplos;
}

function carregarExemplos(callback) {
    var exemplos = obterExemplos();

    asyncLoop(exemplos.length, function(loop) {
        $.get("resp?file=" + exemplos[loop.index].caminho, function(content) {
            exemplos[loop.index].codigo = content;
            loop.next();
        }, "text");
    }, function() {
        callback(exemplos);
    });
}

$(document).ready(function() {
    carregarExemplos(function(exemplos) {
        asyncLoop(exemplos.length, function(loop) {
            var exemplo = exemplos[loop.index];
            var codigo = exemplo.codigo;
            var div = exemplo.div;
            var titulo = div.dataset.title;
            var tipo = div.dataset.type;

            var htmlCabecalho = "<div>" + titulo.escapeHtml() + "</div>";

            var cabecalho = $(htmlCabecalho).attr({
                class: "cabecalho-codigo-portugol",
                style: "color:white"
            });

            $(div).append(cabecalho).append($("<pre>" + codigo.escapeHtml() + "</pre>").attr({
                name: "code", class: "portugol:nocontrols"
            }));

            if (tipo == "exemplo") {
                $(div).after($("<a>Tente você mesmo</a>").attr({
                    class: "botao-codigo-fonte",
                    href: "#",
                    id: "tvml" + loop.index,
                    "data-file": exemplo.caminho
                }));

                $("#tvml" + loop.index).bind("click", function(e) {
                    e.preventDefault();
                    e.defaultPrevented = true;
                    window.parent.parent.portugol.abrirExemplo(codigo, $(this).data("file"));
                });
            }

            loop.next();
        }, function() {
            dp.SyntaxHighlighter.HighlightAll('code');
        });
    });
});
