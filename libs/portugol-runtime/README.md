# portugol-runtime
Script para limitar o uso do console do Portugol

**Não são distribuídos binários neste repositório, você deve compilar você mesmo**

## Compilando

Certifique-se de possuir instalado .NET SDK:
* [.NET SDK](https://www.microsoft.com/net/learn/get-started) (2.1+)

Suporte para Linux (Debian-based) e Windows, para compilar é só rodar o script da plataforma desejada:
##### Windows
```sh
./compile_windows.bat
```
##### Linux
```sh
./compile_linux.sh
```

Não é preciso fazer outras alterações neste projeto, o Portugol Webstudio detectará o binário da sua plataforma automaticamente.
Ambos scripts compilam para ambas plataformas (Linux e Windows)