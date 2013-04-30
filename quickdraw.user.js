//======================================================================
// ==UserScript==
// @name          Quickdraw
// @namespace     http://gark.net/cities/
// @description	  Add quickdraw capabilities to Cities
// @include	http://cities.totl.net/cgi-bin/game*
// @include	http://carmilla.ecs.soton.ac.uk:8080/cgi-bin/game*
// @require	http://potatoengineer.110mb.com/cities_potatolibrary.user.js
// ==/UserScript==
//
// Copyright 2006 Nick Gibbins
//
// Requires greasemonkey 0.8.0+ and firefox 1.5+
//
// Modified by Paul Marshall a.k.a. PotatoEngineer to reduce load time 
//		(but it no longer removes buttons when you lose/bag an item).  
//
// Version 1.4: You can now choose to not kill the recently-used items list.
//			Quips added.  :)
//
// Version 1.32: Fixed bug that prevented initialization, and proves that eval() really, REALLY needs to be WYSIWYG.  It worked just fine for ME, just not anyone ELSE....
//
// Version 1.31: Better display of hotkeys on buttons, and required PotatoLibrary update for inventory.
//
// Version 1.3: Equip-on-keypress for move/fight buttons!
//			Also takes up less space in the Firefox registry now.
//
// Version 1.21: bugfix for aligned instruments.
//
// Version 1.2: Updated for Newfangled interface, and I've finally given in and given it the PotatoScript treatment, updates and everything.
//
// Version 1.13: Tweaked alignment detection, set Aligned Instrument to select fiddles if you have no real alignment.
//
// Version 1.12: improved compatibility with Item Selector.
//
// Version 1.11: improved compatibility with other scripts by specifically removing Fastdraw buttons, 
//					rather than all buttons in the inventory section after the dropdown.
//
// Version 1.1: Each username now gets their own quickdraw
//				Fixed "add current" (though it's kinda a hack)
//				Created an "aligned instrument" button that will remember your most recent alignment (and remembers 
//					the right one if you're hallucinating), and grabs the (basic) instrument that's right for you.
//
// Version 1.0: Second verse, same as the first, a big bit faster and a little bit worse!
//======================================================================
//var startTime=new Date();

var equipItem;	//if defined, then equip this item before acting.

GM_setValue('scriptVersion','1.4');

checkUpdates('QuickDraw','qd','quickdraw.user.js');

initializeQuickdraw();
updateQuickdraw();

//======================================================================
function initializeQuickdraw()
{
	if (GM_getValue('killFastdraw',true)) removeFastdraw();

    var quickdraw = makeBox();

    var buttons = document.createElement("div");
    buttons.setAttribute("id", "quickdrawButtons");
    quickdraw.appendChild(buttons);

    var quickdrawConfigure = makeButton('Configure','quickdrawConfigButton');
    quickdrawConfigure.addEventListener("click",function(){toggleConfig('quickdrawConfig',getItemList,function(){buildQuickDraw(); updateQuickdraw();});},true);
    quickdraw.appendChild(quickdrawConfigure);

    var quickdrawAdd = makeButton('Add current');
    quickdrawAdd.addEventListener("click",addSelected, true);
    quickdraw.appendChild(document.createTextNode(" "));
    quickdraw.appendChild(quickdrawAdd);
	
   var quickdrawConfig = document.createElement("div");
    quickdrawConfig.id= "quickdrawConfig";
    quickdrawConfig.setAttribute("style", "display:none");
	
	var options=makeBox('','quickdrawOptions');
	options.id='quickdrawOptions';
	quickdrawConfig.appendChild(options);
	
	options.appendChild(makeCheckbox('killFastdraw','Remove quickdraw',true));
	options.appendChild(makeCheckbox('killRecentItems','If removing quickdraw, also remove recent items',true));
	
	options.appendChild(locationSelect());
	
	var itemList=document.createElement('table');
	itemList.id='quickdrawItemList';
	itemList.border='0';
	quickdrawConfig.appendChild(itemList);
	
    quickdraw.appendChild(quickdrawConfig);

	insertAt(quickdraw,GM_getValue('displayLocation','UnderQD'));
	
	keys=eval(GM_getValue('keys'+getUsername(),'new Object()'));
	var activateKeys=false;
	for (var i in keys) {	//quick & dirty "does this object have any properties?" check.
		activateKeys=true;
		break;
	}
	if (activateKeys) {
		document.addEventListener('keypress',hotKeys,true);
	}
}
// once you press a hotkey (WITHOUT shift, alt, etc; let's not interfere too much, here), spam some event listeners over the movement/fighting hotkeys, so that once those get clicked, we'll hold an item before the move/attack.
function hotKeys(key) {
	var keys=eval(GM_getValue('keys'+getUsername(),'new Object()'));
	GM_log('hotKey:'+key.which+'  '+String.fromCharCode(key.which));
	if (keys[String.fromCharCode(key.which)] && !key.shiftKey && !key.ctrlKey && !key.altKey && !key.metaKey) {
		equipItem=keys[String.fromCharCode(key.which)];
		var moves=xpath('.//input[contains(@name,"act_move") or contains(@name,"act_fight")]',$('control_pane'));
		for (var i=0;i<moves.length;i++) {
			moves[i].addEventListener('click',equipItemAndMove,false);
			GM_log('spamming listener:'+moves[i].name);
		}
	}
	else {
		equipItem=undefined;
	}
	displayHyperDraw();
}

function equipItemAndMove(event) {
	if (equipItem) {
		var action=event.target.name;
		var urlArgs='?item='+equipItem+'&'+action+'=1';
		GM_log('equipItemAndMove fired.  New urlArgs:'+urlArgs);
		location.href=location.href.split('#')[0].split('?')[0]+urlArgs;
		event.stopPropagation();
		event.preventDefault();
		return false;
	}
}

function displayHyperDraw() {
	var hd=$('hyperDraw');
	if (hd && !equipItem) {
		hd.parentNode.removeChild(hd);
	}
	else if (!hd && equipItem) {
		hd=document.createElement('div');
		hd.setAttribute('class','controls');
		hd.id='hyperDraw';
		hd.appendChild(document.createTextNode('Item equipped on next move/attack: '));
		var item=document.createElement('span');
		item.id='nextEquippedItem';
		item.innerHTML=equipItem;
		hd.appendChild(item);
		$('controls_left').insertBefore(hd, $('controls_left').firstChild);
	}
	else if (hd && equipItem) {
		$('nextEquippedItem').innerHTML=equipItem;
	}
}

function removeFastdraw()
{
	if (isNewfangled()) {
		var qd=$('control_qd').firstChild;
		// always remove the game-generated QD; there's really no point in having both.
		qd.removeChild(qd.firstChild.nextSibling);
		// if the recent items also must go, then kill it.
		if (GM_getValue('killRecentItems',true)) {
			qd.removeChild(qd.firstChild);
		}
	}
	else {
	    var inventory = $("inventory");
	    var todelete = [];
		
		var toDelete=xpath('//input[contains(@name,"fast")]',inventory);
	    for (i = 0; i < toDelete.length; i++) {
			inventory.removeChild(toDelete[i]);
	    }
	}
}

var inv;
function getItemList(newInv) {
    var config = $("quickdrawItemList");
    while (config.hasChildNodes() ) {
		config.removeChild( config.firstChild );
    }
	
	if (newInv) {
		inv=newInv;
	}
	else if (!inv) {
		config.appendChild(quip());
		getInventory('name:value',getItemList);
		return;
	}
	buildConfig(inv);
}

function buildConfig(nameVal) {
    var config = $("quickdrawItemList");
	var qd=eval(GM_getValue('qd'+getUsername(),'new Object()'));
	var keys=eval(GM_getValue('keys'+getUsername(),'new Object()'));
	var invKeys={};
	for (var i in keys) invKeys[keys[i]]=i;
	GM_log('keys:'+printObject(keys));
	var check;
	var key;
	for (var i in nameVal) {
		check=qd[nameVal[i]]?true:false;
		key=invKeys[nameVal[i]]?invKeys[nameVal[i]].toLowerCase():'';
		config.appendChild(createItemSelect(nameVal[i],i,check,key));
	}
    config.appendChild(createItemSelect('ALIGNED_INSTRUMENT','Aligned Instrument',(qd['ALIGNED_INSTRUMENT']?true:false),(invKeys['ALIGNED_INSTRUMENT']?invKeys['ALIGNED_INSTRUMENT']:'')));
	endQuip();
}

function updateQuickdraw()
{
//GM_log('started update');
    var buttons = $("quickdrawButtons");
    while (buttons.hasChildNodes() ) {
		buttons.removeChild( buttons.firstChild );
    }
	var qd=eval(GM_getValue('qd'+getUsername(),'new Object()'));
	var keys=eval(GM_getValue('keys'+getUsername(),'new Object()'));
	var iKeys={};
	for (var i in keys) iKeys[keys[i]]=i;
	var keyStr;
	for (var i in qd) {
		keyStr='';
		if (iKeys[i]) {
			keyStr=' ('+iKeys[i]+')';
		}
		buttons.appendChild(document.createTextNode(" "));
		buttons.appendChild(createItemButton(i,qd[i]+keyStr));
		GM_log('button:'+i+'  '+qd[i]);
	}
//GM_log('ended update');
}

function buildQuickDraw() 
{
//GM_log('started build');
    var cboxes = xpath('.//input[@type="checkbox"]',$("quickdrawItemList"));
	var qd={};
    for (i=0;i<cboxes.length;i++) {
		if (cboxes[i].checked) {
			qd[cboxes[i].value]=cboxes[i].name;
		}
    }
	GM_setValue('qd'+getUsername(),uneval(qd));

	var texts=xpath('.//input[@type="text"]',$('quickdrawItemList'));
	GM_log('texts.length:'+texts.length);
	var keys={};
	for (i=0;i<texts.length;i++) {
		if (texts[i].value!='') {
			keys[texts[i].value.toLowerCase()]=texts[i].name;
			GM_log('hotkey found for '+texts[i].name+':'+texts[i].value.toLowerCase());
		}
	}
	GM_setValue('keys'+getUsername(),uneval(keys));
//GM_log('ended build');
}

function createItemButton(item,desc)
{
    var button = document.createElement("input");
    desc = extractLabel(desc);
    button.setAttribute("type","button");
    button.setAttribute("class","button");
    button.setAttribute("value",desc);
    if (item=='ALIGNED_INSTRUMENT') {
		button.addEventListener('click',
			function (event) {
				var instrument='';
				switch(getAlignment()) {
					case 'water': 
						instrument='InstrumentTambourine';
						break;
					case 'air':
						instrument='InstrumentHarmonica';
						break;
					case 'fire':
						instrument='InstrumentFiddle';
						break;
					case 'earth':
						instrument='InstrumentAccordion';
						break;
					// if you're unaligned, just use a fiddle.  Because I like fiddles.
					default:
						instrument='InstrumentFiddle';
						break;
				}
				holdItem(instrument);
			},true);
    }
    else {
		button.addEventListener("click",function(){holdItem(item);},true);
	}

    return button;
}

function createItemSelect(item,desc,check,hotkey)
{
	if (check || hotkey) GM_log('creating item select:'+item+'  '+desc+'  '+check+'  '+hotkey);
    var row = document.createElement("tr");
	var select=document.createElement('td');
	var hk=document.createElement('td');
	row.appendChild(select);
	row.appendChild(hk);
	
    var checkbox = document.createElement("input");
    desc = extractLabel(desc);
    checkbox.setAttribute("type","checkbox");
    checkbox.setAttribute("value",item);
    checkbox.setAttribute("name",desc);	// necessary for easy retrieval of name later.
    checkbox.setAttribute("id",item);
	checkbox.checked=check;
    var label = document.createElement('label');
	label.setAttribute('for',item);
	label.innerHTML=desc;
	
	var hotkeyLabel=document.createTextNode('Hotkey: ');
	var hotkeyInput=document.createElement('input');
	hotkeyInput.type='text';
	hotkeyInput.name=item;
	hotkeyInput.value=hotkey;
	hotkeyInput.size=1;

    select.appendChild(checkbox);
    select.appendChild(label);
	hk.appendChild(hotkeyLabel);
	hk.appendChild(hotkeyInput);

    return row;
}

function addSelected() 
{
    var item = getHeldItemValue();
    var itemDisplay=getHeldItem();

	// due to the newer, faster, more funky QD-building method, we need to check whether the item is already part of the QuickDraw.
	var qd=eval(GM_getValue('qd'+getUsername(),'new Object()'));
	if (!qd[item]) {
		qd[item]=itemDisplay;
		GM_setValue('qd'+getUsername(),uneval(qd));
	}
    updateQuickdraw();
}

//======================================================================
//var endTime=new Date();
//GM_log((endTime.getTime()-startTime.getTime()));