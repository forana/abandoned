var BASE = {
	id: NaN,
	name: "Unnamed",
	ammo: null,
	energy: 0,
	damage: 0,
	variance: 0,
	accuracy: 1,

	animation: function() {
		return _.clone(AnimationBase);
	},
	image: "resources/test.png"
};

Weapons = _.clone(ModelBase);

Weapons.LASER = _.defaults({
	id: "laser1",
	name: "Some Laser",
	damage: 8,
	energy: 5,
	variance: 3,
	animation: Animations.Laser(0.25)
}, BASE);

Weapons.TORPEDO = _.defaults({
	id: "torpedo1",
	name: "Torpedo",
	damage: 30,
	variance: 20,
	accuracy: 0.95,
	ammo: Consumables.TORPEDO
}, BASE);