SettingKeys = {
	GLOBAL_MUTE: "mute",
	ENABLE_HAPTIC: "haptic"
};

UserData = {
	settings: [],
	ship: {},
	inventory: {},
	credits: 0,
	sectors: [],
	currentSector: 0,
	currentStep: 0,

	load: function() {
		if (localStorage.gameData) {
			var rawData = JSON.parse(localStorage.gameData);
			this.settings = rawData.settings;

			this.ship = {};
			this.ship.hull = Hulls.fromId(rawData.ship.hull);
			this.ship.engine = Engines.fromId(rawData.ship.engine);
			this.ship.weapons = _.map(rawData.ship.weapons, function(arg) { return Weapons.fromId(arg); });
			this.ship.enhancements = _.map(rawData.ship.enhancements, function(arg) { return Enhancements.fromId(arg); });

			this.inventory = {};
			this.inventory.hulls = _.map(rawData.inventory.hulls, function(arg) { return Hulls.fromId(arg); });
			this.inventory.engines = _.map(rawData.inventory.engines, function(arg) { return Engines.fromId(arg); });
			this.inventory.weapons = _.map(rawData.inventory.weapons, function(arg) { return Weapons.fromId(arg); });
			this.inventory.enhancements = _.map(rawData.inventory.enhancements, function(arg) { return Enhancements.fromId(arg); });
			this.inventory.consumables = _.map(rawData.inventory.consumables, function(arg) { return Consumables.fromId(arg); });

			this.credits = rawData.credits;

			this.sectors = rawData.sectors;
			this.currentSector = rawData.currentSector;
			this.currentStep = rawData.currentStep;
		} else {
			this.setInitialData();
		}
	},

	setInitialData: function() {
		this.settings = {};
		this.settings[SettingKeys.GLOBAL_MUTE] = false;
		this.settings[SettingKeys.ENABLE_HAPTIC] = true;

		this.ship = {
			hull: Hulls.SHUTTLE,
			engine: Engines.SHUTTLE,
			weapons: [Weapons.LASER],
			enhancements: []
		};

		this.inventory = {
			hulls: [],
			engines: [],
			weapons: [],
			enhancements: [],
			consumables: []
		};

		this.credits = 0;

		this.sectors = [];
		this.currentSector = 0;
		this.currentStep = 0;
	},

	save: function() {
		var obj = {};

		obj.settings = this.settings;

		obj.ship = {
			hull: this.ship.hull.id,
			engine: this.ship.engine.id,
			weapons: _.pluck(this.ship.weapons, "id"),
			enhancements: _.pluck(this.ship.enhancements, "id")
		};

		obj.inventory = {
			hulls: _.pluck(this.inventory.hulls, "id"),
			engines: _.pluck(this.inventory.engines, "id"),
			weapons: _.pluck(this.inventory.weapons, "id"),
			enhancements: _.pluck(this.inventory.enhancements, "id"),
			consumables: _.pluck(this.inventory.consumables, "id")
		};

		obj.credits = this.credits;

		obj.sectors = this.sectors;
		obj.currentSector = this.currentSector;
		obj.currentStep = this.currentStep;

		localStorage.gameData = JSON.stringify(obj);
	},

	getShip: function() {
		return new Ship(this.ship.hull,
			this.ship.engine,
			this.ship.weapons,
			this.ship.enhancements
		);
	}
};
