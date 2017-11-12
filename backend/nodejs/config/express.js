'use strict';

// NPM modules
var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cors = require('cors');    

module.exports = function() {
    var app = express(),
        router;

    // enable json parsing
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    // enable CORS
    app.use(cors());

    // Showing stack errors
    app.set('showStackError', true);

    // Router configurations
    router = express.Router();
    
    require(path.resolve('./app/routes/tos.routes.js'))(router);

    app.use(router);

    // exporting app
    module.exports = app;

    return app;
};
