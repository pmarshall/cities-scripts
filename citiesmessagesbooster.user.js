// ==UserScript==
// @name           Cities Messages Booster
// @namespace      http://klozoff.ms11.net/greasemonkey/
// @description    Improves the messages box in Cities.
// @include        http://cities.totl.net/cgi-bin/game*
// @include        http://carmilla.ecs.soton.ac.uk:8080/cgi-bin/game*
// ==/UserScript==

// Version 1.2 (10/18/08): modifiled by PotatoEngineer to make it compatible with the Newfangled interface.  Also handles interface switches gracefully.
// v1.1: 2006-09-10
//				*	somebody changed the page structure and broke things.
//					on the plus side, they added code to make it easier to process
//				*	changed namespace
//				* added carmilla
// v1.0: First release

var messages = document.getElementById('messages');

if (messages == null) return;	// don't bother if they're out of AP!

var newfangled=!document.getElementById('inventory');
var text;
if (newfangled) {
	text=messages.innerHTML;
}
else {
	text=messages.value;
}
text = text.replace(/\n+$/, '');	// if the last line is blank, remove it.
// those damage/xp reports are LONG. They always wrap for me.
text = text.replace(/points? of damage/g, 'damage');
text = text.replace(/(\d+) experience/g, '$1 xp');
// ONLY update messages.value if it's changed, to prevent unnecessary redraws
if (text != messages.value) setMessagebox(text);

// play well with the Max AP Cost Hints feature.
var savetext = text.replace(/\bMax AP in roughly[^\n]+/g, '\n');
savetext = savetext.replace(/\n+$/, '');

var playername = document.getElementById('username').innerHTML;

// finally, clean it up a bit.
// however, since the cleanup can easily make two different names seem indistinct,
// add a hash juuuust in case.
playername = playername.replace(/[^a-zA-Z0-9]/g, '_') + simpleHash(playername);

//  GM_log('unique playername = ' + playername);

// variable prefix
var vprefix = playername + '.';

// Now, for the cool part: The history.
var MaxHistory = 5;
var nexthist = GM_getValue(vprefix+'nexthist', 	0);
if (nexthist < 0 || nexthist >= MaxHistory) nexthist = 0;	// Just in case.
var histtext = '';
var i = nexthist;
do {
	i = (i + MaxHistory - 1) % MaxHistory;
	var histent = GM_getValue(vprefix+'hist'+i, '');
	histent=histent.replace(new RegExp(nlN(),"g"),nl());
	if (histent=='') break;
	//GM_log('loading history[' + i + ']'+histent);
	histtext += nl() + histent;
} while(i != nexthist);
// now, if there is any text in the message box, save it as the next history entry.
// but not if it's blank! (which will happen if you just refresh)
if (savetext != '') {
	var d = new Date();
	// overwrite the oldest entry.
//	GM_log('Overwriting history[' + nexthist + ']');
	
	var strdate = '[' + d.getFullYear() + '-' + LZ(d.getMonth()) + '-' + LZ(d.getDate()) + ' ' + LZ(d.getHours()) + ':' + LZ(d.getMinutes()) + ':' + LZ(d.getSeconds()) + ']'+nl();
	GM_setValue(vprefix+'hist'+nexthist,  strdate + savetext);
	// update the next-history item.
	GM_setValue(vprefix+'nexthist', (nexthist+1) % MaxHistory);
}
if (histtext != '') {
	if (newfangled) messages.innerHTML += histtext;
	else messages.value += histtext;
}

// returns the passed value as a 2 digit string
function LZ(x) { if (x<10) return '0'+x; return x; }

function simpleHash(str) {
	str = str.toString();	// just in case
	var hash = 0;
	for (var i=str.length-1; i>=0; i--) {
			hash = (hash<<1) | str.charCodeAt(i);
	}
	return hash;
}


function setMessagebox(text) {
	if (newfangled) {
		document.getElementById('messages').innerHTML=text;
	}
	else {
		document.getElementById('messages').value=text;
	}
}

function nl() {
	if (newfangled) return '<br>';
	else return "\n";
}
function nlN() {
	if (newfangled) return "\n";
	else return '<br>';
}
