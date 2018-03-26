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
            .waitForElementVisible('.action-add', 5000)
            .click('.action-add')
            .waitForElementVisible('iframe', 5000)
            .frame(0)
            .pause(5000)
            .click('#submit-btn')
            .pause(10000)
            .assert.containsText('#output .ace_content', 'Programa finalizado')
            .end();
    }
}