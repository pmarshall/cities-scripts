//THIS IS LINE 274 ON THE ERROR CONSOLE
//======================================================================
// ==UserScript==
// @name          Cities Outfitter
// @description	  Quickly put on.... everything.
// @include        http://cities.totl.net/cgi-bin/game*
// @include        http://carmilla.ecs.soton.ac.uk:8080/cgi-bin/game*
// @require	http://potatoengineer.110mb.com/cities_potatolibrary.user.js
// ==/UserScript==
//
// Copyright 2007 (at least the bits I've done, anyway) by Paul Marshall, aka Cor or PotatoEngineer. 
// Permission freely granted to use, modify, distribute, excerpt, fold, spindle, and/or mutilate for any non-commercial purpose.
//
// Quite shamelessly based on the QuickBling (and BulkBuy) script which is: 
// Copyright 2006 Steve (last name unknown at the moment), which is in turn
// quite shamelessly based on the QuickDraw script which is: 
// Copyright 2006 Nick Gibbins
//
// Requires greasemonkey 0.8.0+ and firefox 1.5+
//
// Woe unto ye who tries to understand this gibberish!  Know that I made this with word wrap turned on, and thus the comments occasionally run far off to the right, like this one.
//
// Version 2.42: PotatoLibrary update.
//
// Version 2.41: Items update.
//
// Version 2.4: quips!
//
// Version 2.3: Re-added in the "equip slot X with item Y" functionality.
//
// Version 2.22: Forgot a few of the new pets.
//
// Version 2.21: PotatoLibrary update for Firefox 3.
//
// Version 2.2: Now for newfangled interface!
//
// Version 2.19: Snowshoes are multi-equippable again.
//
// Version 2.18: Horizontal and Vertical Blings named properly.
//
// Version 2.17: Tweaked item slots used.  The QuantumHelm is the first non-hat headwear that doesn't take up your ears slot.
//
// Version 2.16: Basic quantum equipment added.
//
// Version 2.15: Can only wear one leather gorget at a time.
//				DogBot properly named.
//
// Version 2.14: Army boots are equippable (again).
//
// Version 2.13: Bugfix for pet-equipping.
//
// Version 2.12: Bugfix for that "Only unequip items if space is needed" checkbox.
//				Also: unequipping a multiple-slot item (hauberk, jacket, horsie) no longer causes 'king fiddling.
//
// Version 2.11: Equipping a particular number of blings now works with post-werewolf equipping.
//
// Version 2.1: If underground (actually, if there's no GPS data available), don't unequip lanterns (if checkbox is set).
//
// Version 2.02: More Bugfix: the "only unequip if necessary" checkbox works properly now.
//
// Version 2.01: Bugfix: Pets can be unequipped now.
//
// Version 2.0: MAJOR overhaul.
//				Outfits, when worn, will not unequip anything if it's possible to wear the item without unequipping.
//				Finally, the exact number of blings to be worn can be selected.
//				Equipment is sorted by slot in the "configure outfits" menu, though slots have no particular order.
//
// Version 1.91: Because getting past one test case is not, in fact, the same as a fully working script, here's a bugfix.
//
// Version 1.9: In an attempt to eliminate the "phantom item" bug, Outfitter no longer stores one key per item per outfit.
//				Also, Outfitter will attempt to wear Glowing Mails On Sunday, Daily Mails, and Sun/Moon Stone Blings before
//					wearing any other equipment.  If these items are not glowing, they will not be worn.
//
// Version 1.82: More bugfix: werewolfism now refreshes the page before it does anything, so no more 'king fiddling.
//				Also: re-allowed parentheses for things that AREN'T armor block percentages.
//
// Version 1.81: Bugfix: 12:41PM would turn into 00:41AM the next day.
//
// Version 1.8: Now, it can stop!
//
// Version 1.71: Oops, accidentally broke everything.  Fixed now.
//
// Version 1.7: Outfitter can equip you with any outfit you own at a particular time every day.  Quite useful if you're
//					inflicted with lycanthropy and want to get the benefits of fashion.  Each alt you use may have
//					different werewolf settings.
//
// Version 1.61: Bugfix: if "don't unequip pets" is checked, it won't try to equip them when they're already equipped.
//				Also bugfixed PotatoConsole (in only this script): asking to go "under Item" will not land you below equip.
//
// Version 1.6: PotatoConsole update: the option to leave the console open on page load if it wasn't closed.
//
// Version 1.5: Added PotatoConsole.
//
// Version 1.49: Quantum Sheep (and maybe electric sheep and mayflies?) added to pets list.
//				Now compatible with the Item Selector script (which broke my favorite way to find the inventory...)
//				Added Iron Maiden to "equippables" list, if you REALLY want to wear one....
//
// Version 1.48: Bort Goggles added.
//
// Version 1.47: Disguise kits are now NEVER unequipped. 
//				Also sorted the changelog so the recent stuff is at the top.
//
// Version 1.46: Added Aventail, Chausse, Haubgergeon, and Hauberk, and added Chausse to multi-equip.
//				Also fixed oufit deletion. 
//
// Version 1.45: Added Rivets to multi-equip.
//
// Version 1.44: Added Rivets.
//
// Version 1.43: Fixed "Add Equipped Outfit" to actually display the outfit components in the config screen. 
//					It worked before, it just didn't LOOK like it worked, and under the old "save outfit changes every
//					time" method, just checking the outfit would delete it once you closed the config box.
//
// Version 1.42: Fixed it the OTHER way: if you're wearing multiple, and you want to wear just one, it'll do that.
//
// Version 1.41: If you're wearing something that's part of your outfit, and it's a "wear all" item, Outfitter will 
//					check if you have some more of those items, and try to wear them if you do.  It doesn't check for
//					equipment slot size, so it'll try to wear more if you already have 10 blings or 2 boots.
//
// Version 1.4: Tweaked UI: applying changes to an outfit is no longer the default action.  
//					Now you need to click APPLY OUTFIT CHANGES.
//				Also, REALLY ACTUALLY fixed "don't unequip pets."
//
// Version 1.33: ACTUALLY fixed "don't unequip pets."
//
// Version 1.32: more "don't unequip pets" bugfix.
//
// Version 1.31: Bugfix for "don't unequip pets."
//
// Version 1.3: Added "don't unequip pets" checkbox to config.
//
// Version 1.2: Added "create outfit from equipment" button
//				Bugfix: if your "putting on stuff" part of dressing only consists of a held item, it works now.
//				Also added lanterns.
//
// Version 1.17: Pet eggs are not equippable.
//
// Version 1.16: Added the Kilgore Trout masks, elephants.
//
// Version 1.15: More bugfix.  Selecting the last outfit, then deleting it, would cause a script crash on the next
//					refresh. And since the script crashed, you couldn't fix it.... but there's a default fix for that now.
//
// Version 1.14: Bugfix.  Dressing continues after you get to the equipment screen but aren't stripping anything.
//				Allowed multi-equipping snowshoes.
//
// Version 1.13: Bugfix.  Menu re-displayed after a stripping-only operation completes.
//
// Version 1.12: Bugfix.  The script could strip one extra item and not put it back on in some outfit swaps.
//
// Version 1.11: Bugfix.  The script would error out after collecting the stripping info.
//
// Version 1.1: Copied update section from Big Brother 1.73 (so it should work more gooder now)
//				Added PetRocks, Pwnys, Baby Dung Beetles, Geese.
//				Minor bugfix with Outfitter doing nothing when wearing nothing and putting on an outfit 
//					with only a held item.
//
// Version 1.0: Not at all the first version, just the first where I kept track of changes.  
//				Added auto-update, stripped some debuggery.
//				Made script not "hang" when it's stripping, but can't find anything to remove.
//
//======================================================================

// new outfit variables:
// GLOBAL:
// outfits+getUsername(): uneval'd array of Outfit objects
// tempOutfit: uneval'd array itemCodes; if an item is equipped an exact multiple of times, then it gets added that many times.
// tempHeldItem: item code of held item.
// strip: uneval'd Array of items to be stripped
// collectStripInfo: BOOLEAN: are we collecting the information for stripping?  Technically, only required for users that don't view their equipment in the side panel.  (Such as, for instance, ME.  I didn't realize that most players view their equipment in the side panel.)
// getEquip: BOOLEAN: are we in the process of looking for currently-equipped items to create an outfit from?  (again, only for those without equip in the side panel.)
// collectSlotInfo: BOOLEAN: same as the other two, but for the particular purpose of the equip-single-item thingummy.
// stripping: BOOLEAN: are we in the process of getting naked? (overridden by collectStripInfo)
// dressing: BOOLEAN: are we getting dressed? (overridden by stripping)
// OUTFIT OBJECT
// name: display name of outfit
// heldItem: item code to be held; does not exist if no item is to be held.
// items: object with <itemCode>:<equipCount> properties.

//var startTime=new Date();

var selectOutfit;
var debug=GM_getValue('debug',false);
GM_setValue('scriptVersion',"2.42");
const DEFAULT_OUTFITS="[{'name':'Outfit 0','items':{}}]";
const EMPTY_SLOTS={'pets':0,'head':0,'ears':0,'glasses':0,'eyeliner':0,'tash':0,'neck':0,'body':0,'back':0,'hands':0,'polish':0,'bling':0,'arms':0,'crotch':0,'zip':0,'legs':0,'skirt':0,'socks':0,'shoes':0,'snowshoes':0,'transport':0,'lantern':0,'mirror':0,'disguise':0,'maiden':0};

doIt();

function doIt() {
	checkUpdates('Outfitter','outfit','cities_outfitter.user.js');

	cancelBox();
	initializeOutfit();
	mainFunc(); 
	werewolfTimer();
	cancelBox();	// happens a second time because it's possible that mainFunc() realized that we're done dressing.
}
//var endTime=new Date();
//GM_log((endTime.getTime()-startTime.getTime()));
function mainFunc() {

	if (debug) GM_log('entering MainFunc.  getEquip:'+GM_getValue('getEquip',false)+' collectSlotInfo:'+GM_getValue('collectSlotInfo','potato')+' collectStripInfo:'+GM_getValue('collectStripInfo',false)+' stripping:'+GM_getValue('stripping',false)+' dressing:'+GM_getValue('dressing', false));
	if (GM_getValue('collectSlotInfo',false) ){
		if (debug)GM_log('collecting slot info');
		goToInfo(equipSlot,noEquipSlot);
	}
	else if (GM_getValue('getEquip',false) ){
		if (debug)GM_log('collecting equip info');
		goToInfo(collectEquipInfo,noEquipInfo);
	}
	// if we're going to strip, collect info.
	else if (GM_getValue('collectStripInfo',false)) {
		if (debug)GM_log('collecting strip info');
		goToInfo(collectStripInfo,noEquipStrip);
	}
	// if we're stripping, get naked.
	else if (GM_getValue('stripping',false)) {
		if (debug)GM_log('stripping');
		strip();
	}
	// if we're getting dressed then dress!
	else if (GM_getValue('dressing', false)) {
		if (debug)GM_log('dressing');
		dress();
	}
	// if we're not here for any reason, then we might have just ended stripping/dressing or something.  Once more for paranoia!
	else {
		cancelBox();
	}
	
}

// either creates or destroys the cancel div, as appropriate.
function cancelBox() {
	
	var cancelDiv=$('cancelOutfitter');
	var outfitting;
	if (GM_getValue('getEquip',false) || GM_getValue('collectStripInfo',false) ||
			GM_getValue('stripping',false) || GM_getValue('dressing', false))
		outfitting=true;
	else outfitting=false;
	if (!cancelDiv && outfitting) {
		var cancelDiv=makeBox('Outfitter: ','cancelOutfitter');
		
		var cancelButton=makeButton('For the love of Montresor, stop!');
		cancelButton.addEventListener('click', 
				function() {
					GM_setValue('getEquip',false);
					GM_setValue('collectStripInfo',false);
					GM_setValue('collectSlotInfo',false);
					GM_setValue('stripping',false);
					GM_setValue('dressing', false);
					document.body.removeChild($('cancelOutfitter'));
				}, true);
		cancelDiv.appendChild(cancelButton);
		document.body.insertBefore(cancelDiv, document.body.firstChild);
	}
	else if (cancelDiv && !outfitting ) {
		document.body.removeChild(cancelDiv);
	}
}

// If you're a werewolfy person, then create a timeout that will make you get dressed just after your werewolf time ends.
function werewolfTimer() {
	if (GM_getValue('werewolf'+getUsername())) {
		var userTime=GM_getValue('werewolfTime'+getUsername(),'');
		times=userTime.split(':');
		// if the date isn't properly formatted, forget it.
		if (times.length=2) {
			times[0]=parseInt(times[0]);
			times[1]=parseInt(times[1]);
			// a little bit of multi-compatibility: if they use a HH:MMpm time format, then add 12 hours.
			if (/pm/i.test(userTime) && times[0]!=12) times[0]+=12;
			var curDate=new Date();
			var dressDate=new Date();
			dressDate.setHours(times[0]);
			dressDate.setMinutes(times[1]);
			dressDate.setSeconds(0);
			if (dressDate.getTime()-curDate.getTime() < 0) dressDate.setDate(dressDate.getDate()+1);
			setTimeout(function() {startDressing(GM_getValue('wereOutfit'+getUsername(),0), true);}, dressDate.getTime()-curDate.getTime());
			if (debug) GM_log ('milliseconds to outfit change: '+(dressDate.getTime()-curDate.getTime())+' dressDate:'+dressDate.getTime()+' curDate:'+curDate.getTime());
		}
	}
}


function changeSelectedOutfit() {
	if ($('outfitConfig').getAttribute('style')!='display:none') {
		updateItemList();
	}
	GM_setValue('selectedOutfit',selectOutfit.selectedIndex);
	$('renameOutfit').value=selectOutfit.options[selectOutfit.selectedIndex].innerHTML;
}

// construct the outfit selection box, and the (default hidden) configuration controls.  Don't build
// the inventory list until later.
var consoleVisible=false;
function initializeOutfit() {
	var box=makeBox('Outfits','outfits');
	var dressDiv=document.createElement("div");
	dressDiv.setAttribute("id","outfit-controls");
	box.appendChild(dressDiv);

	selectOutfit=document.createElement("select");
	selectOutfit.setAttribute("class","controls");
	selectOutfit.setAttribute("id","outfitSelect");
	selectOutfit.addEventListener('change',changeSelectedOutfit, true);
	
	var outfits=eval(GM_getValue('outfits'+getUsername(),DEFAULT_OUTFITS));
	
	for (var i=0;i<outfits.length;i++) {
		var option=document.createElement("option");
		option.innerHTML=outfits[i].name;
		selectOutfit.appendChild(option);
	}
	
	// oops.  If we select a nonexistent item, the entire script crashes.  And since it crashes, it can't be fixed... so this will fix it automatically.
	if (GM_getValue('selectedOutfit',0) >= selectOutfit.length) GM_setValue('selectedOutfit',0);
	
	selectOutfit.selectedIndex=GM_getValue('selectedOutfit',0);
	dressDiv.appendChild(selectOutfit);
	dressDiv.appendChild(document.createTextNode(" "));
	
	var dressButton=makeButton('Get Dressed');
	dressButton.addEventListener('click', function() {startDressing();}, true);
	dressDiv.appendChild(dressButton);
	dressDiv.appendChild(document.createTextNode(" "));
	
	var stripButton=makeButton('Get Naked!');
	stripButton.addEventListener('click', startStripping, true);
	dressDiv.appendChild(stripButton);
	dressDiv.appendChild(document.createTextNode(" "));
	
	var configButton = makeButton('Configure');
	configButton.setAttribute("id","outfitConfigButton");
	configButton.addEventListener('click', function(){toggleConfig('outfitConfig',function(){GM_setValue('addHeldItem',false); updateItemList();});}, true);
	dressDiv.appendChild(configButton);
	
	// THIS SECTION HAS BEEN OBSOLETED.  In theory, the newer & shinier version does the same thing, only better.
	// new stuff: just equip one item.
	dressDiv.appendChild(document.createElement('br'));
	
	var slotSelect=document.createElement('select');
	slotSelect.id='slotSelect';
	slotSelect.innerHTML="<option value='absolutely_nothing'>Select a Slot</option><option value='head'>Head</option><option value='glasses'>Eyeglasses</option><option value='neck'>Neck</option><option value='body'>Body</option><option value='back'>Back</option><option value='arms'>Arms</option><option value='hands'>Hands</option><option value='legs'>Legs</option><option value='socks'>Socks</option><option value='shoes'>Shoes</option><option value='bling'>Blings</option><option value='pet'>Pets</option><option value='lantern'>Lanterns</option><option value='transport'>Transportation</option><option value='disguise'>Disguises</option><option value='other'>Other/Unique</option>";
	
	var slotItemSelect=document.createElement('select');
	slotItemSelect.id='slotItemSelect';
	slotSelect.addEventListener('change',
			function(event) {
				// make that button only visible when we have a valid option.
				if (slotSelect.selectedIndex!=0) slotButton.setAttribute('style','');
				else slotButton.setAttribute('style','display:none');
				
				// remove any previous selects that might have been here before (from other calls to this function)
				while (slotItemSelect.hasChildNodes()) {
					slotItemSelect.removeChild(slotItemSelect.firstChild);
				}
				
				// add new selects
				getInventorySlotItems(slotSelect.options[slotSelect.selectedIndex].value);
			},
			true);
			
	var slotButton=makeButton('Do it!');
	slotButton.setAttribute('style','display:none');
	slotButton.addEventListener('click',
			function(event) {
				// there must actually be some child nodes if we're going to equip.
				if (!slotItemSelect.hasChildNodes()) return;
				
				if (debug) GM_log('start dressing slot: item = '+slotItemSelect.options[slotItemSelect.selectedIndex].value);
				GM_setValue('collectSlotInfo',true);
				GM_setValue('stripping',true);
				GM_setValue('dressing',true);
				GM_setValue('tempOutfit','["'+slotItemSelect.options[slotItemSelect.selectedIndex].value+'"]');
				mainFunc();
			},
			true);
	
	dressDiv.appendChild(document.createTextNode('Equip just the '));
	dressDiv.appendChild(slotSelect);
	dressDiv.appendChild(document.createTextNode(' slot with '));
	dressDiv.appendChild(slotItemSelect);
	dressDiv.appendChild(slotButton);
	
	dressDiv.appendChild(document.createElement('br'));
	dressDiv.appendChild(makeCheckbox('clearSlot','Only unequip items if space is needed',true,true));


	// config div
	var configDiv=document.createElement("div");
	configDiv.setAttribute("id","outfitConfig");
	box.appendChild(configDiv);

	var nameBox=document.createElement("input");
	nameBox.setAttribute("type","text");
	nameBox.setAttribute("id","renameOutfit");
	nameBox.setAttribute("value",outfits[selectOutfit.selectedIndex].name);

	var renameButton = makeButton('Rename Outfit');
	renameButton.addEventListener('click', function (){
											var outfits=eval(GM_getValue('outfits'+getUsername(),DEFAULT_OUTFITS));
											outfits[selectOutfit.selectedIndex].name=nameBox.value;
											GM_setValue('outfits'+getUsername(),uneval(outfits));
											selectOutfit.options[selectOutfit.selectedIndex].innerHTML=nameBox.value;
										}, true);
										
	configDiv.appendChild(document.createTextNode(" "));
	configDiv.appendChild(renameButton);
	configDiv.appendChild(document.createTextNode(" "));
	configDiv.appendChild(nameBox);
	
	var addOutfitButton = makeButton('Add Blank Outfit');
	addOutfitButton.addEventListener('click', function (){
											var outfits=eval(GM_getValue('outfits'+getUsername(),DEFAULT_OUTFITS));
											outfits.push({'name':'Outfit '+selectOutfit.length,'items':{}});
											GM_setValue('outfits'+getUsername(),uneval(outfits));
											var option=document.createElement("option");
											option.innerHTML='Outfit'+selectOutfit.length;
											selectOutfit.appendChild(option);
											selectOutfit.selectedIndex=selectOutfit.length-1;
											changeSelectedOutfit();
										}, true);
	var removeOutfitButton = makeButton('Remove Outfit');
	removeOutfitButton.addEventListener('click', function (){
											if (GM_getValue("CO_outfitCount",1)>1) {
												var outfits=eval(GM_getValue('outfits'+getUsername(),DEFAULT_OUTFITS));
												outfits.splice(selectOutfit.selectedIndex,1);
												GM_setValue('outfits'+getUsername(),uneval(outfits));
												selectOutfit.remove(selectOutfit.selectedIndex);
												selectOutfit.selectedIndex=0;
												changeSelectedOutfit();
											}
										}, true);
	configDiv.appendChild(document.createTextNode(" "));
	configDiv.appendChild(addOutfitButton);
	configDiv.appendChild(document.createTextNode(" "));
	configDiv.appendChild(removeOutfitButton);
	configDiv.appendChild(document.createElement("br"));
	var addEquippedOutfitButton=makeButton('Create Outfit from Equipped Items');
	addEquippedOutfitButton.addEventListener('click', function() {
											GM_setValue('getEquip',true);
											mainFunc();
										},true);
										
	
	var heldItemCB=makeCheckbox('addHeldItem','Include held item in outfit');
	heldItemCB.checked=false;
	configDiv.appendChild(addEquippedOutfitButton)
	configDiv.appendChild(heldItemCB)
	
	configDiv.appendChild(makeCheckbox('ignorePets',"Don't unequip Pets",false));
	
	configDiv.appendChild(makeCheckbox('ignoreLantern',"Don't unequip lanterns while underground",false));
	

	// text input: "when do you revert to human?"
	var werewolfTime=document.createElement("input");
	werewolfTime.setAttribute("type","text");
	werewolfTime.setAttribute("size","4");
	werewolfTime.setAttribute("id","werewolfTime");
	werewolfTime.setAttribute("value",GM_getValue('werewolfTime'+getUsername(),'Local time'));
	werewolfTime.addEventListener('change',
			function() {
				GM_setValue('werewolfTime'+getUsername(),werewolfTime.value);
			}
			, true);
	
	// select: "What outfit do you want to wear when you're no longer werewolfy?"
	var werewolfSelectOutfit=document.createElement("select");
	werewolfSelectOutfit.setAttribute("class","controls");
	werewolfSelectOutfit.setAttribute("id","werewolfOutfitSelect");
	werewolfSelectOutfit.addEventListener('change',
			function() {
				GM_setValue('wereOutfit'+getUsername(),werewolfSelectOutfit.selectedIndex);
			}
			, true);
	for (var i=0;i<outfits.length;i++) {
		var option=document.createElement("option");
		option.innerHTML=outfits[i].name;
		werewolfSelectOutfit.appendChild(option);
	}
	if (GM_getValue('wereOutfit'+getUsername(),0) >= GM_getValue('CO_outfitCount',1)) {
		GM_setValue('wereOutfit'+getUsername(),0);
	}
	werewolfSelectOutfit.selectedIndex=GM_getValue('wereOutfit'+getUsername(),0);

	
	configDiv.appendChild(document.createElement("br"));
	configDiv.appendChild(document.createTextNode("Werewolf? "));
	configDiv.appendChild(makeCheckbox('werewolf'+getUsername(),'Equip outfit on timer',false));
	configDiv.appendChild(document.createTextNode("Time to equip outfit (HH:MM): "));
	configDiv.appendChild(werewolfTime);
	configDiv.appendChild(document.createTextNode("Outfit to wear: "));
	configDiv.appendChild(werewolfSelectOutfit);
	
	
	
	configDiv.appendChild(document.createElement("br"));
	configDiv.appendChild(document.createTextNode(" Version "+GM_getValue('scriptVersion')));
	
	configDiv.appendChild(makeCheckbox('debug','Debug Mode',false));
	
	var applyButton = makeButton('Apply Outfit Changes');
	applyButton.addEventListener('click', createOutfit, true);
	configDiv.appendChild(document.createElement("br"));
	configDiv.appendChild(applyButton);
	
	var itemList=document.createElement("div");
	itemList.setAttribute("id","outfitsItemList");
	
	configDiv.appendChild(itemList);
	   configDiv.setAttribute("style","display:none");
	insertAt(box,GM_getValue('display_location','PotatoConsole'));
	
	configDiv.appendChild(locationSelect());
	
}
function getInventorySlotItems(slotName) {
	if (debug) GM_log('entering getSlotItems');
	if (!inv) {
		getInventory('value:nameCount',function(invObj){inv=invObj; getInventorySlotItems(slotName);});
		return;
	}
	var items=new Array();
	var slot;
	for (var i in inv) {
		slot=findSlot(i);
		for (var j=0;j<slot.length;j++) {
			// this is long and awkward because the "other" category has all the one-item things.
			if (slot[j][1]==slotName || (slotName=='other' && (slot[j][1]=='skirt' || slot[j][1]=='tash' || slot[j][1]=='maiden' || slot[j][1]=='crotch' || slot[j][1]=='mirror' || slot[j][1]=='eyeliner' || slot[j][1]=='polish' || slot[j][1]=='snowshoes'))) {
				items.push([(slotName=='pet'?'':'All')+i, inv[i].name]);
			}
		}
	}
	if (slotName=='other') {
		items.push(['Strip_skirt','Take off Skirt']);
		items.push(['Strip_tash','Get rid of ugly Tash']);
		items.push(['Strip_maiden','Remove Iron Maiden']);
		items.push(['Strip_crotch','De-Cod your Piece']);
		items.push(['Strip_mirror','Put away Mirror']);
		items.push(['Strip_eyeliner','Take off Eye Liners']);
		items.push(['Strip_polish','Remove Nail Polish']);
		items.push(['Strip_snowshoes','Take off Snowshoes']);
	}
	else {
		// just add that slot's "clear" command.  Capitalize the first letter of the slot name for display.
		items.push(['Strip_'+slotName,'Strip '+slotName.substr(0,1).toUpperCase()+slotName.substr(1)]);
	}	
	
	for (var i=0;i<items.length;i++) {
		var option=document.createElement('option');
		option.value=items[i][0];
		option.innerHTML=items[i][1];
		$('slotItemSelect').appendChild(option);
	}
	
	return items;
}

function prependTempItem(item) {
	var tempOutfit=eval(GM_getValue('tempOutfit','[]'));
	tempOutfit.unshift(item);
	if (debug) GM_log('ended prependTempItem:'+item);
	GM_setValue('tempOutfit',uneval(tempOutfit));
}
function appendTempItem(item) {
	var tempOutfit=eval(GM_getValue('tempOutfit','[]'));
	tempOutfit.push(item);
	if (debug) GM_log('ended appendTempItem:'+item);
	GM_setValue('tempOutfit',uneval(tempOutfit));
}

var inv;
function updateItemList(invObj)
{
	var config = $("outfitsItemList");
	while (config.hasChildNodes() ) {
		config.removeChild( config.firstChild );
	}

	if (!inv && !invObj) {
		quip('outfitConfig');
		getInventory('value:nameCount',updateItemList);
		return;
	}
	else if (invObj) inv=invObj;
	
	// create a held-item dropdown for the outfit
	var heldSelect = document.createElement("select");
	heldSelect.setAttribute("id",'heldItem');
	var defaultOption = document.createElement("option");
	defaultOption.setAttribute("value","NOTHING");
	defaultOption.innerHTML='No held item for this Outfit';
	heldSelect.appendChild(defaultOption);
	config.appendChild(heldSelect);
	
	var spacer=document.createElement("option");
	spacer.innerHTML='--------------';
	spacer.setAttribute("disabled","disabled");
	heldSelect.appendChild(spacer);
	
	var outfit=eval(GM_getValue('outfits'+getUsername(),DEFAULT_OUTFITS))[selectOutfit.selectedIndex];
	
	var itemTree=clone(EMPTY_SLOTS);
	
	// nab the item dropdown from the webpage
	var foundCannon=0;
	for (var i in inv) {
		// create an option for the "held" item
		var heldOpt = document.createElement("option");
		heldOpt.innerHTML=inv[i].name;
		heldOpt.value=i;
		// alas, the newfangled inventory has no spacers between types.
		heldSelect.appendChild(heldOpt);
		
		if (i=='Caravel') {	// an extra hack to get a caravel cannon as an equippable item.
			heldOpt = document.createElement("option");
			heldOpt.innerHTML="Caravel Cannon";
			heldOpt.value='CaravelCannon';
			heldSelect.appendChild(heldOpt);
			foundCannon+=1;
		}
		if (i=='Tank') {	// an extra hack to get a tank gun as an equippable item.
			heldOpt = document.createElement("option");
			heldOpt.innerHTML="Tank Gun";
			heldOpt.value='TankGun';
			heldSelect.appendChild(heldOpt);
			foundCannon+=1;
		}
		
		if (outfit.heldItem == i) {
			heldSelect.selectedIndex=heldSelect.options.length-1;
			if (debug)GM_log('found the right option, and setting it: '+outfit.heldItem);
		}
		
		// create checkbox for item if it's equippable
		var itemSlots=findSlot(i);
		if (itemSlots[0][0]/*isEquip(opt.value)*/) { // "strip_<slot> always has 0 for the slot size.
			if (!itemTree[itemSlots[0][1]]) {
				itemTree[itemSlots[0][1]]=new Array();
			}
			// yes, create a new object purely for equippable things.  Should be pretty trivial compared to building the held-item select.  We're grouping by location, anyway.
			itemTree[itemSlots[0][1]].push([i,inv[i].name]);
		}
	}
	for (var i in itemTree) {
		if (!itemTree[i]) continue;	// each element starts as 0, for the slot size.
		var groupDiv=document.createElement('div');
		groupDiv.innerHTML=i.substr(0,1).toUpperCase()+i.substr(1)+':';
		config.appendChild(groupDiv);
		for (var j=0;j<itemTree[i].length;j++) {
			config.appendChild(createItemSelect(itemTree[i][j][0], itemTree[i][j][1]));
		}
	}
	endQuip();
}

function createItemSelect(item,desc) {
    var select = document.createElement("div");
    var checkbox = document.createElement("input");
    desc = extractLabel(desc);
    
    checkbox.setAttribute('id', 'CO_' + item);
    checkbox.setAttribute("type","checkbox");
    checkbox.setAttribute("name",item);
	
	var outfit=eval(GM_getValue('outfits'+getUsername(),DEFAULT_OUTFITS))[$('outfitSelect').selectedIndex];
    
    // the only case where we want to "equip N" is with bling; I really don't care about quantum sheep.
	if (findSlot(item)[0][1]=='bling') {
		var radioAll=document.createElement('input');
		radioAll.type='radio';
		radioAll.name=item;
		
		checkbox.name='Multi'+item;
		
		var radioNumber=document.createElement('input');
		radioNumber.type='radio';
		radioNumber.name=item;
		
		var itemCount=document.createElement('input');
		itemCount.type='text';
		itemCount.size='1';
		itemCount.value='default';

		var setRadio=false;
		if (outfit.items[item]!=undefined) {
			checkbox.checked=true;
			if (item.substr(0,3)=='All') {
				radioAll.checked=true;
			}
			else if (!isNaN(parseInt(outfit[item]))){
				radioNumber.checked=true;
				itemCount.value=parseInt(outfit[item]);
			}
		}
		if (!radioAll.checked && !radioNumber.checked) radioAll.checked=true;
		if(itemCount.value=='default') itemCount.value=1;

		
		
		select.appendChild(checkbox);
		select.appendChild(document.createTextNode(desc+' '));
		select.appendChild(radioAll);
		select.appendChild(document.createTextNode('Equip All '));
		select.appendChild(radioNumber);
		select.appendChild(document.createTextNode('Equip Number:'));
		select.appendChild(itemCount);
	}
	// for some items, you want to equip all, or equip one.  Vambraces, winged boots, skis, etc.
	else if ((getSlotSize(findSlot(item)[0][1])==2 || getSlotSize(findSlot(item)[0][1])>=100)&& getSlotSize(findSlot(item)[0][1])!=findSlot(item)[0][0]) {
		var radioAll=document.createElement('input');
		radioAll.type='radio';
		radioAll.name=item;
		
		checkbox.name='All'+item;
		
		var radioOne=document.createElement('input');
		radioOne.type='radio';
		radioOne.name=item;
		
		var setRadio=false;
		if (outfit.items[item]!=undefined) {
			checkbox.checked=true;
			if (item.substr(0,3) == 'All') {
				radioAll.checked=true;
			}
			else {
				radioOne.checked=true;
			}
		}
		if (!radioAll.checked && !radioOne.checked) radioAll.checked=true;

		
		select.appendChild(checkbox);
		select.appendChild(document.createTextNode(desc+' '));
		select.appendChild(radioAll);
		select.appendChild(document.createTextNode('Equip All '));
		select.appendChild(radioOne);
		select.appendChild(document.createTextNode('Equip One'));
	}
	else {
		if (outfit.items[item]!=undefined) checkbox.checked=true;

		var label = document.createElement('label');
		label.appendChild(document.createTextNode(desc));
		label.setAttribute('for', 'outfit_' + item);

		select.appendChild(checkbox);
		select.appendChild(label);
	}
    return select;
}

// called when the user clicks "Update Outfit".
// runs through all of the items in the checkbox list, and pulls the checked items,
// to be equipped.
function createOutfit() {
	var outfitNum=GM_getValue('selectedOutfit',0);
	var items = $("outfitsItemList");
	var cboxes=items.getElementsByTagName("input");
	var newOutfit={'name':$('outfitSelect').options[$('outfitSelect').selectedIndex].innerHTML,'items':{}};
	for (var i=0;i<cboxes.length;i++) {
		// there are two types of nodes here: labels and inputs.  I just want the inputs.  Note that some inputs are radio buttons, and some are textfields.  But each item only has one checkbox.
		if (cboxes[i].type=='checkbox' && cboxes[i].checked) {
			// if a multi-equippable checkbox is checked, then the next three inputs will be EquipAll (radio), EquipNumber (radio), and itemCount (text).
			if (/^Multi/.test(cboxes[i].name)) {
				var equipAll=cboxes[i+1];
				var equipNumber=cboxes[i+2];
				var itemCount=cboxes[i+3];
				
				if (equipAll.checked) {
					newOutfit.items['All'+cboxes[i].name.substr(5)]=1;
					if (debug)GM_log('found all for all/count for outfit: '+cboxes[i].name);
				}
				else {
					var equipCount=parseInt(itemCount.value);
					if (equipCount=='NaN' || equipCount<=0) equipCount=1; // if we didn't get an intelligible number, assume 1.
					newOutfit.items[cboxes[i].name.substr(5)]=equipCount;
					if (debug)GM_log('found '+equipCount+' items for all/count for outfit: '+cboxes[i].name);
				}
			}
			else if (/^All/.test(cboxes[i].name)) {
				var equipAll=cboxes[i+1];
				var equipOne=cboxes[i+2];
				
				if (equipAll.checked) {
					newOutfit.items['All'+cboxes[i].name.substr(3)]=1;
					if (debug)GM_log('found all in all/one for outfit: '+cboxes[i].name);
				}
				else {
					newOutfit.items[cboxes[i].name.substr(3)]=1;
					if (debug)GM_log('found single item in all/one for outfit: '+cboxes[i].name);
				}
			}
			else {
				newOutfit.items[cboxes[i].name]=1;
				if (debug)GM_log('found single item for outfit: '+cboxes[i].name);
			}
		}
	}
	var hold=$('heldItem').options[$('heldItem').selectedIndex].value;
	if (hold!='NOTHING'){
		newOutfit.heldItem=hold;
		if (debug)GM_log('held item: '+$('heldItem').options[$('heldItem').selectedIndex].value);
	}
	
	var allOutfits=eval(GM_getValue('outfits'+getUsername(),DEFAULT_OUTFITS));
	var foundOutfit=false;
	for (var i=0;i<allOutfits.length;i++) {
		if (allOutfits[i].name==newOutfit.name) {
			allOutfits[i]=newOutfit;
			foundOutfit=true;
			break;
		}
	}
	if (!foundOutfit) {
		allOutfits.push(newOutfit);
	}
	GM_setValue('outfits'+getUsername(),uneval(allOutfits));
	
	if (debug)GM_log('outfit created! complete outfit object:'+printObject(allOutfits));

}

var slotSize;

function getSlotSize(slotName) {
	if (!slotSize) {
		slotSize=new Object;
		slotSize.head=1;
		slotSize.ears=2;
		slotSize.body=1;
		slotSize.hands=2;
		slotSize.neck=2;
		slotSize.arms=2;
		slotSize.legs=2;
		slotSize.boat=1;
		slotSize.socks=1;
		slotSize.back=1;
		slotSize.disguise=1;
		slotSize.transport=1;
		slotSize.shoes=2;
		slotSize.glasses=1;
		slotSize.bling=10;
		slotSize.pets=12;
		slotSize.lantern=1;
		slotSize.maiden=1;
		slotSize.crotch=1;
		slotSize.mirror=1;
		slotSize.eyeliner=1;
		slotSize.polish=1;
		slotSize.skirt=1;
		slotSize.zip=2;
		slotSize.tash=1000;
		slotSize.snowshoes=1000; //actually, it's infinite, but 1000 snowshoes oughta be enough for anyone!
	}
	if (slotSize[slotName]) return slotSize[slotName];
	return 0;
}


// determines which slots the temporary outfit uses.  I do not care if any slot goes over capacity.
// ASSUMPTION: the "inv" object has already been filled.
function outfitSlots() {
	var slots=clone(EMPTY_SLOTS);
	
	// loop through all the items in the just-about-to-be-equipped outfit.  Check what slots it fills, and how many we're equipping, and adjust the slots object to reflect that.
	var tempOutfit=eval(GM_getValue('tempOutfit','[]'));
	for (var i=0;i<tempOutfit.length;i++) {
		var item=tempOutfit[i];
		if (tempOutfit[i].substr(0,3)=='All') {
			var realItem=tempOutfit[i].substr(3);
			var itemSlots=findSlot(realItem);
			// if somebody says "equip all bling", then actually count the buggers.  Otherwise, just assume the slot is filled.
			// at the moment, bling is the only really large slot; snowshoes are more of a bug.
			if (getSlotSize(itemSlots[0][1])>2 && getSlotSize(itemSlots[0][1])<100) {
				var itemCount=inv[realItem].count;
				for (var j=0;j<itemSlots.length;j++) {
					// add to slot size
					slots[itemSlots[j][1]]+=itemSlots[j][0]*itemCount;
				}
			}
			else {
				for (var j=0;j<itemSlots.length;j++) {
					slots[itemSlots[j][1]]=getSlotSize(itemSlots[j][1]);
				}
			}
		}
		else {
			var itemSlots=findSlot(item);
			for (var j=0;j<itemSlots.length;j++) {
				slots[itemSlots[j][1]]+=itemSlots[j][0];
			}
		}
	}
	
	return slots;
}

var allStuff=false;
// return the slot name and equip size of the equipment item in question.
function findSlot(invItem) {
	var testItem=invItem.replace(/\..*/,'');//strip the exact number of any custom item.
	//if (debug && testItem!=invItem) GM_log('testing unique item:'+testItem);
	if (!allStuff) {
		if (debug) GM_log('initializing allStuff');
		allStuff=new Object;
		// bling
		allStuff.SafetyPin=[[1,'bling']];
		allStuff.Rivet=[[1,'bling']];
		allStuff.RabbitFoot=[[1,'bling']];
		allStuff.BlingBling=[[1,'bling']];
		allStuff.FireBling=[[1,'bling']];
		allStuff.IceBling=[[1,'bling']];
		allStuff.DiamondBling=[[1,'bling']];
		allStuff.EmeraldBling=[[1,'bling']];
		allStuff.FeatheredBling=[[1,'bling']];
		allStuff.GhastlyBling=[[1,'bling']];
		allStuff.GoldBling=[[1,'bling']];
		allStuff.HealingBling=[[1,'bling']];
		allStuff.LongitudeBling=[[1,'bling']];
		allStuff.IronBling=[[1,'bling']];
		allStuff.MajorHealingBling=[[1,'bling']];
		allStuff.MercuryBling=[[1,'bling']];
		allStuff.MisrilBling=[[1,'bling']];
		allStuff.MoonStoneBling=[[1,'bling']];
		allStuff.RubyBling=[[1,'bling']];
		allStuff.OnyxBling=[[1,'bling']];
		allStuff.OpalBling=[[1,'bling']];
		allStuff.SunStoneBling=[[1,'bling']];
		allStuff.OneBling=[[1,'bling']];
		allStuff.LatitudeBling=[[1,'bling']];
		allStuff.WatchBling=[[1,'bling']];
		allStuff.WeddingRing=[[1,'bling']];
		allStuff.Hamulet=[[1,'bling']];
		allStuff.AmuletOfEndor=[[1,'bling']];
		allStuff.Zip=[[1,'bling'],[1,'zip']];
		allStuff.SpringBling=[[1,'bling']];
		allStuff.Strip_bling=[[0,'bling']];
		// hands
		allStuff.LeatherGlove=[[1,'hands']];
		allStuff.Gauntlet=[[1,'hands']];
		allStuff.WoollyGlove=[[1,'hands']];
		allStuff.Strip_hands=[[0,'hands']];
		// head
		allStuff.Bascinet=[[1,'head'],[1,'ears']];
		allStuff.Sallet=[[1,'head'],[1,'ears']];
		allStuff.QuantumHelm=[[1,'head']];
		allStuff.MinersHat=[[1,'head']];
		allStuff.LitMinersHat=[[1,'head']];
		allStuff.Strip_head=[[0,'head']];
		//ears
		allStuff.BunnyEars=[[2,'ears']];
		allStuff.EarMuffs=[[2,'ears']];
		allStuff.Strip_head=[[0,'ears']];
		// mostly body
		allStuff.LeatherCuirass=[[1,'body']];
		allStuff.MailOnSunday=[[1,'body']];
		allStuff.DailyMail=[[1,'body']];
		allStuff.LeatherJacket=[[1,'body'],[2,'arms']];
		allStuff.BronzeScale=[[1,'body']];
		allStuff.Hauberk=[[1,'body'],[2,'arms']];
		allStuff.Haubergeon=[[1,'body']];
		allStuff.Apron=[[1,'body']];
		allStuff.Jumper=[[1,'body']];
		allStuff.JumperBad=[[1,'body']];
		allStuff.JumperWorse=[[1,'body']];
		allStuff.CustomShirt=[[1,'body']];
		allStuff.ShirtFLA=[[1,'body']];
		allStuff.Shirt242 =[[1,'body']];
		allStuff.ShirtSexPistols =[[1,'body']];
		allStuff.ShirtSisters =[[1,'body']];
		allStuff.ShirtBauhaus =[[1,'body']];
		allStuff.ShirtOldBauhaus =[[1,'body']];
		allStuff.ShirtOldFLA =[[1,'body']];
		allStuff.ShirtOldRamones =[[1,'body']];
		allStuff.ShirtRamones =[[1,'body']];
		allStuff.ShirtOldSexPistols =[[1,'body']];
		allStuff.ShirtOldSisters =[[1,'body']];
		allStuff.ShirtPinkPWEI =[[1,'body']];
		allStuff.ShirtOldPinkPWEI =[[1,'body']];
		allStuff.ShirtPWEI =[[1,'body']];
		allStuff.ShirtOldPWEI =[[1,'body']];
		allStuff.Shirt=[[1,'body']];
		allStuff.QuantumJumper=[[1,'body'],[2,'arms']];
		allStuff.Anorak=[[1,'body'],[2,'arms']];
		allStuff.Strip_body=[[0,'body']];
		// neck
		allStuff.LeatherGorget=[[2,'neck']];
		allStuff.ScarfShort=[[1,'neck']];
		allStuff.Aventail=[[2,'neck']];
		allStuff.AmuletOfEndor=[[2,'neck']];
		allStuff.TimeScarf=[[2,'neck']];
		allStuff.Scarf=[[2,'neck']];
		allStuff.SealStole=[[1,'neck']];
		allStuff.QuantumScarf=[[2,'neck']];
		allStuff.Strip_neck=[[0,'neck']];
		// legs
		allStuff.LeatherGreave=[[1,'legs']];
		allStuff.Chausse=[[1,'legs']];
		allStuff.BronzeGreave=[[1,'legs']];
		allStuff.ShinPad=[[1,'legs']];
		allStuff.ManchesterShinPad=[[1,'legs']];
		allStuff.ArsenalShinPad=[[1,'legs']];
		allStuff.BoltonShinPad=[[1,'legs']];
		allStuff.QuantumLegwarmer=[[1,'legs']];
		allStuff.ArmyTrousers=[[2,'legs']];
		allStuff.ArmyRivetTrousers=[[2,'legs']];
		allStuff.KneePad=[[1,'legs']];
		allStuff.Strip_legs=[[0,'legs']];
		// socks
		allStuff.Socks=[[1,'socks']];
		allStuff.FishNets=[[1,'socks']];
		allStuff.Strip_socks=[[0,'socks']];
		// back
		allStuff.Wings=[[1,'back']];
		allStuff.SealCoat=[[1,'back']];
		allStuff.TribbleCoat=[[1,'back']];
		allStuff.DusterCoat=[[1,'back']];
		allStuff.GreenSuit=[[1,'back'],[2,'arms'],[2,'legs']];
		allStuff.Strip_back=[[0,'back']];
		// arms
		allStuff.BronzeVambrace=[[1,'arms']];
		allStuff.LeatherVambrace=[[1,'arms']];
		allStuff.Strip_arms=[[0,'arms']];
		// transport
		allStuff.AirShip=[[1,'transport']];
		allStuff.Caravel=[[1,'transport']];
		allStuff.Ferry=[[1,'transport']];
		allStuff.MagicCarpet=[[1,'transport']];
		allStuff.Raft=[[1,'transport']];
		allStuff.Boat=[[1,'transport']];
		allStuff.SurveyVessel=[[1,'transport']];
		allStuff.SpeedBoat=[[1,'transport']];
		allStuff.SpeederBike=[[1,'transport']];
		allStuff.Tank=[[1,'transport']];
		allStuff.VirtuousVessel=[[1,'transport']];
		allStuff.Rib=[[1,'transport']];
		allStuff.Zodiac=[[1,'transport']];
		allStuff.Trawler=[[1,'transport']];
		allStuff.Strip_transport=[[0,'transport']];
		// disguise
		allStuff.SmilerMask=[[1,'disguise']];
		allStuff.SparticusMask=[[1,'disguise']];
		allStuff.Sheet=[[1,'disguise']];
		allStuff.TroutMask=[[1,'disguise']];
		allStuff.TroutMaskReplica=[[1,'disguise']];
		allStuff.SpockEars=[[1,'disguise']];
		allStuff.DisguiseKit=[[1,'disguise']];
		allStuff.Strip_disguise=[[0,'disguise']];
		// lantern
		allStuff.OilLantern=[[1,'lantern']];
		allStuff.GasLantern=[[1,'lantern']];
		allStuff.Strip_lantern=[[0,'lantern']];
		// glasses
		allStuff.BardGoggles=[[1,'glasses']];
		allStuff.BebeGoggles=[[1,'glasses']];
		allStuff.BeerGoggles=[[1,'glasses']];
		allStuff.FieldGlasses=[[1,'glasses']];
		allStuff.ReadingGlasses=[[1,'glasses']];
		allStuff.Shades=[[1,'glasses']];
		allStuff.SnowGoggles=[[1,'glasses']];
		allStuff.BortGoggles=[[1,'glasses']];
		allStuff.RoseTintedShades=[[1,'glasses']];
		allStuff.MagicSpecs=[[1,'glasses']];
		allStuff.Scouter=[[1,'glasses']];
		allStuff.Strip_glasses=[[0,'glasses']];
		// shoes
		allStuff.LeatherBoot=[[1,'shoes']];
		allStuff.BunnySlipper=[[1,'shoes']];
		allStuff.FlyingBoot=[[1,'shoes']];
		allStuff.DrMartins=[[2,'shoes']];
		allStuff.Trainers2=[[2,'shoes']];
		allStuff.Trainers3=[[2,'shoes']];
		allStuff.MagicBoots=[[2,'shoes']];
		allStuff.PointyBoots=[[2,'shoes']];
		allStuff.Ski=[[1,'shoes']];
		allStuff.Strip_shoes=[[0,'shoes']];
		// pets
		allStuff.Ferret=[[4,'pets']];
		allStuff.GoldFish=[[1,'pets']];
		allStuff.Kittin=[[3,'pets']];
		allStuff.DogBot=[[4,'pets']];
		allStuff.Peeve=[[1,'pets']];
		allStuff.DungBeetle=[[5,'pets']];
		allStuff.PetRock=[[1,'pets']];
		allStuff.Goose=[[1,'pets']];
		allStuff.Pwny=[[4,'pets'],[1,'transport']];
		allStuff.Elephant=[[1,'pets'],[1,'transport']];
		allStuff.Sheep=[[2,'pets']];
		allStuff.ElectricSheep=[[1,'pets']];
		allStuff.Mayfly=[[1,'pets']];
		allStuff.Hamster=[[1,'pets']];
		allStuff.PetMinrilax=[[1,'pets']];
		allStuff.Familiar=[[2,'pets']];
		allStuff.Dragon=[[1,'pets'],[1,'transport']]; // Dragons come in many flavors.  Manage your own damn equipment!
		allStuff.Strip_pet=[[0,'pets']];
		// other/unique
		allStuff.Mirror=[[1,'mirror']];
		allStuff.Snowshoes=[[1,'snowshoes']];
		allStuff.BlackEyeLiner=[[1,'eyeliner']];
		allStuff.BlackNailPolish=[[1,'polish']];
		allStuff.CodPiece=[[1,'crotch']];
		allStuff.IronMaiden=[[1,'maiden']];
		allStuff.Tash=[[1,'tash']];
		allStuff.LongSkirt=[[1,'skirt']];
		allStuff.Skirt=[[1,'skirt']];
		allStuff.ShortSkirt=[[1,'skirt']];
		allStuff.MiniSkirt=[[1,'skirt']];
		allStuff.BeltSkirt=[[1,'skirt']];
		allStuff.Strip_mirror=[[0,'mirror']];
		allStuff.Strip_snowshoes=[[0,'snowshoes']];
		allStuff.Strip_eyeliner=[[0,'eyeliner']];
		allStuff.Strip_polish=[[0,'polish']];
		allStuff.Strip_crotch=[[0,'crotch']];
		allStuff.Strip_maiden=[[0,'maiden']];
	}
	if (allStuff[testItem]) {
		//if (debug)GM_log(allStuff[testItem]);
		return allStuff[testItem];
	}
	
	return [[0,'none']];
}


function startStripping() {
	GM_setValue('collectStripInfo',true);
	GM_setValue('tempUnequip',true);
	mainFunc();
}

function startDressing(outfitNum, werewolf) {
	if (outfitNum==undefined) outfitNum=selectOutfit.selectedIndex;
	if (werewolf==undefined) werewolf=false;
	if (debug) GM_log('start dressing: outfit number = '+outfitNum);
	
	// fetch the inventory if it doesn't exist yet.
	if (!inv) {
		getInventory('value:nameCount',function(invObj){inv=invObj; startDressing(outfitNum,werewolf);});
		return;
	}
	
	var outfit=eval(GM_getValue('outfits'+getUsername(),DEFAULT_OUTFITS))[outfitNum];
	GM_setValue('collectStripInfo',true);
	GM_setValue('stripping',true);
	GM_setValue('dressing',true);
	GM_setValue('tempUnequip',GM_getValue('clearSlot',true));
		
	// for cases where we equip several items individually, break them into parts first.
	var equips=new Array();
	for (var i in outfit.items) {
		for (var j=0;j<outfit.items[i];j++) {
			equips.push(i);
		}
	}
	// ah, the joys of pre-sorting things.  If it's one of the few possible glowing items, then check to see if it's glowing.  If so, then it goes to the front of the list.  If not, then it gets thrown from the outfit.
	var sortedEquips=[];
	for (var i=0;i<equips.length;i++) {
		if (debug) GM_log('pre-processing:'+equips[i]);
		var testEquip=equips[i];
		if (/^All/.test(testEquip)) testEquip=testEquip.substr(3);
		if (isGlowItem(testEquip)) {
			if (inv[testEquip].name.substr(0,8)=='Glowing ') sortedEquips.unshift(equips[i]);
			else {
				if(debug)GM_log('found item, but wasn\'t glowing');
			}
		}
		else {
			sortedEquips.push(equips[i]);
			if (debug) GM_log('item appended');
		}
	}
	
	GM_setValue('tempHeldItem',outfit.heldItem?outfit.heldItem:'NOTHING');
	GM_setValue('tempOutfit',uneval(sortedEquips));
	
	if (werewolf) location.href=(location.href.split('#')[0]).split('?')[0];
	else mainFunc();
}

function dress() {
	var tempOutfit=eval(GM_getValue('tempOutfit','[]'));
	if (debug)GM_log('itemCount: '+tempOutfit.length);
	if (tempOutfit.length==0) {
		GM_setValue('dressing', false);
		if (debug)GM_log('done dressing');
		
		// And finally, equip the held item, if any.
		var targetItem=GM_getValue('tempHeldItem','NOTHING')
		if (targetItem!='NOTHING') {
			holdItem(targetItem);
		}
		else {
			cancelBox();
		}
	}
	else {
		var all=tempOutfit[0].substr(0,3)=='All';
		var equip='?item='+(all?tempOutfit[0].substr(3):tempOutfit[0])+'&act_item_equip'+(all?'all':'')+'=1';
		tempOutfit.shift();
		GM_setValue('tempOutfit',uneval(tempOutfit));
		location.href=location.href.split('?')[0].split('#')[0]+equip;
	}
}

























function countEquipment() {
	var equipDiv=$('equipment');
	
	if (equipDiv==null) return 0;	//if we didn't find equipment, there ain't none.
	
	var equipHTML=equipDiv.innerHTML;
	var numRegEx=/\d{1,3}/;  //we can get away with this because the number of equipped items is the first thing displayed.
	var numEquipped=numRegEx.exec(equipHTML);
	if (debug)GM_log('amount of equipment: '+numEquipped+' raw value: '+$('equipment').innerHTML);
	return parseInt(numEquipped);
}

function collectStripInfo(equipmentDiv) {
	var inputs=equipmentDiv.getElementsByTagName('input');
	if (debug)GM_log('number of form[0] elements: '+document.forms[0].elements.length+'  Viewport inputs: '+inputs.length);
	var unequipRegEx=/unequip/;
	var multiRegEx=/unequipall/;
	var inputName;
	
	// Step 1 of culling: compare what we're wearing and what we're equipping, and unequip things that conflict.  Or just unequip it all if it's that kind of thing.
	var wearSlots=outfitSlots();
	//if (debug) for (var i in wearSlots) GM_log('wearSlots('+i+'):'+wearSlots[i]+' getSlotInfo('+i+'):'+getSlotInfo(equipmentDiv,i));
	for (var i in wearSlots) {
		if (debug) GM_log('testing outfitslots:'+i+' slot size:'+getSlotSize(i)+' total slots:'+(getSlotInfo(equipmentDiv, i)+wearSlots[i]));
		if (getSlotInfo(equipmentDiv, i)+wearSlots[i]>getSlotSize(i) || GM_getValue('tempUnequip',false)) {
			addSlotToUnequip(equipmentDiv, i);
		}
	}
	if (debug) GM_log('after collecting unequips:'+GM_getValue('unequips'));
	var stripCompare;
	var dressCompare;
	var stripItemRegEx=/[^_]*(?=_unequip)/;
	
	var unequips=eval(GM_getValue('unequips','[]'));
	var equips=eval(GM_getValue('tempOutfit','[]'));
	
	// step 2 of culling: disallow the unequipping of pets, disguise kits, and lanterns (while underground).
	if (debug)GM_log('beginning pet compare.  Strip count: '+unequips.length+' Temp Equip Count: '+equips.length);
	// remove all pets from stripping if we aren't removing pets.
	for (var k=0;k<unequips.length;k++) {
		stripCompare=unequips[k];
		stripCompare=stripItemRegEx.exec(stripCompare);
		if (debug) GM_log('testing for pet: '+stripCompare);
		if ((isPet(stripCompare) && GM_getValue('ignorePets', false)) || 'DisguiseKit'==stripCompare || (!haveGPS() && (stripCompare=='GasLantern'||stripCompare=='OilLantern') && GM_getValue('ignoreLantern',false))) {
			unequips.splice(k,1);
			if (debug)GM_log('Pet found!  not stripping '+unequips[k]);
			k-=1;
			
			// if we're not stripping it, then don't equip it, either.
			for (var m=0;m<equips.length;m++) {
				var dressCompare=equips[m];
				if (dressCompare.substr(0,3)=='All') {
					dressCompare=dressCompare.substr(3);
				}
				if (dressCompare==stripCompare) {
					while (equips[m]==dressCompare) equips.splice(m,1);
				}
			}
		}
	}
		
	// step 3 of culling: don't strip anything we're going to wear later, and don't equip anything we're already wearing.  (unless it's an "equip all" command)
	if (debug)GM_log('beginning equip-list compare.  Strip count: '+unequips.length+' Temp Equip Count: '+equips.length);
	// if we're dressing, don't strip anything we need to wear later.
	if (GM_getValue('dressing',false)) {
		var outfitNum=('GM_selectedOutfit',0);
		for (var j=0;j<equips.length;j++) {
			for (var k=0;k<unequips.length;k++) {
				stripCompare=unequips[k];
				dressCompare=equips[j];
				
				var equipAll=false, equipSome=false;
				if (dressCompare.substr(0,3)=='All') {
					dressCompare=dressCompare.substr(3);
					equipAll=true;
				}
				var equipCount=0;
				for (var z=j;z<equips.length;z++) {
					if (equips[z]==dressCompare) equipCount++;
					else break;
				}
				if (equipCount>1) equipSome=true;
				var unequipAll=multiRegEx.test(stripCompare);
				//if (debug) GM_log('stripCompare: '+stripCompare+' unequipAll:'+unequipAll);
				
				stripCompare=stripItemRegEx.exec(stripCompare);
				//if (debug)GM_log('ignore strip? comparing '+GM_getValue('CO_stripName'+k,0)+' and '+GM_getValue('CO_tempItem'+j,'') +' as '+stripCompare+' and '+dressCompare);
				if (stripCompare==dressCompare) {
					// now there's an exception: if we want to wear one item, and we're wearing multiple, then strip.  Also strip if we want to wear an exact number of some item.
					if ((!unequipAll || equipAll) && !equipSome) {
						// if we're not taking it off, then remove it from the stripping array.
						if (debug)GM_log('Duplicate found!  not stripping '+unequips[k]);
						unequips.splice(k,1);
					}
					else if (debug) GM_log('decided NOT to strip an item, because we\'re not wearing multiple, and we\'re equipping one or more.');
					
					// if we're wearing some number of the item, and we need to be wearing ALL of the item, check if
					// we have any of the item in inventory.  If so, don't  remove the item from the dress commands.
					var stillDressing=false;
					if (equipAll && inv[dressCompare]) {
						if (debug) GM_log('We\'re wearing it already, but we can still wear more!  (I think)');
						stillDressing=true;
					}
					if (unequipAll && !equipAll || equipSome) stillDressing=true;
					
					// and then remove it from the dressing array, too.
					if (!stillDressing) {
						// it's possible that we'll have a Multi-equip command here.  If so, remove ALL of the identical commands.  Guarantee at least one removal, so we catch All<item> equips.
						if (debug)GM_log('Duplicate found!  Also not wearing '+equips[j]);
						do equips.splice(j,1);
						while (equips[j]==dressCompare); 
						j=j-1;	// we just shuffled the array back one space, so re-check the current array location.
					}
					
					break;
				}
			}
		}
	}
	
	
	GM_setValue('collectStripInfo',false);
	
	if (GM_getValue('tempHeldItem','NOTHING')=='NOTHING' && equips.length==0) {
		GM_setValue('dressing',false);
		cancelBox();
	}
	
	GM_setValue('unequips',uneval(unequips));
	GM_setValue('tempOutfit',uneval(equips));
	
	if (debug)GM_log('stripCount: '+unequips.length + ' strip? '+GM_getValue('stripping',false)+' collectInfo? '+GM_getValue('collectStripInfo',false)+' heldItem: '+GM_getValue('tempHeldItem','NOTHING'));

	if (unequips.length==0) {
		GM_setValue('stripping', false);
		if (GM_getValue('dressing')) {
			mainFunc();
		}
	}
	else {
		if (debug)GM_log('found equipment, stripping begun');
		GM_setValue('stripping',true);
		mainFunc();
	}
	
}

function goToInfo(equipDivFunc,noEquipFunc) {
	var numEquips = countEquipment();
	// what screen are we on, again?
	if (debug)GM_log('checking screen');
	var onEquipmentScreen=document.getElementsByTagName('h1');
	if (debug)GM_log('found '+onEquipmentScreen.length);
	if (onEquipmentScreen.length==0) {
		if (debug)GM_log('found normal screen, clicking equip');
		// if we're not looking at the equipment pane, go there.
		var equipButton = document.forms.namedItem('controls').elements.namedItem('act_view_equip');
		var equipPaneButton=document.forms.namedItem('controls').elements.namedItem('act_eqpane');
		if (equipButton) {
			equipButton.click();
		}
		// because SOME PEOPLE (everyone but me, apparently) view their equipment in the side panel.
		else if (equipPaneButton) {
			if (debug) GM_log('found equipment pane on screen');
			equipDivFunc($('equipment'));
		}
		else {
			// if we can't find an equipment button, we aren't wearing anything.  Skip to dressing.
			if (debug) GM_log('nothing equipped, trying the no-equip function');
			noEquipFunc();
		}
	}
	else {
		if (debug)GM_log('found equipment screen.');
		equipDivFunc($('control_pane'));
	}
}

function noEquipStrip() {
	if (debug)GM_log('could not find equip button, already naked.');
	GM_setValue('collectStripInfo',false);
	GM_setValue('stripping',false);
	if (GM_getValue('tempHeldItem','NOTHING')=='NOTHING' && eval(GM_getValue('tempOutfit','[]')).length==0) {
		GM_setValue('dressing',false);
		cancelBox();
		if (debug) GM_log('nothing to wear.  I quit!');
	}
	else {
		mainFunc();
	}
}

// this is called once per page refresh when stripping.  I'd make this timed, but all timing variables get deleted
// with every refresh, and taking off an item refreshes the page.
function strip() {
	var unequips=eval(GM_getValue('unequips','[]'));
	if (unequips.length==0) {
		if (debug)GM_log('done stripping, dressing started');
		// if we're done stripping, stop before we kill something.
		GM_setValue('collectStripInfo',false);
		GM_setValue('stripping',false);
		if (debug)GM_log('dressing: '+GM_getValue('dressing'));
		mainFunc();  //if we're dressing, go back and do that.
		return;
	}
	var unequip='?'+unequips[0]+'=1';
	if (debug) GM_log('clicking STRIP: '+unequips[0]);
	unequips.shift();
	GM_setValue('unequips',uneval(unequips));
	location.href=((location.href.split('?')[0]).split('#')[0])+unequip;
}










function collectEquipInfo(equipmentDiv) {
	var inputs=equipmentDiv.getElementsByTagName('input');
	if (debug)GM_log('number of form[0] elements: '+document.forms[0].elements.length+'  Viewport inputs: '+inputs.length);
	var unequipRegEx=/unequip/;
	var multiRegEx=/unequipall/;
	var inputName;
	GM_setValue('CO_stripCount', 0);
	
	var items=new Array();
	var itemRegEx=/([^_]*)_unequip/;
	
	// read over all the viewport buttons, and collect all the "unequip" thingummies.
	// If there's an "unequip all", ignore the "unequip" for that item.
	for (i=0;i<inputs.length ;i++) {
		if (debug)GM_log('input '+i+': '+inputs[i].name);
		inputName=inputs[i].name;
		if (unequipRegEx.test(inputName)) {
			if (i+1<inputs.length && multiRegEx.test(inputs[i+1].name)) {
				if (debug)GM_log('input '+i+': '+inputs[i+1].name + ' added to multiUnequips');
				var item='All'+itemRegEx.exec(inputs[i+1].name)[1];
				items.push(item);
				i++;
			}
			else {
				if (debug)GM_log('input '+i+': '+inputs[i].name + ' added to singleUnequips');
				items.push(itemRegEx.exec(inputs[i].name)[1]);
			}
		}
	}
	if (debug) GM_log('initial unequipping list:'+items);
	// now that we're done reading, if we found something, build the outfit.
	if (items.length || GM_getValue('addHeldItem',false)) {
		var newOutfit={'name':'Outfit '+selectOutfit.length,'items':{}};
		var option=document.createElement("option");
		GM_setValue('CO_outfitName'+outfitNum,'Outfit '+selectOutfit.length);
		option.innerHTML=newOutfit.name;
		if (GM_getValue('addHeldItem',false)) {
			newOutfit.heldItem=getHeldItemValue();
		}
		
		for (var i=0;i<items.length;i++) {
			newOutfit.items[items[i]]=1;
		}
		
		selectOutfit.appendChild(option);
		selectOutfit.selectedIndex=selectOutfit.length-1;
	}
	GM_setValue('getEquip',false);
	mainFunc();
}

function noEquipInfo() {
	// if there's nothing equipped, and only an item to hold, then make that outfit.  Otherwise, just ignore the request.
	if (GM_getValue('addHeldItem',false)) {
		var newOutfit={'name':'Outfit '+selectOutfit.length,'items':{},'heldItem':getHeldItemValue()};
		var outfits=GM_getValue('outfits'+getUsername(),DEFAULT_OUTFITS);
		outfits.push(newOutfit);
		GM_setValue('outfits'+getUsername(),outfits);
		var option=document.createElement("option");
		option.innerHTML=GM_getValue('CO_outfitName'+selectOutfit.length);
		selectOutfit.appendChild(option);
		selectOutfit.selectedIndex=selectOutfit.length-1;
	}
}


function noEquipSlot() {
	if (debug) GM_log('slot equippage: equipment not found.');
	GM_setValue('collectSlotInfo',false);
	GM_setValue('stripping',false);
	// if the only command was to strip, then just quit.
	var outfit=eval(GM_getValue('tempOutfit','[]'));
	if (outfit.length==0 || /^Strip_/.test(outfit[0])) {
		GM_setValue('dressing',false);
		cancelBox();
		if (debug) GM_log('nothing to wear.  I quit!');
	}
	// otherwise, on with the dressing!
	else {
		mainFunc();
	}
}

//slot name(s) will be determined by the item being equipped, which is in CO_tempItem0
function equipSlot(equipDiv) {
	if (debug) GM_log('entering equipSlot');
	var equipItem=eval(GM_getValue('tempOutfit','["NOTHING"]'));
	equipItem=equipItem[0];
	var slots=outfitSlots();
	GM_setValue('unequips','[]');
	var stripItem=/Strip_(.*)/.exec(equipItem);
	if (debug) GM_log('slots for equipItem:'+printObject(slots));
	for (var i in slots) {
		var slotsTaken=getSlotInfo(equipDiv, i);
		// if equipping that slot would take us over the slot size, OR we decided to unequip the slot, then look for stuff to unequip.
		if ((stripItem && stripItem[1]==i) || (slots[i]>0 && (GM_getValue('clearSlot',true) || slotsTaken+slots[i]>getSlotSize(i)))) {
			if (debug) GM_log('unequipping slot because either clearSlot is true:'+GM_getValue('clearSlot',true)+' or the item starts with "Strip_":'+/^Strip_/.test(equipItem)+' or slotsTaken:'+slotsTaken+' + slots[i]:'+slots[i]+' is greater than getSlotSize(i):'+getSlotSize(i));
			addSlotToUnequip(equipDiv, i);
		}
	}
	
	// wrap up the stripping: set the iterator, clear the "collect info" flag, check whether we're actually doing any dressing.
	GM_setValue('collectSlotInfo',false);

	if (stripItem) {
		GM_setValue('dressing',false);
		cancelBox();
	}
	
	// if we're not stripping, we're not getting dressed, and we're not even going to hold an item (this should only happen when the player wants to equip an empty outfit while wearing nothing), just quit.
	if (eval(GM_getValue('unequips','[]')).length<=0) {
		GM_setValue('stripping', false);
		if (GM_getValue('dressing')) {
			mainFunc();
		}
		else cancelBox();
	}
	else {
		if (debug)GM_log('found equipment slot, stripping begun');
		GM_setValue('stripping',true);
		mainFunc();
	}
}

function getSlotInfo(equipDiv,slotName) {
	//if (debug) GM_log('entering getSlotInfo');
	var inputs=equipDiv.getElementsByTagName('input');
	var unequipRegEx=/unequip/;
	var multiRegEx=/unequipall/;
	var inputName;
	var countRegEx=/ x (\d+):/;
	var itemRegEx=/([^_]*)_unequip/;
	var slotTaken=0;
	var equipName;
	var equipCount;
	// read over all the viewport buttons, and collect all the "unequip" thingummies.
	// If there's an "unequip all", ignore the "unequip" for that item.
	for (i=0;i<inputs.length ;i++) {
		//if (debug)GM_log('input '+i+': '+inputs[i].name);
		inputName=inputs[i].name;
		if (unequipRegEx.test(inputName)) {
			if (i+1<inputs.length && multiRegEx.test(inputs[i+1].name)) {
				equipName=itemRegEx.exec(inputs[i+1].name)[1];
				equipCount=parseInt(countRegEx.exec(inputs[i].parentNode.firstChild.innerHTML)[1]);
				//if (debug)GM_log('input '+i+': '+inputs[i+1].name + ' found in equip (multiple, count '+equipCount+')');
				i++;
			}
			else {
				//if (debug)GM_log('input '+i+': '+inputs[i].name + ' found in equip');
				equipName=itemRegEx.exec(inputs[i].name)[1];
				equipCount=1;
			}
		}
		// if the input we found wasn't equipment, then it's one of the other miscellaneous buttons.
		else {
			equipName='nothing';
			equipCount=0;
			//if (debug) GM_log('equip was nothing.');
		}
		var itemSlot=findSlot(equipName);
		for (var j=0;j<itemSlot.length;j++) {
			if (itemSlot[j][1]==slotName) {
				slotTaken+=itemSlot[j][0]*equipCount;
				//if (debug) GM_log('getSlotInfo: slot ('+slotName+') taken by '+equipName+' of size '+itemSlot[j][0]*equipCount+' and slot '+itemSlot[j][1]);
			}
		}
	}
	return slotTaken;
}

// given a single slotName, adds all items in equipDiv to the unequips that match that slot.
function addSlotToUnequip(equipDiv,slotName) {
	if (debug) GM_log('entering addSlotToUnequip');
	var inputs=equipDiv.getElementsByTagName('input');
	var unequipRegEx=/unequip/;
	var multiRegEx=/unequipall/;
	var inputName;
	var countRegEx=/ x (\d+):/;
	var itemRegEx=/([^_]*)_unequip/;
	var slotTaken=0;
	
	var unequips=eval(GM_getValue('unequips','[]'));

	// read over all the viewport buttons, and collect all the "unequip" thingummies.
	// If there's an "unequip all", ignore the "unequip" for that item.
	for (i=0;i<inputs.length ;i++) {
		//if (debug)GM_log('input '+i+': '+inputs[i].name);
		inputName=inputs[i].name;
		if (unequipRegEx.test(inputName)) {
			if (i+1<inputs.length && multiRegEx.test(inputs[i+1].name)) {
				//if (debug)GM_log('input '+i+': '+inputs[i+1].name + ' added to multiUnequips');
				var equipName=itemRegEx.exec(inputs[i+1].name)[1];
				var equipCount=parseInt(countRegEx.exec(inputs[i].parentNode.firstChild.innerHTML)[1]);
				i++;
			}
			else {
				//if (debug)GM_log('input '+i+': '+inputs[i].name + ' added to singleUnequips');
				var equipName=itemRegEx.exec(inputs[i].name)[1];
				var equipCount=1;
			}
			var itemSlot=findSlot(equipName);
			for (var j=0;j<itemSlot.length;j++) {
				if (itemSlot[j][1]==slotName) {
					// multiple-slot items can end up getting unequipped twice.  If what I'm unequipping is already being unequipped, then don't add this unequip.
					if (unequips.indexOf(inputs[i].name)!=-1) {
						if (debug) GM_log('not unequipping '+inputs[i].name+' because it is already being unequipped.');
						break;
					}
					// side note: i is exactly what it should be; if it's a multiple-unequip, i has already been incremented.
					unequips.push(inputs[i].name);
					if (debug) GM_log(inputs[i].name+' will be unequipped by addSlotToUnequip because its slot-name '+itemSlot[j][1]+' is the same as slotName '+slotName);
				}
			}
		}
	}
	GM_setValue('unequips',uneval(unequips));
}

//======================================================================
