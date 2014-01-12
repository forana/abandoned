Backlorg = {
	tags: [],
	items: [],

	bindGlobalEvents: function() {
		$("#link-login").on("click", this.showLogin);
		$("#link-logout").on("click", this.showLogout);
	},

	showLogout: function() {
		alert("TODO this");
	},

	showLogin: function() {
		alert("TODO this");
	},

	initModels: function(tags, items) {
		this.tags = tags;
		this.items = items;
	},

	showList: function(container, includedTags) {
		var toRender = [];
		$(this.items).each(function() {
			var found = false;
			$(this.tags).each(function() {
				if ($.inArray(this.id, includedTags) != -1) {
					found = true;
					return false;
				}
			});

			if (found) {
				toRender.push(this);
			}
		});

		if (toRender.length == 0) {
			if (this.items.length == 0) {
				container.renderTemplate("noItems");
			} else {
				container.renderTemplate("itemsFiltered");
			}
		} else {
			container.renderTemplate("itemList",{items: toRender});
		}
	}
};

$.on = function(event, callback) {
	$(Backlorg).on(event,callback);
}

$.trigger = function(event, payload) {
	$(Backlorg).trigger(event,payload);
}

$(document).on("ready",function() {
	Backlorg.bindGlobalEvents();
});