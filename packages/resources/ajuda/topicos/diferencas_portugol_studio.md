# Diferenças em relação ao Portugol Studio

O Portugol Webstudio usa a mesma linguagem do [Portugol Studio](https://univali-lite.github.io/Portugol-Studio/), e o Portugol Studio é a referência de como cada programa deve se comportar: um programa que funciona em um deve funcionar no outro, com os mesmos resultados e os mesmos erros.

Esta página lista as exceções: o que o Webstudio ainda não tem, e os poucos casos em que ele faz diferente de propósito, quase sempre porque o Portugol Studio tem um defeito naquele ponto.

---

# Bibliotecas

As bibliotecas abaixo existem no Portugol Studio, mas ainda não no Webstudio. Um programa que inclui uma delas mostra um erro e não é executado:

- Arquivos
- Internet
- Mouse
- ServicosWeb
- Sons
- Teclado

As outras bibliotecas funcionam como no Portugol Studio. Veja a lista em [Bibliotecas](linguagem_portugol/bibliotecas/index.md).

---

# Resultados diferentes

Nestes casos o programa funciona nos dois, mas o resultado é diferente, porque o do Portugol Studio está errado.

## Atribuição composta com uma expressão

Em `a *= 1 + 2`, o Webstudio multiplica `a` pela expressão inteira, como se espera. O Portugol Studio troca o comando por `a = a * 1 + 2`, sem parênteses, e por isso multiplica só pelo `1`. O mesmo vale para `+=`, `-=` e `/=`.

```portugol sintaxe title="Atribuição composta"
inteiro a = 3
a *= 1 + 2
escreva(a) // 9 no Webstudio, 5 no Portugol Studio
```

## Menos duas vezes

No Webstudio, `-(-i)` vale `i`. No Portugol Studio, ele diminui `i` em 1, como se fosse `--i`, e o valor da variável muda.

```portugol sintaxe title="Menos duas vezes"
inteiro i = 7
escreva(-(-i), " ", i) // "7 7" no Webstudio, "6 6" no Portugol Studio
```

## Soma de dois caracteres

Somar dois valores do tipo `caracter`, como `'C' + 'a'`, resulta em um número `inteiro`, a soma dos códigos dos caracteres. Os dois calculam o mesmo número, mas o Portugol Studio diz que o resultado é uma `cadeia`, e por isso aceita guardá-lo numa variável `cadeia` e só falha ao executar. O Webstudio aponta o erro no editor.

Para juntar os caracteres numa cadeia, inclua uma cadeia na expressão:

```portugol sintaxe title="Juntando caracteres"
escreva('C' + 'a')      // 164
escreva("" + 'C' + 'a') // Ca
```

## Funções matemáticas

Algumas funções da biblioteca Matematica, como `raiz`, `potencia`, `seno` e `cosseno`, podem dar um resultado diferente no último algarismo das casas decimais. Os dois fazem a mesma conta, mas cada um usa a matemática da sua plataforma (Java no Portugol Studio, JavaScript no navegador).

## Algarismos de outros alfabetos

A função `cadeia_para_inteiro` da biblioteca Tipos aceita só os algarismos de 0 a 9. O Portugol Studio também aceita algarismos de outros alfabetos, como o ٣ (o 3 em árabe).

---

# Programas aceitos só no Webstudio

O Webstudio aceita estes programas, que estão corretos, mas que o Portugol Studio recusa por um defeito dele:

- Um comentário depois do `}` que fecha o programa
- Uma chave `}` dentro de uma cadeia, como em `escreva(" }")`
- Tamanho de vetor ou matriz com uma conta como `inteiro v[5 - 2]` ou `inteiro v[8 >> 1]`: na subtração, na divisão, no resto e nos deslocamentos, o Portugol Studio faz a conta ao contrário
- Tamanho de vetor ou matriz com um sinal de menos ou um `~` em volta do valor todo, como `inteiro v[-(-3)]`
- Algumas expressões que o Portugol Studio não consegue traduzir, como `1 - 2 + "a"`, `7 % 5 * 0.5` e o operador `~` logo antes de uma função de biblioteca
- Um incremento dentro de uma conta, como `i++ + i++` ou `-i++` (veja abaixo)

## Incremento dentro de uma conta

O Portugol define `i++` como um comando, que equivale a `i = i + 1`, e o mesmo vale para `++i`, `i--` e `--i`. Como comando, no `para` e sozinho como valor, como em `escreva(i++)` ou `inteiro r = i++`, o incremento funciona igual nos dois: a variável muda, e o valor usado é o novo.

Dentro de uma conta, o resultado segue o código que o Portugol Studio gera, e não o de outras linguagens como C ou JavaScript. Por isso o Webstudio mostra um aviso, mas executa o programa:

```portugol sintaxe title="Incremento dentro de uma conta"
inteiro i = 1
inteiro r = i++ + i++ // r e i valem 4; em C ou JavaScript, valeriam 3
```

Para evitar surpresas, escreva o incremento numa linha separada, antes ou depois da conta.

---

# Mensagens de erro

As mensagens de erro são as do Portugol Studio, com algumas diferenças:

- O sublinhado marca só o trecho onde está o erro, e não o começo do comando. Em `escreva(a b)`, o Webstudio aponta o `b`, e o Portugol Studio aponta o `(`.
- Quando falta fechar um `(`, `[` ou `{` no fim de uma linha, o erro aparece no fim dessa linha, e não no começo da próxima.
- Quando a mensagem do Portugol Studio aponta o problema errado, o Webstudio mostra uma mensagem corrigida. Por exemplo, em `inteiro x =` sem um valor, o Portugol Studio pede para inserir um `(`, e o Webstudio diz que era esperada uma expressão.
- Algumas mensagens são exclusivas do Webstudio, como a de um comentário que não foi fechado, a de um acento no nome de uma variável e a de um `caracter` vazio.
- Onde o Portugol Studio mostra uma mensagem em inglês ou para com um erro interno, o Webstudio mostra uma mensagem em português.
- Comparar duas cadeias com `>`, `<`, `>=` ou `<=` é um erro nos dois. O Portugol Studio só mostra o erro ao executar o programa, sem dizer a linha; o Webstudio mostra no editor, no lugar da comparação.

Para alguns enganos comuns, o Webstudio diz o que está errado, onde o Portugol Studio quase sempre pede um `(` ou um `)`:

| Código                         | Mensagem do Webstudio                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| `se (x = 1)`                   | Um sinal de igual só, `=`, guarda um valor numa variável, e não compara dois valores |
| `se (x =< 1)`                  | O operador `=<` não existe                                                           |
| `senao (x > 1)`                | O `senao` não recebe uma condição                                                    |
| `inteiro m[2,3]`               | As posições de uma matriz não são separadas por vírgula                              |
| `se (v[1) {`                   | Era esperado `]` antes de `)`                                                        |
| `caso 1:` fora de um `escolha` | A palavra `caso` só pode ser usada dentro de um `escolha`                            |

O Webstudio também mostra avisos que o Portugol Studio não tem. Eles não impedem a execução do programa:

- Sobre variáveis, vetores, matrizes, constantes e parâmetros que foram declarados mas não são usados
- Sobre um incremento, como `i++`, usado dentro de uma conta
