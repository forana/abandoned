Game.Screens.Field = {
	NUM_STARS: 200,
	SHIP_STEP: Math.PI / 180,

	navButtons: [],
	controlButtons: [],
	stars: [],

	audioCache: new AudioCache(),
	imageCache: new ImageCache(),

	theta: 0,

	sector: null,

	ship: new Ship(Hulls.SHUTTLE, [Weapons.LASER, Weapons.TORPEDO], [], null, null, "HMS Vomit"),

	load: function() {
		for (var i=0; i<this.NUM_STARS; i++) {
			this.stars.push(new OrbitalStar());
		}
		this.sector = Sectors.get(UserData.currentSector);
	},

	unload: function() {
		this.stars = [];
		this.audioCache.clear();
		this.imageCache.clear();
		this.theta = 0;

		_.each(this.controlButtons.concat(this.navButtons), function(button) {
			ClickRegister.unregister(button);
		});
		this.controlButtons = [];
		this.navButtons = [];
	},

	update: function() {
		for (var i=0; i<this.stars.length; i++) {
			this.stars[i].move();
		}
		this.theta += this.SHIP_STEP;
	},

	render: function(context, height) {
		var divide = height - 5;

		this._renderField(context, divide);
		this._renderControls(context, divide);
	},

	_renderField: function(context, divide) {
		context.fillStyle = "#000";
		context.fillRect(0, 0, 24*Game.PPU, divide*Game.PPU);

		// background stars
		var dist = Math.sqrt(12*12 + divide*divide) / 2 * Game.PPU;
		for (var i=0; i<this.stars.length; i++) {
			this.stars[i].render(context, 12*Game.PPU, divide/2*Game.PPU, dist);
		}

		// the star
		var star = this.sector.stars[UserData.currentStep];
		var r = 255 - star.darkness*star.darkness + Math.pow(star.red > star.darkness ? star.darkness : star.red, 2);
		var g = 255 - Math.pow(star.darkness, 2);
		var b = 255 - Math.pow(star.darkness, 4);
		context.fillStyle = "rgb("+r+", "+g+", "+b+")";
		context.fillRect(10*Game.PPU, (divide/2 - 2)*Game.PPU, 4*Game.PPU, 4*Game.PPU);
		context.drawImage(this.imageCache.get("resources/images/frames/starmask.png"), 10*Game.PPU, (divide/2 - 2)*Game.PPU, 4*Game.PPU, 4*Game.PPU);

		// nav arrows
		if (this.navButtons.length == 0) {
			var forwardButton = new ImageButton(this.imageCache.get("resources/images/frames/arrow-green.png"),
				14*Game.PPU,
				(divide/2 - 6)*Game.PPU,
				4*Game.PPU,
				4*Game.PPU
			);
			this.navButtons.push(forwardButton);
			var backButton = new ImageButton(this.imageCache.get("resources/images/frames/arrow-red.png"),
				7*Game.PPU,
				(divide/2 + 2)*Game.PPU,
				3*Game.PPU,
				3*Game.PPU
			);
			this.navButtons.push(backButton);

			forwardButton.setClick(function() {
				alert("aw shit");
			});
			backButton.setClick(function() {
				alert("barf");
			});
		}
		_.each(this.navButtons, function(button) {
			button.render(context);
		});

		// the ship
		var radius = 3 + this.ship.hull.scale / 2;
		var scale = this.ship.hull.scale / 2;
		context.drawRotatedImage(this.imageCache.get(this.ship.hull.image),
			12*Game.PPU + radius*Game.PPU*Math.cos(this.theta),
			divide/2*Game.PPU + radius*Game.PPU*Math.sin(this.theta),
			scale*Game.PPU,
			scale*Game.PPU,
			this.theta + Math.PI);

		// sector name
		context.fillStyle = "#FFF";
		context.font = Game.PPU*1.5 + Game.FONT;
		context.fillCenteredText("The " + this.sector.name + " Sector",
			12*Game.PPU,
			3*Game.PPU);

		// star name
		context.font = Game.PPU + Game.FONT;
		context.fillCenteredText(this.sector.stars[UserData.currentStep].name,
			12*Game.PPU,
			(divide - 3)*Game.PPU);

		// distance to next star
		context.font = Game.PPU*0.7 + Game.FONT;
		var starDistance = (this.sector.stars.length - UserData.currentStep);
		context.fillCenteredText("- " + starDistance + " star" + (starDistance > 1 ? "s" : "") + " to next base -",
			12*Game.PPU,
			(divide - 2)*Game.PPU);
	},

	_renderControls: function(context, divide) {
		if (this.controlButtons.length == 0) {
			var shipDetailButton = new CanvasButton("Your ship", 2*Game.PPU, divide*Game.PPU, 10*Game.PPU, 4*Game.PPU);
			shipDetailButton.setClick(function() {
				Game.swapScreen(Game.Screens.ShipDetail);
			});
			this.controlButtons.push(shipDetailButton);
			var backToBaseButton = new CanvasButton("Back to base", 12*Game.PPU, divide*Game.PPU, 10*Game.PPU, 4*Game.PPU);
			backToBaseButton.setClick(function() {
				Game.swapScreen(Game.Screens.Field, {action: "base"});
			});
			this.controlButtons.push(backToBaseButton);
		}

		context.fillStyle = "#006";
		context.fillRect(0, divide*Game.PPU, 24*Game.PPU, Game.canvas.height - divide*Game.PPU);
		_.each(this.controlButtons, function(button) {
			button.render(context);
		});
	}
};