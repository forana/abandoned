GameCore = {
	canvas: document.createElement(navigator.isCocoonJS ? "screencanvas" : "canvas"),
	context: null,

	UPDATES_PER_SECOND: 25,

	timer: null,

	screen: null,

	start: function() {
		this.resizeCanvas();
		var self = this;
		window.addEventListener("resize", function() {
			self.resizeCanvas();
		});

		this.context = this.canvas.getContext("2d");
		document.body.appendChild(this.canvas);

		this.canvas.addEventListener("mouseup", function(e) {
			self.delegateClick(e.pageX, e.pageY);
		});
		this.canvas.addEventListener("touchend", function(e) {
			self.delegateClick(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});

		this.updateInterval = window.setInterval(function() {
			self.update();
		}, 1000/this.UPDATES_PER_SECOND);

		this.render();
	},

	resizeCanvas: function() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;

		this.screen && this.screen.updateDimensions(this.getWidth(), this.getHeight());
	},

	getWidth: function() {
		return this.canvas.width;
	},

	getHeight: function() {
		return this.canvas.height;
	},

	setScreen: function(newScreen) {
		this.screen = newScreen;
	},

	update: function() {
		this.screen.update(this);
	},

	render: function() {
		var self = this;
		window.requestAnimationFrame(function () {
			self.render();
		});

		this.screen.render(this.context);
	},

	delegateClick: function(x, y) {
		this.screen.handleClick(x, y);
	}
};
