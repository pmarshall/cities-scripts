//======================================================================
// ==UserScript==
// @name          Cities Message Qty
// @namespace     http://klozoff.ms11.net/greasemonkey/
// @description	  See how many of an item you have in the Messages box
// @include	http://cities.totl.net/cgi-bin/game*
// @include	http://carmilla.ecs.soton.ac.uk:8080/cgi-bin/game*
// @require	http://potatoengineer.110mb.com/cities_potatolibrary.user.js
// ==/UserScript==
//
// The usefulness of this script is limited; it is, however, handy for 
// bulk fishing.
//
// Requires greasemonkey 0.8.0+ and firefox 1.5+
//
// Version 1.02: PotatoLibrary update.
//
// Version 1.01: bugfix to play nicer with other messagebox-editing scripts.  Not bulletproof, but better.
//======================================================================

GM_setValue('scriptVersion','1.02');

checkUpdates('Message Qty','msgqty','cities_message_qty.user.js');


var gainLoseRE = /You (?:gain|lose) (an?|\d+) (.+?)(?=\.\n|\.$|\.<)/;
doIt();


function doIt() {
	var messages;
	if (isNewfangled()) msgText=$('messages').innerHTML;
	else messages = $('messages').value;

	if (gainLoseRE.test(msgText)) {
		getInventory('nameObject',testMessages);
	}
}

function testMessages(items) {
	// re-get the messages, because this might have come after an inventory fetch, and who knows what scripts have run since then?
	var messages;
	if (isNewfangled()) messages=$('messages').innerHTML;
	else messages = $('messages').value;
	var newMsgText='';
	while ( (m = gainLoseRE.exec(messages)) != null ) {
		newMsgText += RegExp.leftContext + m[0];
		messages = RegExp.rightContext;	
		var qty = m[1];
		var objname = m[2];
		
		objname=extractLabel(objname);
		if (qty != 'a' && qty != 'an') objname=depluralize(objname);
		
		newMsgText += ' (' + (items[objname]?items[objname]:0) + ')';
	}

	if (newMsgText.length > 0) {
		newMsgText += messages;
		// if it's == 0, nothing happened.
		if (isNewfangled()) $('messages').innerHTML = newMsgText;
		else $('messages').value = newMsgText;
	}
}

//======================================================================
