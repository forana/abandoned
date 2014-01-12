var BASE = {
	id: NaN,
	name: "Unnamed Engine",
	description: "",
	value: 100,
	image: "/resources/test.png",
	speed: 1,
	output: 100,
	volume: 1
};

Engines = _.clone(ModelBase);

Engines.SHUTTLE = _.defaults({
	id: "shuttle",
	name: "Shuttle Engine",
	description: "The standard engine transport shuttles use. Easy to find, cheap to replace.",
	value: 100,
	speed: 100,
	output: 100,
	volume: 2
});

Engines.LIFEBOAT = _.defaults({
	id: "lifeboat",
	name: "Lifeboat Engine",
	description: "An engine cannibalized from a capital ship's lifeboat. Small and fast, but not very strong.",
	value: 120,
	speed: 150,
	output: 50,
	volume: 1
});

Engines.SPEEDHAWK = _.defaults({
	id: "speedhawk",
	name: "Speedhawk Engine",
	description: "An engine scavenged from an old scout ship.",
	value: 600,
	speed: 180,
	output: 90,
	volume: 1
});

Engines.RESEARCH = _.defaults({
	id: "research",
	name: "Research Satellite Power Supply",
	description: "Lots of power, but not very fast.",
	value: 600,
	speed: 30,
	output: 150,
	volume: 1
});

Engines.HAMMERVOID = _.defaults({
	id: "hammervoid",
	name: "Hammervoid Cycler",
	description: "Experimental. No one knows what a \"Hammervoid\" is, but it makes a nifty engine.",
	value: 1400,
	speed: 120,
	output: 140,
	volume: 3
});
