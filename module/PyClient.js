var spawn = require('child_process').spawn;
var Q = require('kew');

var Client = function (rtPth) {
    this.rootPath = rtPth;
};
Client.prototype.getNews = function (topic) {
    var defer = Q.defer();
    var res = spawn('python3', [this.rootPath + 'getNews.py', topic]);
    var str = '';

    res.stdout.setEncoding('utf8');
    res.stdout.on('data', function (data) {
        str += data;
    });
    res.stdout.on('error', function (data) {
        console.log(data);
    });
    res.stdout.on('end', function () {
        if (str == '') {
            defer.resolve({ status: 'noResult' });
        } else {
            var resJson = JSON.parse(str);

            var newsArray = [];
            for (var i = 0; resJson[i]; i++) {
                newsArray.push(resJson[i]);
            }

            defer.resolve(newsArray);
        }
    });

    return defer.promise;
};

Client.prototype.wordCount = function (sessionToken, keyManagerToken, roomId) {
    var defer = Q.defer();

    //var command = 'python3 ' + this.rootPath + 'getWordCount.py ' + sessionToken + ' ' + keyManagerToken + ' ' + roomId;
    var res = spawn('python3', [this.rootPath + 'getWordCount.py', sessionToken, keyManagerToken, roomId]);

    var str = '';

    var dict = {};
    res.stdout.on('data', function (data) {
        str += data;
    });
    res.stdout.on('error', function (data) {
        console.log(data);
    });
    res.stdout.on('end', function () {
        if (str == '') {
            defer.resolve({ status: 'noResult' });
        } else {
            var resJson = JSON.parse(str);
            resJson.forEach(function (kv) {
                dict[kv[0]] = kv[1];
            });
            defer.resolve(dict);
        }
    });

    return defer.promise;
};

Client.prototype.getTokens = function (sessionToken, keyManagerToken, roomId) {
    var defer = Q.defer();

    var res = spawn('python3', [this.rootPath + 'convert_command.py', sessionToken, keyManagerToken, roomId]);

    var str = '';
    var err = '';
    res.stdout.on('data', function (data) {
        str += data;
    });
    res.stderr.on('data', function (data) {
        err += data;
    });
    res.stdout.on('end', function () {
        if (str == '') {
            defer.resolve({ status: 'noResult' });
        } else {
            var resTokenStr = str;

            defer.resolve(resTokenStr);
        }
    });
    res.stderr.on('end', function () {
        console.log(err);
    });

    return defer.promise;
};

Client.prototype.getSummary = function (sessionToken, keyManagerToken, roomId) {
    var defer = Q.defer();

    var res = spawn('python3', [this.rootPath + 'summarizeMessage.py', sessionToken, keyManagerToken, roomId]);

    var str = '';
    var err = '';
    res.stdout.on('data', function (data) {
        str += data;
    });
    res.stderr.on('data', function (data) {
        err += data;
    });
    res.stdout.on('end', function () {
        if (str == '') {
            defer.resolve({ status: 'noResult' });
        } else {
            var resTokenStr = str;

            defer.resolve(resTokenStr);
        }
    });
    res.stderr.on('end', function () {
        console.log(err);
    });

    return defer.promise;
};
module.exports = Client;
