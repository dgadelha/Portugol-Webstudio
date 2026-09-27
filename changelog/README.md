# Mudanças da versão beta

Cada mudança que ainda não chegou na versão estável fica num arquivo `.md` nesta pasta. Assim, dois pull requests nunca editam o mesmo trecho do [`CHANGELOG.md`](../CHANGELOG.md) e não entram em conflito.

Para registrar a sua mudança, rode:

```sh
npm run changelog:entry
```

O comando cria um arquivo com a data e a hora no nome, como `changelog/2026-09-27-18-13-00.md`. Escreva nele o texto da mudança, pensando em quem usa a IDE (estudantes e professores), sem jargão técnico. Se quiser, termine com o seu usuário do GitHub e o link do PR, como nas outras entradas:

```md
Contribuição de [@usuario](https://github.com/usuario). [Mais detalhes](link do PR)
```

Não precisa colocar título, data nem a linha `---` que separa as mudanças: isso é feito automaticamente. A versão beta ([beta.portugol.dev](https://beta.portugol.dev/)) mostra os arquivos desta pasta, e quando o beta chega na versão estável eles são juntados no `CHANGELOG.md`, numa seção com a data do dia, e apagados daqui.

Para ver a sua mudança na IDE rodando localmente, reinicie o `npm start`: as mudanças desta pasta são lidas quando ele começa.
