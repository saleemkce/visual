'use strict';

var controller = require('../controllers/data.controller');

module.exports = function(app) {

    app.route('/tos')
        .post(controller.saveTos);

    app.route('/tos/all/datatable')
        .post(controller.getTosDataTable);

    app.route('/api/data')
        .get(controller.getProjects);

    app.route('/tos/all')
        .get(controller.getTosAnalytics);

    // app.route('/tos/php')
    //     .get(controller.getTosPHP);
};
