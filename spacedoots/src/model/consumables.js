var BASE = {
	id: "NaN",
	name: "Unnamed Item",
	decription: "",
	image: "resources/test.png",
	value: 999999,
	stack: 1
};

Consumables = _.clone(ModelBase);

Consumables.TORPEDO = _.defaults({
	id: "torpedo",
	name: "Standard Torpedo",
	description: "A normal torpedo. Nothing special.",
	value: 10,
	stack: 10
}, BASE);

Consumables.NUCLEAR_TORPEDO = _.defaults({
	id: "torpedo-nuclear",
	name: "Nuclear Torpedo",
	description: "A torpedo with a nuclear warhead. Large explosion, lots of damage.",
	value: 200,
	stack: 10
}, BASE);

Consumables.ANTIMATTER_TORPEDO = _.defaults({
	id: "torpedo-antimatter",
	name: "Antimatter Torpedo",
	description: "Torpedo containing an antimatter gas. Literally annihilates enemy ships.",
	value: 2000,
	stack: 10
}, BASE);

Consumables.PLASMA_PACK = _.defaults({
	id: "plasma-ammo",
	name: "Plasma Pack",
	description: "A single plasma unit capsule, containing the material to fire for a small plasma shot.",
	value: 2,
	stack: 500
}, BASE);

Consumables.PARADOX_PELLET = _.defaults({
	id: "paradox-pellet",
	name: "Paradox Origin",
	description: "A single point from which the impossible may flow.",
	value: 80000,
	stack: 10
}, BASE);

Consumables.DILITHIUM_INGOT = _.defaults({
	id: "dilithium",
	name: "Dilithium Ingot",
	description: "A strange material.",
	value: 400
}, BASE);

Consumables.DEFUNCT_PROBE = _.defaults({
	id: "probe",
	name: "Defunct Probe",
	description: "A space probe from centuries ago. Sell it for parts.",
	value: 200
}, BASE);
