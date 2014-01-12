/* jquery.templater
 * 2013 Alex Foran
 *
 * [%normal tag%]
 * [=subtemplate call=]
 */

$.Templater = {
	repl_prefix: "[%",
	repl_suffix: "%]",
	subtemp_prefix: "[=",
	template_name_sep: ":",
	subtemp_suffix: "=]",

	templates: {},

	makeReplaceKey: function(str) {
		return this.repl_prefix + str + this.repl_suffix;
	},

	// returns a template filled in with specified values
	// name - the template's name
	// keys - the values to fill in
	render: function (name, keys) {
		if (!(name in this.templates)) {
			throw "Template '"+name+"' not found";
		}
		var template = this.templates[name];
		var workingCopy = template;

		if (keys) {
			for (var key in keys) {
				if (keys.hasOwnProperty(key)) {
					var replacement = keys[key];

					// simple replaces
					workingCopy = workingCopy.split(this.makeReplaceKey(key)).join(keys[key]);


					// subtemplate calls
					var subSplitKey = this.subtemp_prefix + key + this.template_name_sep;
					var subBuffer = workingCopy;
					workingCopy = "";
					var currentIndex;

					// keep looping until we find no more instances
					while ((currentIndex = subBuffer.indexOf(subSplitKey)) >= 0) {
						// cut out the template name and transfer the string where we found this to the working string
						// (I am so sorry)
						workingCopy += subBuffer.slice(0, currentIndex);
						subBuffer = subBuffer.slice(currentIndex + subSplitKey.length);
						var endIndex = subBuffer.indexOf(this.subtemp_suffix);
						var templateName = subBuffer.slice(0, endIndex);

						// call the template we found for the matched variable
						// if the variable is an array, call the template (and append it) for each item
						var subtemplate;
						if (replacement instanceof Array) {
							var results = [];
							for (var i = 0; i<replacement.length; i++) {
								results.push(this.render(templateName, replacement[i]));
							}
							subtemplate = results.join("");
						} else {
							subtemplate = this.render(templateName, replacement);
						}

						workingCopy += subtemplate;

						// cut off that end slice
						subBuffer = subBuffer.slice(endIndex + this.subtemp_suffix.length);
					}

					// whatever's left, render that, too
					workingCopy += subBuffer;
				}
			}
		}

		return workingCopy;
	},

	// load a single template
	// - name: the name by which it will be stored and called
	// - str: the template string
	load: function (name, str) {
		this.templates[name] = str;
	}
};

$.fn.extend({
	// load each matched item as a template, using the name attribute as the template name
	loadTemplates: function() {
		$(this).each(function() {
			var child = $(this);
			$.Templater.load(child.attr("name"), child.html());
		});
	},

	// render a template into the first element matched by the selector
	// - template: the name of the template to call
	// - values: the values to populate the template
	renderTemplate: function(template, values) {
		$(this).html($.Templater.render(template, values));
	},
});