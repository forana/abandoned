var AudioWrapper = function(path) {
	this.element = document.createElement("audio");
	this.element.src = path;
	this.element.load();

	this.play = function() {
		if (UserData.settings[SettingKeys.GLOBAL_MUTE] !== true) {
			var clone = this.element.cloneNode();
			clone.addEventListener("ended", function() {
				delete clone.src;
			});
			clone.play();
			if (navigator.isCocoonJS) {
				clone.src = this.element.src;
			}
		}
	};

	this.unload = function() {
		delete this.element.src;
	};
};

AudioCache = function() {
	this.cache = {};

	this.get = function(path) {
		if (!(this.cache[path])) {
			this.cache[path] = new AudioWrapper(path);
		}
		return this.cache[path];
	};

	this.clear = function() {
		_.each(this.cache, function(wrapper) {
			wrapper.unload();
		});
	};
}