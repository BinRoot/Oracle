var express = require('express');
var app = express();
var db = require('./db.js');
var async = require('async')
var crypto = require('crypto');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var request = require('request');

var GOOGLE_CLIENT_ID = "941975996034.apps.googleusercontent.com";
var GOOGLE_CLIENT_SECRET = "hdsxYToVNjq_buyYuyGQAp4r";
var callbackURLpassport = "http://localhost:5000/auth/google/callback";

app.use(express.static(__dirname + '/public'));

var hurl = 'http://oracle1.herokuapp.com';
var lurl = 'http://localhost:5000'

var env = process.env.NODE_ENV || 'development';
var aws = "http://ec2-50-19-140-101.compute-1.amazonaws.com:8983/solr/";

switch(env){
  case 'development':
    console.log('in developoment mode');
    url = lurl;
    break;
  case process.env.NODE_ENV:
    console.log('in production mode');
    url = hurl;

    GOOGLE_CLIENT_ID = "941975996034-o52eu27r1q39cfkmk1i80mua67076po8.apps.googleusercontent.com";
    GOOGLE_CLIENT_SECRET = "_jM2IisLTmLHp5Tz7_CYaEP8";
    callbackURLpassport = "http://oracle1.heroku.com/auth/google/callback";

    break;
}

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURLpassport // /oauth2callback ?
  },
  function(accessToken, refreshToken, profile, done) {
    console.log('done! ' + JSON.stringify(profile));

    addOrUpdateUser(profile);

    return done(null, profile);
  }
));

// Configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/../../public'));
});

app.get('/', function(req, res) {

    if(req.cookies.returnto) {
	var retto = req.cookies.returnto;
	res.clearCookie('returnto');
	res.redirect(retto);
    }
    else {
	if (req.isAuthenticated()) {
	    db.findUser({id: req.user.id}, function(u) {
		var q = req.query["q"];
		res.render('index', {user: req.user, query: q, userExtra: u});
	    });
	}
	else {
	    var q = req.query["q"];
	    res.render('index', {user: req.user, query: q});
	}
    }
});


app.get('/gravatar', function(req, res) {
    var uid = req.query["id"];

    db.findUser({id: uid}, function(user) {

	console.log('in callback: '+JSON.stringify(user));

	var email = user.email;
	var hash = crypto.createHash('md5').update(email).digest("hex");
	res.send(hash);
    });

});

function getSolrCode(item, callback){
    // get all code data from solr
    var getCodeURL = aws + "collection1/select?q=id%3A" + item + "&wt=json";

    var options = {
          uri: getCodeURL,
          method: 'GET',
    };

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          var solrResp = (JSON.parse(body)).response;
          callback(null, solrResp.docs[0]);
      }
      else {
          console.log(error + ' *** ' + response.statusCode);
          callback(null, "Error fetching code item");
      }
    });
}

function updateUserRep(uid, isUp) {

}

app.get('/api/vote', function(req, res, next) {
    ensureAuthenticated(req, res, next, '/publish');
}, function(req, res) {
    var cid = req.query["cid"];
    var u1id = req.user.id; // voter
    console.log('in /api/vote, searching for ' + cid);
    
    db.findUser({id: u1id}, function(user1Obj) { //\\ get user1 object (mongo)
	
	var previouslyVoted = false;

	var votes = user1Obj.votes;
	if(votes) {
	    if(votes.indexOf(cid) != -1) {
		previouslyVoted = true;
		res.send('ERR 0: User '+u1id+' has already voted on code '+cid);
	    }
	}

	if(!previouslyVoted) {
	    getSolrCode(cid, function(blah, ret) { //\\ get code object (solr)
		if(ret) {
		    console.log('getSolrCode results: '+JSON.stringify(ret));
		    var oldVotes = ret.votes;
		    var u2id = ret.uid; // votee

		    db.upvoteUser(u2id, function() { //\\ upvote user (mongodb)
			
			//\\ upvote code (solr)
			var postData = [ {id:cid, votes:{"set":(ret.votes+1)}} ];
			var options = {
			    uri: aws + 'update/json?commit=true',
			    method: 'POST',
			    json: postData
			};
			console.log('POSTing: '+JSON.stringify(postData));
			request(options, function (error, response, body) {
			    if (!error && response.statusCode == 200) {

				//\\ add cid to user's votes (mongodb)
				db.votesUpdateUser(u1id, cid, function() {
				    
				    //\\ add to history (mongodb)
				    var hist = {
					action: "vote",
					u1id: u1id,
					u2id: u2id,
					cid: cid,
					time: new Date(),
				    };

				    db.addHistory(hist, function() {
					res.send('Done');
				    });

				});
			    }
			});
		    });
		}
	    });
	}
    });

});


function idToCode(ids, callback){
  async.map(ids, getSolrCode, function(err, results){
      callback(results);
    }
  );
}

//Endpoint to translate an array of code ids (in request body) to an array of code items
app.get('/api/codes/', function(req, res){
  var _codeIDs = req.body.ids;

  console.log(_codeIDs);

  idToCode(_codeIDs, function(results){
    res.send(results);
  })
});

app.get('/u/:id', function(req, res){
    var uid = req.params.id;
    console.log('looking for '+uid);
    db.findUser({id: uid}, function(ret) {
	console.log('/u/:id  ' + JSON.stringify(ret));

	// ADD NAVBAR
	if (req.isAuthenticated()) {
	    db.findUser({id: req.user.id}, function(u) {

		if(ret.publications) {
		    idToCode(ret.publications, function(results){
			console.log("***" + JSON.stringify(results));
			res.render('profile', {user: req.user, userExtra: u, profile: ret, codes: results});
		    });
		}
		else {
		    res.render('profile', {user: req.user, userExtra: null, profile: ret, codes: null});
		}
	    });
	}
	else {

	    if(ret.publications) {
		idToCode(ret.publications, function(results){
		    console.log("***" + JSON.stringify(results));
		    res.render('profile', {user: null, userExtra: null, profile: ret, codes: results});
		});
	    }
	    else {
		res.render('profile', {user: null, userExtra: null, profile: ret, codes: null});
	    }


	}
    });

});

app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                            'https://www.googleapis.com/auth/userinfo.email']}));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    console.log('SUCCESS!!!');
    res.redirect('/');
  });

app.get('/auth/google/return',
	passport.authenticate('google', { successRedirect: '/',
					  failureRedirect: '/fail' }));

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});


app.get('/account', function(req, res, next) {
    ensureAuthenticated(req, res, next, '/account');
}, function(req, res) {
    res.send('works!');
});


app.get('/fail', function(req, res) {
    res.send('login failed!');
});

app.get('/publish', function(req, res, next) {
    ensureAuthenticated(req, res, next, '/publish');
}, function(req, res) {

    var extraData = {type: req.query.type};
    console.log('type: '+ extraData.type );

    db.findUser({id: req.user.id}, function(u) {
	res.render('publish', {user: req.user, userExtra: u, extra:extraData});
    });
});

app.get('/update', function(req, res, next) {
    ensureAuthenticated(req, res, next, '/update');
}, function(req, res) {
    var extraData = {type: req.query.type};
    console.log('type: '+ extraData.type );
    res.render('update', {user: req.user, extra:extraData});
});

// TODO: /delete should not be available to all users
// Huge-ass security issue.
app.post('/delete', function(req, res, next) {
    var post_id = req.body.id; // :codeid | :userid
    var post_mode = req.body.mode; // "code" | "user"

    var data = {
	id: post_id,
    };

    var postData = {delete:data};

    var options = {
	uri: aws + 'update/json?commit=true',
	method: 'POST',
	json: postData
    };

    request(options, function (error, response, body) {
	if (!error && response.statusCode == 200) {
	    res.send(body);
	}
    });

});

app.post('/publish', function(req, res, next) {
    ensureAuthenticated(req, res, next, '/publish');
}, function(req, res) {

    var post_type = req.body.type.toLowerCase();
    var post_lang = req.body.lang.toLowerCase();
    var post_code = req.body.code;
    var post_email = req.user.emails[0].value;

    var post_uid = req.user.id;
    var post_id = req.user.id + (new Date()).getTime();

    var data = {
	id: post_id,
	type: post_type,
	uname: req.user.displayName,
	uid: post_uid,
	lang: post_lang,
	code: post_code,
	votes: 1,
	description: "",
	email: post_email
    };

    var postData = {add:{doc:data}};

    var options = {
	uri: aws + 'update/json?commit=true',
	method: 'POST',
	json: postData
    };

    console.log('POSTing: '+JSON.stringify(postData));

    request(options, function (error, response, body) {
	if (!error && response.statusCode == 200) {
	    db.addOrUpdateUserPublications(post_uid, post_id, function() {

		//\\ add to history (mongodb)
		var hist = {
		    action: "publish",
		    uid: post_uid,
		    cid: post_id,
		    time: new Date(),
		};

		db.addHistory(hist, function() {
		    res.send(body);
		});


	    });
	}
    });


});

/* Currently the Solr search is pretty dumb:
 * if type matches OR code matches then
 * it sorts per votes and returns result
*/
app.get('/search', function(req, res) {
    var q = req.query["q"];

    var searchURL = aws + "collection1/select?q=" + q + 
                    "&wt=json&defType=edismax&qf=code%5E0.3+type%5E20";

    var options = {
	uri: searchURL,
	method: 'GET',
    };

    request(options, function (error, response, body) {
	if (!error && response.statusCode == 200) {
	    console.log(JSON.stringify((JSON.parse(body)).response) );
	    res.send(JSON.stringify((JSON.parse(body)).response));
	}
	else {
	    console.log(error + ' *** ' + response.statusCode);
	}
    });
});

app.get('/peek', function(req, res) {
    var q = req.query["q"];

    var options = {
	uri: aws + 'collection1/select?q=*%3A*&fl=+&wt=json&facet=true&facet.field=type&facet.prefix='
	         + q,
	method: 'GET',
    };

    request(options, function (error, response, body) {
	if (!error && response.statusCode == 200) {
	    var bodyJ = JSON.parse(body);
	    var facets = bodyJ.facet_counts.facet_fields.type;

	    // [ "a", 1, "b", 2 ] --> [{str: "a", val: 1}, {str: b, val: 2}]
	    
	    var data = [];
	    for(var i=0; i<facets.length/2; i+=2) {
		data.push({str: facets[i], val: facets[i+1]});
	    }

	    res.send(JSON.stringify(data));
	}
	else {
	    console.log(error + ' *** ' + response.statusCode);
	}
    });
});


app.get('/a/:code', function(req, res){
    var _code = req.params.code;

    console.log('in /a/:code, ' + _code);

    // get all code data from solr
    var getCodeURL = aws + "collection1/select?q=id%3A"
	+ _code + "&wt=json";

    var options = {
	uri: getCodeURL,
	method: 'GET',
    };

    request(options, function (error, response, body) {
	if (!error && response.statusCode == 200) {
	    console.log(JSON.stringify((JSON.parse(body)).response) );
	    var solrResp = (JSON.parse(body)).response;

	    if (req.isAuthenticated()) {
		db.findUser({id: req.user.id}, function(u) {
		    res.render('code', {user: req.user, userExtra: u, code:solrResp});
		});
	    }
	    else {
		res.render('code', {user: req.user, userExtra:null, code:solrResp});
	    }
	}
	else {
	    console.log(error + ' *** ' + response.statusCode);
	}
    });

});


// Simple route middleware to ensure user is authenticated.                                                                                                                    //   Use this route middleware on any resource that needs to be protected.  If                                                                                                 //   the request is authenticated (typically via a persistent login session),                                                                                                  //   the request will proceed.  Otherwise, the user will be redirected to the                                                                                                  //   login page.

/* // Deprecated
function getIdFromURI(uri) {
    var gid = uri.split("?")[1];
    return gid.substring(3, gid.length);
}
*/


/*
profile = {"displayName":"Nishant Shukla",
           "emails":[{"value":"nick722@gmail.com"}],
           "name":{"familyName":"Shukla","givenName":"Nishant"},
           "identifier":"https://www.google.com/accounts/o8/id?id=AItOawko8c_hlIiC0x8h3XYlZewRHPr8FnXidac"}
*/
function addOrUpdateUser(profile) {
    var userData = {
	displayName: profile.displayName,
	email: profile.emails[0].value,
	id: profile.id,
	rep: 100
    }

    console.log("\ncalling db.addOrUpdateUser on " + JSON.stringify(userData)+"\n");

    db.addOrUpdateUser(userData);
}


function ensureAuthenticated(req, res, next, ret) {
    if (req.isAuthenticated()) { return next(); }

    console.log('ret:' + ret);

    // add return path to cookie
    res.cookie('returnto', ret, { maxAge: 9000, httpOnly: true });

    res.redirect('/auth/google')
}

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
