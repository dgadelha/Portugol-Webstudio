# Operações Lógicas

As operações lógicas são uma novidade para muitos, pois raramente são vistas na escola. Um operador lógico opera somente valores lógicos, ou seja, é necessário que o valor à esquerda e o à direita do operador sejam valores lógicos (verdadeiro ou falso).

É muito comum usar expressões relacionais (que dão resultado lógico) e combiná-las usando operadores lógicos. Por exemplo:

| Operações         | Resultado  |
| ----------------- | ---------- |
| 5 > 3 `e` 2 < 1   | falso      |
| `nao` (8 < 4)     | verdadeiro |
| 1 > 3 `ou` 1 <= 1 | verdadeiro |

Assim como as operações aritméticas, as operações lógicas também possuem prioridades. Veja a tabela abaixo:

| Operador | Prioridade |
| -------- | ---------- |
| `ou`     | 1          |
| `e`      | 2          |
| `nao`    | 3          |

Ou seja, o `nao` tem maior prioridade que todos, e o `ou` tem a menor. Veja os exemplos a seguir:

| Passo   | Exemplo 1                   | Exemplo 2                            |
| ------- | --------------------------- | ------------------------------------ |
| Passo 1 | `nao` verdadeiro `ou` falso | verdadeiro `e` falso `ou` verdadeiro |
| Passo 2 | falso `ou` falso            | falso `ou` verdadeiro                |
| Passo 3 | falso                       | verdadeiro                           |

Nesta seção, serão abordados os seguintes tópicos:

- [e](./e.md)
- [ou](./ou.md)
- [nao](./nao.md)
