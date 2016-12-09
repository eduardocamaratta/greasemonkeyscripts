// ==UserScript==
// @name        DisableOGloboPaywall
// @namespace   gmcamaratta
// @description Disables O Globo Paywall
// @include     http://*.oglobo.globo.com/*
// @run-at      document-start
// @version     1
// @grant       none
// ==/UserScript==

// IMPORTANT: This script depends on the 'run-at document-start' tag.
var blocker = function(e) {
	if(e.target.src.search(/paywall/i) != -1) {
		e.preventDefault();
		e.stopPropagation();
	}
};

window.addEventListener ('beforescriptexecute', blocker, true);