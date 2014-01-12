Box = {
	render: function(context, text, x, y, width, height, active, subtext) {
		var OUTLINE_COLOR = "#FFF";
		var ACTIVE_COLOR = "#009";
		var INACTIVE_COLOR = "#003";

		context.fillStyle = OUTLINE_COLOR;
		context.fillRect(x + 0.5*Game.PPU, y + 1*Game.PPU, width - 1*Game.PPU, height - 2*Game.PPU);
		context.fillRect(x + 1*Game.PPU, y + 0.5*Game.PPU, width - 2*Game.PPU, height - 1*Game.PPU);
		context.fillStyle = active ? ACTIVE_COLOR : INACTIVE_COLOR;
		context.fillRect(x + 1*Game.PPU, y + 1*Game.PPU, width - 2*Game.PPU, height - 2*Game.PPU);
		context.fillStyle = OUTLINE_COLOR;
		context.fillRect(x + 0.75*Game.PPU, y + 0.75*Game.PPU, 0.5*Game.PPU, 0.5*Game.PPU);
		context.fillRect(x + 0.75*Game.PPU, y + height - 1.25*Game.PPU, 0.5*Game.PPU, 0.5*Game.PPU);
		context.fillRect(x + width - 1.25*Game.PPU, y + 0.75*Game.PPU, 0.5*Game.PPU, 0.5*Game.PPU);
		context.fillRect(x + width - 1.25*Game.PPU, y + height - 1.25*Game.PPU, 0.5*Game.PPU, 0.5*Game.PPU);

		context.font = Game.PPU + Game.FONT;
		var measured = context.measureText(text);
		context.fillText(text, x + width/2 - measured.width/2, y + height/2 + (subtext ? 0 : Game.PPU/2) - Game.PPU*0.15);
		if (subtext) {
			context.font = Game.PPU*0.7 + Game.FONT;
			measured = context.measureText(subtext);
			context.fillText(subtext, x + width/2 - measured.width/2, y + height/2 + Game.PPU - Game.PPU*0.15);
		}
	}
};

CanvasButton = function(text, x, y, width, height, subtext) {
	_.extend(this, ClickBase);

	this.enabled = true;

	this.text = text;
	this.subtext = subtext;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;

	this.render = function(context) {
		var ttext = typeof(this.subtext) == "function" ? this.subtext() : this.subtext;
		Box.render(context, this.text, this.x, this.y, this.width, this.height, this.enabled && !this.tempDisabled, ttext);
	};
};

ImageButton = function(image, x, y, width, height) {
	_.extend(this, ClickBase);

	this.enabled = true;

	this.image = image;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;

	this.render = function(context) {
		context.drawImage(this.image, x, y, width, height);
	};
};
