// ==UserScript==
// @name           Cities Autofeeder
// @namespace      http://potatoengineer.110mb.com/
// @description    Automatically feed your baby
// @include        http://cities.totl.net/cgi-bin/game*
// @include		   http://carmilla.ecs.soton.ac.uk:8080/cgi-bin/game*
// @require		http://potatoengineer.110mb.com/cities_potatolibrary.user.js
// ==/UserScript==
//
// Created in 2007 by PotatoEngineer, a.k.a. Cor, a.k.a. Paul Marshall.
// Permission is granted to use, excerpt, modify, fold, spindle, or mutilate for any non-commercial purpose.
// Inspired by Stevie-O's AutoWorship script; oddly enough, the only line I actually copied was the one to 
//     refresh the page.
//
// Version 1.3: Now for newfangled interface!  (And PotatoLibrary update)
//
// Version 1.21: Changed "activate autofeeding" text to RED when script is not active, just to encourage new adopters to actually click that checkbox.
//
// Version 1.2: PotatoConsole update: you can leave it open if you unset the checkbox.
//
// Version 1.1: Added to PotatoConsole.
//
// Version 1.05: found the timing issue.  It should work now.
//
// Version 1.04: Of COURSE that last change introduced a bug.  Argh.
//
// Version 1.03: Just for overkill value, ALWAYS checks to see if the baby is selected, and selects it.
//
// Version 1.02: It works now, and as is traditional, now has an auto-updater.
//
// Version 1.01: Took out the refresh when I click the button.  Maybe it'll work this time.
//
// Version 1.0: first release to the wild.  May or may not actually work with babies, but at least the interface works.

// WARNING: turn the script off when you're done with it.  It'll try to equip the baby every time.


GM_setValue('scriptVersion','1.3');

checkUpdates('Baby Feeder','autofeed','cities_autofeeder.user.js');

makeConfig();

var active=GM_getValue('active',false);

var clickTimer;

if (active) {	
	if (selectBaby()) {
		return;
	}
	
	// look for the feeding button, and push it.
	var feedButton = xpath1("//input[@type='submit' and @name='act_item_feed']");
	if (feedButton) feedButton.click();
	
	var now=new Date();
	var nextWorship=new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(),now.getSeconds(),0);
	nextWorship.setMinutes(nextWorship.getMinutes()+30);
	
	var delay = nextWorship.getTime() - now.getTime();	// how many milliseconds until the next worship time.
	GM_log('delay:'+delay);
	clickTimer=setTimeout(refreshPage, delay);	// refreshes every 10 minutes
}


function makeConfig() {
	var configDiv=makeBox('AutoFeeder:');
	var activeCB=document.createElement('input');
    activeCB.setAttribute("type","checkbox");
    activeCB.setAttribute("name","Active");
    activeCB.checked=GM_getValue('active',false);
	activeCB.addEventListener(
		'click',
		function(event)
		{
			GM_setValue('active',activeCB.checked);
			active=GM_getValue('active');	// that's a global variable declared at the top.
			GM_log('ACTIVE value is now '+GM_getValue('active'));
			
			// if we're activating the script, go select the baby.
			if (active) {
				if (selectBaby()) {
					return;
				}
			}
			else {
				window.clearTimeout(clickTimer);
			}
		},
		true);
	var autofeedText=document.createElement('span');
	autofeedText.innerHTML=' Activate Autofeeding: ';
	if (!GM_getValue('active',false)) {
		autofeedText.setAttribute('style','color: red');
	}
	configDiv.appendChild(autofeedText);
	configDiv.appendChild(activeCB);
	
	insertAt(configDiv,GM_getValue('displayLocation','PotatoConsole'));

	configDiv.appendChild(locationSelect());
	
}

// if you don't have the baby selected, it selects the baby and returns true.  If you don't have a baby, returns false.
function selectBaby() {
	if (getHeldItemValue()!='Baby' && !GM_getValue('attemptedEquip',false)) {
		GM_setValue('attemptedEquip',true);
		holdItem('Baby');
		return true;
	}
	else if (GM_getValue('attemptedEquip')) {
		GM_setValue('attemptedEquip',false);
	}
	return false;
}

function refreshPage() {
	location.href=location.href;
}

