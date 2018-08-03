const botClient = require('./SymphonyClient');
const Q = require('kew');
var pyClass = require('./PyClient');
var pyClient = new pyClass('./nlp/');
// var spawn = require('child_process').exec;
const asyncLoop = require('node-async-loop');
const parseXml = require('xml2js').parseString;
const Settings = require('../constants/Settings');

var Callbacks = {};

// Callbacks.wordAnalysis = function (messageObject) {
//     var defer = Q.defer();
//     //console.log(messageObject);

//     //botClient.postMessage(messageObject[0].payload.messageSent.message.message);

//     //var sar = spawn('cd');
//     //var str = '';
//     //sar.stdout.on('data', function (data) { str += data; })
//     //sar.stdout.on('end', function () {
//     pyClient.wordCount(botClient.auth.sessionToken, botClient.auth.kmToken, Settings.mainChatRoom).then(function (dict) {
//         botClient.postMessage(JSON.stringify(dict), function (result) {

//             defer.resolve({ status: 'OK' });
//         });
//     });

//     //});


//     return defer.promise;
// };

Callbacks.reactMessage = function (messageObject) {
    var defer = Q.defer();

    if (messageObject[0].initiator.user.username == 'bot.test1') {
        defer.resolve({ status: 'fail' });
        return defer.promise;
    }
    asyncLoop(messageObject,
                function (message, next) {
                    parseXml(message.payload.messageSent.message.message, function (err, result) {
                        var msgJson = result;
                        var msgText = msgJson.div.p[0];
                        var tokens = msgText.split(' ');
                        if (tokens[0] == 'ns') {
                            var topic = constructNewsTopic(tokens);
                            pyClient.getNews(topic).then(function (newsArray) {
                                var message = '';
                                if (newsArray.status == 'noResult') {
                                    message = 'No news on ' + topic;
                                } else {
                                    message = constructNewsHtml(topic, newsArray);
                                }
                                botClient.postMessage(message, function (res) {
                                    next(err);
                                });
                            });
                        // // } else if (tokens[0] == 'getsummary') {
                        // //     pyClient.getSummary(botClient.auth.sessionToken, botClient.auth.kmToken, Settings.mainChatRoom).then(function (summary) {
                        // //         botClient.postMessage(summary, function (res) {
                        // //             next();
                        // //         });
                        // //     });
                        // // } else {
                        // //     pyClient.getNews(tokens[1]).then(function (result) {
                        // //         botClient.postMessage(JSON.stringify(result[0]), function (res) {
                        // //             //defer.resolve({ status: 'OK' });
                        // //             next();
                        // //         });
                        // //     });
        
                        // // }
                        // 
                        } else {
                            next(err);
                        }
                    });
                },
                function (err) {
                    console.log('error:' + err);
                });
    
    return defer.promise;
};

var escapeStr = function (str) {
    return str.replace(/'/g, '&apos;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;');
};

var getTokens = function (text) {
    var defer = Q.defer();
    pyClient.getTokens(botClient.auth.sessionToken, botClient.auth.kmToken, Settings.mainChatRoom).then(function (result) {
        defer.resolve(result);
    });

    return defer.promise;
};

var constructNewsTopic = function (tokens) {
    var topic = '';

    for (var i = 1; tokens[i]; i++) {
        topic += tokens[i] + ' ';
    }

    return topic;
};

var constructNewsHtml = function (topic, newsArray) {
    var message = 'News on ' + topic + '<br/>';
    message += '<table><tr><th>No.</th><th>Title</th><th>Sentiment</th></tr>';
    newsArray.forEach(function (news, i) {
        message += '<tr><td>' + i + '</td><td><a href = "' + escapeStr(news.url) + '">' + escapeStr(news.title) + '</a></td><td>' + news.sentiment + '%</td></tr>';
        //message += '<tr><td>' + i + '</td><td><a href = "' + escapeStr(news.url) + '">' + news.title + '</a></td><td>' + news.sentiment + '%</td></tr>';
        //message += '<a href = "' + escapeStr(news.url) + '">' + escapeStr(news.title) + '</a><br/>';
    });
    message += '</table>';

    return message;
};

module.exports = Callbacks;
