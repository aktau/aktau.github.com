/**
 * Cube.js - crazy cubes for RaphaelJS (inspired by Paper.js tutorials and SeuratJS plugin)
 *
 * Copyright 2012, Nicolas Hillegeer
 * http://aktau.be/
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
define(["raphael", "colors", "paths"], function (Raphael, colors, SVG) {
	"use strict";

	Raphael.fn.hexagon = function(radius) {
		return this.path(SVG.hexagon(radius));
	};

	// cube is actually based on a hexagon, returns 3 faces.
	Raphael.fn.cube = function(length) {
		var facePaths = SVG.cube(length, 90),
		faces = [],
		container = {};

		// initialize the cubeColor function on the paper if it doesn't exist yet
		this.customAttributes.cubeColor = this.customAttributes.cubeColor || function(colour) {
			// verify that the object is a set and the parts belong to a cube
			// this. Otherwise just set the given color.
			var type = this.data("type"),
				position = this.data("position"),
				hex = Raphael.color(colour).hex;

			if (type != "cube" || position == "left") {
				return { "fill": hex };
			}
			else if (position == "top") {
				return { "fill": colors.brighten(hex, 50) };
			}
			else {
				return { "fill": colors.darken(hex, 50) };
			}
		};

		// very very naughty... force Raphael to see the cubeColor as... a color
		Raphael._availableAnimAttrs.cubeColor = "colour";

		for (var i = 0; i < facePaths.length; i++) {
			faces.push(
				this.path(facePaths[i])
					.data("type", "cube")
					.data("position", (i === 0) ? "left" : (i == 1) ? "top" : "right")
			);
		}

		container.faces = faces;
		container.cube = this.set().push(faces[0], faces[1], faces[2]);

		return container;
	};
});