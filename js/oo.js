/**
 * oo.js - micro object orientation
 */
define([], function() {
	"use strict";

	return {
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
});