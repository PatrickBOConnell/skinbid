//THIS IS THE SKIN BIDS MAIN WEBSERVER


var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	path = require('path'),
	passport = require('passport'),
	util = require('util'),
	SteamStrategy = require('passport-steam').Strategy;
	
	
var cookieParser = express.cookieParser('your secret sauce')
  , sessionStore = new connect.middleware.session.MemoryStore();

var db = require('mongojs').connect('localhost/csgodrawingboard', ['strats', 'logs']);
require('winston-mongodb').MongoDB;

	
process.on('uncaughtException', function(err) {
	console.log('uncaught exception: ' + err);
});

passport.serializeUser(function(user, done){
    done(null, user);
});

passport.deserializeUser(function(obj,done){
    done(null, obj);
});
	

passport.use(new SteamStrategy({
    returnURL: 'http://localhost:8080/auth/steam/return',//return url here
	realm: 'http://localhost:8080/',
    },
	function(identifier, profile, done) {
		process.nextTick(function() {
		    //I guess this is where I put in the query for local user from steam data?
			console.log('the identifier is: ' + identifier);
			var id = identifier.match('http://steamcommunity.com/openid/id/(.*)')[1];
		    profile.identifier = id;
			return done(null, profile);
		});
	}
));	


var port = process.env.PORT || 8080;	
server.listen(port);

/* io.configure(function () { 
	io.set("transports", ["xhr-polling"]); 
	io.set("polling duration", 10); 
}); */

var rooms = {};
var indexes_served = 0;
var rooms_served = 0;

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(cookieParser);
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({store: sessionStore}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

//POSTS
app.post('/test', function(req, res) {
	console.log('got make_room post');
	console.log(req.body);
	var map = req.body.map;
	console.log('map is: ' + map);
	var roomname;
	do{
		var crypto = require('crypto'),
			shasum = crypto.createHash('sha1');
		shasum.update('' + Math.random() + new Date().getTime());
		roomname = shasum.digest('hex');
	}while(rooms[roomname] !== undefined);
	rooms[roomname] = new Room(roomname);
	rooms[roomname].map = map;
	res.redirect('/room=' + roomname);
});

app.get('/auth/steam',
    passport.authenticate('steam', {failureRedirect: '/'}),
    function(req, res) {
        res.redirect('/');
});

app.get('/auth/steam/return',
    passport.authenticate('steam', {failureRedirect: '/'}),
    function(req, res) {
        res.redirect('/');
});