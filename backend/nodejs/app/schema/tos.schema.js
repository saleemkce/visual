/**
 * @module app/tos/schema
 * @name tos
 * @description tos schema to be saved in mongodb
 * @returns TosSchema
 */
'use strict';

//NPM modules and variables
var mongoose = require('mongoose'),
    Schema = new mongoose.Schema({
    }, {
        versionKey: false,
        strict: false
    });

var TosSchema = mongoose.model('tos', Schema);

module.exports = TosSchema;
