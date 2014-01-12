AnimationBase = {
	actionSet: {},

	currentStep: 0,

	isFinished: function() {
		return _.keys(this.actionSet).length == 0;
	},

	update: function(action) {
		this.currentStep++;
		var self = this;
		_.each(this.actionSet, function(fnList, threshold, list) {
			if (self.currentStep >= threshold) {
				if (typeof(fnList) == "function") {
					fnList(action);
				} else {
					_.each(fnList, function(fn) {
						fn(action);
					});
				}
				delete list[threshold];
			}
		});
	},

	render: function(context, userX, userY, targetX, targetY) {
		// override me
	},

	Functions: {
		executeDamage: function(action) {
			action.target.damage(action.user.getWeaponDamage(action.device));
		},
		end: function() {
			// dummy
		},
		playSound: function(path) {
			return function(action) {
				action.audioCache.get(path).play();
			}
		}
	}
};

Animations = {};
