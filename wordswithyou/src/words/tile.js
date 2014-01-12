Tile = function(model) {
	this.rep = model[0];
	this.value = model[1];

	this.offset = 0;
	this.image = ImageCache.get("resources/tile.png")

	this.slide = function(dist) {
		this.offset += dist;
	};

	this.update = function(dist) {
		this.offset = Math.max(0, this.offset - dist);
	};

	this.renderBlock = function(context, x, y, width, height) {
		context.fillStyle = "#CCAA99";
		context.drawImage(this.image, x, y, width, height);
	};

	this.renderLargeText = function(context, x, y, width, height, size) {
		var mid = context.measureText(this.rep).width / 2;
		context.fillText(this.rep,
			x + width/2 - mid,
			y + height/2 + size/2);
	};

	this.renderSmallText = function(context, x, y, width, height, size) {
		var mid = context.measureText(this.value).width / 2;
		context.fillText(this.value,
			x + width/2 - mid,
			y + height*0.95);
	};
};
