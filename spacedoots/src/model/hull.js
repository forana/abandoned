var Scales = {
	VERY_SMALL: 1,
	SMALL: 2,
	MEDIUM: 3,
	LARGE: 4,
	VERY_LARGE: 6
};

var BASE = {
	name: "TODO name",
	description: "TODO description",
	image: "resources/test.png",

	allowedWeapons: 0,
	allowedEquips: 0,

	scale: Scales.MEDIUM,

	value: 999999
};

Hulls = _.clone(ModelBase);

Hulls.SHUTTLE = _.defaults({
	id: "shuttle",
	name: "Shuttle",
	description: "The most common and cheapest hull around. Small and simple, but it gets the job done.",
	image: "resources/images/ships/shuttle.png",
	scale: Scales.SMALL,
	allowedWeapons: 2
}, BASE);
