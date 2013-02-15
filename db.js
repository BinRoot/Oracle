var Db = require('mongodb').Db;
var env = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/test';

// This is just an example of how to 
// insert an element to the collection
// of 'users'
var insertCode = function(data, callback) {
    Db.connect(env, function(err, db) {
        if(!err) {
            console.log("We are connected!");

	    db.collection('codes').insert(data, function(err, result) {
		if (err) return console.dir(err);
		else callback();
	    });
        }
        else {
            console.log("Error, not connected: " + err);
	}
    });
};

exports.insertCode = insertCode;
