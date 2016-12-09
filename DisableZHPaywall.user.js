// ==UserScript==
// @name        DisableZHPaywall
// @namespace   gmcamaratta
// @description Disable the paywall from Zero Hora
// @include     http://zh.clicrbs.com.br/*
// @version     1
// @grant       none
// ==/UserScript==

// We want to remove the following line, which is inserted by js *after* the page was loaded:
// <link rel="stylesheet" type="text/css" href="http://www.clicrbs.com.br/sites/templates/css/paywall.css?20151217v1">

// Source: http://www.javascriptkit.com/javatutors/loadjavascriptcss2.shtml
function removejscssfile(filename, filetype) {
    var targetelement = (filetype=="js") ? "script" : (filetype=="css")? "link" : "none" // determine element type to create nodelist from
    var targetattr = (filetype=="js") ? "src" : (filetype=="css")? "href" : "none" // determine corresponding attribute to test for
    var allsuspects = document.getElementsByTagName(targetelement);
    for (var i = allsuspects.length; i>=0; i--){ // search backwards within nodelist for matching elements to remove
      if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1) {
          allsuspects[i].parentNode.removeChild(allsuspects[i]) // remove element by calling parentNode.removeChild()
      }
    }
}


/*********************************************************************************************************************
 ** Abort if running in an iframe **
 *********************************************************************************************************************/

// Do not execute in iframes
if (window.self != window.top) {
  return;
}


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
    removejscssfile("paywall.css", "css");
  }, 0);
});
