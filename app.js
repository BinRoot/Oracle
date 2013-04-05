var express = require('express');
var app = express();
var db = require('./db.js');
var async = require('async')
var crypto = require('crypto');
var passport = require('passport');
var GoogleStrategy = require('passport-google').Strategy;
var request = require('request');

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
    break;
}

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GoogleStrategy({
    returnURL: url + '/auth/google/return',
    realm: url
  },
  function(identifier, profile, done) {
    process.nextTick(function () {
        console.log("done! "+identifier);
	profile.identifier = identifier;

	console.log("profile: " + JSON.stringify(profile))
/*
{"displayName":"Nishant Shukla","emails":[{"value":"nick722@gmail.com"}],"name":{"familyName":"Shukla","givenName":"Nishant"},"identifier":"https://www.google.com/accounts/o8/id?id=AItOawko8c_hlIiC0x8h3XYlZewRHPr8FnXidac"}
*/
	addOrUpdateUser(profile);

	return done(null, profile);
    });
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

    var q = req.query["q"];
    res.render('index', {user: req.user, query: q});
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

app.get('/u/:id', function(req, res){
  var _id = req.params.id;

  res.render('profile');
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

//Endpoint to translate an array of code ids (in request body) to an array of code items
app.get('/api/codes/', function(req, res){
  var _codeIDs = req.body.ids;

  async.map(_codeIDs, getSolrCode, function(err, results){
      res.send(results);
    }
  );
});


app.get('/auth/google', passport.authenticate('google'));

app.get('/auth/google/return',
	passport.authenticate('google', { successRedirect: '/',
					  failureRedirect: '/fail' }));

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
    res.render('publish', {user: req.user, extra:extraData});
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

    var post_uid = getIdFromURI(req.user.identifier);
    var post_id = getIdFromURI(req.user.identifier) + (new Date()).getTime();

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
		res.send(body);
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

    var regexQuery = "*" + q.replace(" ", "*") + "*";

    var searchURL = aws + "collection1/select?q=type%3A"
	+ regexQuery + "+OR+code%3A*"
	+ regexQuery + "&sort=votes+desc&wt=json";

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
	uri: aws + 'collection1/select/?wt=json&q=*:*&fl=name&facet=true&facet.field=type',
	method: 'GET',
    };

    request(options, function (error, response, body) {
	if (!error && response.statusCode == 200) {
	    res.send(body);
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
	    //res.send(JSON.stringify((JSON.parse(body)).response));
	    var solrResp = (JSON.parse(body)).response;
	    res.render('code', {user: req.user, code:solrResp});
	}
	else {
	    console.log(error + ' *** ' + response.statusCode);
	}
    });

});


// Simple route middleware to ensure user is authenticated.                                                                                                                    //   Use this route middleware on any resource that needs to be protected.  If                                                                                                 //   the request is authenticated (typically via a persistent login session),                                                                                                  //   the request will proceed.  Otherwise, the user will be redirected to the                                                                                                  //   login page.

function getIdFromURI(uri) {
    var gid = uri.split("?")[1];
    return gid.substring(3, gid.length);
}


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
	id: getIdFromURI(profile.identifier)
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
