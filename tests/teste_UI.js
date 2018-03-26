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
            .click('li#j1_1 > i')
            .pause(1000)
            .waitForElementVisible('a#j1_2_anchor', 5000)
            .pause(1000)
            .click('a#j1_2_anchor')
            .waitForElementVisible('a#exemplo-go', 10000)
            .click('a#exemplo-go')
            .pause(5000)
            .frame(0)
            .click('#submit-btn')
            .pause(5000)
            .assert.containsText('pre#output', 'Olá mundo')
            .end();
    }
}