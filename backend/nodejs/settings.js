'use strict';

/* Settings file for Application */
module.exports = {
	environment : 'local',
	db : {
		hostname : '127.0.0.1',
		name : 'tosdata',
		username : 'root',
		password : 'root',
		port: 27017,
		replicaSet: '',
		connectionTimeout : 4000
	},
	port: 4500
};
