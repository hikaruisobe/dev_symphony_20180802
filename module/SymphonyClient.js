const httpClient = require('request');
const fs         = require('fs');
const crypto     = require('crypto');
const https      = require('https');
const FormData   = require('form-data');
const Q          = require('kew');

const Settings   = require('../constants/Settings');
const Constants  = require('../constants/Constants');
const Util  = require('./Util');

const secret = fs.readFileSync(Constants.keyPath, 'utf8');
const user   = Constants.userNameTest1;
 
function Jwt(username, signingKey) {
    this.header     = {};
    this.body       = {};
    this.header.alg = 'RS512';
    this.body.sub   = username;
    this.body.exp   = (Util.nowEpochSeconds() + (5 * 60));
    this.signingKey = signingKey;
    return this;
}
 
Jwt.prototype.sign    = function sign(payload, cryptoInput) {
    let buffer = crypto.createSign('RSA-SHA512').update(payload).sign(cryptoInput);
    return Util.base64urlEncode(buffer);
};
 
Jwt.prototype.compact = function compact() {
    let segments = [];
    segments.push(Util.base64urlEncode(JSON.stringify(this.header)));
    segments.push(Util.base64urlEncode(JSON.stringify(this.body)));
    this.signature = this.sign(segments.join('.'), this.signingKey);
    segments.push(this.signature);
    return segments.join('.');
};
 


let Client = {};
Client.auth = {};

Client.init = function (callback) {
    const jwt    = new Jwt(user, secret);
    const jws    = jwt.compact();
    var headersOpt = {
        "content-type"  : "application/json",
        "cache-control" : "no-cache"
    };
    var options = {
        headers: headersOpt,
        url: Constants.urlSessionToken,
        body: JSON.stringify({
          token: jws
        })
    };
    httpClient.post(options, function (req, res, err) {
        var result = JSON.parse(res.body);

        Client.auth.sessionToken = result.token;

        var options = {
            headers: headersOpt,
            url: Constants.urlKmToken,
            body: JSON.stringify({
              token: jws
            })
        };
        httpClient.post(options, function (req, res, err) {
            var result = JSON.parse(res.body);

            Client.auth.kmToken = result.token;

            var options = {
                url: Constants.urlRoomBase + Settings.newsChatRoom + Constants.urlRoomInfo,
                headers: {
                    sessionToken: Client.auth.sessionToken
                }
            };
            httpClient.get(options, function (req, res, err) {
                if (callback != null) { 
                    callback(); 
                }
            });
        });
    });
};


Client.postMessage = function (msg, callback) {
    var form = new FormData();
    form.append('message', '<messageML>' + msg + '</messageML>');
    var headersOpt             = form.getHeaders();
    headersOpt.sessionToken    = Client.auth.sessionToken;
    headersOpt.keyManagerToken = Client.auth.kmToken;
    var options = {
        url: Constants.urlStream + Settings.mainChatRoom + Constants.urlCreateMessage,
        headers: headersOpt
    };
    var req = httpClient.post(options);
    form.pipe(req);
    httpClient.post(options, function (req, res, err) {
        callback(JSON.parse(res.body));
    });
};

Client.listen = function (callback) {
    var options = {
        url: Constants.urlDatafeedRoot + Constants.urlCreate,
        headers: {
            sessionToken: Client.auth.sessionToken,
            keyManagerToken: Client.auth.kmToken
        }
    };

    httpClient.post(options, function (req, err, res) {
        var dfInstance = JSON.parse(res);
        callback(dfInstance);
    });
};

Client.readFromDatafeed = function (dfInstance, callback) {
    var options = {
        url: Constants.urlDatafeedRoot + dfInstance.id + Constants.urlRead,
        headers: {
            sessionToken: Client.auth.sessionToken,
            keyManagerToken: Client.auth.kmToken
        }
    };
    httpClient.get(options)
        .on('response', function (response) {
            if (response.statusCode == 200) {
                var str = '';
                response.on('data', function (data) {
                    str += data;
                });
                response.on('end', function () {
                    callback(JSON.parse(str)).then(function (result) {
                        Client.readFromDatafeed(dfInstance, callback);
                    });
                });
            }
            if (response.statusCode == 204) {
                console.log('reconnect');
                Client.readFromDatafeed(dfInstance, callback);
            }
        });
};

Client.getTextMessage = function (messageML) {
    return messageML.replace(/\<.+?\>/g, '');
};

module.exports = Client;
