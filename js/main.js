require.config({
	urlArgs:
		"bust=" +  (new Date()).getTime(),
	paths: {
		"raphael": "vendor/raphael.2.1.0.amd",
		"jquery": "vendor/jquery",
		"dat": "vendor/dat", // re-base the dat project
		"datgui": "vendor/dat/gui/GUI"
	}
});

require(["aktau"],
	function(aktau) {
		"use strict";

		aktau.init();
	}
);