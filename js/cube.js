/**
 * Cube.js - crazy cubes for RaphaelJS (inspired by Paper.js tutorials and SeuratJS plugin)
 *
 * Copyright 2012, Nicolas Hillegeer
 * http://aktau.be/
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
function hexagon(radius) {
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
}

// returns 3 SVG paths representing the faces of the cube
// r.cube(50).forEach(function(e) { e.attr({"transform": "T100,100","fill": "red"}) })
function cube(length, startAngle) {
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

		console.log("setting " + faceIndex);
		face += "L0,0";
		faces[faceIndex++] = face + "Z";
	}

	return faces;
}

function setupCubes(settings) {
	var radius = 50,
		startx = 500,
		starty = 200,
		xstep = radius * Math.sqrt(3),
		ystep = radius * (1.5), // radius
		steps = 6,
		alternate = 0,
		cubes = [];

	for (i = 0; i <= steps; ++i) {
		var dy = starty + i * ystep;

		for (j = 0; j <= steps; ++j) {
			var dx = startx + j * xstep,
			c = r.cube(50);

			console.log("going for it...");
			console.log(c);
			c.cube.attr({"transform": "T" + dx + "," + dy, "fill": ((i + j) % 2 === 0) ? "red" : "orange"});
			c.faces[0].attr({"fill": darken(palette[colorNames[1]], 25)});
			c.faces[1].attr({"fill": brighten(palette[colorNames[1]], 25)});

			cubes.push(c);
		}

		startx += ((++alternate % 2 === 0) ? 1 : -1) * (xstep / 2);
	}

	return cubes;
}

Raphael.fn.hexagon = function(radius) {
	return this.path(hexagon(radius));
};

// cube is actually based on a hexagon, returns 3 faces.
Raphael.fn.cube = function(length) {
	var facePaths = cube(length, 90),
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
			return { "fill": brighten(hex, 50) };
		}
		else {
			return { "fill": darken(hex, 50) };
		}
	};

	// very very naughty... force Raphael to see the cubeColor as, well, a color
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