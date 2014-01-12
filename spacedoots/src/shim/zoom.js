window.fzoom = 1;

if (!navigator.isCocoonJS) {
	document.addEventListener("DOMContentLoaded", function() {
		var fitWindow = function() {
			var windowHeight = window.innerHeight;
			var boxHeight = 1024;
			var windowWidth = window.innerWidth;
			var boxWidth = 768;

			var vz = windowHeight / boxHeight;
			var hz = windowWidth / boxWidth;
			
			document.body.style.zoom = Math.min(hz, vz);
			window.fzoom = Math.min(hz, vz);
		};
		window.addEventListener("resize", fitWindow);
		var initialZoom = function() {
			fitWindow();
			window.removeEventListener("load", initialZoom);
		}
		window.addEventListener("load", initialZoom);
	});
}