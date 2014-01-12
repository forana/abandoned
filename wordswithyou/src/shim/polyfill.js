if (!window.requestAnimationFrame) {
	window.requestAnimationFrame = window.msRequestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || (function () {
		alert("Your browser is not modern enough for this - please install the latest version of whatever it is");
		throw "I'm sorry :(";
	})();
}

if (!navigator.vibrate) {
	navigator.vibrate = function (pattern) {
	};
}
