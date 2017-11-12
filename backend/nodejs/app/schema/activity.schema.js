/**
 * @module app/activity/schema
 * @name activity
 * @description activity schema to be saved in mongodb
 * @returns ActivitySchema
 */
'use strict';

//NPM modules and variables
var mongoose = require('mongoose'),
    Schema = new mongoose.Schema({
    }, {
        versionKey: false,
        strict: false
    });

var ActivitySchema = mongoose.model('activity', Schema);

module.exports = ActivitySchema;
