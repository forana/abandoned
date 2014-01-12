Game.Screens.Battle = {
	NUM_STARS: 200,

	SHIP_THETA_STEP: Math.PI / 240,
	SHIP_BASE_SCALE: 1,

	IMAGES: {
		PILOT_FRAME_LEFT: "resources/images/frames/pilot-l.png",
		PILOT_FRAME_RIGHT: "resources/images/frames/pilot-r.png",
		NAME_FRAME_LEFT: "resources/images/frames/name-l.png",
		NAME_FRAME_RIGHT: "resources/images/frames/name-r.png",
		BAR_SHIELD: "resources/images/frames/shields.png",
		BAR_ENERGY: "resources/images/frames/energy.png"
	},

	shipTheta: 0,
	stars: [],
	ships: [],
	buttons: [],
	imageCache: new ImageCache(),
	audioCache: new AudioCache(),

	shieldPattern: null,
	energyPattern: null,

	actionQueue: [],

	load: function() {
		for (var i=0; i<this.NUM_STARS; i++) {
			this.stars.push(new HorizontalStar());
		}
		this.shipTheta = 0;
		this.ships = [
			new Ship(Hulls.SHUTTLE, [Weapons.LASER, Weapons.TORPEDO], [], null, this.imageCache.get("resources/test.png"), "HMS Vomit"),
			new Ship(Hulls.SHUTTLE, [], [], null, this.imageCache.get("resources/test.png"))
		];

		var self = this;
	},

	unload: function() {
		this.stars = [];
		_.each(this.buttons, function(button) {
			ClickRegister.unregister(button);
		});
		this.buttons = [];
		this.imageCache.clear();
		this.audioCache.clear();
		this.actionQueue = [];
		this.shieldPattern = null,
		this.energyPattern = null
	},

	update: function() {
		this.shipTheta += this.SHIP_THETA_STEP;
		for (var i=0; i<this.stars.length; i++) {
			this.stars[i].move();
		}
		if (this.actionQueue.length > 0) {
			this.actionQueue[0].update();
			if (this.actionQueue[0].isFinished()) {
				this.actionQueue.splice(0,1);
			}
			if (this.actionQueue.length == 0) {
				this._enableButtons();
			}
		}
	},

	render: function(context, height) {
		var divide = height - 14;

		this._renderField(context, divide);
		this._renderButtons(context, divide);
	},

	_renderField: function(context, divide) {
		// black backdrop
		context.fillStyle = "#000";
		context.fillRect(0, 0, 24 * Game.PPU, divide * Game.PPU);

		// stars
		for (var i=0; i<this.stars.length; i++) {
			this.stars[i].render(context, divide * Game.PPU);
		}

		// ships
		var xc = 12 * Game.PPU;
		var yc = divide / 2 * Game.PPU;
		var r = Math.min(xc, yc) * 0.75;
		var closeMod = 0.75 + 0.25*Math.cos(this.shipTheta*2/3);
		r = r * closeMod;

		for (var i=0; i<this.ships.length; i++) {
			this.ships[i].updateVisibles();
			var theta = this.shipTheta + Math.PI * 2 / this.ships.length * i;
			var facing = theta - Math.PI/2;
			if (this.ships[i].isDead()) {
				facing *= 7;
			}
			var scale = this.ships[i].hull.scale * this.SHIP_BASE_SCALE * Game.PPU;
			this.ships[i].vx = xc + r * Math.cos(theta);
			this.ships[i].vy = yc + r * Math.sin(theta);
			context.drawRotatedImage(this.imageCache.get(this.ships[i].hull.image), this.ships[i].vx, this.ships[i].vy,
				scale, scale, facing);
		}

		// current action
		if (this.actionQueue.length > 0) {
			this.actionQueue[0].render(context, this.ships[0].vx, this.ships[0].vy, this.ships[1].vx, this.ships[1].vy);
		}

		// health and energy bars
		context.font = Game.PPU + Game.FONT;
		// player panel
		context.fillStyle = "#333";
		context.fillRect(4*Game.PPU, (divide - 3)*Game.PPU, 19*Game.PPU, 2*Game.PPU);
		context.drawImage(this.imageCache.get(this.IMAGES.NAME_FRAME_LEFT), 4*Game.PPU, (divide - 4)*Game.PPU, 8*Game.PPU, Game.PPU);
		context.drawImage(this.ships[0].pilot, 1*Game.PPU, (divide - 4)*Game.PPU, 3*Game.PPU, 3*Game.PPU);
		context.drawImage(this.imageCache.get(this.IMAGES.PILOT_FRAME_LEFT), 1*Game.PPU, (divide - 4)*Game.PPU, 3*Game.PPU, 3*Game.PPU);
		// enemy panel
		context.fillRect(1*Game.PPU, 1*Game.PPU, 19*Game.PPU, 2*Game.PPU);
		context.drawImage(this.imageCache.get(this.IMAGES.NAME_FRAME_RIGHT), 12*Game.PPU, 3*Game.PPU, 8*Game.PPU, Game.PPU);
		context.drawImage(this.ships[1].pilot, 20*Game.PPU, 1*Game.PPU, 3*Game.PPU, 3*Game.PPU);
		context.drawImage(this.imageCache.get(this.IMAGES.PILOT_FRAME_RIGHT), 20*Game.PPU, 1*Game.PPU, 3*Game.PPU, 3*Game.PPU);

		// health
		context.fillStyle = "#36C";
		context.fillRect(4*Game.PPU, (divide - 3)*Game.PPU, 19*Game.PPU * (this.ships[0].visibleHealth / this.ships[0].maxHealth), 1*Game.PPU);
		var enemyHealth = 19*Game.PPU * (this.ships[1].visibleHealth / this.ships[1].maxHealth);
		context.fillRect(1*Game.PPU + (19*Game.PPU - enemyHealth), 1*Game.PPU, enemyHealth, 1*Game.PPU);
		context.fillStyle = "#FFF";
		context.fillText(Math.round(this.ships[0].health) + "/" + this.ships[0].maxHealth, 4.25*Game.PPU, (divide - 2.2)*Game.PPU);
		// energy
		context.fillStyle = "#3C6";
		context.fillRect(4*Game.PPU, (divide - 2)*Game.PPU, 19*Game.PPU * (this.ships[0].visibleEnergy / this.ships[0].maxEnergy), 1*Game.PPU);
		var enemyEnergy = 19*Game.PPU * (this.ships[1].visibleEnergy / this.ships[1].maxEnergy);
		context.fillRect(1*Game.PPU + (19*Game.PPU - enemyEnergy), 2*Game.PPU, enemyEnergy, 1*Game.PPU);
		context.fillStyle = "#FFF";
		context.fillText(Math.round(this.ships[0].energy) + "/" + this.ships[0].maxEnergy, 4.25*Game.PPU, (divide - 1.2)*Game.PPU);
		// ship names
		context.fillStyle = "#FFF";
		context.fillText(this.ships[0].name, 4.25*Game.PPU, (divide - 3.2)*Game.PPU);
		var enemyNameWidth = context.measureText(this.ships[1].name).width;
		context.fillText(this.ships[1].name, 19.75*Game.PPU - enemyNameWidth, 3.8*Game.PPU);
	},
		
	_renderButtons: function(context, divide) {
		// blue backdrop
		context.fillStyle = "#006";
		context.fillRect(0, divide * Game.PPU, 24 * Game.PPU, Game.canvas.height);

		// load the buttons if they didn't exist
		if (this.buttons.length == 0) {
			var self = this;

			var bw = 10;
			var bh = 4;
			var bx = 2;
			var by = divide + 1;

			for (var i=0; i<4/* && i<this.ships[0].hull.allowedWeapons*/; i++) {
				(function(weapon, i) {
					var subtext = (weapon && weapon.ammo) ? function() {
						return " x" + 10;
					} : null;
					var button = new CanvasButton(weapon ? weapon.name : "(empty)",
						(bx + (i%2==1 ? bw : 0)) * Game.PPU,
						(by + Math.floor(i/2) * bh) * Game.PPU,
						bw * Game.PPU,
						bh * Game.PPU,
						subtext);
					if (weapon) {
						button.setClick(function() {
							self._disableButtons();
							self.actionQueue.push(new Action(weapon, self.ships[0], self.ships[1], self.audioCache, self.imageCache));
						});
					} else {
						button.enabled = false;
					}
					self.buttons.push(button);
				})(this.ships[0].weapons[i], i);
			}
			
			var specialButton = new CanvasButton("Tactical",  2 * Game.PPU, (divide + 9) * Game.PPU, 10 * Game.PPU, 4 * Game.PPU);
			specialButton.setClick(function() {
				self.ships[0].hull.scale = Math.random() * 10;
			});
			this.buttons.push(specialButton);
			var retreatButton = new CanvasButton("Retreat",  12 * Game.PPU, (divide + 9) * Game.PPU, 10 * Game.PPU, 4 * Game.PPU);
			retreatButton.setClick(function() {
				alert("I didn't implement this yet");
			});
			this.buttons.push(retreatButton);
		}
		
		// draw buttons
		_.each(this.buttons, function(button) {
			button.render(context);
		});
	},

	_disableButtons: function() {
		_.each(this.buttons, function(button) {
			button.tempDisabled = true;
		});
	},

	_enableButtons: function() {
		_.each(this.buttons, function(button) {
			button.tempDisabled = false;
		});
	}
};
