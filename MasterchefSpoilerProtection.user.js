// ==UserScript==
// @name        MasterchefSpoilerProtection
// @namespace   gmcamaratta
// @description This script removes Masterchef spoilers from UOL and ClicRBS
// @include     /^.*uol\.com\.br.*$/
// @include     /^.*clicrbs\.com\.br.*$/
// @exclude     /^.*clicrbs\.com\.br/jsp.*$/
// @run-at      document-start
// @version     1
// @grant       none
// ==/UserScript==


/*********************************************************************************************************************
 ** Masterchef Spoiler Removal **
 *********************************************************************************************************************/

var msSpoilerProtectClass = 'msspoilerprotection';

function shouldExecuteMasterchefSpoilerRemoval() {
  var date = new Date();
  // If today is wednesday past 1am, or today is between thurday and sunday
  return (date.getDay() == 3 && date.getHours() > 1) || date.getDay() > 3;
};

var removeElement = function(e) {
  if(!e) return;
  e.parentNode.removeChild(e);
};

function insertMasterchefSpoilerProtection() {
  if(!shouldExecuteMasterchefSpoilerRemoval()) {
    return;
  }

  // This executed before load, so jquery was not available yet
  var after = function() {
    var innerHtml = "<div class='" + msSpoilerProtectClass + "' style='position: fixed; z-index: 10000000; left: 0; top: 0; height: 100%; width: 100%; background-color: rgba(255, 255, 255, 0.99);'>" +
                      "<span style='display: block; position: relative; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; font-size: 30px; font-weight: bold'>" + 
                        "Protecting you from masterchef spoilers..." +
                        "<span style='display: block; font-size: 20px; font-style: italic'>Click to remove</span>" +
                      "</span>" +
                    "</div>";
    var protection = document.createElement('div');
    protection.innerHTML = innerHtml;
    protection.onclick = function(e) {removeElement(this)};
    var body = document.getElementsByTagName('body')[0];
    body.insertBefore(protection, body.children[0]);
  };

  // This is executed in an interval to prevent the browser from crashing for excessive cpu usage
  var timer = setInterval(function() {
    if(document.getElementsByTagName('body').length > 0) {
      clearInterval(timer);
      after();
    }
  }, 5);
};

function removeMasterchefSpoilers() {
  if(!shouldExecuteMasterchefSpoilerRemoval()) {
    return;
  }
  [].slice.call(document.getElementsByTagName('a')).filter(function(a){return a.href.match(/masterchef/)}).forEach((e) => removeElement(e));
  var elements = [].slice.call(document.getElementsByClassName(msSpoilerProtectClass));
  elements.forEach((e) => removeElement(e));
};


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
    removeMasterchefSpoilers();
  }, 0);
});

/*********************************************************************************************************************
 ** Start **
 *********************************************************************************************************************/

// We execute this before load, for obvious reasons
insertMasterchefSpoilerProtection();
