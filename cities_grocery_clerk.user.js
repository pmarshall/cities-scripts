// ==UserScript==
// @name           Cities Grocery Clerk
// @namespace      http://potatoengineer.110mb.com/
// @description    It puts things in your bags!
// @include        http://cities.totl.net/cgi-bin/game*
// @include        http://carmilla.ecs.soton.ac.uk:8080/cgi-bin/game*
// @require	http://potatoengineer.110mb.com/cities_potatolibrary.user.js
// ==/UserScript==
//
// Created by Paul Marshall, a.k.a. PotatoEngineer, a.k.a. Cor
// The WTH EULA applies to this script: you may do WHATEVER THE HELL YOU WANT to it.
//
// This script stuffs your stuff into bags, to keep your page-loads fast.  To use it, open the configuration
// panel, check everything you want it to bag (and which bag it goes into), and click BAG IT ALL! to de-clutter your inventory.
// This script effectively replaces the Sorting Office, but the GLs minded that so very little that they allowed bulk-bagging.
//
// Version 1.2: Reduced page-loads even further, added quips.
//
// Version 1.11: PotatoLibrary update.
//
// Version 1.1: Newfangled interface compatibility!
//
// Version 1.02: Debugged bagging a single bag.
//
// Version 1.01: Script no longer repeats endlessly if you ask to bag an unbaggable item.
//
// Version 1.0: puts things in bags.  Manages separate bags individually, coded by internal item name, and for separate characters.

//VARIABLES:
// GLOBAL:
//bagging: BOOLEAN: whether we're bagging at the moment
//bagsToBag: uneval'd array of bag codes to bag.  Will get spliced into emptiness as bagging progresses.
//bags+getUsername(): uneval'd array of {"code":<bagCode>,"name":<bagDescription>} objects
//<internal code of bag>: uneval'd array of {"code":<itemCode>,"name":<itemDescription>} objects

GM_setValue('scriptVersion','1.2');
var debug=GM_getValue('debug',false);

if (debug) GM_log('bags:'+GM_getValue('bags'+getUsername())+'  bagsToBag:'+GM_getValue('bagsToBag'));

doIt();

function doIt() {
	checkUpdates('Grocery Clerk','clerk','cities_grocery_clerk.user.js');
	cancelBox();
	if (GM_getValue('bagging',false)) bag();
	createInterface();
	cancelBox()
}

// either creates or destroys the cancel div, as appropriate. 
function cancelBox() {
	
	var cancelDiv=$('cancelBagger');
	if (!cancelDiv && GM_getValue('bagging')) {
		var cancelDiv=makeBox('Grocery Clerk: ','cancelBagger');
		
		var cancelButton=makeButton('Stop baggin\' on your stuff');
		cancelButton.addEventListener('click', 
				function() {
					GM_setValue('bagging', false);
					document.body.removeChild($('cancelBagger'));
				}, true);
		cancelDiv.appendChild(cancelButton);
		document.body.insertBefore(cancelDiv, document.body.firstChild);
	}
	else if (cancelDiv && !GM_getValue('bagging') ) {
		document.body.removeChild(cancelDiv);
	}
}

function bag() {
	var bagsToBag=eval(GM_getValue('bagsToBag','[]'));
	// if we're past the end of the bag-bagging queue, quit.
	if (bagsToBag.length==0) {
		GM_setValue('bagging',false);
		if (debug) GM_log('iterated past last bag, quitting');
		return;
	}
	// equip the bag, then put stuff in it.  Thank goodness that the "item" part of a URL gets eval'd first.
	var bagString='?item='+bagsToBag[0]+'&act_item_bulkadd=1';
	var bag=eval(GM_getValue(bagsToBag[0],'[]'));
	for (var i in bag) {
		bagString+='&add_item_'+bag[i].code+'=*';
	}
	bagsToBag.splice(0,1);
	GM_setValue('bagsToBag',uneval(bagsToBag));
	if (debug) GM_log('BAGGING!'+bagString);
	location.href=location.href.split('?')[0].split('#')[0]+bagString;
}

function startBagging() {
	var bagSelect=$('bagSelect');
	var bagCode=bagSelect.options[bagSelect.selectedIndex].value;
	var bagsToBag=[];
	// if we're bagging every bag, load them into the queue.  Otherwise, just load the queue with the one bag.
	if (bagCode=='%ALL%') {
		var allBags=eval(GM_getValue('bags'+getUsername(),'[]'));
		if (debug) GM_log('allBags.length:'+allBags.length+'allBags printed:'+printObject(allBags)+' allBags unevaled:'+uneval(allBags));
		for (var i=0;i<allBags.length;i++) {
			bagsToBag.push(allBags[i].code);
			GM_log('i:'+i+' allBags[i].code:'+allBags[i].code+'  allBags[i]:'+allBags[i]);
		}
	}
	else {
		bagsToBag.push(bagSelect.options[bagSelect.selectedIndex].value)
		if (debug) GM_log('only bagging one bag:'+bagSelect.options[bagSelect.selectedIndex].value);
	}
	GM_setValue('bagging',true);
	GM_setValue('bagsToBag',uneval(bagsToBag));
	
	if (debug) GM_log('starting bagging. stored bagsToBag:'+GM_getValue('bagsToBag')+'  printed bagsToBag:'+printObject(bagsToBag)+' unevaled bagsToBag:'+uneval(bagsToBag));
	GM_setValue('triedEquipping',false); // just in case we've gotten confused
	cancelBox();
	bag();
}

function createBag() {
	var itemList=$('bagItemList');
	var bagSelect=$('bagSelect');
	if (bagSelect.options.length==0) return;
	var bagCode=bagSelect.options[bagSelect.selectedIndex].value;
	if (bagCode=='%ALL%') return;
	
	// copy the checkbox info into the bag info.
	var cboxes=itemList.getElementsByTagName("input");
	var bagIndex=0;
	var bagItems=[];
	for (var i=0;i<cboxes.length;i++) {
		if (cboxes[i].checked) {
			var item=cboxes[i].name.split('%$%');
			bagItems.push({'code':item[0],'name':item[1]});
		}
	}
	if (debug) GM_log('createBag: found '+bagItems.length+' items.');
	GM_setValue(bagCode,uneval(bagItems));
	// if this bag is not registered in the system, then add it to the list of known bags.
	var foundBag=false;
	var bags=eval(GM_getValue('bags'+getUsername(),'[]'));
	for (var i=0;i<bags.length;i++) {
		if (bagCode==bags[i].code) {
			bags[i].name=bagSelect.options[bagSelect.selectedIndex].innerHTML;
			GM_setValue('bags'+getUsername(),uneval(bags));
			foundBag=true;
			break;
		}
	}
	// if not found, create new entry in bag list.
	if (!foundBag) {
		bags.push({'code':bagCode,'name':bagSelect.options[bagSelect.selectedIndex].innerHTML});
		if (debug) GM_log('new bag created!'+bagCode+' current bag count:'+bags.length);
		GM_setValue('bags'+getUsername(),uneval(bags));
	}
}

function listBaggableBags() {
	var bagSelect=$('bagSelect');
	
	while (bagSelect.hasChildNodes()) bagSelect.removeChild(bagSelect.firstChild);
	
	var option=document.createElement("option");
	option.innerHTML='All Bags';
	option.value='%ALL%';
	selectBag.appendChild(option);
	if (debug) GM_log('updateBagList, config closed.');
	var bags=eval(GM_getValue('bags'+getUsername(),'[]'));
	for (var i=0;i<bags.length;i++) {
		var option=document.createElement("option");
		option.innerHTML=bags[i].name;
		option.value=bags[i].code;
		selectBag.appendChild(option);
		if (debug) GM_log('item appended to bagSelect:'+option.innerHTML);
	}
}

// once we're done with updateBagList(), we should have an inventory.  In theory, this will happen on initial load, unless we're currently bagging.  (in which case, it's all automated, anyway.)
var inv;
function updateBagList() {
	if (debug) GM_log('entering updateBagList');
	var confBtn=$('bagConfigButton');
	var bagSelect=$('bagSelect');
	
	while (bagSelect.hasChildNodes()) bagSelect.removeChild(bagSelect.firstChild);
	
	// culling the list of bags.  If you trade bags away or otherwise get rid of them, they'll be removed from the internal bag list.  If you get the bag back, then you just need to save changes once on that bag; the internal data-storage for the bag is untouched, just the "pointer" to the bag is lost.
	if (inv) cullBags(inv);
	else {
		quip('bagItemList');
		getInventory('value:name',cullBags);  // I'd just get the "junk" inventory here, except that I may need the full inventory later, and the overhead of a new request dwarfs the difference between return sizes.
	}
}

function cullBags(invObj) {
	if (!inv) inv=invObj;
	var bags=eval(GM_getValue('bags'+getUsername(),'[]'));
	if (debug) GM_log('beginning bag cull.  Total bags:'+eval(GM_getValue('bags'+getUsername(),'[]')).length);
	
	GM_log('cullBags invObj:'+printObject(invObj));
	
	var bagChange=false;
	for (var i=0;i<bags.length;i++) {
		if (debug) GM_log('bag cull loop:'+bags[i].code);
		if (!invObj[bags[i].code]) {
			if (debug) GM_log('bag no longer extant: '+bags[i].code);
			bags.splice(i,1);
			bagChange=true;
		}
	}
	// premature optimization FTW!
	if (bagChange) GM_setValue('bags'+getUsername(),uneval(bags));
	
	// yeah, the function isn't quite named right, but this is the only time we'll be generating the list of inventory bags, and we need the inventory first.
	var bagSelect=$('bagSelect');
	for (var i in inv) {
		if (i.substr(0,4)=='Bag.') {
			var option=document.createElement("option");
			option.innerHTML=inv[i];
			option.value=i;
			bagSelect.appendChild(option);
		}
	}
	
	// once we have the right bags, use that same inventory to update the item list.
	updateItemList();
}

function updateItemList(invObj) {
	if (invObj && !inv) {
		inv=invObj;
	}
	else if (!inv) {
		// if the inventory doesn't exist, then... um... go get it, and try again.  
		getInventory('value:name',updateItemList);
		return;
	}
	var itemList=$('bagItemList');
	var bagSelect=$('bagSelect');
	
	// clear out the old item-list, if any
	while (itemList.hasChildNodes()) itemList.removeChild(itemList.firstChild);
	
	if (bagSelect.options.length==0) return;
	var bagCode=bagSelect.options[bagSelect.selectedIndex].value;
	if (bagCode=='%ALL%') return;
	
	var currentBag=eval(GM_getValue(bagCode,'[]'));
	
	var bagItems=new Object;
	// create checkboxes for every item in the current bag list
	for (var i=0;i<currentBag.length;i++) {
		var cb=createItemSelect(currentBag[i].code,currentBag[i].name,bagCode, true);
		itemList.appendChild(cb);
		
		// also make me an associative array of itemCode -> description
		bagItems[currentBag[i].code]=currentBag[i].name;
	}
	
	if (debug) GM_log('updateItemList bagCode:'+bagCode);
	// now create the checkboxes for everything that ISN'T in the bag.  The hashmap is MUCH faster than O(n^2).
	for (var i in inv) {
		if (!bagItems[i]) {
			var cb=createItemSelect(i,inv[i],false);
			itemList.appendChild(cb);
		}
	}
	endQuip();
}

function createItemSelect(item,desc,check) {
	if (check==undefined) check=false;	// a hack to set a default
	
    var select = document.createElement("div");
    var checkbox = document.createElement("input");
    desc = extractLabel(desc);
    
    checkbox.setAttribute('id', item);
    checkbox.setAttribute("type","checkbox");
    checkbox.setAttribute("name",item+'%$%'+desc);
    //checkbox.setAttribute("desc",desc);
	checkbox.checked=check;
    
	var label = document.createElement('label');
	label.appendChild(document.createTextNode(desc));
	label.setAttribute('for', 'outfit_' + item);

	select.appendChild(checkbox);
	select.appendChild(label);
    return select;
}

function changeSelectedBag() {
	if (debug) GM_log('entering changeSelectedBag');
	var confBtn=$('bagConfigButton');
	var selectBag=$('bagSelect');
	if (confBtn.getAttribute("value")=='Configure') {
		// not much to say if we're changing the selected bag while the config is closed.
	}
	else if (selectBag.selectedIndex!=GM_getValue('selectedBag','FNORD')) {
		updateItemList();
	}
	GM_setValue('selectedBag', selectBag.selectedIndex);
}
function createInterface() {
	var box=makeBox('Grocery Clerk: ','clerk');
	
	selectBag=document.createElement("select");
	selectBag.setAttribute("class","controls");
	selectBag.setAttribute("id","bagSelect");
	selectBag.addEventListener('click', changeSelectedBag, true);
	
	var bagButton=makeButton('Bag it!');
	bagButton.addEventListener('click', startBagging, true);
	
	var configButton = makeButton('Configure');
	configButton.setAttribute("id","bagConfigButton");
	configButton.addEventListener('click', function(){toggleConfig('bagConfig',updateBagList,listBaggableBags);}, true);

	var configDiv=document.createElement('div');
	configDiv.setAttribute('id','bagConfig');
	configDiv.setAttribute('style','display:none');

	// oops.  If we select a nonexistent item, the entire script crashes.  And since it crashes, it can't be fixed... so this will fix it automatically.
	if (GM_getValue('selectedBag',0) >= selectBag.length) GM_setValue('selectedBag',0);
	
	selectBag.selectedIndex=GM_getValue('selectedBag',0);
	box.appendChild(selectBag);
	box.appendChild(document.createTextNode(" "));
	box.appendChild(bagButton);
	box.appendChild(document.createTextNode(" "));
	box.appendChild(configButton);
	
	
	box.appendChild(configDiv);
	
	var setBagList=makeButton('Apply Changes to Bag');
	setBagList.id='bag-apply';
	setBagList.addEventListener('click', createBag,true);
	configDiv.appendChild(setBagList);
	
	configDiv.appendChild(document.createTextNode('Version: '+GM_getValue('scriptVersion','highly confused.')+' '));
	
	var debugCB=makeCheckbox('debug','Debug Mode',false);
    configDiv.appendChild(debugCB);
	
	var itemList=document.createElement('div');
	itemList.id='bagItemList';
	configDiv.appendChild(itemList);
	
	configDiv.appendChild(locationSelect());
	
	insertAt(box, GM_getValue('display_location','PotatoConsole'));
	
	listBaggableBags();
}
