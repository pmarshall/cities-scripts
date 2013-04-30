// ==UserScript==
// @name           Cities PotatoFeeder
// @namespace      http://potatoengineer.110mb.com/
// @description    Feeds all your pets once per day
// @include        http://cities.totl.net/cgi-bin/game*
// @include        http://carmilla.ecs.soton.ac.uk:8080/cgi-bin/game*
// @require	http://potatoengineer.110mb.com/cities_potatolibrary.user.js
// ==/UserScript==


// Created by Paul Marshall, a.k.a. PotatoEngineer, a.k.a. Cor
// The WTH EULA applies to this script: you may do WHATEVER THE HELL YOU WANT to it.
//
// This script feeds your pets.  That's about it.  It selects whatever food is handy, except that it requires any over-fullness feeding to have the stuffing-type food. (literally; it only requires that food when feeding>=100%.  This is because people who haven't finished the Animal Sanctuary quest can't tell the difference between 76% and 99%, and I didn't want those people to be not feeding pets after 76% if they lacked a stuffing-food.)  Plus the usual controls to move the config-box around to different places.
//
// There are three settings: what fullness you want to feed your pets to (this is for ALL pets), whether to activate time-based feeding, and what time to feed at (if you have activated time-based feeding.)
//
// Version 1.2: quips.
//
// Version 1.11: PotatoLibrary update for Firefox 3.
//
// Version 1.1: Newfangled interface!
//
// Version 1.02: Dead pets are now properly skipped.
//				Flake Shakers and Shakey Flakes no longer prevent feeding pets in your inventory.
//
// Version 1.01: Cleaned up the user interface.
//				Fixed timed feeding.
//
// Version 1.0: It feeds pets!
//
// VARIABLES:
// GLOBAL:
// feeding: BOOLEAN: currently feeding pets.
// gotEquipPets: BOOLEAN: already collected pet codes from equip.
// gotInvPets: BOOLEAN: already collected pet codes from inventory
// pets: uneval'd array of pet codes.  Temporary, and reused between inventory-feeding and equipment-feeding.
// feedTarget+getUsername(): NUMBER: target feed% to feed until.  For non-PSQ characters, estimated.
// feedTime+getUsername(): STRING: time at which to feed pets.
// stuffPoint+getUsername(): NUMBER: at what point you MUST feed the pet with stuffing-type food.  default 90.
GM_setValue('scriptVersion','1.2');
var debug=GM_getValue('debug',false);

checkUpdates('PotatoFeeder','petfeed','cities_potatofeeder.user.js');

// sanity check: if we're not feeding anything, then clear the "go find pets in the equip screen" flag.
if (!GM_getValue('feeding',false) && !GM_getValue('feedEquip',false)) GM_setValue('gotEquipPets',false);

cancelBox();
createInterface();
feed();
feedTimer();
cancelBox();

function feed() {
	if (GM_getValue('feeding',false)) {
		findAndFeed();
	}
	else if (GM_getValue('feedEquip',false)) {
		feedEquip();
	}
	cancelBox();
}

// either creates or destroys the cancel div, as appropriate.
function cancelBox() {
	var cancelDiv=$('cancelPetFeeder');
	if (!cancelDiv && (GM_getValue('feeding',false)||GM_getValue('feedEquip',false))) {
		var cancelDiv=makeBox('PotatoPetFeeder: ','cancelPetFeeder');
		
		var cancelButton=makeButton('Let them starve!');
		cancelButton.addEventListener('click', 
				function() {
					stopFeeding();
					document.body.removeChild($('cancelPetFeeder'));
				}, true);
		cancelDiv.appendChild(cancelButton);
		document.body.insertBefore(cancelDiv, document.body.firstChild);
	}
	else if (cancelDiv && !(GM_getValue('feeding',false)||GM_getValue('feedEquip',false)) ) {
		document.body.removeChild(cancelDiv);
	}
}



function findAndFeed() {
	// are we currently holding a pet that needs feeding?
	var pets=eval(GM_getValue('pets','[]'));
	if (isPet(getHeldItem())) {
		// if we fed it (and clicked a button), return and stop executing so we can pick it up on the page-refresh.
		if (debug) GM_log('about to feed '+getHeldItem());
		if (feedAPet($('item'))) return;
		// if the pet didn't exist, or didn't need feeding, we'll keep going.
		if (debug) GM_log('pet was full!');
	}
	// either it wasn't a pet, or it was full.
	pets.shift();
	GM_setValue('pets',uneval(pets));
	
	// if we're not holding a feedable pet, hold the next pet.  If it's not a pet, no worries, it'll be eliminated on the next refresh.
	if (debug) GM_log('not holding feedable pet ('+getHeldItem()+'), look for one.');
	if (pets.length) {
		holdItem(pets[0]);
		return;
	}
	// if we're out of pets to feed, go look at the equip page.
	if (debug) GM_log('not holding a pet, have no non-fed pet.  Screw this, look at equip.');
	GM_setValue('feeding',false);
	GM_setValue('feedEquip',true);
	feedEquip();
}

function feedAPet(petDiv) {
	GM_log('feedAPet:'+petDiv.firstChild.firstChild.innerHTML);
	var petResult=/([^(]+) \(([^)]+)/.exec(petDiv.firstChild.firstChild.innerHTML);
	if (petResult) {
		var petType=petResult[2];
		var petName=petResult[1];
		// unfortunately, the fed-ness of a pet is at the top level of the item div, so it requires a rather precise regex to extract from the rest of the noise.
		var feedRegEx=new RegExp(petName+' is (stuffed|full|nearly full|hungry|very hungry|starving).? (\\((\\d+)%\\))?|Your '+petType.toLowerCase()+' is (dead)!');
		var fed=feedRegEx.exec(petDiv.innerHTML);
		if (debug) GM_log('fedness:'+fed+'  type:'+petType+'  name:'+petName);
		if (fed){
			var currentFed=0;
			// determine if we have the pet sanctuary quest or not.
			if(fed[2]) {
				currentFed=parseInt(fed[3]);	
			}
			else if (fed[4]) {
				currentFed=9999;	// if they're dead, simplify it by saying they're utterly stuffed, and thus don't need feeding.
			}
			else {
				currentFed=fedLevel(fed[1]);
			}
			
			// look through the list of foods for a usable food.
			var feedSelect=petDiv.getElementsByTagName('select');
			if (feedSelect) feedSelect=feedSelect[0];
			var i=0;
			var stuffingFood=stuffFood(petType);
			// iterate through the possible foods until we find one we have.  If the feed target requires stuffing-food, and we have at least 100% fullness, then we require, specifically, a stuffing-food.
			for (;feedSelect && i<feedSelect.options.length && (feedSelect.options[i].disabled || 
						(GM_getValue('feedTarget'+getUsername(),90)>100 && currentFed>=GM_getValue('stuffPoint'+getUsername(),100) && !stuffingFood['NOTHING'] && !stuffingFood[feedSelect.options[i].value]))
						;i++);
			// either the pet is already fed, or we don't have anything to feed it with.  In either case, remove the pet from the feed-list.
			if (debug) GM_log('checking feed; petName:'+petName+' feedTarget:'+GM_getValue('feedTarget'+getUsername(),90)+' currentFed:'+(currentFed+0)+' target<fed:'+(parseInt(GM_getValue('feedTarget'+getUsername(),90))<currentFed)+' feed-select:'+feedSelect);
			if (feedSelect && (i==feedSelect.options.length || parseInt(GM_getValue('feedTarget'+getUsername(),90))<currentFed)) {
				if (debug)GM_log('ignoring pet because it is full');
			}
			// feed it!  i points to an available food. (Or, if required, the stuffing-food.)
			else if (feedSelect) {
				feedSelect.selectedIndex=i;
				var inputs=petDiv.getElementsByTagName('input');
				inputs[0].click();
				return true;
			}
			// as luck would have it, we won't select a dead pet in the equipment pane, so if we're here (and thus the pet is dead), we know that we're holding that pet, and thus knock off the first pet from the list.
			else {
				if (debug) GM_log('pet is dead or unfeedable');
			}
		}
	}
	return false;
}

var fedLevels;
function fedLevel(fedName) {
	if (!fedLevels) {
		fedLevels=new Object();
		fedLevels['stuffed']=150;
		fedLevels['full']=100;
		fedLevels['nearly full']=99;
		fedLevels['hungry']=74;
		fedLevels['very hungry']=50;
		fedLevels['starving']=24;
	}
	return fedLevels[fedName];
}

var stuff;
function stuffFood(petType) {
	if (!stuff) {
		stuff=new Object();
		stuff['Dogbot']={'Oil':1};
		stuff['Baby Dung Beetle']={'Poop':1};
		stuff['Dung Beetle']={'Poop':1};
		stuff['Giant Dung Beetle']={'Poop':1};
		stuff['Electric Sheep']={'Oil':1};
		stuff['Ferret']={'Rasin':1};
		stuff['Goldfish']={'NOTHING':1};
		stuff['Goose']={'NOTHING':1};
		stuff['Kittin']={'Cod':1,'FlyingFish':1,'Eel':1,'LionFish':1,'Cream':1};
		stuff['Kat']={'Cod':1,'FlyingFish':1,'Eel':1,'LionFish':1,'Cream':1};
		stuff['Big Kat']={'Cod':1,'FlyingFish':1,'Eel':1,'LionFish':1,'Cream':1};
		stuff['Peeve']={'Kudos':1};
		stuff['Pwny']={'Carrot':1};
		stuff['Horsie']={'Carrot':1};
		stuff['War Horsie']={'Carrot':1};
		stuff['Winged Horsie']={'Carrot':1};
		stuff['Flyin\' Horsie']={'Carrot':1};
		stuff['Sea Horsie']={'NOTHING':1};
		stuff['Quantum Sheep']={'Rasin':1,'MagicHerb':1};
		stuff['Rock']={'Diamond':1};
		stuff['Baby Troll']={'Diamond':1};
		stuff['Troll']={'Diamond':1};
		stuff['Elephant']={'Bun':1,'CreamBun':1};
		stuff['Dragon']={'NOTHING':1};
	}
	return stuff[petType];
}

function feedEquip() {
	var pets;
	// what screen are we on, again?
	if (debug)GM_log('checking screen');
	var onEquipmentScreen=document.getElementsByTagName('h1');
	if (debug)GM_log('found '+onEquipmentScreen.length);
	if (onEquipmentScreen.length==0) {
		// if we're not looking at the equipment pane, go there.
		var equipButton = document.forms.namedItem('controls').elements.namedItem('act_view_equip');
		var equipPaneButton=document.forms.namedItem('controls').elements.namedItem('act_eqpane');
		if (equipButton) {
			if (debug)GM_log('found normal screen, clicking equip');
			equipButton.click();
		}
		// because SOME PEOPLE (everyone but me, apparently) view their equipment in the side panel.
		else if (equipPaneButton) {
			if (debug)GM_log('equip in side pane');
			// feed something.
			feedEquipPane($('equipment'));
		}
		// there IS no equip pane, anywhere.
		else {
			if (debug)GM_log('no equip!');
			stopFeeding();
			return;
		}
	}
	else {
		if (debug)GM_log('found equipment screen.');
		feedEquipPane($('control_pane'));
	}
}

function feedEquipPane(equipDiv) {
	// there might be some clever xpath method for this, but I need to break the name of the feed-select into parts, and check one part against a regex.  I'll just go for the brute-force method here.
	var inputs=equipDiv.getElementsByTagName('input');
	var petCodeRE=/([^_]*)_feed/;
	for (var i=0;i<inputs.length;i++) {
		if (inputs[i].name) {
			// look for the act_equip_<petCode>_feed input, compare that petCode against our pets to feed.  If we're feeding it, jump two nodes up to feed the complete pet-div to the feedAPet function.
			var petCode=petCodeRE.exec(inputs[i].name);
			if (petCode) {
				// feed the pet.  If we actually clicked something, then return so that we aren't interrupted by the refresh.
				if (feedAPet(inputs[i].parentNode.parentNode)) return;
			}
		}
	}
	// if we managed to get here, there's nothing more to do.
	stopFeeding();
}

// clear all relevant variables.
function stopFeeding() {
	GM_setValue('feeding',false);
	GM_setValue('feedEquip',false);
	GM_setValue('gotEquipPets',false);
}

function startFeeding() {
	GM_setValue('feeding',true);
	GM_setValue('gotEquipPets',false);	// should already be false, but hey, why not?
	quip('petfeed');
	getInventory('valueObject',saveInvPets,'pet')
}

function saveInvPets(invObj) {
	endQuip();
	var pets=[];
	for (var i in invObj) {
		if (isPet(i)) pets.push(i);
	}
	GM_setValue('pets',uneval(pets));
	
	if (debug) GM_log('inventory pets:'+pets);
	
	if (pets.length) holdItem(pets[0]);
	else feed();
}

function feedTimer() {
	if (GM_getValue('autoFeed'+getUsername(),false)) {
		var userTime=GM_getValue('feedTime'+getUsername(),'');
		times=userTime.split(':');
		// if the date isn't properly formatted, forget it.
		if (times.length=2) {
			times[0]=parseInt(times[0]);
			times[1]=parseInt(times[1]);
			// a little bit of multi-compatibility: if they use a HH:MMpm time format, then add 12 hours.
			if (/pm/i.test(userTime) && times[0]!=12) times[0]+=12;
			var curDate=new Date();
			var feedDate=new Date();
			feedDate.setHours(times[0]);
			feedDate.setMinutes(times[1]);
			feedDate.setSeconds(0);
			if (feedDate.getTime()-curDate.getTime() < 0) feedDate.setDate(feedDate.getDate()+1);
			setTimeout(function() {startFeeding();}, feedDate.getTime()-curDate.getTime());
			if (debug) GM_log ('milliseconds to feeding time: '+(feedDate.getTime()-curDate.getTime())+' feedDate:'+feedDate.getTime()+' curDate:'+curDate.getTime());
		}
	}
}


function createInterface() {
	var box=makeBox('PotatoFeeder: ','petfeed');
		
	var feedButton=makeButton('Feed your pets');
	feedButton.addEventListener('click', startFeeding, true);
	box.appendChild(feedButton);
	
	var configButton = makeButton('Configure');
	configButton.setAttribute("id","feederConfigButton");
	configButton.addEventListener('click', function() {toggleConfig('feederConfig');}, true);
	box.appendChild(document.createTextNode(' '));
	box.appendChild(configButton);

	var configDiv=document.createElement('div');
	configDiv.id='feederConfig';
	configDiv.setAttribute('style','display:none');
	box.appendChild(configDiv);

	var feedLevelBox=document.createElement("input");
	feedLevelBox.setAttribute("type","text");
	feedLevelBox.size="3";
	feedLevelBox.setAttribute("id","feedTarget");
	feedLevelBox.setAttribute("value",GM_getValue('feedTarget'+getUsername(),90));
	feedLevelBox.addEventListener('change',
			function() {
				GM_setValue('feedTarget'+getUsername(),feedLevelBox.value);
				GM_log('feedTarget is now '+GM_getValue('feedTarget'+getUsername()));
			}
			,true);
	configDiv.appendChild(document.createTextNode('Fullness to feed pets to (in %): '));
	configDiv.appendChild(feedLevelBox);
	configDiv.appendChild(document.createElement('br'));
	configDiv.appendChild(document.createTextNode('Note: the above box works even if you have not completed the Animal Sanctuary Quest and do not know the exact fullness of your pets, but this script will round down when feeding your pets in this case. (e.g., asking for 90% feeding will get you about 76%)'));
	
	configDiv.appendChild(document.createElement('br'));
	configDiv.appendChild(makeCheckbox('autoFeed'+getUsername(),'Feed pets automatically at the given time:'));

	// text input: "when do you want to auto-feed?"
	var feedTime=document.createElement("input");
	feedTime.setAttribute("type","text");
	feedTime.setAttribute("size","6");
	feedTime.setAttribute("id","feedTime");
	feedTime.setAttribute("value",GM_getValue('feedTime'+getUsername(),'Local time'));
	feedTime.addEventListener('change',
			function() {
				GM_setValue('feedTime'+getUsername(),feedTime.value);
			}
			, true);
	configDiv.appendChild(feedTime);
	
	configDiv.appendChild(document.createElement('br'));
	configDiv.appendChild(makeCheckbox('debug','Debug Mode'));
	configDiv.appendChild(document.createTextNode(' Version: '+GM_getValue('scriptVersion')));
	
	configDiv.appendChild(document.createElement('br'));
	configDiv.appendChild(locationSelect());
	
	insertAt(box, GM_getValue('display_location','PotatoConsole'));
}
