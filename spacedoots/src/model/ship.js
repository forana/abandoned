Ship = function(hull, weapons, enhancements, engine, pilot, nickname) {
	this.hull = hull;
	this.weapons = weapons;
	this.enhancements = enhancements;
	this.engine = engine;

	this.name = nickname ? nickname : this.hull.name;
	this.pilot = pilot ? pilot : "resources/test.png";
	this.maxHealth = 100;
	this.visibleHealth = this.maxHealth;
	this.health = this.maxHealth;
	this.maxEnergy = 100;
	this.visibleEnergy = this.maxEnergy;
	this.energy = this.maxEnergy;

	this.speed = 100;//this.engine.speed;

	this.damage = function (amount) {
		this.health = Math.max(0, this.health - amount);
	};

	this.heal = function (amount) {
		this.health = this.visibleHealth = Math.min(this.maxHealth, this.health + amount);
	};

	this.isDead = function () {
		return this.health <= 0;
	};

	this.updateVisibles = function () {
		var hDiff = this.maxHealth - this.health;
		this.visibleHealth = Math.max(this.health, this.visibleHealth - (hDiff / Game.FPS));
		var eDiff = this.maxEnergy - this.energy;
		this.visibleEnergy = Math.max(this.energy, this.visibleEnergy - (eDiff / Game.FPS));
	};

	this.consumeEnergy = function (amount) {
		if (this.energy > amount) {
			this.energy -= amount;
		} else {
			this.damage(amount - this.energy);
			this.energy = 0;
		}
	};

	this.getWeaponDamage = function (weapon) {
		return weapon.damage + Math.random() * weapon.variance;
	};

	//this.maxHealth = _calcMaxHealth();
};