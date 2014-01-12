BaseRules = {
	getInitialGrid: function(size) {
		var grid = [];
		for (var i = 0; i<size; i++) {
			var col = [];
			for (var j = 0; j<size; j++) {
				col.push(new Tile(Letters.pick()));
			}
			grid.push(col)
		}
		return grid;
	},

	afterMoveMade: function(grid) {
	},

	isGameOver: function(grid, moves) {
		return false;
	}
};
