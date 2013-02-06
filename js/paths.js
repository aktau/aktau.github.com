/**
 * paths.js
 *
 * module that can generate SVG paths
 */
define([], function() {
	"use strict";

	return {
		hexagon: function(radius) {
			var path = "",
			startAngle = 90,
			deg2rad = Math.PI / 180;

			for (var i = 0; i <= 6; ++i) {
				var degrees = startAngle + (i * 60),
				radians = degrees * deg2rad,
				x = radius * Math.cos(radians),
				y = radius * Math.sin(radians);

				path += (i === 0 ? "M" : "L") + x + "," + y;
			}

			path += "Z";

			return path;
		},

		// returns 3 SVG paths representing the faces of the cube
		// r.cube(50).forEach(function(e) { e.attr({"transform": "T100,100","fill": "red"}) })
		cube: function(length, startAngle) {
			var faces = [],
			faceIndex = 0,
			deg2rad = Math.PI / 180;

			if (startAngle === undefined) {
				startAngle = 90;
			}

			for (var i = 0; i < 3; ++i) {
				var face = "";

				for (var j = 0; j <= 2; ++j) {
					var degrees = startAngle + (((i * 2) + j) * 60),
						radians = degrees * deg2rad,
						x = length * Math.cos(radians),
						y = length * Math.sin(radians);

					face += (j === 0 ? "M" : "L") + x + "," + y;
				}

				// console.log("setting " + faceIndex);
				face += "L0,0";
				faces[faceIndex++] = face + "Z";
			}

			return faces;
		}
	};
});