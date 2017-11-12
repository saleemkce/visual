'use strict';

// settings.js
var settings = require('./settings'),
    mongoose = require('mongoose'),
    app;

// Bootstrap db connection
var conString = 'mongodb://' + settings.db.username + ':' + settings.db.password + '@' + settings.db.hostname + ':' + settings.db.port + '/' + settings.db.name + '?replicaSet=' + settings.db.replicaSet + '&connectTimeoutMS=' + settings.db.connectionTimeout;
mongoose.connect(conString);

// On MongoDB connection error
mongoose.connection.on('error', function(err) {
    console.log('Mongoose default connection error: ' + err);
});

// On MongoDB connection done
mongoose.connection.on('connected', function() {
    // Initialize the application server
    app = require('./config/express')();

    app.listen(settings.port, function() {
        console.log('--------------------------------------------');
        console.log('\x1b[32m', 'Time On Site Backend - Server Started');
        console.log('\x1b[32m', 'Environment: ' + settings.environment);
        console.log('\x1b[32m', 'Port: ' + settings.port);
        console.log('--------------------------------------------');
    });
});
