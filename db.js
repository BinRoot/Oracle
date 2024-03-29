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

var findTypes = function findTypes(val, callback) {
    Db.connect(env, function(err, db) {
        if(!err) {
            console.log("We are connected! finding "+JSON.stringify(val));

            gKey = {'type':1};
            gCond = val;
            gInit = {sum:0};
            gReduce = function(doc, prev){prev.sum++};

            db.collection('codes').group(gKey, gCond, gInit, gReduce, function(err, result) {
                if (err) return console.dir(err);

                callback(result);
            });

        }
        else {
            console.log("Error, not connected: " + err);
        }
    });
}


var findUser = function findUser(val, callback) {
    Db.connect(env, function(err, db) {
        if(!err) {
            console.log("We are connected! finding user "+JSON.stringify(val));

	    db.collection('users').findOne(val, function(err, result) {
		if (err) return console.dir(err);

                callback(result);
	    });
	    
        }
        else {
            console.log("Error, not connected: " + err);
        }
    });
}

var upvoteUser = function upvoteUser(uid, callback) {
    Db.connect(env, function(err, db) {
        if(!err) {
            console.log("We are connected! finding user "+JSON.stringify(uid));

	    pushUpdate = { $inc: { rep: 1 } };
	    
	    db.collection('users').update({id:uid}, pushUpdate, {safe:true, upsert:true}, function(err) {
                if (err) return console.dir(err);
		console.log('upvoted!');
		callback();
            });
        }
        else {
            console.log("Error, not connected: " + err);
        }
    });
}

var votesUpdateUser = function votesUpdateUser(uid, cid, callback) {
    Db.connect(env, function(err, db) {
        if(!err) {
            console.log("We are connected! finding user "+JSON.stringify(uid));

	    pushUpdate = { $push: { votes:cid } }
	    
	    db.collection('users').update({id:uid}, pushUpdate, {safe:true, upsert:true}, function(err) {
                if (err) return console.dir(err);
		console.log('added cid to votes!');
		callback();
            });
        }
        else {
            console.log("Error, not connected: " + err);
        }
    });
}



var addOrUpdateUserPublications = function addOrUpdateUserPublications(uid, codeId, callback) {
    Db.connect(env, function(err, db) {
        if(!err) {
            console.log("We are connected! upserting " + uid + ", adding "+codeId);
	    
	    var pushUpdate = {
		$push: {
		    publications: codeId
		}
	    };

	    db.collection('users').update({id:uid}, pushUpdate, {safe:true, upsert:true}, function(err) {
                if (err) return console.dir(err);
		callback();
            });
	    
        }
        else {
            console.log("Error, not connected: " + err);
        }
    });
}

var addHistory = function addHistory(hist, callback) {
    Db.connect(env, function(err, db) {
        if(!err) {
            console.log("We are connected! adding history " + JSON.stringify(hist));

	    db.collection('hist').insert(hist, function(err, result) {
		if (err) return console.dir(err);
		else callback();
	    });
	    
        }
        else {
            console.log("Error, not connected: " + err);
        }
    });
}


var addOrUpdateUser = function addOrUpdateUser(userData) {
    Db.connect(env, function(err, db) {
        if(!err) {
            console.log("We are connected! upserting "+JSON.stringify(userData));
	    
	    db.collection('users').update({email:userData.email}, userData, {safe:true, upsert:true}, function(err) {
                if (err) return console.dir(err);

            });
	    
        }
        else {
            console.log("Error, not connected: " + err);
        }
    });
    
}

exports.addOrUpdateUserPublications = addOrUpdateUserPublications;
exports.insertCode = insertCode;
exports.findTypes = findTypes;
exports.addOrUpdateUser = addOrUpdateUser;
exports.findUser = findUser;
exports.upvoteUser = upvoteUser;
exports.votesUpdateUser = votesUpdateUser;
exports.addHistory = addHistory;
