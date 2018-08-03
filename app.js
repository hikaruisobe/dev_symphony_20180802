'use strict';
const debug = require('debug');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');

const routes = require('./routes/index');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/data', express.static(__dirname + '/data'));
app.use('/module', express.static(__dirname + '/module'));
app.use('/scripts', express.static(__dirname + '/node_modules'));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
// development error handler
// will print stacktrace
const env = app.get('env');
if (env === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            status: err.status,
            error: err
        });
    });
}
// production error handler
// no stacktraces leaked to user
if (env == 'production') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message
        });
    });
}

var options = {
    key: fs.readFileSync('./certs/server.key'),
    cert: fs.readFileSync('./certs/server.crt')
};
var server = https.createServer(options, app);

server.listen(process.env.PORT);