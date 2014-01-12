Ideas = {
	clearErrors: function() {
		$("#box-errors .alert").hide(200).remove();
	},

	showErrors: function(errors) {
		this.clearErrors();

		var errorBox = document.getElementById("box-errors");
		_(errors).forEach(function(error) {
			$(errorBox).append($(
				"<div class='alert alert-error fade in'>" +
					"<button type='button' class='close' data-dismiss='alert'>&times;</button>" +
					error +
				"</div>"
			).show(200));
		});
	},

	callAPI: function(target, vars, successCallback, formToDisable, enforceLogin) {
		var uri = "/api/" + target;

		if (formToDisable) {
			$("input, button, textarea", formToDisable).attr("disabled", true);
		}

		$.ajax({
			url: uri,
			type: "POST",
			async: true,
			data: vars,
			success: function(result) {
				if (result.error) {
					if (result.error.id == 2 && enforceLogin) { // "Invalid credentials"
						Ideas.logOut();
					} else {
						Ideas.showErrors([result.error.message]);
					}
				} else {
					successCallback(result);
				}
			},
			error: function(err) {
				Ideas.showErrors([err]);
			},
			complete: function() {
				if (formToDisable) {
					$("input, button, textarea", formToDisable).attr("disabled", false);
				}
			}
		});
	},

	logIn: function(uid, secret) {
		Ideas._setCookie("uid", uid);
		Ideas._setCookie("secret", secret);
		$(document.body).removeClass("state-initial").removeClass("state-loggedout").addClass("state-loggedin");
	},

	logOut: function() {
		Ideas._unsetCookie("uid");
		Ideas._unsetCookie("secret");
		Ideas.clearErrors();
		$(document.body).removeClass("state-initial").removeClass("state-loggedin").addClass("state-loggedout");
	},

	_setCookie: function(key, value) {
		var expires = new Date();
		expires.setTime(expires.getTime() + 24*60*60*1000); // expire in 1000 days
		document.cookie = key + "=" + value + "; expires=" + expires.toGMTString() + "; path=/";
	},

	_unsetCookie: function(key) {
		var expires = new Date();
		expires.setTime(expires.getTime() - 3600); // expire an hour ago
		document.cookie = key +"=deleted; expires=" + expires.toGMTString();
	},

	buildIdea: function(idea) {
		return $("" +
			"<div class='idea'>" +
				"<div class='remove'><a href='#'><img src='img/x.png' alt='x' /></a></div>" +
				"<div class='name'>" + idea.text.replace("<", "&lt;") + "</div>" +
					"<div class='tags'>" + _(idea.tags).reduce(function (html, tag) {
						return html + "<span class='tag'>" + tag + "</span>";
					}, "") + "</div>" +
					"<div class='date'>last touched " + (new Date(idea.lastChanged)).toLocaleDateString() + "</div>" +
				"</div>" +
			"</div>");
	},

	showIdeas: function(ideas) {
		var ideaBox = document.getElementById("box-ideas");
		$(ideaBox).empty();
		_(ideas).forEach(function(idea) {
			$(ideaBox).prepend(Ideas.buildIdea(idea));
		});
	},

	getIdeas: function() {
		Ideas.callAPI("get", {}, function(result) {
			$(document.body).removeClass("state-initial").removeClass("state-loggedout").addClass("state-loggedin");
			Ideas.showIdeas(result.ideas);
		}, null, true);
	}
};

// man if there's one thing I love, it's binding events !!
$(document).on("ready", function() {
	// global stuff
	$("#link-logout").on("click", function() {
		Ideas.logOut();
	});

	$("#box-what").hide();
	$("#link-what").on("click", function() {
		$("#box-what").show(200);
	});

	// login form stuff
	var loginForm = document.getElementById("form-login");
	$(loginForm).on("submit", function(e) {
		e.preventDefault();
	});

	$("#link-register").on("click", function() {
		$("#controls-register").show(200);
		$("#controls-login").hide(200);
	});
	$("#link-login").on("click", function() {
		$("#controls-register").hide(200);
		$("#controls-login").show(200);
	});

	var validateLoginFields = function(errors) {
		if (loginForm.email.value.length==0) {
			errors.push("Need an email address to log in, man");
		} else if (!/.+@.+\..+/.test(loginForm.email.value)) {
			errors.push("I don't think that's a valid email address...");
		}

		if (loginForm.password.value.length==0) {
			errors.push("Password has to be at least 0 characters long.");
		}
	};

	$("#button-login").on("click", function() {
		var errors = [];
		validateLoginFields(errors);
		Ideas.showErrors(errors);

		if (errors.length == 0) {
			Ideas.callAPI("login", {email: loginForm.email.value, pw: loginForm.password.value}, function (result) {
				Ideas.logIn(result.uid, result.secret);
				Ideas.getIdeas();
			}, $("#form-login"), false);
		}
	});

	$("#button-register").on("click", function() {
		var errors = [];
		validateLoginFields(errors);
		if (loginForm.password.value != loginForm.password2.value) {
			errors.push("Passwords should probably match!");
		}
		Ideas.showErrors(errors);

		if (errors.length == 0) {
			Ideas.callAPI("register", {email: loginForm.email.value, pw: loginForm.password.value}, function (result) {
				Ideas.logIn(result.uid, result.secret);
				Ideas.getIdeas();
			}, $("#form-login"), false);
		}
	});

	// add ideas stuff
	var addIdeaForm = document.getElementById("form-addidea");
	$("textarea[name=ideaname]", addIdeaForm).autoResizeTextarea().submitOnEnter();
	$(addIdeaForm).on("submit", function(e) {
		e.preventDefault();

		Ideas.callAPI("add", {text: addIdeaForm.ideaname.value, tags: addIdeaForm.tags.value}, function(result) {
			$("#box-ideas").prepend(Ideas.buildIdea({text: addIdeaForm.ideaname.value, tags: addIdeaForm.tags.value == "" ? [] : addIdeaForm.tags.value.split(" "), lastChanged: (new Date()).getTime()}).fadeIn());
			addIdeaForm.ideaname.value = "";
		}, addIdeaForm, true);
	});

	// ACTUALLY DO THINGS #WOW #WHOA
	$(document.body).addClass("state-initial");
	if (document.cookie.indexOf("uid=") != -1 && document.cookie.indexOf("secret=") != -1) { // dirty dirty cheap way to check if the cookies exist
		Ideas.getIdeas();
	} else {
		Ideas.logOut();
	}
});