// ==UserScript==
// @name        RemoveFolhaPaywall
// @namespace   gmcamaratta
// @description Disable the Paywall from Folha
// @include     http://*.folha.uol.com.br/*
// @include     http://*.blogfolha.uol.com.br/*
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
