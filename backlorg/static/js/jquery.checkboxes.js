/* jquery.checkboxes.js
   2013 Alex Foran

   Provides some stuff for messing with checkboxes.
 */

$.fn.extend({ 
	// Provides an easy way to deal with a group of checkboxes with an all/none master control.
	groupCheckboxes: function(allControlFilter) {
		var allControl = $(this).filter(allControlFilter).get(0);

		var self = this;
		var allNormalBoxes = [];

		$(this).each(function() {
			if (this != allControl) {
				allNormalBoxes.push(this);
			}
		});

		$(allControl).on("change", function() {
			var check = $(this).attr("checked") == "checked";
			$(allNormalBoxes).attr("checked",check);
		});

		$(allNormalBoxes).on("change", function() {
			if ($(this).attr("checked") != "checked") {
				$(allControl).attr("checked", false);
			}
		});

		return $(this);
	},

	getCheckedValues: function() {
		var res = [];

		$(this).each(function() {
			if (this.checked) {
				res.push(this.value);
			}
		});

		return res;
	}
});
