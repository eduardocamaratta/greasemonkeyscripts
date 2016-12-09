// ==UserScript==
// @name        SanitizeUol
// @namespace   gmcamaratta
// @description Removes the paywall and the tracker for all links
// @include     /^.*uol\.com\.br.*$/
// @run-at      document-start
// @version     1
// @grant       none
// ==/UserScript==


/*
 * This script executes the following procedures over uol.com.br:
 * 1. Removes the paywall
 * 2. Removes the tracker from links
 */


/*********************************************************************************************************************
 ** Tracker Removal **
 *********************************************************************************************************************/

function removeTracker() {
  var allLinks = $('a');
  allLinks.each(function(i, v) {
    if(v.href.startsWith("http://click.uol.com.br")) {
      v.href = v.href.replace(/^.*u=/, '');
    }
  });
};


/*********************************************************************************************************************
 ** Paywall removal **
 *********************************************************************************************************************/

function removePaywall() {
  var timer;
  var interval = 100;
  var maxTime = 10000;

  var verifyOverlay = function() {
    var element1 = $('.overlay-lightbox');
    var element2 = $('.content-lightbox-container');
    if (element1.length > 0 && element2.length > 0) {
      element1.remove();
      element2.remove();
      clearInterval(timer);
    }
  }

  timer = setInterval(verifyOverlay, interval);
  setTimeout(function() {clearInterval(timer);}, maxTime);
};


/*********************************************************************************************************************
 ** Load **
 *********************************************************************************************************************/

var addLoadEvent = function(newLoadEvent) {
  var oldOnLoad = window.onload;
  if(typeof window.onload != 'function') {
    window.onload = newLoadEvent;
  } else {
    window.onload = function() {
      if (oldOnLoad) {
        oldOnLoad();
      }
      newLoadEvent();
    };
  }
};

// Multiple scripts can be adding callbacks to onload, add this callback in a safe manner
addLoadEvent(function() {
  setTimeout(function() {
    removeTracker();
  }, 0);
});

/*********************************************************************************************************************
 ** Start **
 *********************************************************************************************************************/

// This initiates a timer, so there is no need to execute in onload
removePaywall();
