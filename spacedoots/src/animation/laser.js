Animations.Laser = function(width) {
	return function() {
		_.extend(this, AnimationBase);

		this.actionSet = {
			5: [AnimationBase.Functions.executeDamage,
				AnimationBase.Functions.playSound("resources/sounds/laser1.mp3")],
			30: AnimationBase.Functions.end
		};

		var scaledWidth = width * Game.PPU;
		var color = "#0F0";

		this.render = function(context, userX, userY, targetX, targetY) {
			if (this.currentStep >= 5) {
				context.fillStyle = color;
				context.fillRotatedRect(ExtMath.average(userX, targetX), ExtMath.average(userY, targetY),
					ExtMath.distance(userX, userY, targetX, targetY), scaledWidth * (30 - this.currentStep) / 30,
					ExtMath.angleTo(userX, userY, targetX, targetY));
			}
		}
	};
};
