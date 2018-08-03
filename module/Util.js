const Util = {};
const crypto = require('crypto');

Util.nowEpochSeconds = function() {
    return Math.floor(new Date().getTime() / 1000);
};

Util.base64urlEncode = function(str) {
    return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
};


module.exports = Util;