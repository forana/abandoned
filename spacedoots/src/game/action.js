Action = function(device, user, target, audioCache, imageCache) {
	this.device = device;
	this.user = user;
	this.target = target;
	this.audioCache = audioCache;
	this.imageCache = imageCache;

	this.animation = new this.device.animation();

	this.costsProcessed = false;

	this.update = function() {
		if (!this.costsProcessed) {
			this.processCosts();
			this.costsProcessed = true;
		}
		this.animation.update(this);
	};

	this.processCosts = function() {
		this.user.consumeEnergy(device.energy);
		// todo handle inventory
	};

	this.isFinished = function() {
		return this.animation.isFinished();
	};

	this.render = function(context, userX, userY, targetX, targetY) {
		this.animation.render(context, userX, userY, targetX, targetY);
	};
};