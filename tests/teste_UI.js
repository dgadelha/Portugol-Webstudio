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
            .click('#j1_1')
            .pause(1000)
            .click('#j1_1_anchor')
            .pause(1000)
            .click('#exemplo-go')
            .pause(5000)
            .frame(0)
            .click('#submit-btn')
            .pause(5000)
            .assert.containsText('pre#output', 'Olá mundo')
            .end();
    }
}