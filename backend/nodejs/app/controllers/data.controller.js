/**
 * @module app/controllers
 */
'use strict';

// NPM modules
var mongoose = require('mongoose'),
    recordsCount;

//schemas
var TosSchema = require('../schema/tos.schema'),
    ActivitySchema = require('../schema/activity.schema');

/**
 * [saveTos Method to save TimeOnSite(tos) data either tos or activity]
 * @param  {[type]}   req  [request object]
 * @param  {[type]}   res  [response object]
 * @param  {Function} next [callback function]
 * @return {[string]}      [returns back string 'success' to denote storing tos data successful]
 */
module.exports.saveTos = function(req, res, next) {
    var data = req.body;
    console.log(data);
    //console.log(data.TOSId);

    var freshData = {};

    if(data && data.trackingType && data.trackingType == 'tos') {

        // converting to ISO date format
        data.entryTime = (new Date(data.entryTime)).toISOString();
        data.exitTime = (new Date(data.exitTime)).toISOString();

        freshData = {
            tos_id : data.TOSId,
            tos_session_key : data.TOSSessionKey,
            tos_user_id : data.TOSUserId,
            url : data.URL,
            title : data.title,
            entry_time : data.entryTime,
            timeonpage : data.timeOnPage,
            timeonpage_tracked_by : data.timeOnPageTrackedBy,
            timeonsite : data.timeOnSite,
            timeonpage_by_duration : data.timeOnPageByDuration,
            timeonsite_by_duration : data.timeOnSiteByDuration,
            tracking_type : data.trackingType,
            exit_time : data.exitTime
        };

        var Tos = new TosSchema(freshData);
        Tos.save(freshData, function(err) {
            console.log(err);
        });
        
    } else if(data && data.trackingType && data.trackingType == 'activity') {
        
        data.activityStart = (new Date(data.activityStart)).toISOString();
        data.activityEnd = (new Date(data.activityEnd)).toISOString();

        freshData = {
            tos_id : data.TOSId,
            tos_session_key : data.TOSSessionKey,
            tos_user_id : data.TOSUserId,
            url : data.URL,
            title : data.title,
            activity_start: data.activityStart,
            activity_end: data.activityEnd,
            time_taken: data.timeTaken,
            time_taken_by_duration: data.timeTakenByDuration,
            time_taken_tracked_by: data.timeTakenTrackedBy,
            tracking_type: data.trackingType
        };

        var Activity = new ActivitySchema(freshData);
        Activity.save(freshData, function(err) {
            console.log(err);
        });

    }
    
    console.log('type : ' + data.trackingType);
    res.send('success');
    
};

/**
 * [getTosAnalytics Retrieves a set of data for making analytics with dc charting]
 * @param  {[object]}   req  [request object]
 * @param  {[object]}   res  [response object]
 * @param  {Function} next [callback function]
 * @return {[array]}        [result set]
 */
module.exports.getTosAnalytics = function(req, res, next) {
    var whereCond = {},
        analyticsDataLimit = 10000; 

    if(req.query) {
        if(req.query.startDate && req.query.endDate && module.exports.isValidDate(req.query.startDate) && module.exports.isValidDate(req.query.endDate)) {

            var startDate = new Date(req.query.startDate),
                endDate = new Date(req.query.endDate);

            whereCond['entry_time'] = {
                $gte: (new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())).toISOString(),
            };
            whereCond['exit_time'] = {
                $lte: (new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())).toISOString()
            };
        }
    }
    console.log(whereCond);

    TosSchema
        .find(whereCond)
        .sort({
            $natural: -1
        })
        .limit(analyticsDataLimit)
        .exec(function(err, data) {
            if (err) {
                res.status(err);
            } else {
                res.json(data);
            }
        });

};

/**
 * [isValidDate checks if given string is a valid date type]
 * @param  {[string]}  data in specifc format
 * @return {any}
 */
module.exports.isValidDate = function(dateStr) {
    if(isNaN(new Date(dateStr).getTime())) {
        return false;
    }

    var strArr = dateStr.split(' ');
    if(strArr.length === 1) {
        return 'dateSearch';
    } else if(strArr.length === 2) {
        return 'dateTimeSearch';
    } else {
        return false;
    }

};

/**
 * [getTosDataTable Method to fetch data for reporting in datatable]
 * @param  {[object]}   req  [request object]
 * @param  {[object]}   res  [respionse object]
 * @param  {Function} next [callback function]
 * @return {[array]}       [ returns data as array of objects to be used in datatable]
 */
module.exports.getTosDataTable = function(req, res, next) {//console.log(req.body)
    var response = {},

        // date search params
        entryTimePresent = false,
        exitTimePresent = false,
        entryDateString,
        exitDateString,

        fieldToOrder = null,
        orderBy = null,
        fieldToSearch = {},
        totalRecords = 0,
        recordsFiltered = 0,
        isSearchPresent = false;

    if (recordsCount && recordsCount >= 0) {
        console.log('*** Data count from cache ' + recordsCount);
        totalRecords = recordsCount;
        recordsFiltered = recordsCount;
    } else {
        TosSchema.find().count(function(err, count) {
            if (err) {
                console.log(err);
                res.status(err);
            } else {
                console.log('*** Data count at first time : ' + count);
                recordsCount = count;
                totalRecords = count;
                recordsFiltered = count;
            }
        });
    }
    
    /* Datatable global search box */
    // if(req.body.search.value !== null) {
    //     //fieldToSearch = req.body.search.value;
    //     fieldToSearch = {'tos_session_key': req.body.search.value}
    //     //console.log(fieldToSearch)
    // }

    for (var i in req.body.columns) {
        if(req.body.columns[i].search && req.body.columns[i].search && req.body.columns[i].search.value) {
            
            var k = req.body.columns[i].data,
                v = req.body.columns[i].search.value,
                isSearchPresent = true;

            if (req.body.columns[i].data == 'tos_id' || req.body.columns[i].data == 'timeonpage' || req.body.columns[i].data == 'timeonsite') {
                fieldToSearch[k] = parseInt(v);
            }
            //2017-4-6T00:00:00.000Z 
            else if(req.body.columns[i].data == 'entry_time' && req.body.columns[i].data != 'exit_time') {

                var searchType = module.exports.isValidDate(v);
                if(searchType == 'dateTimeSearch') {
                    var dateStr = new Date(v),
                        dateQuery;
                        //currentDate,
                        //currentDateString;
                        
                        entryTimePresent = (req.body.columns[i].data == 'entry_time');

                        entryDateString = dateStr.toISOString();

                    if(entryTimePresent) {
                        console.log('only entry is present!');
                        dateQuery = {
                            $eq: entryDateString
                        };    
                    }

                    fieldToSearch[req.body.columns[i].data] = dateQuery;

                } else if(searchType == 'dateSearch') {
                    var dateStr = new Date(v),
                        dateQuery;
                        
                        entryTimePresent = (req.body.columns[i].data == 'entry_time');

                        entryDateString = dateStr.toISOString();
                    
                    if(entryTimePresent) {

                        var currentDate = new Date(dateStr);
                        var nextDate = currentDate.setDate((new Date(dateStr)).getDate() + 1)
                        nextDate = new Date(nextDate);

                        dateQuery = {
                            $gte: (new Date(dateStr.getFullYear(), dateStr.getMonth(), dateStr.getDate())).toISOString(),
                            $lt: (new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate())).toISOString()
                        }
                    }

                    
                    fieldToSearch[req.body.columns[i].data] = dateQuery;
                } else {
                    console.log('invalid date ' + v);
                }
                
            }
            else if(req.body.columns[i].data != 'entry_time' && req.body.columns[i].data == 'exit_time') {
                var dateStr = new Date(v),
                    dateQuery;
                    
                    exitTimePresent = (req.body.columns[i].data == 'exit_time');
                    exitDateString = dateStr.toISOString();

                if(entryTimePresent && exitTimePresent) {
                    console.log('Both are present!');

                    fieldToSearch['entry_time'] = {
                        '$gte': entryDateString
                    };
                    fieldToSearch['exit_time'] = {
                        '$lte': exitDateString
                    };

                } else {
                    console.log('only exit is present!');

                    var searchType = module.exports.isValidDate(v);
                    if(searchType == 'dateTimeSearch') {
                        dateQuery = {
                            $eq: exitDateString
                        }
                    } else if(searchType == 'dateSearch') {


                        var currentDate = new Date(dateStr);
                        var nextDate = currentDate.setDate((new Date(dateStr)).getDate() + 1)
                        nextDate = new Date(nextDate);

                        dateQuery = {
                            $gte: (new Date(dateStr.getFullYear(), dateStr.getMonth(), dateStr.getDate())).toISOString(),
                            $lt: (new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate())).toISOString()
                        }


                    } 

                    fieldToSearch[req.body.columns[i].data] = dateQuery;

                }    
            }
            else {
                /* equality search */
                //fieldToSearch[k] = v;
                
                /* SQL LIKE search*/
                fieldToSearch[k] = {'$regex': '.*'+v+'.*'}
            }

        } else {
            //console.log('NO DATA... for ' + req.body.columns[i].search);
        }
    }


    if(isSearchPresent) {
        console.log(fieldToSearch);
        var schema = TosSchema;

        TosSchema
            .find(fieldToSearch)
            .count(function(err, count) {
                if(err) {
                    res.status(err);
                } else {

                    response.recordsTotal = totalRecords;
                    response.recordsFiltered = count;

                    schema = TosSchema
                        .find(fieldToSearch)

                    if(req.body.order[0].column) {
                        fieldToOrder = req.body.columns[req.body.order[0].column].data;
                        orderBy = req.body.order[0].dir;

                        if(orderBy == 'desc') {
                            schema = schema
                                .sort('-' + fieldToOrder)
                        } else {
                            schema = schema
                                .sort('' + fieldToOrder)
                        }
                        //console.log(fieldToOrder, orderBy)
                    }
                    
                    schema = schema
                        .skip(req.body.start)

                    /* Note: req.body.length can also be -1*/
                    schema = schema
                        .limit(req.body.length)

                    schema
                        .exec(function(err, data) {
                            if (err) {
                                res.status(err);
                            } else {
                                response.draw = parseInt(req.body.draw);
                                response.data = data;
                                response.error = err;
                                res.json(response);
                            }
                        });

                }
            });

    } else {
        TosSchema
        .find()
        .skip(req.body.start)
        .limit(req.body.length)
        .exec(function(err, data) {
            if (err) {
                res.status(err);
            } else {
                response.draw = parseInt(req.body.draw);
                response.recordsTotal = totalRecords;
                response.recordsFiltered = recordsFiltered;
                response.data = data;
                response.error = err;
                res.json(response);
            }
        });
    }

};

/**
 * [refreshData It updates "recordsCount" variable for data refresh]
 * @param  {[object]}   req  [request object]
 * @param  {[object]}   res  [respionse object]
 * @param  {Function} next [callback function]
 * @return {[json]}        [returns back 'refresh_success' code]
 */
module.exports.refreshData = function(req, res, next) {
    if(req.body && req.body.timestamp) {
        TosSchema.find().count(function(err, count) {
            if (err) {
                console.log(err);
                res.status(err);
            } else {
                console.log('*** Data count after refresh : ' + count);
                recordsCount = count;
                res.json({
                    code: 'refresh_success'
                });
            }
        });
    } else {
        res.json({
            message: 'Method POST - data is empty'
        });
    }
    
};


/*
    entryTime: {"$gte": (new Date(2017, 1, 2, 22, 8, 53)).toISOString()}
    FORMAT: YYYY, MM, DD, HH, MM, SS -> MM in range (0 - 11)
*/
