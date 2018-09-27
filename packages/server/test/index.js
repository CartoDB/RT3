const Mocha = require('mocha')
const mocha = new Mocha({})
const debug = require('debug')('app:test')

// Test suites
mocha.addFile('test/functional/index.js');

// run tests
mocha.run()
    .on('test', function (test) {
    })
    .on('test end', function (test) {
    })
    .on('pass', function (test) {
    })
    .on('fail', function (test, err) {
        if (process.env.NOTIFY === 1) {
            debug({
                'title': test.title,
                'message': test.file
            })
        }
    })
    .on('end', async function () {
        // Clean db
        process.exit()
    })
