Game.Screens.Title = {
	button: null,

	load: function() {
	},

	unload: function() {
		ClickRegister.unregister(this.button);
		this.button = null;
	},

	render: function(context, height) {
		context.font = Game.PPU + "px Helvetica";
		
		context.fillStyle = "#000";
		context.fillRect(0, 0, 24 * Game.PPU, Game.canvas.height);

		if (this.button == null) {
			this.button = new CanvasButton("Hey fuck you man", 2 * Game.PPU, (height/2 - 4) * Game.PPU, 20 * Game.PPU, 8 * Game.PPU);
			this.button.setClick(function() {
				Game.swapScreen(Game.Screens.Battle);
			});
		}
		
		this.button.render(context);
	}
};
