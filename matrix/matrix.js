Matrix = function(backcanvas, forecanvas) {
	var backFPSCap = 20;
	var backFPSInc = 1000 / backFPSCap;
	var backTargetTime = 0;
	var foreNeedsDrawing = true;

	var sizeCanvases = function() {
		var width = document.body.clientWidth;
		var height = document.body.clientHeight;
		forecanvas.width = width;
		backcanvas.width = width;
		forecanvas.height = height;
		backcanvas.height = height;
	};
	sizeCanvases();
	window.addEventListener("resize", function() {
		sizeCanvases();
		foreNeedsDrawing = true;
	});

	var letterImage = new Image();
	letterImage.src = "hex.png";
	letterImage.addEventListener("load", function() {
		foreNeedsDrawing = true;
	});
	var backctx = backcanvas.getContext("2d");
	var forectx = forecanvas.getContext("2d");

	var charCount = 16;
	var charWidth = 6;
	var charHeight = 10;

	var row = 0;

	var trailLength = 20;
	var makeTrailColor = function(trailDist) {
		return "rgba(0, 255, 0, " + (1.0 - trailDist/trailLength) + ")";
	};

	(function matrixLoop() {
		window.requestAnimationFrame(matrixLoop);

		var time = new Date().getTime();

		if (foreNeedsDrawing) {
			forectx.clearRect(0, 0, forecanvas.width, forecanvas.height)

			for (var x = 0; x < forecanvas.width; x += charWidth) {
				for (var y = 0; y < forecanvas.height; y+= charHeight) {
					var index = Math.floor(Math.random() * charCount);
					forectx.drawImage(letterImage, index * charWidth, 0, charWidth, charHeight,
							x, y, charWidth, charHeight);
				}
			}

			foreNeedsDrawing = false;
		}

		if (time >= backTargetTime) {
			backctx.fillStyle = "#009966";
			backctx.fillRect(0, 0, backcanvas.width, backcanvas.height);

			var y = Math.floor(backcanvas.height * row / charHeight) * charHeight;
			for (var i=0; i<trailLength; i++) {
				backctx.fillStyle = makeTrailColor(i);
				backctx.fillRect(0, y - charHeight * i, backcanvas.width, charHeight);
			}

			var step = charHeight / backcanvas.height;
			row += step;
			if (row >= 1) {
				row = 0;
			}

			backTargetTime = time + backFPSInc;
		}
	})();
};

