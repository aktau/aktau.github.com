/**
 * design.selection.js
 */
define(["design.core", "jquery"], function(CORE, $) {
	"use strict";

	var interaction = {},
		elements = [],
		dataKey = "designjs.oldborder",
		listenKeys = {};

	listenKeys["76"] = {"purpose": "local"};
	listenKeys["1"] = {"purpose": "tag"};
	listenKeys["3"] = {"purpose": "class"};

	interaction.onKeyDown = function(e) {
		if (e.which in listenKeys) {
			listenKeys[e.which].status = "active";
		}
	};

	interaction.onKeyUp = function(e) {
		if (e.which in listenKeys) {
			listenKeys[e.which].status = "inactive";
		}
	};

	interaction.onClick = function(e) {
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

		var result = CORE.select(selector);

		// var result = d.register($(selector, parent));

		if (e.which in listenKeys) {
			listenKeys[e.which].status = "inactive";
		}

		console.log("Elements ", result, "selected!");

		return false;
	};

	interaction.onEnter = function(e) {
		// stop propagating the event so we only receive the event for the innermost element
		e.stopPropagation();

		var el = $(this);

		// console.log("new onEnter! event = ", e, " this = ", this);

		// entering an element always clear all other elements
		interaction.clear();

		// add the element to the array. Not a problem even if its already in there
		elements.push(el);

		// save the old border
		// console.log("	-> stored border: ", el.css("border"));
		el.data(dataKey, el.css("border"));

		// change to selected border
		el.css("border", "solid red 1px");
	};

	interaction.onLeave = function(e) {
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
		interaction.onEnter.call(e.relatedTarget, e);
	};

	interaction.clear = function() {
		for (var i = elements.length - 1; i >= 0; --i) {
			var el = elements[i];

			el.css("border", el.data(dataKey));
			el.removeData(dataKey);
		}

		elements.length = 0;
	};

	// register keypresses
	$(document).keydown(function(e) {
		console.log("keydown: " + e.which);

		if (e.which == 67 || e.which == 66) { // "c" and "b"
			var property = (e.which == 67) ? "color" : (e.which == 66) ? "background-color" : "color";
			//var nextVal = d.current.properties[property].next();

			//console.log("-> ", d.current.selector, $(d.current.selector), nextVal);

			//$(d.current.selector).css(property, nextVal);
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
});