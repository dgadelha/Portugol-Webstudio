# runtime
Binário responsável pelo controle do console do Portugol.

## Compilando
Certifique-se de possuir instalado:
** Compilar apenas no Linux **

* [Python 3.5](https://www.python.org/downloads/)
* [Pexpect](https://pypi.python.org/pypi/pexpect)
* [ptyprocess](https://github.com/pexpect/ptyprocess)
* [Pyinstaller](http://www.pyinstaller.org/)
* [UPX](https://upx.github.io/)

Compile o runtime com:
```sh
pyinstaller --noconfirm --log-level=WARN --onefile --nowindow runtime.py
```
O binário se encontrará dentro de `dist/`
