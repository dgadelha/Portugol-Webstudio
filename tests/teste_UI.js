module.exports = {
    before: function (browser, done) {
        server = require('../bin/testserver')(done) // done is a callback that executes when the server is started
    },

    after: function () {
        server.close()
    },

    'Demo test': function (browser) {
        browser
            .url('localhost:3000')   // visit the local url
            .waitForElementVisible('body'); // wait for the body to be rendered

        browser
            .assert.containsText('body','hello') // assert contains
            .end()
    }
}