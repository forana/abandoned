GameScreen = function(game, rules) {
	_.extend(this, Screen);

	this.gridSize = 6;
	this.plays = [[], []];
	this.turn = 0;

	this.grid = rules.getInitialGrid(this.gridSize);

	this.update = function(game) {
		for (var i=0; i<this.gridSize; i++) {
			for (var j=0; j<this.gridSize; j++) {
				this.grid[i][j].update(0.1);
			}
		}
	};

	this.updateDimensions = function(width, height) {
		this.xOffset = (width - height) / 2;
		this.sizePerTile = height / this.gridSize;
		this.width = width;
		this.height = height;
		this.largeFontSize = Math.floor(this.sizePerTile / 2);
		this.smallFontSize = Math.floor(this.sizePerTile / 5);
	};

	this.render = function(context) {
		context.fillStyle = "#000000";
		context.fillRect(0, 0, this.width, this.height);

		for (var i=0; i<this.gridSize; i++) {
			for (var j=0; j<this.gridSize; j++) {
				this.grid[i][j].renderBlock(context,
					this.xOffset + i*this.sizePerTile,
					j*this.sizePerTile,
					this.sizePerTile,
					this.sizePerTile
				);
			}
		}

		context.fillStyle = "#333333";
		context.font = this.smallFontSize + "px Helvetica Arial";
		for (var i=0; i<this.gridSize; i++) {
			for (var j=0; j<this.gridSize; j++) {
				this.grid[i][j].renderSmallText(context,
					this.xOffset + i*this.sizePerTile,
					j*this.sizePerTile,
					this.sizePerTile,
					this.sizePerTile,
					this.smallFontSize
				);
			}
		}

		context.fillStyle = "#000000";
		context.font = this.largeFontSize + "px Helvetica Arial";
		for (var i=0; i<this.gridSize; i++) {
			for (var j=0; j<this.gridSize; j++) {
				this.grid[i][j].renderLargeText(context,
					this.xOffset + i*this.sizePerTile,
					j*this.sizePerTile,
					this.sizePerTile,
					this.sizePerTile,
					this.largeFontSize
				);
			}
		}
	};
};
