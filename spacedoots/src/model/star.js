HorizontalStar = function() {
	this.velocity = Math.random() * Game.PPU / 16;
	this.x = Math.random() * 24 * Game.PPU;
	this.yPercentage = Math.random();
	this.r = this.velocity;

	this.reset = function() {
		this.yPercentage = Math.random();
		this.r = Math.random() * Game.PPU / 16;
		this.x = Game.PPU * 24;
	};

	this.move = function() {
		this.x -= this.velocity;
		if (this.x < 0) {
			this.reset();
		}
	};

	this.render = function(context, maxHeight) {
		context.fillStyle = "#FFF";
		context.fillRect(this.x - this.r, this.yPercentage * maxHeight - this.r, 2*this.r, 2*this.r);
	};
};

OrbitalStar = function() {
	var px = Math.random() - 0.5;
	var py = Math.random() - 0.5;
	this.velocity = Math.random();
	this.distance = Math.sqrt(py*py + px*px) * 2;
	this.r = this.velocity * Game.PPU / 8;
	this.theta = Math.atan(py / px) + (py>0 ? 0 : Math.PI);

	this.move = function() {
		this.theta += this.velocity / 180 / Math.PI;
	};

	this.render = function(context, x, y, maxR) {
		context.fillStyle = "#FFF";
		context.fillRect(
			x + this.distance * maxR * Math.cos(-this.theta) - this.r/2,
			y + this.distance * maxR * Math.sin(-this.theta) - this.r/2,
			this.r,
			this.r);
	}
};
