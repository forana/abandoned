/*
2013 Alex Foran
TODO document / github / license
*/
$.fn.autoResizeTextarea = function(minheight) {
	if (this.length > 0) {
		var vPad = parseInt($(this).css("padding-top")) + parseInt($(this).css("padding-bottom"));
		var trueMinHeight = minheight || parseInt($(this).css("min-height")) || $(this).get(0).scrollHeight - vPad;

		var b = function() {
			this.scrollTop = 0;
			$(this).css("height", 1);
			$(this).css("height", Math.max(trueMinHeight, this.scrollHeight - vPad) + "px");
		};
		$(this).on("keydown", b);
		$(this).on("keyup", b);
		$(this).on("change", b);

		return $(this);
	}
};

$.fn.submitOnEnter = function() {
	$(this).on("keydown", function(e) {
		var forms = $(this).parents("form");
		if ((e.which == 10 || e.which == 13) && !e.shiftKey && forms.length > 0) {
			e.preventDefault();
			forms.submit();
		}
	});

	return $(this);
};
