// ==UserScript==
// @name        RemoverOverlayLegendasTV
// @namespace   gmcamaratta
// @description Remove the annoying overlay from legendas tv
// @include     http://legendas.tv/*
// @version     1
// @grant       none
// ==/UserScript==

var timer;
var maxTime = 10000;
var interval = 100;

var removeElementById = function(elementId) {
	var element = document.getElementById(elementId);
	if (element != null) {
		element.remove();
	}
};

var verifyOverlay = function() {
	removeElementById('fanback');
	removeElementById('overlay');
};

timer = setInterval(verifyOverlay, interval);
setTimeout(function() {clearInterval(timer);}, maxTime);
