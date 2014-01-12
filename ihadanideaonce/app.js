var express = require("express");
var uuid = require("node-uuid");
var users = require("./users");

var app = express();

app.use(express.static(__dirname + '/static'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(app.router);

app.use(function(err, req, res, next) {
	var id = uuid.v4();
	console.log("Error refid", id);
	console.log(err);
	res.send(500, {error: {message: "Internal application error", id: -6},  refid: id});
});

app.post("/api/register", function(req, res) {
	var email = req.body.email;
	var pw = req.body.pw;

	users.register(email, pw, function(result) {
		res.send(result);
	});
});

app.post("/api/login", function(req, res) {
	var email = req.body.email;
	var pw = req.body.pw;

	users.login(email, pw, function(result) {
		res.send(result);
	});
});

app.post("/api/get", function(req, res) {
	var uid = req.body.uid || req.cookies.uid;
	var secret = req.body.secret || req.cookies.secret;

	users.getIdeas(uid, secret, function(result) {
		res.send(result);
	});
});

app.post("/api/add", function(req, res) {
	var uid = req.body.uid || req.cookies.uid;
	var secret = req.body.secret || req.cookies.secret;
	var ideatext = req.body.text;
	var tags = req.body.tags == "" ? [] : req.body.tags.split(" ");

	users.addIdea(ideatext, tags, uid, secret, function(result) {
		res.send(result);
	});
});

app.post("/api/update", function(req, res) {
	var uid = req.body.uid || req.cookies.uid;
	var secret = req.body.secret || req.cookies.secret;
	var id = req.body.id;
	var ideatext = req.body.text;
	var tags = req.body.tags == "" ? [] : req.body.tags.split(" ");

	users.updateIdea(id, ideatext, tags, uid, secret, function(result) {
		res.send(result);
	});
});

app.post("/api/delete", function(req, res) {
	var uid = req.body.uid || req.cookies.uid;
	var secret = req.body.secret || req.cookies.secret;
	var id = req.body.id;

	users.deleteIdea(id, uid, secret, function(result) {
		res.send(result);
	});
});

var port = process.env.PORT || 8000;
console.log("Will listen on port " + port);
app.listen(port);
