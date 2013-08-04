/**
 * design.js
 *
 * A designer aid, paste this in your page to be able to cycle through some important css properties.gives a developer lots of control
 *
 * Inspiration for module system: http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
 *
 * All css properties: http://stackoverflow.com/questions/1471118/how-can-i-get-list-of-all-element-css-attributes-with-jquery
 *
 * planned features:
 * - use colour palettes
 * - nice selectors
 * - should autoload on load
 * - be more flexible than just jQuery
 * - possible add submodules to main object (window in the case of browsers)
 *		-> decoupling jQuery and Sizzle: http://stackoverflow.com/questions/3952817/decoupling-jquery-sizzle
 * - lazy eval selectors
 * - find some way to indicate that the current element is selected (maybe by blinking a border)
 * - animate between values of modifiers and be able to pause/start with space-bar
 * - fix the "current" element, sometimes the selector is not really a selector
 */

/**
 * connect an element with some "modifiers".
 *
 * Arrggh, why do I keep getting better ideas? [selector, properties, modifiers]
 *
 * Example: job.span	-> [color] -> [palette]
 *			h1			-> [background-color, font-familiy, line-height] -> [palette, font, number]
 *			ul li a		-> [color, background-color] -> [color, random-color]
 */

define(
	"jQuery",
	function($) {

	}
)

var util = util || {
	inherit: function(proto) {
		function F() {}
		F.prototype = proto;
		return new F();
	},

	extend: function(child, parent) {
		child.prototype = this.inherit(parent.prototype);
		child.prototype.constructor = child;
		child.parent = parent.prototype;
	}
};

function OrdinalModifier() {
	this.values = [];
	this.value = null;
	this.index = 0;
}

OrdinalModifier.prototype.next = function() {
	console.log("OrdinalModifier.next(): ", this.index, this.values, this.value);

	this.index = (this.index + 1) % this.values.length;
	this.value = this.values[this.index];

	return this.value;
};

OrdinalModifier.prototype.previous = function() {
	this.index = Math.abs(this.index - 1) % this.values.length;
	this.value = this.values[this.index];

	return this.value;
};

function PaletteModifier(palette) {
	// call parent constructor
	OrdinalModifier.apply(this);

	this.palette = null;

	var palettes = PaletteModifier.palettes;

	console.log("PaletteModifier: start", palette, this.palette, palettes);

	if (palette && palette in palettes) {
		// find and assign the requested palette
		this.palette = palettes[palette];

		console("PaletteModifier: assigning with requested palette", palette, this.palette);
	}
	else {
		// assign the first palette that's found
		for (var paletteName in palettes) {
			console.log("loop: ", paletteName);

			if (palettes.hasOwnProperty(paletteName)) {
				console.log("yea");
				this.palette = palettes[paletteName];
				break;
			}
		}

		console.log("PaletteModifier: assigning with default palette", this.palette);
	}

	// assign palette's colours as values
	this.values = [];

	for (var colorName in this.palette) {
		if (this.palette.hasOwnProperty(colorName)) {
			this.values.push(this.palette[colorName]);
		}
	}

	console.log("PaletteModifier: done", this.values, this.palette);
}

// add palettes in the form {paletteName: palette}
PaletteModifier.palettes = {};

PaletteModifier.prototype = util.inherit(OrdinalModifier.prototype);

/**
 * A modifier is an object that has the following properties:
 *
 * - type: ordinal or numeric
 * - if any:
 *		- value()
 * - if ordinal:
 *		- next()/previous() (auto-wrap)
 * - if integer or float:
 *		- defaultStep (just a recommendation)
 *		- range (hard limits)
 *
 * A modifier needs to be creatable by using new Modifier
 */

/**
 * Nice to have use-cases:
 *
 * design.current
 * design.register("span.job") // will couple all available properties with default modifiers
 * design.register("div", [palette]) // will couple only the palette modifier
 * design.registerMore("span.job") // add extra elements to be styled
 * design.live("#background")
 *		-> edit height, width, font, line-height, color, background-color, ...
 * modifier functions define: next(), previous(), current(), reset(), wrap(<true|false>)
 */
var design = (function($) {
	console.log("Welcome to design.js");
	console.log("--------------------");
	console.log("Usage:");
	console.log("Before being able to work with design.js, you need to select element(s) to work with. You can do this with some hotkeys:");
	console.log("	- ctrl+click:		selects only the element being pointed at");
	console.log("	- ctrl+t+click:		selects all elements with the same TAG as the selected element");
	console.log("	- ctrl+l+click:		selects all elements with the same TAG as the selected element that have the same parent (the 'l' stands for local)");
	console.log("	- ctrl+c+click:		selects all elements with the same CLASS as the selected element");

	// d is the design.js object
	var d = {};

	d.elements = [];

	// feel free to add your own modifiers
	d.modifiers = {
		palette: PaletteModifier
	};

	// all modifiable properties and their default modifier
	d.properties = {
		"color": "palette",
		"background-color": "palette"
	};

	/**
	 *
	 * selector: f.ex: "div.myForeground"
	 *
	 * properties: f.ex: {
	 *		"line-height": "default",
	 *		"background-color": "palette"
	 * }
	 */
	d.register = function(selector, properties) {
		// console.log("d.register called");

		d.elements.length = 0;

		return d.registerMore(selector, properties);
	};

	d.registerMore = function(selector, properties) {
		// console.log("d.registerMore called");

		properties = properties || d.properties;

		var augmentedProperties = clone(properties);

		// replace all string descriptions of modifiers with instantiations
		for (var key in augmentedProperties) {
			var value = augmentedProperties[key];

			if (isString(value)) {
				if (value in d.modifiers) {
					console.log("registerMore: value is in modifiers, instantiating...", value, d.modifiers);

					augmentedProperties[key] = new d.modifiers[value]();
				}
			}
			else {
				console.log("registerMore: value is not a string, keeping and hoping for the best...");
			}
		}

		var o = {
			selector: selector,
			properties: augmentedProperties,
			nodes: $(selector)
		};

		d.elements.push(o);

		d.current = o;

		var gui = new dat.GUI();

		for (var modifierName in o.properties) {
			console.log("WUT?", o.properties, modifierName, o.properties[modifierName]);

			var modifier = o.properties[modifierName];

			(function (curr, cssProperty, modifier) {
				gui.add(modifier, "value", modifier.values).onChange(function() {
					console.log("YAY", curr, modifierName, modifier.value);
					$(curr.selector).css(cssProperty, modifier.value);
				});
			})(o, modifierName, modifier);
		}

		return o;
	};

	d.unregister = function(selector) {
		// stub
	};

	function clone(obj) {
		var c = {};

		// we are not cloning the objects because we assume they are single use anyway
		for (var i in obj) {
			c[i] = obj[i];
		}

		return c;
	}

	// from underscore.js
	function isString(obj) {
		return toString.call(obj) == '[object String]';
	}

	var interaction = (function(d, settings) {
		settings = settings || {};

		var o = {},
			elements = [],
			dataKey = "designjs.oldborder",
			listenKeys = {};

		// var tagSelectKey = settings.tagSelectKey || '84', // default key is 't'
		// 	localSelectKey = settings.localSelectKey || '76', // default key is 'l'
		// 	classSelectKey = settings.classSelectKey || '67';

		listenKeys[settings.localSelectKey || '76'] = {"purpose": "local"};
		// listenKeys[settings.tagSelectKey || '84'] = {"purpose": "tag"};
		listenKeys[settings.tagSelectKey || '1'] = {"purpose": "tag"};
		listenKeys[settings.classSelectKey || '3'] = {"purpose": "class"};
		// listenKeys[settings.classSelectKey || '67'] = {"purpose": "class"};

		o.onKeyDown = function(e) {
			if (e.which in listenKeys) {
				listenKeys[e.which].status = "active";
			}
		};

		o.onKeyUp = function(e) {
			if (e.which in listenKeys) {
				listenKeys[e.which].status = "inactive";
			}
		};

		o.onClick = function(e) {
			console.log("click: ", e.which);

			e.preventDefault();

			if (e.which in listenKeys) {
				listenKeys[e.which].status = "active";
			}

			// which one to select?
			var el = $(e.target),
				selector = el,
				isLocal = false,
				selectTag = false,
				selectClass = false;

			// check modifiers
			for (var keyCode in listenKeys) {
				var key = listenKeys[keyCode];

				if (key.status == "active") {
					switch (key.purpose) {
						case "local": isLocal = true; break;
						case "tag": selectTag = true; break;
						case "class": selectClass = true; break;
					}
				}
			}

			var parent = isLocal ? el.parent() : document;

			if (selectTag) {
				selector = el.prop("tagName").toLowerCase();
			}
			else if (selectClass) {
				selector = el.prop("class").toLowerCase();
			}
			else {
				selector = el;
			}

			console.log("-------> ", selector, parent, selectTag, selectClass, isLocal, listenKeys);

			var result = d.register($(selector, parent));

			if (e.which in listenKeys) {
				listenKeys[e.which].status = "inactive";
			}

			console.log("Elements ", result, "selected!");

			return false;
		};

		o.onEnter = function(e) {
			// stop propagating the event so we only receive the event for the innermost element
			e.stopPropagation();

			var el = $(this);

			// console.log("new onEnter! event = ", e, " this = ", this);

			// entering an element always clear all other elements
			o.clear();

			// add the element to the array. Not a problem even if its already in there
			elements.push(el);

			// save the old border
			// console.log("	-> stored border: ", el.css("border"));
			el.data(dataKey, el.css("border"));

			// change to selected border
			el.css("border", "solid red 1px");
		};

		o.onLeave = function(e) {
			// stop propagating the event so we only receive the event for the innermost element
			e.stopPropagation();

			var el = $(this);

			// console.log("new onLeave! event = ", e, " this = ", this);

			// console.log("	-> restoring border: ", el.data(dataKey));
			el.css("border", el.data(dataKey));
			el.removeData(dataKey);

			// in the case that a child element is left, the parent will not be informed
			// that it was entered again (because technically the mouse never left, it just went inside of a child)
			// we fix this by manually calling a mouseenter on the entered element (parent = event.relatedTarget)
			// inform the related element. We pass in the same event object, obviously its type and other properties will be wrong
			// but their correctness is not necessary, only the "this" variable is important
			o.onEnter.call(e.relatedTarget, e);
		};

		o.clear = function() {
			for (var i = elements.length - 1; i >= 0; --i) {
				var el = elements[i];

				el.css("border", el.data(dataKey));
				el.removeData(dataKey);
			}

			elements.length = 0;
		};

		return o;
	})(d, {});

	// register keypresses
	$(document).keydown(function(e) {
		console.log("keydown: " + e.which);

		if (e.which == 67 || e.which == 66) { // "c" and "b"
			var property = (e.which == 67) ? "color" : (e.which == 66) ? "background-color" : "color";
			var nextVal = d.current.properties[property].next();

			console.log("-> ", d.current.selector, $(d.current.selector), nextVal);

			$(d.current.selector).css(property, nextVal);
		}
		else if (e.which == 91) {
			$("body *")
				.on("mouseenter.designjs", interaction.onEnter)
				.on("mouseleave.designjs", interaction.onLeave);

			$(document)
				.on("click.designjs", interaction.onClick)
				.on("keydown.designjs", interaction.onKeyDown)
				.on("keyup.designjs", interaction.onKeyUp);
		}

		// globalCubes.forEach(function(container) {
		//	container.cube.animate({"cubeColor": nextPaletteColor() }, 1000);
		// });
	});

	$(document).keyup(function(e) {
		console.log("keyup: " + e.which);

		switch (e.which) {
			// user releases "ctrl" (cmd on mac)
			case 91:
				$("body *").off("mouseenter.designjs mouseleave.designjs");

				$(document)
					.off("click.designjs")
					.off("keydown.designjs")
					.off("keyup.designjs");

				// clear all stragglers...
				interaction.clear();
			break;
		}
	});

	return d;
})(jQuery);

/**
 * Palette module - palette modifier and management
 *
 * design.palette.current: the current palette
 * design.palette.list()
 * design.palette.add(palette, [name]) (palette is an object which only contains the names and the hex values of the colors)
 * design.palette.cycle() (all colors + 1)
 */
var design = (function(d) {
	// define submodule
	var p = d.palette = d.palette || {};

	//Palette.prototype.

	// add palette modifier to modifiers array
	//d.modifiers.push(Palette);

	//var palettes = [];

	//p.current = [];

	return d;
})(design);
