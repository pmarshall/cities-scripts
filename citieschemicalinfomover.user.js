// ==UserScript==
// @name           Cities Chemical Info Mover
// @namespace      http://potatoengineer.110mb.com/
// @description    Moves the information from the Blue Flowers quest into your Abilities box.
// @include        http://cities.totl.net/cgi-bin/game*
// ==/UserScript==

// Version 1.1: fixed for newfangled interface, and made compatiable with both interfaces.

var chemicalInfo;
if (document.getElementById('topdeck')) {
	chemicalInfo=document.getElementById('topdeck').nextSibling;
}
else{
	chemicalInfo=document.getElementById('controls_bottom').firstChild;
}

if (chemicalInfo && /Current effects:/.test(chemicalInfo.innerHTML)) {
	chemicalInfo.setAttribute('class','');
	var abilities=document.getElementById('abilities');
	if (abilities) {
		abilities.appendChild(chemicalInfo);
		body.removeChild(chemicalInfo);
	}
	else  {
		var inventory=document.getElementById('inventory');
		inventory.parentNode.insertBefore(chemicalInfo, inventory.nextSibling);
		body.removeChild(chemicalInfo);
	}
}