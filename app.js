var express = require('express');
var app = express();
var db = require('./db.js');

var passport = require('passport');
var GoogleStrategy = require('passport-google').Strategy;

app.use(express.static(__dirname + '/public'));

var hurl = 'http://oracle1.herokuapp.com';
var lurl = 'http://localhost:5000'

var env = process.env.NODE_ENV || 'development';

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
    res.send('Hello World!');
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

app.post('/publish', function(req, res, next) {
    ensureAuthenticated(req, res, next, '/publish');
}, function(req, res) {

    var post_type = req.body.type;
    var post_lang = req.body.lang;
    var post_code = req.body.code;

    console.log("user stuff: "+JSON.stringify(req.user));


    var data = {
	type: post_type,
	uname: req.user.displayName,
	uid: getIdFromURI(req.user.identifier),
	lang: post_lang,
	code: post_code,
	time: new Date(),
	votes: 1,
	comments: [],
	tags: [],
	description: ""
    };
    db.insertCode(data, function() {
	res.send('works');
    });
});

app.get('/search', function(req, res) {
    var q = req.query["q"];

    if(!q) {
	// res.send('[]'); // if empty, return nothing
	var searchObject = {type: {$regex:".*"}};
        db.findTypes(searchObject, function(out) {
	    res.send(JSON.stringify(out) );
	});
    }
    else if (q) {
        // if search is surround by quotes, return exact results                
        if(q[0]=="\"" && q[q.length-1]=="\"") {
            q = q.substring(1,q.length-1)
            var searchObject = {type: q};
            db.findTypes(searchObject, function(out) {
		res.send(JSON.stringify(out) );
	    });
        }
        else { // otherwise return similar results                              
            q = ".*" + q.replace(" ",".*") + ".*";

            var searchObject = {type: {$regex: q}};
            db.findTypes(searchObject, function(out) {
		res.send( JSON.stringify(out) );
	    });
        }
    }
});


// Simple route middleware to ensure user is authenticated.                                                                                                                    //   Use this route middleware on any resource that needs to be protected.  If                                                                                                 //   the request is authenticated (typically via a persistent login session),                                                                                                  //   the request will proceed.  Otherwise, the user will be redirected to the                                                                                                  //   login page.                                                          

function getIdFromURI(uri) {
    var gid = uri.split("?")[1];
    return gid.substring(3, gid.length);
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
