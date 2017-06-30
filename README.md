# Portugol Webstudio [![Build Status](https://travis-ci.org/dgadelha/Portugol-Webstudio.svg?branch=master)](https://travis-ci.org/dgadelha/Portugol-Webstudio)
IDE online para o Portugol (UNIVALI)

## Bibliotecas Utilizadas
- [jQuery](https://jquery.com/) para diminuir a dor de cabeça
- [Socket.io](https://github.com/socketio/socket.io) para permitir saídas e interação em tempo real
- [Twig](https://twig.sensiolabs.org/) templating framework para ajudar na construção de páginas sem ter que realizar muita programação no node
- [pty.js](https://github.com/chjj/pty.js) para emular um terminal virtual
- [Express](http://expressjs.com/) framework para gerar as páginas, configurar rotas e permitir uma fácil integração
- [Nodemon](https://nodemon.io/) para monitorar alterações no código e reiniciar o node manualmente
- [Pexpect](https://pexpect.readthedocs.io) resposável por controlar o console do portugol dentro do runtime.py
- [Portugol-Console](https://github.com/UNIVALI-LITE/Portugol-Console) [(modificado com saída limpa / UTF-8)](https://github.com/dgadelha/Portugol-Console) para executar o código inserido pelo usuário
- [Portugol-Nucleo](https://github.com/UNIVALI-LITE/Portugol-Nucleo) [(modificado para UTF-8)](https://github.com/dgadelha/Portugol-Nucleo) - necessário para o Portugol-Console

## Compilando
Certifique-se de possuir instalado:
* [NodeJS e NPM](https://nodejs.org/en/download/)
* [Python 3 (ou superior)](https://www.python.org/downloads/)
* [Pexpect](https://pypi.python.org/pypi/pexpect)

Instale as dependências utilizando:

	npm install

Após a instalação, é necessário instalar o pexpect antes de iniciar o aplicativo. Você pode instalar manualmente utilizando pip ou tentar instalar usando:

	npm preinstall

Logo, você poderá iniciar o sistema utilizando:

	npm start

Após isto, você poderá acessar o aplicativo em: [http://127.0.0.1:3000](http://127.0.0.1:3000)

## Contribuidores
- [Alisson Steffens](https://github.com/AlissonSteffens)
- [Douglas Gadêlha](https://github.com/dgadelha)
- [Guilherme Scaranse](https://github.com/guiscaranse)
- [Laboratório de Inovação Tecnológica na Educação (LITE) da Universidade do Vale do Itajaí (UNIVALI)](https://github.com/UNIVALI-LITE)

## Sobre o Projeto
Este projeto foi criado graças ao Programa Institucional de Bolsa de Iniciação à Docência (Pibid), programa da Coordenação de Aperfeiçoamento de Pessoal de Nível Superior (CAPES), fundação vinculada ao Ministério da Educação (MEC).

**Autor:** [Douglas Gadêlha Souza Silva](mailto:douglas.gadelha@ifba.edu.br)

**Co-autor:** [Guilherme Scaranse](mailto:guilherme.scaranse@ifba.edu.br)

**Orientador:** [Douglas Xavier Teodoro de Oliveira](mailto:douglasteodoro@ifba.edu.br)

**Instituição:** [Instituto Federal de Educação, Ciência e Tecnologia da Bahia (IFBA) - Campus Porto Seguro](http://portoseguro.ifba.edu.br/)

## Licença
    Portugol Webstudio - IDE online para o Portugol (UNIVALI)
    Copyright (C) 2016  Douglas Gadêlha / Ministério da Educação (MEC)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
