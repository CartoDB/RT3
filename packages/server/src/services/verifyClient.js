'use strict'

const debug = require('debug')('app:verifyClient');
const url = require('url');
const querystring = require('querystring');

module.exports = function(info, cb) {
    const { req } = info;

    let validated = false;

    const queryString = querystring.parse(url.parse(req.url).query);
    if (queryString && queryString.api_key == '1234') {
        validated = true;
    }

    debug(validated);
    cb(validated);
}
