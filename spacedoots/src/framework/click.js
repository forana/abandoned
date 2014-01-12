ClickBase = {
	x: -1,
	y: -1,
	width: 0,
	height: 0,

	onclick: null,
	enabled: true,
	tempDisabled: false,

	sound: Game.audioCache.get(Sounds.CLICK),

	setClick: function(clickfunc) {
		this.onclick = clickfunc;
		ClickRegister.register(this);
	},

	checkAndTriggerClick: function(x, y) {
		if (x >= this.x && x <= this.x + this.width &&
			y >= this.y && y <= this.y + this.height &&
			this.onclick != null &&
			this.enabled !== false && this.tempDisabled !== true) {
			if (UserData.settings[SettingKeys.ENABLE_HAPTIC] === true) {
				navigator.vibrate(5);
			}
			this.sound.play();
			this.onclick();
			return false;
		}
		return true;
	}
};

ClickRegister = {
	objects: [],

	init: function() {
		Game.canvas.addEventListener("mouseup", function(e) {
			var x = e.offsetX / window.fzoom;
			var y = e.offsetY / window.fzoom;
			ClickRegister.click(x, y);
		});
		Game.canvas.addEventListener("touchend", function(e) {
			ClickRegister.click(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		});
	},

	register: function(obj) {
		this.objects.push(obj);
	},

	unregister: function(obj) {
		for (var i=0; i<this.objects.length; i++) {
			if (this.objects[i] == obj) {
				this.objects.splice(i);
			}
		}
	},

	click: function (x, y) {
		_.each(this.objects, function(obj) {
			return obj.checkAndTriggerClick(x, y);
		});
	}
};