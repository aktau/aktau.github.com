/**
 * design.core.js
 *
 * requires Chrome, Firefox, IE9+ or better
 */

/**
 * the object
 *
 * collection ->
 *  selector: String
 *  set: Function(String, Object)
 *  get: Function(String)
 *  onChange(fn: Function): Function
 *  css-property: {get value() {}, set value(v) { $elem.css(ccs-property, v) }, controller: Object}
 *  css-property2: ...
 *
 * controller ->
 *  type: String
 *  setup: Function(cssModifier: Function)
 *  createKeyBindings: Function
 *  createGui: Function
 *  destroy: Function
 */
define(["design.common"], function(_) {
	"use strict";

	console.log("Welcome to design.js");
	console.log("--------------------");
	console.log("Usage:");
	console.log("Before being able to work with design.js, you need to select element(s) to work with. You can do this with some hotkeys:");
	console.log("	- ctrl+click:		selects only the element being pointed at");
	console.log("	- ctrl+t+click:		selects all elements with the same TAG as the selected element");
	console.log("	- ctrl+l+click:		selects all elements with the same TAG as the selected element that have the same parent (the 'l' stands for local)");
	console.log("	- ctrl+c+click:		selects all elements with the same CLASS as the selected element");

	var Core = function() {
		this.controllers = {};

		this.factory = null;
	};

	Core.prototype.registerController = function(name, type, constructor) {
		if (name in this.controllers) {
			console.log("[registerController] -> " + name + " already exists, replacing...");
		}
		else {
			console.log("[registerController] -> " + name + " did not exist, adding to controllers...");
		}

		this.controllers[name] = {
			constructor: constructor,
			type: type
		};
	};

	Core.prototype.registerFactory = function(newFactory) {
		this.factory = newFactory(this.factory);
	};

	Core.prototype.select = function(selector, options) {
		// TODO: perform destroy routine on this.current first if it exists

		if (this.current) {
			_.each(this.current, function() {
				console.log("LOOP: ", this, this.remove);

				if (this.controller && this.controller.remove) {
					this.controller.remove();
				}
			});

			delete this.current;
		}


		this.current = {
			selector: selector
		};

		options = options || {};

		// add a getter/setter + controller for every property we know
		for (var property in this.properties) {
			var attributes = this.properties[property];

			console.log("[select] -> creating an instance for css property ", property, " (attributes: ", attributes, ")");

			this.current[property] = {
				parent: this.current,
				property: property,
				get value() { return $(this.parent.selector).css(this.property); },
				set value(val) { $(this.parent.selector).css(this.property, val); }
			};

			options.attributeName = property;

			var controller = this.factory(attributes.type, this.current[property], "value", options);

			this.current[property].controller = controller;
		}

		window.current = this.current;

		return this.current;
	};

	/**
	 * types of properties:
	 *
	 * number
	 * percent
	 * measure (em/px/pt/...)
	 * fonts
	 * color
	 */
	Core.prototype.properties = {
		"color": {
			type: "color"
		},
		"background-color": {
			type: "color"
		},
		"font-family": {
			type: "font"
		},
		"line-height": {
			type: "measure"
		}
	};

	var CORE = new Core();

	return CORE;
});