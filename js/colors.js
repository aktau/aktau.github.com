/**
 * colors.js
 *
 * ideas: maybe you could do something with the color thief: http://lokeshdhakar.com/projects/color-thief/
 */
define([], function() {
	"use strict";

	var solarized = {
		"background":	"#002b36",
		"background2":	"#073642",
		"base01":		"#586e75",
		"base00":		"#657b83",
		"base0":		"#839496",
		"base1":		"#93a1a1",
		"base2":		"#eee8d5",
		"base3":		"#fdf6e3",
		"yellow":		"#b58900",
		"orange":		"#cb4b16",
		"red":			"#dc322f",
		"magenta":		"#d33682",
		"violet":		"#6c71c4",
		"blue":			"#268bd2",
		"cyan":			"#2aa198",
		"green":		"#859900"
	};

	var zenburn = {
		"background":	"#000010",
		"foreground":	"#ffffff",
		"color0":		"#000000",
		"color1":		"#9e1828",
		"color2":		"#aece92",
		"color3":		"#968a38",
		"color4":		"#414171",
		"color5":		"#963c59",
		"color6":		"#418179",
		"color7":		"#bebebe",
		"color8":		"#666666",
		"color9":		"#cf6171",
		"color10":		"#c5f779",
		"color11":		"#fff796",
		"color12":		"#4186be",
		"color13":		"#cf9ebe",
		"color14":		"#71bebe",
		"color15":		"#ffffff"
	};

	function brighten(hex, percent){
		// strip the leading # if it's there
		hex = hex.replace(/^\s*#|\s*$/g, '');

		// convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
		if(hex.length == 3){
			hex = hex.replace(/(.)/g, '$1$1');
		}

		var r = parseInt(hex.substr(0, 2), 16),
			g = parseInt(hex.substr(2, 2), 16),
			b = parseInt(hex.substr(4, 2), 16);

		return '#' +
			((0|(1<<8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
			((0|(1<<8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
			((0|(1<<8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
	}

	function darken(hex, percent) {
		// strip the leading # if it's there
		hex = hex.replace(/^\s*#|\s*$/g, '');

		// convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
		if(hex.length == 3){
			hex = hex.replace(/(.)/g, '$1$1');
		}

		var r = parseInt(hex.substr(0, 2), 16),
			g = parseInt(hex.substr(2, 2), 16),
			b = parseInt(hex.substr(4, 2), 16);

		return '#' +
			((0|(1<<8) + r * (100 - percent) / 100).toString(16)).substr(1) +
			((0|(1<<8) + g * (100 - percent) / 100).toString(16)).substr(1) +
			((0|(1<<8) + b * (100 - percent) / 100).toString(16)).substr(1);
	}

	function colorNames(palette) {
		var result = [];

		palette = palette || module.palette;

		for (var colorName in module.palette) {
			if (palette.hasOwnProperty(colorName)) {
				result.push(colorName);
			}
		}

		return result;
	}

	var module = {
		brighten: brighten,
		darken: darken,
		colorNames: colorNames,
		palettes: [solarized, zenburn],
		palette: solarized
	};

	return module;
});