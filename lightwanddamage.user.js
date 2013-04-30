// ==UserScript==
// @name           Light Wand Damage
// @namespace      http://potatoengineer.110mb.com/
// @description    Displays the damage of a light wand next to the inventory listing.
// @include        http://cities.totl.net/cgi-bin/game
// @include		  http://carmilla.ecs.soton.ac.uk:8080/cgi-bin/game
// ==/UserScript==

var inventory = document.getElementById("inventory");
var lightRE=/Light Wand \((\d+)/;
var results;
for (var i=0;i<inventory.firstChild.options.length && !results;i++) {
	results=lightRE.exec(inventory.firstChild.options[i].innerHTML);
}
if (results) {
	inventory.appendChild(document.createTextNode(" "+results[1]));
}