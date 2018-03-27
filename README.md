<img src="https://cdn.rawgit.com/dgadelha/Portugol-Webstudio/06fd49b6/public/assets/landing/img/lightbulb.svg" width="123px" alt="Portugol Webstudio" align="right">

# Portugol Webstudio

*IDE online para o Portugol (UNIVALI)*

[![Estado de Build](https://travis-ci.org/dgadelha/Portugol-Webstudio.svg?branch=master)](https://travis-ci.org/dgadelha/Portugol-Webstudio) [![Licença](https://img.shields.io/badge/licen%C3%A7a-GPL-blue.svg)](https://github.com/dgadelha/Portugol-Webstudio/blob/master/LICENSE) [![Uptime Robot ratio (30 dias)](https://img.shields.io/uptimerobot/ratio/m779527785-838b3e8aaad99ab74a5ca00f.svg)](https://stats.uptimerobot.com/Z4wPBuEq7)

Baseado no Portugol Studio (UNIVALI), o **Portugol Webstudio** tenta trazer todo ambiente de desenvolvimento que é possível se encontrar no desktop, para a internet. Ele constitui-se de um ambiente de desenvolvimento construído para permitir a criação e a execução dos programas escritos em Portugol, trazendo assim uma experiência o mais próxima do que você pode encontrar da IDE do Portugol Studio. Portugol, também conhecido como Português estruturado, é um pseudocódigo escrito em português.

![Captura de Tela](https://raw.githubusercontent.com/dgadelha/Portugol-Webstudio/master/public/assets/screenshot.png)

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
- [Ace](https://ace.c9.io/) para o Editor de Código
- [ax5ui-layout](http://ax5.io/ax5ui-layout/) para o Layout do IDE
- [Bootstrap](https://getbootstrap.com/) para os Grids responsivos

## Características

- Suporta abertura e escrita de arquivos `.por`
- Permite editar e rodar múltiplos códigos ao mesmo tempo
- Executado no console original do Portugol com interação em tempo real
- Interface simples e idêntica ao Portugol Studio

***
## Compilando
**Apenas suporte para plataformas Linux.** Ver [#8](https://github.com/dgadelha/Portugol-Webstudio/issues/8) em caso de dúvidas.

Certifique-se de possuir instalado:
* [NodeJS](https://nodejs.org/en/download/) (8+)
* [NPM](https://nodejs.org/en/download/) (5.0+)

Compile o Portugol Webstudio com:
```sh
npm install
npm start
```

Após isto, você poderá acessar o aplicativo em: [http://127.0.0.1:3000](http://127.0.0.1:3000)

> Versões anteriores do NPM e NodeJS podem funcionar, embora não tenham sido testadas.

***
## Contribuidores
- [Alisson Steffens](https://github.com/AlissonSteffens)
- [Douglas Gadêlha](https://github.com/dgadelha)
- [Guilherme Scaranse](https://github.com/guiscaranse)
- [Laboratório de Inovação Tecnológica na Educação (LITE) da Universidade do Vale do Itajaí (UNIVALI)](https://github.com/UNIVALI-LITE)

## Sobre o Projeto

**Autor:** [Douglas Gadêlha](mailto:dgadelha@live.com)

**Co-autor:** [Guilherme Scaranse](mailto:guilherme.scaranse@ifba.edu.br)

## Licença
    Portugol Webstudio - IDE online para o Portugol (UNIVALI)
    Copyright (C) 2017  Douglas Gadêlha, Guilherme Scaranse e contribuidores

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
