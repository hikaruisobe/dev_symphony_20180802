'use strict';
const express = require('express');
const router = express.Router();
const Constants  = require('../constants/Constants');

var botClient = require(Constants.pathSymphonyClient);
var callbacks = require(Constants.pathChatCallbacks);

botClient.init(function () {
    console.log(botClient.auth);
    botClient.listen(function (dfInstance) {
        botClient.readFromDatafeed(dfInstance, callbacks.reactMessage);
    });
});

/* GET home page. */
router.get('/', function (req, res) {
    res.render(Constants.pugIndex, { title: Constants.msgTitle });
});

module.exports = router;
