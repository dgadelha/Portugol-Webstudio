module.exports = {
    before: function (browser, done) {
        server = require('../bin/testserver')(done) // done is a callback that executes when the server is started
    },

    after: function () {
        server.close()
    },

    'Carregar IDE' : function (client) {
        client
            .url('http://127.0.0.1:3000/ide')
            .waitForElementPresent('body', 1000)
            .assert.containsText('#anchor-inicio', 'Portugol Webstudio');
    },

    'Usar IDE' : function(client) {
        client
            .click('.action-add')
            .pause(1000)
            .frame(0)
            .setValue('pre#editor', 'programa { funcao inicio() { escreva("Olá mundo") } }')
            .click('#submit-btn')
            .assert.containsText('pre#output', 'Night Watch')
            .end();
    }
}