Sectors = {
	get: function(index) {
		while (UserData.sectors.length <= index) {
			var sector = {};
			sector.name = Darmok.genString(NameBanks.STARS, 3, 16);
			sector.stars = [];
			for (var i = 0; i < UserData.sectors.length+1; i++) {
				var star = {
					name: Darmok.genString(NameBanks.STARS, 3, 32),
					darkness: Math.floor(Math.random()*8),
					red: Math.floor(Math.random()*10)
				}
				sector.stars.push(star);
			}
			UserData.sectors.push(sector);
		}
		return UserData.sectors[index];
	}
};
