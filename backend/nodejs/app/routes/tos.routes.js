'use strict';

var controller = require('../controllers/data.controller');

module.exports = function(app) {

    app.route('/tos')
        .post(controller.saveTos);

    app.route('/tos/datatable_reports')
        .post(controller.getTosDataTable);

    app.route('/tos/datatable_refresh')
        .post(controller.refreshData);

    app.route('/tos/analytics')
        .get(controller.getTosAnalytics);

};
