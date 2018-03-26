const PKG = require('./package.json'); // so we can get the version of the project
const BINPATH = './node_modules/nightwatch/bin/'; // change if required.

const config = {
    "src_folders": [
        "tests"
    ],
    "selenium": {
        "start_process": true,
        "server_path": BINPATH + "selenium.jar", // downloaded by selenium-download module (see below)
        "log_path": "",
        "host": "127.0.0.1",
        "port": 4444,
        "cli_args": {
            "webdriver.chrome.driver": BINPATH + "chromedriver" // also downloaded by selenium-download
        }
    },
    "test_workers": { "enabled": true, "workers": "auto" }, // perform tests in parallel where possible
    "test_settings": {
        "default": {
            "launch_url": "http://ondemand.saucelabs.com",
            "selenium_port": 80,
            "selenium_host": "ondemand.saucelabs.com",
            "silent": true,
            "username": process.env.SAUCE_USERNAME,
            "access_key": process.env.SAUCE_ACCESS_KEY,
            "globals": {
                "waitForConditionTimeout": 10000
            },
            "desiredCapabilities": {
                "extendedDebugging: true",
                "tunnel-identifier": process.env.TRAVIS_JOB_NUMBER,
                build: "build-" + process.env.TRAVIS_JOB_NUMBER
            }
        },
        "chrome": {
            "desiredCapabilities": {
                "browserName": "chrome",
                "javascriptEnabled": true,
                "acceptSslCerts": true
            }
        },
        "firefox": {
            "desiredCapabilities": {
                "platform": "XP",
                "browserName": "firefox",
                "version": "33"
            }
        }
    }
}
module.exports = config;

/**
 * selenium-download does exactly what it's name suggests;
 * downloads (or updates) the version of Selenium (& chromedriver)
 * on your localhost where it will be used by Nightwatch.
 */
require('fs').stat(BINPATH + 'selenium.jar', function (err, stat) { // got it?
    if (err || !stat || stat.size < 1) {
        require('selenium-download').ensure(BINPATH, function (error) {
            if (error) throw new Error(error); // no point continuing so exit!
            console.log('✔ Selenium & Chromedriver downloaded to:', BINPATH);
        });
    }
});