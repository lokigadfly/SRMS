var MongoClient = require('mongodb').MongoClient;
var path = require('path');
var config = require(path.join(__dirname, 'config'));
var db_url = 'mongodb://' + config.db_user + ':' + config.db_password + '@' + config.db_address + ':27017/' + config.db_dbname;
var console = process.console;
var db_obj;

exports.connect = function(callback) {
	if (db_obj) {
		callback(db_obj);
	} else {
		MongoClient.connect(db_url, function(err, db) {
			if (err) {
				console.time().file().error(err);
				process.exit(-1);
			} else {
				console.log('DB Connected.');
				db_obj = db;
				callback(db_obj);
			}
		});
	}
};
