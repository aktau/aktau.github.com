/**
 * design.controllers.js
 */
define(["design.core", "design.common", "jquery", "datgui"], function(CORE, _, $, GUI) {
	"use strict";

	var gui = new GUI();

	CORE.registerController("colorNormal", "color", function(type, object, attribute, options) {
		console.log("[colorNormal] creating...", type, object, attribute, options);

		var colorController = gui.addColor(object, attribute),
			attributeName = options.attributeName || "unknown";

		console.log("MOO: ", colorController, $(colorController.domElement).siblings("span.property-name"));

		$(colorController.domElement).siblings("span.property-name").text(attributeName);

		return colorController;
	});

	CORE.registerFactory(function(oldFactory) {
		return function(type, object, attribute, options) {
			var controller = null;

			switch (type) {
				case "color":
					console.log("[controllerFactory] color type");
					var controllers = _.filter(CORE.controllers, function() { return this.type == "color"; });

					console.log("BEFORE: ", CORE.controllers, ", AFTER: ", controllers);

					var selected = _.first(controllers);

					console.log("SELECTED: ", selected);

					if (selected !== null) {
						controller = selected.constructor(type, object, attribute, options);
					}
				break;

				default:
					console.log("[controllerFactory] did not recognize " + type);

					if (oldFactory) {
						controller = oldFactory(type, object, attribute, options);
					}
			}

			return controller;
		};
	});

	console.log("[design/controllers]: loaded");
});