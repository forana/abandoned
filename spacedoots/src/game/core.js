Game = {
	Screens: {},

	canvas: null,
	context: null,
	screen: null,
	
	xOffset: null,

	audioCache: new AudioCache(),

	updateInterval: null,
	
	// 'frames' per second that data should update at
	FPS: 60,
	// number of pixels per unit
	PPU: null,
	// minimum acceptable height-to-width ratio
	CORRECTION_RATIO: 4.0/3,
	// number of "units" across the screen
	UNIT_COUNT: 24,
	FONT: "px '04b'",//'Droid Sans Mono'",//'monospace' 'Andale Mono' 'Droid Sans Mono' 'Courier'",

	start: function() {
		this.canvas = document.createElement(navigator.isCocoonJS ? "screencanvas" : "canvas");
		this.canvas.imageSmoothingEnabled = false;

		this.setSizes();
		ClickRegister.init();
		UserData.load();

		this.context = this.canvas.getContext("2d");
		ExtDraw.apply(this.context);
		(navigator.isCocoonJS ? document.body : document.getElementById("fakescreen")).appendChild(this.canvas);

		this.render();

		var self = this;
		this.updateInterval = window.setInterval(function() {
			self.screen && self.screen.update && self.screen.update();
		}, 1000/Game.FPS);
	},

	setSizes: function() {
		this.canvas.width = navigator.isCocoonJS ? window.innerWidth : 768;
		this.canvas.height = navigator.isCocoonJS ? window.innerHeight : 1024;

		// calculate PPU
		//  if the width/height ratio is shorter than our minimum (meaning that the screen is stubbyshort).
		//  then we need to calculate what it _should_ have been and set the x-offset
		if (1.0*this.canvas.height/this.canvas.width < this.CORRECTION_RATIO) {
			var normalizedWidth = Math.floor(this.canvas.height / this.CORRECTION_RATIO);
			this.PPU = Math.floor(normalizedWidth / this.UNIT_COUNT);
			this.xOffset = (this.canvas.width - normalizedWidth)/2;
		} else {
			this.PPU = Math.floor(this.canvas.width / this.UNIT_COUNT);
			this.xOffset = 0;
		}
	},

	render: function() {
		window.requestAnimationFrame(function () {
			Game.render();
		});

		// if there's an x-offset, then the device's screen is narrower than our drawing area will think it is
		if (this.xOffset > 0) {
			this.context.fillStyle = "#000000";
			this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.context.save();
			this.context.translate(this.xOffset, 0)
		}

		if (this.screen != null) {
			this.screen.render(this.context, Math.floor(this.canvas.height / this.PPU));
		}

		// restore translation for next frame
		if (this.xOffset > 0) {
			this.context.restore();
		}
	},

	swapScreen: function(newScreen) {
		UserData.save();
		if (this.screen != null) {
			this.screen.unload();
		}
		this.screen = newScreen;
		this.screen.load();
	}
};

document.addEventListener("DOMContentLoaded", function() {
	Game.start();
	Game.swapScreen(Game.Screens.Field);
});

window.addEventListener("focus", function() {
	Game.lastFrame = Date.now();
});