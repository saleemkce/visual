/**
 * @module app/project/schema
 * @name project
 * @description project schema to be saved in mongodb
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

var projectsSchema = mongoose.model('projects', Schema);

module.exports = projectsSchema;