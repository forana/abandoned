ModelBase = {
	fromId: function(id) {
		var ret = null;
		_.each(this, function (obj) {
			if (typeof(obj) != "function" && obj.id == id) {
				ret = _.clone(obj);
				return false;
			}
		});
		return ret;
	}
};
