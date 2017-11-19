'use strict';

var controller = require('../controllers/data.controller');

module.exports = function(app) {

    app.route('/tos')
        .post(controller.saveTos);

    app.route('/tos/datatable_reports')
        .post(controller.getTosDataTable);

    app.route('/tos/datatable_refresh')
        .post(controller.refreshData);

    app.route('/api/data')
        .get(controller.getProjects);

    app.route('/tos/analytics')
        .get(controller.getTosAnalytics);

    // app.route('/tos/php')
    //     .get(controller.getTosPHP);
};
