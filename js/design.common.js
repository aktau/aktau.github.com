/**
 * design.common.js
 */
define([], function() {
	return {
		filter: function(obj, pred) {
			var newObj = null,
				elem = null;

			if (obj.length === obj.length + 0) {
				newObj = [];

				for (var i = obj.length - 1; i >= 0; i--) {
					elem = obj[i];

					if (pred.call(elem, elem, i)) {
						newObj.push(elem);
					}
				}
			}
			else {
				newObj = {};

				for (var key in obj) {
					elem = obj[key];

					if (pred.call(elem, elem, key)) {
						newObj[key] = elem;
					}
				}
			}

			return newObj;
		},

		each: function(obj, fn) {
			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {
					var elem = obj[key];

					fn.call(elem, elem, key);
				}
			}
		},

		keys: function(obj) {
			if (Object.keys) {
				return Object.keys(obj);
			}
			else {
				var k = [];

				for (var key in obj) {
					k.push(key);
				}

				return k;
			}
		},

		first: function(obj) {
			var firstKey = (obj.length === obj.length + 0) ? 0 : this.first(this.keys(obj));

			console.log("[common.first] firstKey = ", firstKey, " of object ", obj, " with keys ", this.keys(obj));

			return (firstKey !== null) ? obj[firstKey] : null;
		},

		isUndefined: function(obj) {
			return obj === undefined;
		},

		isNull: function(obj) {
			return obj === null;
		},

		isNaN: function(obj) {
			return obj !== obj;
		},

		isArray: Array.isArray || function(obj) {
			return obj.constructor === Array;
		},

		isObject: function(obj) {
			return obj === Object(obj);
		},

		isNumber: function(obj) {
			return obj === obj+0;
		},

		isString: function(obj) {
			return obj === obj+'';
		},

		isBoolean: function(obj) {
			return obj === false || obj === true;
		},

		isFunction: function(obj) {
			return Object.prototype.toString.call(obj) === '[object Function]';
		}
	};
});