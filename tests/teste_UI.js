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
            .click('i.jstree-icon.jstree-ocl')
            .pause(1000)
            .waitForElementPresent('#j1_1_anchor', 5000)
            .click('#j1_1_anchor')
            .waitForElementPresent('#exemplo-go', 5000)
            .click('#exemplo-go')
            .pause(5000)
            .frame(0)
            .click('#submit-btn')
            .pause(5000)
            .assert.containsText('pre#output', 'Olá mundo')
            .end();
    }
}