$(window).bind("load", function() {
    $(".ax5layout").ax5layout();

    $(".jstree").on("changed.jstree", function(e, data) {
        if (data.changed.selected.length == 0) return;

        var sid = data.changed.selected[0];
        var html = $("#" + sid).attr("data-html");

        $("#mainFrame").attr("src", d.baseUrl + "resp?file=Recursos/ajuda/" + html);
    }).jstree({
        "core": {
            "themes": {
                "name": "default-dark",
                "dots": true,
                "icons": true
            },

            "data": [
                {
                    "text": "Linguagem Portugol",
                    "icon": "icone icone-lib",
                    "state": {
                        "selected": true,
                        "opened": true
                    },
                    "li_attr": {
                        "data-html": "topicos/linguagem_portugol/index.html"
                    },

                    "children": [
                        {
                            "text": "Bibliotecas",
                            "li_attr": {
                                "data-html": "topicos/linguagem_portugol/bibliotecas/index.html"
                            }
                        },
                        {
                            "text": "Declarações",
                            "icon": "icone icone-lib",
                            "li_attr": {
                                "data-html": "topicos/linguagem_portugol/declaracoes/index.html"
                            },

                            "children": [
                                {
                                    "text": "Declaração de Variáveis",
                                    "li_attr": {
                                        "data-html": "topicos/linguagem_portugol/declaracoes/variavel.html"
                                    }
                                },
                                {
                                    "text": "Declaração de Constante",
                                    "li_attr": {
                                        "data-html": "topicos/linguagem_portugol/declaracoes/constante.html"
                                    }
                                },
                                {
                                    "text": "Declaração de Função",
                                    "li_attr": {
                                        "data-html": "topicos/linguagem_portugol/declaracoes/funcao.html"
                                    }
                                },
                                {
                                    "text": "Declaração de Matriz",
                                    "li_attr": {
                                        "data-html": "topicos/linguagem_portugol/declaracoes/matriz.html"
                                    }
                                },
                                {
                                    "text": "Declaração de Vetor",
                                    "li_attr": {
                                        "data-html": "topicos/linguagem_portugol/declaracoes/vetor.html"
                                    }
                                }
                            ]
                        },
                        {
                            "text": "Entrada e Saída",
                            "icon": "icone icone-lib",
                            "li_attr": {
                                "data-html": "topicos/linguagem_portugol/entrada_saida/index.html"
                            },

                            "children": [
                                {
                                    "text": "Escreva",
                                    "li_attr": {
                                        "data-html": "topicos/linguagem_portugol/entrada_saida/escreva.html"
                                    }
                                },
                                {
                                    "text": "Leia",
                                    "li_attr": {
                                        "data-html": "topicos/linguagem_portugol/entrada_saida/leia.html"
                                    }
                                },
                                {
                                    "text": "Limpa",
                                    "li_attr": {
                                        "data-html": "topicos/linguagem_portugol/entrada_saida/limpa.html"
                                    }
                                }
                            ]
                        },
                        {
                            "text": "Expressões",
                            "icon": "icone icone-lib",
                            "li_attr": {
                                "data-html": "topicos/linguagem_portugol/expressao/index.html"
                            },

                            "children": [
                                {
                                    "text": "Operações Relacionais",
                                    "li_attr": {
                                        "data-html": "topicos/linguagem_portugol/expressao/relacional.html"
                                    }
                                },
                                {
                                    "text": "Atribuições",
                                    "li_attr": {
                                        "data-html": "topicos/linguagem_portugol/expressao/atribuicao.html"
                                    }
                                },
                                {
                                    "text": "Operações Aritméticas",
                                    "li_attr": {
                                        "data-html": "topicos/linguagem_portugol/expressao/operacoes_aritimeticas/index.html"
                                    },

                                    "children": [
                                        {
                                            "text": "Operação de Adição",
                                            "li_attr": {
                                                "data-html": "topicos/linguagem_portugol/expressao/operacoes_aritimeticas/operacao_adicao.html"
                                            }
                                        },
                                        {
                                            "text": "Operação de Subtração",
                                            "li_attr": {
                                                "data-html": "topicos/linguagem_portugol/expressao/operacoes_aritimeticas/operacao_subtracao.html"
                                            }
                                        },
                                        {
                                            "text": "Operação de Multiplicação",
                                            "li_attr": {
                                                "data-html": "topicos/linguagem_portugol/expressao/operacoes_aritimeticas/operacao_multiplicacao.html"
                                            }
                                        },
                                        {
                                            "text": "Operação de Divisão",
                                            "li_attr": {
                                                "data-html": "topicos/linguagem_portugol/expressao/operacoes_aritimeticas/operacao_divisao.html"
                                            }
                                        },
                                        {
                                            "text": "Operação de Modulo",
                                            "li_attr": {
                                                "data-html": "topicos/linguagem_portugol/expressao/operacoes_aritimeticas/operacao_modulo.html"
                                            }
                                        }
                                    ]
                                },
                                {
                                    "text": "Operações Lógicas",
                                    "li_attr": {
                                        "data-html": "topicos/linguagem_portugol/expressao/operacoes_logicas/index.html"
                                    },

                                    "children": [
                                        {
                                            "text": "e",
                                            "li_attr": {
                                                "data-html": "topicos/linguagem_portugol/expressao/operacoes_logicas/e.html"
                                            }
                                        },
                                        {
                                            "text": "ou",
                                            "li_attr": {
                                                "data-html": "topicos/linguagem_portugol/expressao/operacoes_logicas/ou.html"
                                            }
                                        },
                                        {
                                            "text": "nao",
                                            "li_attr": {
                                                "data-html": "topicos/linguagem_portugol/expressao/operacoes_logicas/nao.html"
                                            }
                                        }
                                    ]
                                },
                                {
                                    "text": "Operações Bitwise",
                                    "li_attr": {
                                        "data-html": "topicos/linguagem_portugol/expressao/operacoes_bitwise/index.html"
                                    },

                                    "children": [
                                        {
                                            "text": "Operação de Bitwise AND",
                                            "li_attr": {
                                                "data-html": "topicos/linguagem_portugol/expressao/operacoes_bitwise/bitwise_and.html"
                                            }
                                        },
                                        {
                                            "text": "Operação de Bitwise OR",
                                            "li_attr": {
                                                "data-html": "topicos/linguagem_portugol/expressao/operacoes_bitwise/bitwise_or.html"
                                            }
                                        },
                                        {
                                            "text": "Operação de Bitwise NOT",
                                            "li_attr": {
                                                "data-html": "topicos/linguagem_portugol/expressao/operacoes_bitwise/bitwise_not.html"
                                            }
                                        },
                                        {
                                            "text": "Operação de Bitwise XOR",
                                            "li_attr": {
                                                "data-html": "topicos/linguagem_portugol/expressao/operacoes_bitwise/bitwise_xor.html"
                                            }
                                        },
                                        {
                                            "text": "Operação de Bitwise Shift",
                                            "li_attr": {
                                                "data-html": "topicos/linguagem_portugol/expressao/operacoes_bitwise/bitwise_shift.html"
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "text": "Estruturas de Controle",
                            "icon": "icone icone-lib",
                            "li_attr": {
                                "data-html": "topicos/linguagem_portugol/estruturas_controle/index.html"
                            },

                            "children": [
                                {
                                    "text": "Desvios Condicionais",
                                    "li_attr": {
                                        "data-html": "topicos/linguagem_portugol/estruturas_controle/desvio/index.html"
                                    },
                                    "children": [
                                        {
                                            "text": "Se",
                                            "li_attr": {
                                                "data-html": "topicos/linguagem_portugol/estruturas_controle/desvio/se.html"
                                            }
                                        },
                                        {
                                            "text": "Se senao",
                                            "li_attr": {
                                                "data-html": "topicos/linguagem_portugol/estruturas_controle/desvio/se_senao.html"
                                            }
                                        },
                                        {
                                            "text": "Se senao se",
                                            "li_attr": {
                                                "data-html": "topicos/linguagem_portugol/estruturas_controle/desvio/se_senao_se.html"
                                            }
                                        },
                                        {
                                            "text": "Escolha caso",
                                            "li_attr": {
                                                "data-html": "topicos/linguagem_portugol/estruturas_controle/desvio/escolha_caso.html"
                                            }
                                        }
                                    ]
                                },
                                {
                                    "text": "Laços de Repetição",
                                    "li_attr": {
                                        "data-html": "topicos/linguagem_portugol/estruturas_controle/repeticao/index.html"
                                    },

                                    "children": [
                                        {
                                            "text": "Enquanto",
                                            "li_attr": {
                                                "data-html": "topicos/linguagem_portugol/estruturas_controle/repeticao/enquanto.html"
                                            }
                                        },
                                        {
                                            "text": "Faca enquanto",
                                            "li_attr": {
                                                "data-html": "topicos/linguagem_portugol/estruturas_controle/repeticao/faca_enquanto.html"
                                            }
                                        },
                                        {
                                            "text": "Para",
                                            "li_attr": {
                                                "data-html": "topicos/linguagem_portugol/estruturas_controle/repeticao/para.html"
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "text": "Tipos",
                            "icon": "icone icone-lib",
                            "li_attr": {
                                "data-html": "topicos/linguagem_portugol/tipos/index.html"
                            },

                            "children": [
                                {
                                    "text": "Inteiro",
                                    "li_attr": {
                                        "data-html": "topicos/linguagem_portugol/tipos/inteiro.html"
                                    }
                                },
                                {
                                    "text": "Real",
                                    "li_attr": {
                                        "data-html": "topicos/linguagem_portugol/tipos/real.html"
                                    }
                                },
                                {
                                    "text": "Caracter",
                                    "li_attr": {
                                        "data-html": "topicos/linguagem_portugol/tipos/caracter.html"
                                    }
                                },
                                {
                                    "text": "Cadeia",
                                    "li_attr": {
                                        "data-html": "topicos/linguagem_portugol/tipos/cadeia.html"
                                    }
                                },
                                {
                                    "text": "Logico",
                                    "li_attr": {
                                        "data-html": "topicos/linguagem_portugol/tipos/logico.html"
                                    }
                                },
                                {
                                    "text": "Vazio",
                                    "li_attr": {
                                        "data-html": "topicos/linguagem_portugol/tipos/vazio.html"
                                    }
                                }
                            ]
                        },
                    ]
                }
            ]
        },

        "types": {
            "default": {
                "icon": "icone icone-def"
            }
        },

        "plugins": [ "changed", "types", "wholerow" ]
    });
});
