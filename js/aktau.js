/**
 * aktau.js
 */
define(["raphael", "cube", "colors", "design"], function(Raphael, cubes, color) {
	"use strict";

	var r = Raphael("background", "100%", "100%"),
		w = window;

	function init() {
		// the mist
		w.console.log("Starting up...");
		w.console.log(r);

		setupCubes(r);

		// window.r = r;

		// backgroundElem = $("#background");
	}

	function setupCubes(r) {
		var radius = 50,
			startx = 0,
			starty = 0,
			xstep = radius * Math.sqrt(3),
			ystep = radius * (1.5), // radius
			xsteps = 14,
			ysteps = 8,
			alternate = 0,
			cubes = [];

		for (var i = 0; i <= ysteps; ++i) {
			var dy = starty + i * ystep;

			for (var j = 0; j <= xsteps; ++j) {
				var dx = startx + j * xstep,
					c = r.cube(50);

				// w.console.log("going for it...");
				// w.console.log(c);
				c.cube.attr({"transform": "T" + dx + "," + dy, "fill": ((i + j) % 2 === 0) ? "red" : "orange"});
				c.faces[0].attr({"fill": color.darken(color.palette[color.colorNames()[1]], 25)});
				c.faces[1].attr({"fill": color.brighten(color.palette[color.colorNames()[1]], 25)});

				cubes.push(c);
			}

			startx += ((++alternate % 2 === 0) ? 1 : -1) * (xstep / 2);
		}

		return cubes;
	}

	return {
		init: init
	};
});