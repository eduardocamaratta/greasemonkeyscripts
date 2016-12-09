// ==UserScript==
// @name        TrelloAddEstimativeBadge
// @namespace   gmcamaratta
// @description Adds an estimative badge to Trello cards
// @include     /^.*trello\.com.*$/
// @version     1
// @grant       none
// ==/UserScript==


/*********************************************************************************************************************
 ** Abort if running in an iframe **
 *********************************************************************************************************************/

// Do not execute in iframes
if (window.self != window.top) {
  return;
}


/*********************************************************************************************************************
 ** Badges **
 *********************************************************************************************************************/

var addEstimativeBadges = function() {
  $("<style>.task-estimative, .t-shirt-p, .t-shirt-m, .t-shirt-g {background-color: #909090;color: white;border-radius: 4px;font-size: 12px;width: 20px;text-align: center;font-weight: bold;border: 1px solid #d0d0d0;}.t-shirt-p {background-color: #009933;}.t-shirt-m {background-color: #ffff00; color: #404040;}.t-shirt-g {background-color: #cc0000;}</style>").appendTo('head');

  $('.list-card-details').each(function(i, c) {
    var title = $(c).find('.list-card-title').text();
    var estimative = title.match(/^(\#\d+)?(\(.\))?(.*)$/)[2];
    if(!estimative) {
      return;
    }
    var value = estimative.match(/^\((.)\)$/)[1];
    var estimativeClass = {'P': 't-shirt-p', 'M': 't-shirt-m', 'G': 't-shirt-g'}[value];
    estimativeClass = estimativeClass ? estimativeClass : '.task-estimative';
    $(c).find('.js-plugin-badges').append('<div class="badge ' + estimativeClass + '">' + value + '</div>');
  });
};

window.addEventListener('load', addEstimativeBadges, false);
