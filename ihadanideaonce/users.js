var MongoClient = require("mongodb").MongoClient;
var BSON = require("mongodb").BSON;
var uuid = require("node-uuid");
var crypto = require("crypto");

var collection = null;
var stale = true;

var assertDB = function(callback, andThen) {
	if (stale || !collection) {
		MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
			if (err) {
				mongoError(callback, err);
			} else {
				db.createCollection("ideas", {w:1}, function(err, icollection) {
					if (err) {
						mongoError(callback, err);
					} else {
						collection = icollection;
						collection.ensureIndex({"uid": 1}, {"unique": true}, function(err) {
							if (err) {
								console.log("Could not ensure index: " + err);
							}
						});
						andThen();
					}
				});
			}
		});

		stale = false;
	} else {
		andThen();
	}
};

var ERRORS = {
	DATABASE_ERROR: {message: "Database problem, panic everywhere, we're all dead", id: -1},
	MISSING_PARAMETER: {message: "Missing parameters.", id: 1},
	INVALID_CREDENTIALS: {message: "Email/password combination not recognized.", id: 2},
	EMAIL_IN_USE: {message: "Email address is in use.", id: 3},
	NO_IDEA_FOR_GIVEN_CREDENTIALS: {message: "No idea with the given ID exists for the given credentials.", id: 4}
};


var error = function(callback, err) {
	callback({
		"error": err
	});
};


var mongoError = function(callback, err) {
	stale = true;
	var u = uuid.v4();
	callback({
		"error": ERRORS.DATABASE_ERROR,
		"refid": u
	});
	console.log("Error refid "+u+":", err);
};

var createSalt = function() {
	return crypto.randomBytes(64).toString();
};

var hashPassword = function(pw, salt) {
	var hasher = crypto.createHash("sha256");
	hasher.update(pw);
	hasher.update(salt);
	return hasher.digest().toString();
};

var createSecret = function() {
	return uuid.v4();
};

var getTime = function() {
	return (new Date()).getTime();
};

exports.register = function(email, pw, callback) {
	assertDB(callback, function() {
		if (email == null || pw == null) {
			error(callback, ERRORS.MISSING_PARAMETER);
		} else {
			// check if the email is in use
			collection.findOne({"email": email}, function(err, data) {
				if (err) {
					mongoError(callback, err);
				} else {
					if (data != null) {
						error(callback, ERRORS.EMAIL_IN_USE);
					} else {
						// email address is free - let's start inserting
						var salt = createSalt();
						var passHash = hashPassword(pw, salt);
						var secret = createSecret();
						var uid = uuid.v4();
						collection.insert({"uid": uid, "email": email, "passhash": passHash, "salt": salt, "secret": secret, "ideas": []}, {w:1}, function(err, result) {
							if (err) {
								mongoError(callback, err);
							} else {
								callback({"uid": uid, "secret": secret});
							}
						});
					}
				}
			});
		}
	});
};

exports.login = function(email, pw, callback) {
	assertDB(callback, function() {
		if (email == null || pw == null) {
			error(callback, ERRORS.MISSING_PARAMETER);
		} else {
			// grab blob for email
			collection.findOne({"email": email}, {"ideas": 0}, function(err, data) {
				if (err) {
					mongoError(callback, err);
				} else if (data == null) {
					error(callback, ERRORS.INVALID_CREDENTIALS);
				} else {
					var cHash = hashPassword(pw, data.salt);
					if (cHash != data.passhash) {
						error(callback, ERRORS.INVALID_CREDENTIALS);
					} else {
						callback({"uid": data.uid, "secret": data.secret});
					}
				}
			});
		}
	});
};

exports.getIdeas = function(uid, secret, callback) {
	assertDB(callback, function() {
		if (uid == null || secret == null) {
			error(callback, ERRORS.MISSING_PARAMETER);
		} else {
			collection.findOne({"uid": uid, "secret": secret}, function(err, data) {
				if (err) {
					mongoError(callback, err);
				} else {
					if (data == null) {
						error(callback, ERRORS.INVALID_CREDENTIALS);
					} else {
						callback({"ideas": data.ideas});
					}
				}
			});
		}
	});
};

exports.addIdea = function(text, tags, uid, secret, callback) {
	assertDB(callback, function() {
		if (text == null || tags == null || uid == null || secret == null) {
			error(callback, ERRORS.MISSING_PARAMETER);
		} else {
			var id = uuid.v4();

			collection.update({"uid": uid, "secret": secret},
				{$push: {
					"ideas": {
						"id": id,
						"text": text,
						"tags": tags,
						"lastChanged": getTime()
					}
				}},
				function(err, result) {
					if (err) {
						mongoError(callback, err);
					} else {
						if (result < 1) {
							error(callback, ERRORS.INVALID_CREDENTIALS);
						} else {
							callback({"id": id});
						}
					}
				}
			);
		}
	});
};

exports.updateIdea = function(id, text, tags, uid, secret, callback) {
	assertDB(callback, function() {
		if (id == null || text == null || tags == null || uid == null || secret == null) {
			error(callback, ERRORS.MISSING_PARAMETER);
		} else {
			collection.update({"uid": uid, "secret": secret, "ideas.id": id},
				{$set: {
					"ideas.$": {
						"id": id,
						"text": text,
						"tags": tags,
						"lastChanged": getTime()
					}
				}},
				function(err, result) {
					if (err) {
						mongoError(callback, err);
					} else {
						if (result < 1) {
							error(callback, ERRORS.NO_IDEA_FOR_GIVEN_CREDENTIALS);
						} else {
							callback({"id": id});
						}
					}
				}
			);
		}
	});
};

exports.deleteIdea = function(id, uid, secret, callback) {
	assertDB(callback, function() {
		if (id == null || uid == null || secret == null) {
			error(callback, ERRORS.MISSING_PARAMETER);
		} else {
			collection.update({"uid": uid, "secret": secret},
				{$pull: {
					"ideas": {"id": id}
				}},
				function(err, result) {
					if (err) {
						mongoError(callback, err);
					} else {
						if (result < 1) {
							error(callback, ERRORS.INVALID_CREDENTIALS);
						} else {
							callback({"id": id});
						}
					}
				}
			);
		}
	});
};