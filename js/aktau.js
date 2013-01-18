var backgroundElem;

function linePath(x1, y1, x2, y2) { 
	return 'M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2; 
}

function smoothPath(obj1, obj2) {	
	var bb1 = obj1.getBBox(),
		bb2 = obj2.getBBox(),
		p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
		{x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
		{x: bb1.x - 1, y: bb1.y + bb1.height / 2},
		{x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
		{x: bb2.x + bb2.width / 2, y: bb2.y - 1},
		{x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
		{x: bb2.x - 1, y: bb2.y + bb2.height / 2},
		{x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
		d = {}, 
		dis = [],
		dx,
		dy;
		
	for (var i = 0; i < 4; ++i) {
		for (var j = 4; j < 8; ++j) {
			dx = Math.abs(p[i].x - p[j].x);
			dy = Math.abs(p[i].y - p[j].y);
			
			if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i !== 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
				dis.push(dx + dy);
				d[dis[dis.length - 1]] = [i, j];
			}
		}
	}

	var res = (dis.length === 0) ? [0, 4] : d[Math.min.apply(Math, dis)];
	
	var x1 = p[res[0]].x,
		y1 = p[res[0]].y,
		x4 = p[res[1]].x,
		y4 = p[res[1]].y;
	
	dx = Math.max(Math.abs(x1 - x4) / 2, 10);
	dy = Math.max(Math.abs(y1 - y4) / 2, 10);
	
	// note: toFixed(3) means that 3 numbers will be left after the decimal sign
	var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
		y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
		x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
		y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
		
	// draw a smooth path using curves, control points having been calculated before
	// the hiddenpath is a path that goes from/to the middles of the objects in question, so that an animateAlong can look nice
	var shortpath = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(","),
		longpath = ["M", p[0].x.toFixed(3), p[2].y.toFixed(3), "C", x2, y2, x3, y3, p[4].x.toFixed(3), p[6].y.toFixed(3)].join(",");
	
	return {'shortpath': shortpath, 'longpath': longpath};
}

function rangeRandom(a, b) {
	return Math.floor((Math.random() * (b - a)) + a);
}

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
function cube(length) {
	var faces = [],
		faceIndex = 0,
		startAngle = 90,
		deg2rad = Math.PI / 180;

	for (var i = 0; i < 3; ++i) {
		var face = "";

		for (var j = 0; j <= 2; ++j) {
			var degrees = startAngle + (((i * 2) + j) * 60),
				radians = degrees * deg2rad,
				x = length * Math.cos(radians),
				y = length * Math.sin(radians);

			console.log(degrees, radians, length);

			face += (j === 0 ? "M" : "L") + x + "," + y;
		}

		console.log("setting " + faceIndex);
		face += "L0,0";
		faces[faceIndex++] = face + "Z";
	}

	return faces;
}

Raphael.fn.hexagon = function(radius) {
	return this.path(hexagon(radius));
};

// cube is actually based on a hexagon, returns 3 faces.
Raphael.fn.cube = function(length) {
	var facePaths = cube(length),
		faces = [];

	for (var i = 0; i < facePaths.length; i++) {
		faces.push(this.path(facePaths[i]));
	}

	return faces;
};

Raphael.fn.randomPoint = function() {
	return {
		"x": rangeRandom(0, backgroundElem.width()),
		"y": rangeRandom(0, backgroundElem.height()) 
	};
};

Raphael.fn.randomCircle = function(x, y, r) {
	return this.circle(x, y, 1)
		.attr({"stroke-opacity": 1, stroke: "#FFF"})
		.animate({r: r, "stroke-width": 20}, 5000);	
};

Raphael.fn.manyCircles = function(n) {
	var circles = [];

	for (var i = 0; i < n; i++) {
		var rp = this.randomPoint();

		circles.push(r.randomCircle(rp.x, rp.y, 50));
	}

	return circles;
};

Raphael.fn.line = function(x1, y1, x2, y2, attr) { 
	return this.path(linePath(x1, y1, x2, y2)).attr(attr || {stroke: 'white'}); 
};

Raphael.fn.connection = function (obj1, obj2, attr) {
	var pathspec = smoothPath(obj1, obj2).shortpath;

	return this.path(pathspec).attr(attr);
};

// repeating animation - http://stackoverflow.com/questions/4138644/why-wont-my-raphael-js-animation-loop
/*
 * Raphael v. 1
 * var starSpin = function () {
 *     logoStar.attr({rotation: 0}).animate({rotation: 360}, 5000, starSpin);
 * }
 * 
 * Raphael v. 2
 * var spin = Raphael.animation({transform: "r360"}, 2500).repeat(Infinity);
 * myElement.animate(spin);
 */

// Raphael v. 2 animateAlong
/* https://github.com/brianblakely/raphael-animate-along */

// smoother curve - http://jsfiddle.net/gyeSf/17/

// clip images according to svg path: https://coderwall.com/p/blx8kw

window.onload = function () {
	console.log("Starting up...");

	var r = Raphael("background", "100%", "100%");
	window.r = r;

	backgroundElem = $("#background");

	var circles = [],
		i;

	for (i = 0; i < 30; ++i) {
		var rp = r.randomPoint();

		circles.push(r.randomCircle(rp.x, rp.y, 50));

		r.hexagon(60)
			.attr({"stroke-width": 10, "stroke": "white", "fill": "white"})
			.animate({"transform": "t" + rp.x + "," + rp.y}, 3000);
	}

	for (i = 0, len = circles.length; i < len; ++i) {
		var circle = circles[i];

		var cx = circle.attr("cx"),
			cy = circle.attr("cy");

		console.log("animating from " + circle.getBBox().x + " to "  + (circle.getBBox().x + 40));

		circle.animate({"cx": cx + 80, "cy": cy + 80}, 1000);				
	}

	var radius = 50,
		startx = 100,
		starty = 100,
		xstep = radius * Math.sqrt(3),
		ystep = radius * (1.5), // radius
		steps = 7,
		alternate = 0,
		cubes = []; 

	for (i = 0; i <= steps; ++i) {
		var dy = starty + i * ystep;

		for (j = 0; j <= steps; ++j) {
			var dx = startx + j * xstep,
				c = r.cube(50)
				.forEach(function(e) { e.attr({"transform": "T" + dx + "," + dy, "fill": "red"}) });

			cubes.push(c);
		}

		startx += ((++alternate % 2 === 0) ? 1 : -1) * (xstep / 2);
	}

	// animation = window.setInterval(animate, 10);
}