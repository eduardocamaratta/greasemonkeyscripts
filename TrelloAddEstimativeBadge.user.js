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

styles = `<style>
.task-estimative {
  background-color: #909090;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  width: 20px;
  text-align: center;
  font-weight: bold;
  border: 1px solid #d0d0d0;
}
.f0  { background-color:#4040FF; }
.f1  { background-color:#00E090; color: black; }
.f2  { background-color:#40A000; }
.f3  { background-color:#B0D000; color: black; }
.f5  { background-color:#F0F000; color: black; }
.f8  { background-color:#FF6000; }
.f13 { background-color:#D02020; }
</style>`;

var addEstimativeBadges = function() {
  $(styles).appendTo('head');

  $('.list-card-details').each(function(i, c) {
    var title = $(c).find('.list-card-title').text();
    var estimative = title.match(/^(\#\d+)?(\(\w+\))?(.*)$/)[2];
    if(!estimative) {
      return;
    }
    var value = estimative.match(/^\((\w+)\)$/)[1];
    var estimativeClass = {
      'P': 'f2',
      'M': 'f5',
      'G': 'f13',
      '0': 'f0',
      '1': 'f1',
      '2': 'f2',
      '3': 'f3',
      '5': 'f5',
      '8': 'f8',
      '13': 'f13'}[value];
    estimativeClass = estimativeClass ? ' ' + estimativeClass : '';
    $(c).find('.js-plugin-badges').append('<div class="badge task-estimative' + estimativeClass + '">' + value + '</div>');
  });
};

window.addEventListener('load', addEstimativeBadges, false);
