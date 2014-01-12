Letters = {
	Count: {
		A: 9,
		B: 2,
		C: 2,
		D: 4,
		E: 12,
		F: 2,
		G: 3,
		H: 2,
		I: 8,
		J: 1,
		K: 1,
		L: 4,
		M: 2,
		N: 6,
		O: 8,
		P: 2,
		Qu: 1,
		R: 6,
		S: 4,
		T: 6,
		U: 3,
		V: 2,
		W: 2,
		X: 1,
		Y: 2,
		Z: 1
	},

	Score: {
		A: 1,
		B: 3,
		C: 3,
		D: 2,
		E: 1,
		F: 4,
		G: 2,
		H: 3,
		I: 1,
		J: 8,
		K: 5,
		L: 2,
		M: 3,
		N: 1,
		O: 1,
		P: 3,
		Qu: 6,
		R: 1,
		S: 1,
		T: 1,
		U: 2,
		V: 5,
		W: 4,
		X: 8,
		Y: 4,
		Z: 8
	},

	pickingArray: [],

	pick: function() {
		return this.pickingArray[Math.floor(Math.random() * this.pickingArray.length)];
	}
};

for (var letter in Letters.Count) {
	if (Letters.Count.hasOwnProperty(letter)) {
		var pair = [letter, Letters.Score[letter]];
		for (var i=0; i<Letters.Count[letter]; i++) {
			Letters.pickingArray.push(pair);
		}
	}
}
