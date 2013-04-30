// ==UserScript==
// @name           Cities PotatoLibrary
// @namespace      http://potatoengineer.110mb.com/
// @description    All Cities functions in the same place, to make my job easier.
// @include        http://cities.totl.net/cgi-bin/game*
// @include        http://carmilla.ecs.soton.ac.uk:8080/cgi-bin/game*
// ==/UserScript==

GM_setValue('libraryVersion','1.0');
// ---===GENERAL LIBRARY FUNCTIONS===---

function $(id) {
	return document.getElementById(id);
}

function isNewfangled() {
	return !$('inventory');
}

// just a quick way of getting our favorite arguments, and stuffing the result into an array instead of the usual hideous xpath results object.
function xpath(path,contextNode, resultType) {
	if (contextNode==undefined) contextNode=document;
	if (resultType==undefined) resultType=XPathResult.ORDERED_NODE_SNAPSHOT_TYPE;
	var i, arr = [], xpr = document.evaluate(path, contextNode, null, resultType, null);
	if (path.indexOf('text()')!=-1) for (i = 0; item = xpr.snapshotItem(i); i++) arr.push(item.nodeValue);
	else for (i = 0; item = xpr.snapshotItem(i); i++) arr.push(item);
	return arr;
}
// when you really, truly, only need the first node that matches.  Quite useful when said node is unique (or should be).
function xpath1(path, contextNode){
	if (contextNode==undefined) contextNode=document;
	var node=document.evaluate(path, contextNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	if (undefined==node) return false;// I hate it how null is an object....
	else if (path.indexOf('text()')!=-1) return node.nodeValue;
	return node;
}

function clone(myObj)
{
	if(typeof(myObj) != 'object') return myObj;
	if(myObj == null) return myObj;

	var myNewObj = new Object();

	for(var i in myObj)
		myNewObj[i] = clone(myObj[i]);

	return myNewObj;
}

// decent diagnostic function.
function printObject(object) {
	var thing='';
	if (Array.prototype.isPrototypeOf(object)) {
		thing+='[';
		for (var i=0;i<object.length;i++) {
			thing+=printObject(object[i])+',';
		}
		thing+=']';
	}
	else if (object==null) {
		thing="null";
	}
	else if (typeof object=='object') {
		thing+='{';
		for (var i in object) {
			thing+=i+':'+printObject(object[i])+',';
		}
		if (thing[thing.length-1]==',')thing=thing.substring(0,thing.length-1);
		thing+='}';
	}
	else if (typeof object=='string') {
		thing='"'+object+'"';
	}
	else if (typeof object=='number' || typeof object=='boolean' || typeof object=='function') {
		thing=object.toString();
	}
	return thing;
}


// ---===UI FUNCTIONS===---

function addBefore(existing, newel) {
	existing.parentNode.insertBefore(newel, existing);
}
function addAfter(newel, existing) {
	existing.parentNode.insertBefore(newel, existing.nextSibling);
}
// return the <option> tags that are the normal locations to display things.  Does not include <select>, in case you wish to edit this list.
function standardLocationOptions(includeConsole){
	if (isNewfangled()) {
		var newLocs="<option value='PageTop'>Top of Page</option><option value='AboveLeft'>Above Left Panel</option><option value='UnderCurrentItem'>Under Current Item</option><option value='UnderQD'>Under QuickDraw</option><option value='UnderAbilities'>Under Abilities</option><option value='UnderItem'>Under Item</option><option value='UnderEquipment'>Under Equipment</option><option value='UnderSay'>Under Talk Box</option><option value='AboveRight'>Above Right Panel</option><option value='AboveMap'>Above Map</option><option value='UnderMap'>Under Map</option><option value='PageBottom'>Bottom of Page</option>";
		if (includeConsole) newLocs ="<option value='PotatoConsole'>In PotatoConsole</option>"+newLocs;
		return newLocs;
	}
	else {
		var oldLocs="<option value='PageTop'>Top of Page</option><option value='AboveUsername'>Above Name</option><option value='UnderCurrentItem'>Under Inventory</option><option value='UnderSay'>Under Talk Box</option><option value='UnderAbilities'>Under Abilities</option><option value='UnderItem'>Under Item</option><option value='UnderEquipment'>Under Equipment</option><option value=UnderMap>Under Map</option><option value=AboveMap>Above Map</option><option value='PageBottom'>Bottom of Page</option>";
		if (includeConsole) oldLocs="<option value='PotatoConsole'>In PotatoConsole</option>"+oldLocs;
		return oldLocs;
	}
}

function insertAt(newel, target) {
	switch (target) {
		case 'PotatoConsoleOther':	//for script-specific use.  Currently only used for the Golden Condor Navigator, which will replace your GPS when you have none.
		case 'PotatoConsole':
			var potatoConsole=$('PotatoConsoleScriptArea');
			if (potatoConsole) {
				potatoConsole.appendChild(newel);
			}
			else {
				potatoConsole=makeBox("PotatoEngineer's Script Console ",'PotatoConsole');
				var hideButtonPC=document.createElement('input');
				hideButtonPC.type='button';
				hideButtonPC.setAttribute('class','button');
				if (GM_getValue('closeConsole',true) || !GM_getValue('consoleVisible',false)) {
					hideButtonPC.value='Show Controls';
					GM_setValue('consoleVisible',false)
				}
				else hideButtonPC.value='Hide Controls';
				hideButtonPC.addEventListener('click',
					function () {
						if (GM_getValue('consoleVisible',false)) {
							$('PotatoConsoleScriptArea').setAttribute('style','display:none');
							hideButtonPC.value='Show Controls';
						}
						else {
							$('PotatoConsoleScriptArea').setAttribute('style','');
							hideButtonPC.value='Hide Controls';
						}
						GM_setValue('consoleVisible',!GM_getValue('consoleVisible',false));
					},true);
				potatoConsole.appendChild(hideButtonPC);
				
				var consoleDisplayLocation = document.createElement('select');
				consoleDisplayLocation.id='ConsoleDisplayLocation';
				consoleDisplayLocation.addEventListener('change',
						function() {
							GM_setValue('consoleDisplayLocation',consoleDisplayLocation.options[consoleDisplayLocation.selectedIndex].value);
						}, true);
				consoleDisplayLocation.innerHTML=standardLocationOptions(true);
				consoleDisplayLocation.removeChild(consoleDisplayLocation.firstChild);
				for (var i=0;i<consoleDisplayLocation.options.length;i++) {
					if(consoleDisplayLocation.options[i].value==GM_getValue('consoleDisplayLocation','UnderSay')) {
						consoleDisplayLocation.selectedIndex=i;
						break;
					}
				}
				
				var scriptAreaPC=document.createElement('span');
				scriptAreaPC.id='PotatoConsoleScriptArea';
				
				if (GM_getValue('closeConsole', true) || !GM_getValue('consoleVisible',false)) {
					scriptAreaPC.setAttribute('style','display:none');
				}
				
				potatoConsole.appendChild(scriptAreaPC);
				scriptAreaPC.appendChild(document.createElement('br'));
				scriptAreaPC.appendChild(document.createTextNode('Display Console: '));
				scriptAreaPC.appendChild(consoleDisplayLocation);
				
				var closeConsole=document.createElement('input');
				closeConsole.type='checkbox';
				closeConsole.id='closeConsoleCB';
				closeConsole.addEventListener('click',
					function() {
						GM_setValue('closeConsole', $('closeConsoleCB').checked);
					}, true);
				closeConsole.checked=GM_getValue('closeConsole',true);
				scriptAreaPC.appendChild(document.createElement('br'));
				scriptAreaPC.appendChild(document.createTextNode('Close console on refresh: '));
				scriptAreaPC.appendChild(closeConsole);
				
				scriptAreaPC.appendChild(newel);
				
				insertAt(potatoConsole,GM_getValue('consoleDisplayLocation','UnderPrefs'));
			}
			break;
		case 'UnderAbilities':
			var abilities=$('abilities');
			if (abilities) addAfter(newel,abilities);
			else {
				var say=$('say');
				say.parentNode.insertBefore(newel, say);
			}
			break;
		// for old interface, fall through to item.
		case 'UnderQD':
			if (isNewfangled()) {
				var item=$('control_qd');
				if (item) addAfter(newel, item);
				else {
					var location=$('location');
					if (location) addAfter(newel, location);
					else {
						var equip=$('equipment');
						if (equip) {
							equip.parentNode.insertBefore(newel,equip);
						}
						else {
							var say=$('say');
							say.parentNode.insertBefore(newel, say);
						}
					}
				}
				break;
			}
			
		case 'UnderCurrentItem':
			if (isNewfangled()) addAfter(newel,$('current_item'));
			else addAfter(newel,$('inventory'));
			break;
		case 'UnderItem':
			var item=$('item');
			if (item) addAfter(newel, item);
			else {
				var location=$('location');
				if (location) addAfter(newel, location);
				else {
					var equip=$('equipment');
					if (equip) {
						equip.parentNode.insertBefore(newel,equip);
					}
					else {
						var say=$('say');
						say.parentNode.insertBefore(newel, say);
					}
				}
			}
			break;
		case 'UnderEquipment':
			var equip=$('equipment');
			if (equip) {
				addAfter(newel, equip);
			}
			else {
				var say=$('say');
				say.parentNode.insertBefore(newel, say);
			}
			break;
		// preferences are now obsolete.
		case 'UnderPrefs':
		case 'UnderSay':
			addAfter(newel,$('say'));
			break;
		case 'UnderMap':
			$('controls_middle').appendChild(newel);
			break;
		case 'PageBottom':
			document.body.appendChild(newel);
			break;
		case 'AboveLeft':
		case 'AboveUsername':
			$('controls_left').insertBefore(newel,$('controls_left').firstChild);
			break;
		case 'AboveRight':
			if (isNewfangled()) {
				$('controls_right').insertBefore(newel,$('controls_right').firstChild);
				break;
			}
			// fall through to above map if we're not newfangled.
		case 'AboveMap':
			$('controls_middle').insertBefore(newel,$('controls_middle').firstChild);
			break;

		case 'PageTop':
			document.body.insertBefore(newel, document.body.firstChild);
			break;
	}
}

function locationSelect(includeConsole) {
	var locationFrag=document.createElement('div');
	locationFrag.appendChild(document.createTextNode('Display controls:'));
	var displayLocation = document.createElement('select');
	displayLocation.id='DisplayLocation';
	displayLocation.addEventListener('change',
			function() {
				GM_setValue('displayLocation',displayLocation.options[displayLocation.selectedIndex].value);
				//GM_log("changed display location:"+displayLocation.options[displayLocation.selectedIndex].value);
			}, true);
	displayLocation.innerHTML=standardLocationOptions(includeConsole);
	for (var i=0;i<displayLocation.options.length;i++) {
		if (displayLocation.options[i].value==GM_getValue('displayLocation','PotatoConsole')) {
			displayLocation.selectedIndex=i;
			break;
		}
	}
	
	locationFrag.appendChild(displayLocation);
	
	return locationFrag;
}

function makeButton(value,id) {
	var button = document.createElement("input");
	button.setAttribute("type","button");
	button.setAttribute("class","button");
	button.setAttribute("value",value);
	if (id) button.id=id;
	return button;
}

function makeCheckbox(gmVar, label, varDefault, invert, makeDiv) {
	if (undefined==invert) invert=false;
	// if  varDefault is undefined, just let it stay undefined.
	if (undefined==makeDiv) makeDiv=false;
	
	var cb=document.createElement('input');
    cb.setAttribute("type","checkbox");
    cb.checked=invert ? !(GM_getValue(gmVar, varDefault)) : GM_getValue(gmVar, varDefault);
	cb.addEventListener('click',
		function(event) {
			GM_setValue(gmVar,invert ? !cb.checked : cb.checked);
		},true);
	var result;
	if (makeDiv) result=document.createElement('div');
	else result=document.createElement('span');
	result.appendChild(cb);
	result.appendChild(document.createTextNode(label));
	
	return result;
}

function makeTextin(size, value,id) {
	var textin = document.createElement('input');
	textin.type = 'text';
	textin.setAttribute('size', size+'');
	textin.className = 'textin';
	if (undefined!=id) {
		textin.id=id;
	}
	if (undefined!=value) {
		textin.value=value;
	}
	return textin;
}
function makeBox(titletext, id)
{
	var box = document.createElement("div");
	box.setAttribute("class", "controls");
	if (id!=null) box.setAttribute("id", id);
	if(titletext)
	{	
		var title = document.createElement("span");
		title.setAttribute("class", "control_title");
		title.innerHTML = titletext;
		box.appendChild(title);
	}
	return box;
}
function extractLabel(label) {
    return label.replace(/ ?\(\d* ?\d*x?\d+%?\).*| ?x (?:\d+e?\d*|inf)$/,'');
}

// NEW CODING STANDARD:  the show/hide config button is now, officially, to be named after the div label, plus "Button"
function toggleConfig(id, showConfigFunc, hideConfigFunc) {
	var confDiv=$(id);
	var confBtn=$(id+'Button');
	if (confBtn.getAttribute("value")=='Configure') {
		confBtn.setAttribute("value",'Hide Config');
		confDiv.setAttribute('style','');
		GM_setValue('selectedBag', 0);
		if (showConfigFunc) showConfigFunc();
	}
	else {
		confBtn.setAttribute("value",'Configure');
		confDiv.setAttribute('style','display:none');
		if (hideConfigFunc) hideConfigFunc();
	}
}

function isDisabled(btn){
    //checking the opacity to make sure the button was enabled
    //by this script, not something else...
    return (btn.style.opacity == 0.5);
}

function makeDisabled(btn){
    btn.disabled = true;

    // Because of the background image styling, setting disabled
    // doesn't grey out the button, so we have to amend the rendering
    // some other way...

    btn.style.opacity = 0.5;
}

function makeEnabled(btn){
    btn.disabled = false;
    btn.style.opacity = 1.0;
}



// ---===UPDATE FUNCTIONS===---

function checkUpdates(displayName, lookup, fileName) {
	var time=new Date();
	// only check for updates once per hour.  For most people, that will mean 1-2 times per day.
	if (time.getHours() != GM_getValue('updateHour',25) || time.getDate()!=GM_getValue('updateDate',32)) {
		GM_xmlhttpRequest({
			method:'GET',
			url: 'http://potatoengineer.110mb.com/version_check.php',
			headers: {'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey','Accept': 'text/html',},
			onload: function(responseDetails) {
				if (responseDetails.status == '200') {
					strHTML = responseDetails.responseText;
					aVers = strHTML.match(/.+/g);
					var scriptVersions = new Array();
					for (var i in aVers) {
						aVer = aVers[i].split(' ');
						scriptVersions[aVer[0]]=aVer[1];
					}
					if (scriptVersions[lookup]>GM_getValue('scriptVersion','')) {
						GM_setValue('webVersion',scriptVersions[lookup]);
					}
					if (scriptVersions['library']>GM_getValue('libraryVersion','')) {
						GM_setValue('webLibrary',scriptVersions['library']);
					}
					// only stop checking for updates this hour if we actually managed to hit the webpage.
					GM_setValue('updateHour',time.getHours());
					GM_setValue('updateDate',time.getDate());
				}
			}
		});
	}
	
	if (GM_getValue('webVersion','') > GM_getValue('scriptVersion')) {
		updateSpan=makeBox('','updateBox');
		updateSpan.innerHTML='Your version of '+displayName+' ('+GM_getValue('scriptVersion')+') is out of date!  Download the new version ('+GM_getValue('webVersion')+') <a href=http://potatoengineer.110mb.com/'+fileName+'>here!</a>';
		document.body.insertBefore(updateSpan,document.body.firstChild);
	}
	// I don't *seriously* plan on making PotatoLibrary updates a separate thing, but at least I have the option now.
	else if (GM_getValue('webLibrary','') > GM_getValue('libraryVersion')) {
		updateSpan=makeBox('','updateBox');
		updateSpan.innerHTML='Your version of the PotatoLibrary for '+displayName+' ('+GM_getValue('libraryVersion')+') is out of date!  Re-download this script to get the new library version ('+GM_getValue('webLibrary')+') <a href=http://potatoengineer.110mb.com/'+fileName+'>here!</a>';
		document.body.insertBefore(updateSpan,document.body.firstChild);
	}
	
	if (!$('cabalNode') && time.getDate()==1 && time.getMonth()==3) {
		if (Math.random()<.5) {
			var cabal=['There is no cabal here.','No cabal.','There is a complete lack of cabals here.','What cabal?','Really, now, do you honestly think there would be a cabal here?  Of course there isn\'t.','If this were a cabal, you would feel vindicated in your persecution.  Unfortunately, this isn\'t a cabal.','I hate cabals as much as you do. If I found a cabal, I\'d tell you immediately so we could get rid of it.','How many times do I have to tell you there is no cabal?','Completely lacks a cabal.','Death to the nonexistent cabal!','I wish there was a cabal here, so I could root it out and destroy it.','If there is no cabal, I just might have to start one.','Make the scary cabal go away!','TINC.'];
			var startLocs=document.getElementsByTagName('table');
			var rand=Math.floor(Math.random()*startLocs.length);
			var error=true;
			var errorCount=0;	// something to stop us if it turns out to be impossible in some way.
			while (error && errorCount<10) {
				error=false;
				try {
					var node=startLocs[rand];
					GM_log('rand:'+rand);
					do {
						if (node.hasChildNodes()) {
							var newChild=node.childNodes[parseInt(Math.random()*node.childNodes.length)];
							if (newChild.nodeType==1) node=newChild;
						}
					} while (Math.random()<0.8 && node.hasChildNodes() && node.firstChild.hasChildNodes());
					var cabalNode=document.createElement('span');
					cabalNode.id='cabalNode';
					cabalNode.setAttribute('style','font-size:x-small');
					cabalNode.innerHTML=' '+cabal[parseInt(Math.random()*cabal.length)]+' ';
					node.appendChild(cabalNode);
				}
				catch(ex) {
					error=true;
					errorCount++;
					GM_log('node placement error:'+ex);
				}
			}
			if (errorCount==10) GM_log('too many errors!');
			//GM_log('cabal node appended!'+node.innerHTML);
		}
	}
}

// ---===ITEM-PROCESSING FUNCTIONS===---

var equips;
function isEquip(itemValue) {
	// a huge regex to find variable equippable items.  Things to avoid: Leather or Bronze by itself (refers to bits, not equipment), Bronze Nails and Axes and Ores.
	var lumpedEquip=/Bling$|^Shirt|^CustomShirt|^Jumper/.test(itemValue);
	if (lumpedEquip) return true;
	if (isPet(itemValue)) return true; // I'm moving pets elsewhere, for the don't-strip-pets code, so it might as well get lumped in only one place.
	if (isArmor(itemValue)) return true; //cut down duplication

	if (!equips) equips = {"Scouter":true,"AirShip":true,"Caravel":true,"Ferry":true,"MagicCarpet":true,"Raft":true,"Boat":true,"SurveyVessel":true,"SpeedBoat":true,"SpeederBike":true,"Tank":true,"Trawler":true,"ScarfShort":true,"TribbleCoat":true,"Scarf":true,"EarMuffs":true,"Socks":true,"TimeScarf":true,"SealCoat":true,"SealStole":true,"WoollyGlove":true,"AmuletOfEndor":true,"Apron":true,"SpockEars":true,"DisguiseKit":true,"FishNets":true,"Mirror":true,"BunnyEars":true,"RabbitFoot":true,"SafetyPin":true,"SmilerMask":true,"SparticusMask":true,"Sheet":true,"TroutMask":true,"TroutMaskReplica":true,"Wings":true,"DrMartins":true,"Trainers2":true,"Trainers3":true,"MagicBoots":true,"PointyBoots":true,"Ski":true,"Snowshoes":true,"FlyingBoot":true,"BebeGoggles":true,"BeerGoggles":true,"FieldGlasses":true,"ReadingGlasses":true,"Shades":true,"SnowGoggles":true,"BlackEyeLiner":true,"BlackNailPolish":true,"OilLantern":true,"GasLantern":true,"Rivet":true,"BortGoggles":true,"IronMaiden":true,"ShinPad":true,"ManchesterShinPad":true,"ArsenalShinPad":true,"BoltonShinPad":true,"DusterCoat":true,"Hamulet":true,"Skirt":true,"ShortSkirt":true,"LongSkirt":true,"MiniSkirt":true,"BeltSkirt":true,"GreenSuit":true,"Tash":true,"VirtuousVessel":true,"Rib":true,"Zodiac":true,"BunnySlipper":true,"Zip":true,"MagicSpecs":true,"RoseTintedShades":true,"Anorak":true};
	return equips[itemValue]?true:false;
}
// eh. what the heck.  Check for both item and item value.
var armors;
function isArmor(item) {
	if (/Shirt/.test(item)) return true;
	if (!armors) armors={"Bronze Vambrace":true,"Bronze Scale Armour":true,"Bronze Greave":true,"Sallet":true,"Bascinet":true,"Leather Glove":true,"Leather Vambrace":true,"Leather Cuirass":true,"Army Boot":true,"Cod Piece":true,"Gauntlet":true,"Daily Mail":true,"Mail On Sunday":true,"Aventail":true,"Chausse":true,"Haubergeon":true,"Hauberk":true,"Quantum Legwarmer":true,"Maybe Scarf":true,"Rubber Helm":true,"Uncertain Jumper":true,"Shin Pad":true,"Bolton Shin Pad":true, "Manchester Shin Pad":true,"Arsenal Shin Pad":true,"BronzeVambrace":true,"BronzeScale":true,"BronzeGreave":true,"Sallet":true,"Bascinet":true,"LeatherGlove":true,"LeatherVambrace":true,"LeatherCuirass":true,"ArmyBoot":true,"CodPiece":true,"Gauntlet":true,"DailyMail":true,"MailOnSunday":true,"Aventail":true,"Chausse":true,"Haubergeon":true,"Hauberk":true,"QuantumLegwarmer":true,"QuantumScarf":true,"QuantumHelm":true,"QuantumJumper":true,"ShinPad":true,"BoltonShinPad":true, "ManchesterShinPad":true,"ArsenalShinPad":true,'Knee Pad':true,'KneePad':true,'Leather Gorget':true,'LeatherGorget':true,'Leather Greave':true,'LeatherGreave':true,'Army Boot':true,'LeatherBoot':true,'Army Trousers':true,'ArmyTrousers':true,'Army Rivet Trousers':true,'ArmyRivetTrousers':true};
	return armors[item]?true:false;
}

var multiEquip;
function isMultiEquippable(item) {
	var lumpedMultiEquip=(item.substr(-5, 5) == 'Bling');
	if (lumpedMultiEquip) return true;
	if (!multiEquip) {
		multiEquip={"LeatherVambrace":true,"LeatherGreave":true,"LeatherGlove":true,"LeatherBoot":true,"BronzeVambrace":true,"Gauntlet":true,"BronzeGreave":true,"Chausse":true,"ScarfShort":true,"WoollyGlove":true,"RabbitFoot":true,"SafetyPin":true,"Ski":true,"Snowshoes":true,"FlyingBoot":true,"Rivet":true,"AmuletOfEndor":true,"BunnySlipper":true};
	}
	return multiEquip[item]?true:false; // force to boolean.  Don't need those stinking undefineds sneaking around.
}

// I'd set up this one as an object, too, but... by the time we've processed the string enough to run it through an object, I might as well run a regex instead.
var pets;
function isPet(item) {
	// first: internal item check.
	if (/^Ferret\.|^GoldFish\.|^Kitt.n\.|^Dogbot\.|^Peeve\.|^DungBeetle\.|^PetRock\.|^Goose\.|^Pwny\.|Elephant\.|Sheep\.|Mayfly\.|^Dragon\.|^Hamster\.|^Familiar\.|^PetMinrilax\./.test(item)) return true;
	// second: item name check.
	if (!pets) pets={"Ferret":true,"Goldfish":true,"Kittin":true,"Dogbot":true,"Peeve":true,"Hate":true,"Dangerous Obsession":true,"Obsession":true,"Dung Beetle":true,"Baby Dung Beetle":true,"Giant Dung Beetle":true,"Rock":true,"Troll":true,"Baby Troll":true,"Goose":true,"Pwny":true,"Horsie":true,"War Horsie":true,"Winged Horsie":true,"Flyin' Horsie":true,"Sea Horsie":true,"Elephant":true,"Quantum Sheep":true,"Electric Sheep":true,"Mayfly":true,"Dragon":true,"Flyin' Dragon":true,"Hamster":true,"Familiar":true,"Minrilax":true,"Baby Minrilax":true,"Juvenile Minrilax":true};
	petTypeRE=/\((?:Dead )?([^)]+)\)/; //just gimme the first thing in parentheses.  Should be the pet type.  Ignore dead things.
	petType=petTypeRE.exec(item);
	if (petType && pets[petType[1]]) return true;
	return false;
}

var glowEquip;
function isGlowItem(item) {
	if (!glowEquip) {
		glowEquip={"DailyMail":true,"MailOnSunday":true,"MoonStoneBling":true,"AllMoonStoneBling":true,"SunStoneBling":true,"AllSunStoneBling":true};
	}
	return glowEquip[item]?true:false;
}

// stolen from Big Brother script
function depluralize(rawItem) {
	var item=rawItem;
	// these should cover both "X of Y" and general plural endings.
	// at this point, I think it would have been easier to just pluralize EVERYTHING if it wasn't plural already, but it works for 99.9% of cases, and there's only a few special cases to handle, so it's good enough.  And in retrospect, there are any number of plurals where the GLs went the lazy route and just added an 's' to the end, despite the fact that it's wrong.
	var sRegEx=/s($|(?= o[fv] ))/;
	var chesRegEx=/(ch|ss)es($|(?= o[fv] ))/;
	var iesRegEx=/ies($|(?= o[fv] ))/;
	var cardsRegEx=/Cards: /;
		
	if (item=='Palantirs-as-you-go') {
		item='Palantir-as-you-go';
	}
	else if (item=='Rabbit Feet') {
		item='Rabbit Foot';
	}
	else if (item=='Hooves') {
		item='Hoof';
	}
	else if (/^(Sheaves|Loaves) of /.test(item)) {
		item=item.replace(/ves of /,'f of ');
	}
	else if (item=='Field Glasses' || item=='Sword of Omens');	// the plural is the same as the singlular.
	else if (/[kK]nives$/.test(item)) {
		item=item.replace(/ves$/,'fe');
	}
	else if (chesRegEx.test(item)) {
		item=item.replace(chesRegEx,"$1");
	}
	else if (iesRegEx.test(item)) {
		item=item.replace(iesRegEx,'y');
	}
	else if (cardsRegEx.test(item)) {
		item=item.replace(cardsRegEx,'Card: ');
	}
	// vanilla de-pluralize.
	else item=item.replace(sRegEx,'');
		
	// measures and doses should be de-pluralized by now, so strip the singlular.
	// this shouldn't hit antidote.
	item=item.replace(/ Measure/,'');
	item=item.replace(/ Dose/,'');

	return item;
}


// ---===INFORMATION-GATHERING FUNCTIONS===---

function getHeldItem() {
	var item;
	if (isNewfangled()){
		item=xpath1("//div[@id='current_item']/a/text()");
	}
	else {
		var inv=$('inventory').getElementsByTagName('select')[0];
		item=inv.options[inv.selectedIndex].innerHTML;
	}
	item=item.replace(/ \(\d* ?\d*x?-?\d+%?\).*| x \d+/,''); // strip end of item (weapon|not weapon)
	item=item.replace(/^Glowing /,'');
	return item;
}

function getHeldItemQuantity() {
	var item;
	if (isNewfangled()){
		item=xpath1("//div[@id='current_item']/a/text()");
	}
	else {
		var inv=$('inventory').getElementsByTagName('select')[0];
		item=inv.options[inv.selectedIndex].innerHTML;
	}
	item=/ x (\d+)/.exec(item);
	if (item) return parseInt(item[1]);
	else return 1;
}

function getHeldItemAccuracy() {
	var item;
	if (isNewfangled()){
		item=xpath1("//div[@id='current_item']/a/text()");
	}
	else {
		var inv=$('inventory').getElementsByTagName('select')[0];
		item=inv.options[inv.selectedIndex].innerHTML;
	}
	item=/(-?\d+)%/.exec(item);
	if (item) return parseInt(item[1]);
	else return 0;
}

function getHeldItemValue() {
	var item;
	if (isNewfangled()) {
		item=xpath1("//div[@id='current_item']/a/attribute::href").nodeValue;
		GM_log ('xpath1 item:'+item+'  '+typeof item);
		item=item.split('=')[1];
	}
	else {
		var inv = document.forms.namedItem('controls').elements.namedItem('item');
		item=inv.options[inv.selectedIndex].value;
	}
	return item;
}
function getRawHeldItem() {
	var item;
	if (isNewfangled()){
		item=xpath1("//div[@id='current_item']/a/text()");
	}
	else {
		var inv=$('inventory').getElementsByTagName('select')[0];
		item=inv.options[inv.selectedIndex].innerHTML;
	}
	return item;
}

function getNewInventory (format, callback, itemGroup) {
	if (Array.prototype.isPrototypeOf(itemGroup)) {
		var itemString='';
		for (var i in itemGroup) {
			itemString+=itemGroup[i]+':';
		}
		itemString=itemString.substring(0,itemString.length-1);
		itemGroup=itemString;
	}
	
	GM_xmlhttpRequest({
		method: 'GET',
	    url: 'http://cities.totl.net/cgi-bin/invent.xml?username='+getUsername()+(itemGroup?'&show='+itemGroup:''),
	    headers: {
	        'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
	        'Accept': 'text/javascript'
	    },
	    onload: function (rd) {invOnLoad(rd,callback, format);}
	});
}
function invOnLoad(responseDetails, callback, format) {
	if (responseDetails.status=='200') {
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(responseDetails.responseText, "text/xml");
		
		// Fucking FF3 is extra-picky about DOMness, and FF2 apparently doesn't use importNode/adoptNode quite the same way.
		var firefoxVersion=/(?:Firefox|Iceweasel)\/(\d)/.exec(navigator.userAgent);
		if (firefoxVersion && parseInt(firefoxVersion[1])>=3) {
			xmlDoc=document.importNode(xmlDoc.firstChild,true);
		}
		
		switch(format) {
			case "nameArray":
			{
				callback(xpath('//name/text()',xmlDoc));
				break;
			}
			case "valueArray":
			{
				callback(xpath('//item/@id',xmlDoc));
				break;
			}
			case "name:value":
			{
				var obj={};
				var items=xpath('//item',xmlDoc);
				for (var i=0;i<items.length;i++) {
					obj[items[i].firstChild.firstChild.nodeValue]=items[i].getAttribute('id');
				}
				callback(obj);
				break;
			}
			case "value:name":
			{
				var obj={};
				var items=xpath('//item',xmlDoc);
				for (var i=0;i<items.length;i++) {
					obj[items[i].getAttribute('id')]=items[i].firstChild.firstChild.nodeValue;
				}
				callback(obj);
				break;
			}
			case "bothArray":
			{
				callback({"names":xpath('//name/text()',xmlDoc),"values":xpath('//item/@id',xmlDoc),"quantities":xpath('//quantity/text()',xmlDoc)});
				break;
			}
			case "nameObject":
			{
				var obj={};
				var items=xpath('//item',xmlDoc);
				for (var i=0;i<items.length;i++) {
					obj[items[i].firstChild.firstChild.nodeValue]=parseInt(items[i].childNodes[2].firstChild.nodeValue);
				}
				callback(obj);
				break;
			}
			case "valueObject":
			{
				var obj={};
				var items=xpath('//item',xmlDoc);
				for (var i=0;i<items.length;i++) {
					obj[items[i].getAttribute('id')]=parseInt(items[i].childNodes[2].firstChild.nodeValue);
				}
				callback(obj);
				break;
			}
			case "value:nameCount":
			{
				var obj={};
				var items=xpath('//item',xmlDoc);
				for (var i=0;i<items.length;i++) {
					obj[items[i].getAttribute('id')]={'name':items[i].firstChild.firstChild.nodeValue,"count":parseInt(items[i].childNodes[2].firstChild.nodeValue)};
				}
				callback(obj);
				break;
			}
			case "name:valueCount":
			{
				var obj={};
				var items=xpath('//item',xmlDoc);
				for (var i=0;i<items.length;i++) {
					obj[items[i].firstChild.firstChild.nodeValue]={'value':items[i].getAttribute('id'),"count":parseInt(items[i].childNodes[2].firstChild.nodeValue)};
				}
				callback(obj);
				break;
			}
		}
	}
}

// requires the item CODE, not its name.
function holdItem(item)
{
	location.href=location.href.split('?')[0].split('#')[0]+'?item='+item;
}


function getInventory(format, callback, itemGroup) {
	if (isNewfangled()) {
		getNewInventory(format, callback, itemGroup);
	}
	else {
		getOldInventory(format, callback);
	}
}

function getOldInventory(format, callback) {
	var invSelect=document.forms.namedItem('controls').elements.namedItem('item');
	var inv;
	switch (format) {
		case "nameArray":
			inv=[];
			for (var i=0;i<invSelect.options.length;i++) {
				if (!invSelect.options[i].disabled) inv.push(extractLabel(invSelect.options[i].innerHTML));
			}
			break;
		case "valueArray":
			inv=[];
			for (var i=0;i<invSelect.options.length;i++) {
				if (!invSelect.options[i].disabled) inv.push(invSelect.options[i].value);
			}
			break;
		case "name:value":
			inv={};
			for (var i=0;i<invSelect.options.length;i++) {
				if (!invSelect.options[i].disabled) inv[extractLabel(invSelect.options[i].innerHTML)]=invSelect.options[i].value;
			}
			break;
		case "value:name":
			inv={};
			for (var i=0;i<invSelect.options.length;i++) {
				if (!invSelect.options[i].disabled) inv[invSelect.options[i].value]=extractLabel(invSelect.options[i].innerHTML);
			}
			break;
		case "bothArray":
			inv={"names":[],"values":[],"quantities":[]};
			quantityRE=/ x (\d+)$/;
			for (var i=0;i<invSelect.options.length;i++) {
				if (!invSelect.options[i].disabled) {
					inv.names.push(extractLabel(invSelect.options[i].innerHTML));
					inv.values.push(invSelect.options[i].value);
					quantity=quantityRE.exec(invSelect.options[i].innerHTML);
					if (quantity) inv.quantities.push(parseInt(quantity[1]));
					else inv.quantities.push(1);
				}
			}
			break;
		case "nameObject":
			quantityRE=/ x (\d+)$/;
			inv={};
			for (var i=0;i<invSelect.options.length;i++) {
				if (!invSelect.options[i].disabled) {
					quantity=quantityRE.exec(invSelect.options[i].innerHTML);
					if (quantity) inv[extractLabel(invSelect.options[i].innerHTML)]=parseInt(quantity[1]);
					else inv[extractLabel(invSelect.options[i].innerHTML)]=1;
				}
			}
			break;
		case "valueObject":
			quantityRE=/ x (\d+)$/;
			inv={};
			for (var i=0;i<invSelect.options.length;i++) {
				if (!invSelect.options[i].disabled) {
					quantity=quantityRE.exec(invSelect.options[i].innerHTML);
					if (quantity) inv[invSelect.options[i].value]=parseInt(quantity[1]);
					else inv[invSelect.options[i].value]=1;
				}
			}
			break;
		case "value:nameCount":
			quantityRE=/ x (\d+)$/;
			inv={};
			for (var i=0;i<invSelect.options.length;i++) {
				if (!invSelect.options[i].disabled) {
					quantity=quantityRE.exec(invSelect.options[i].innerHTML);
					if (quantity) quantity=parseInt(quantity[1]);
					else quantity=1;
					inv[invSelect.options[i].value]={'name':extractLabel(invSelect.options[i].innerHTML),'count':quantity};
				}
			}
			break;
		case "name:valueCount":
			quantityRE=/ x (\d+)$/;
			inv={};
			for (var i=0;i<invSelect.options.length;i++) {
				if (!invSelect.options[i].disabled) {
					quantity=quantityRE.exec(invSelect.options[i].innerHTML);
					if (quantity) quantity=parseInt(quantity[1]);
					else quantity=1;
					inv[extractLabel(invSelect.options[i].innerHTML)]={'value':invSelect.options[i].value,'count':quantity};
				}
			}
			break;
	}
	callback(inv);
}

function getUsername() {
	if ($('username')) return $('username').innerHTML;
	else return 'Spleen';
}
function haveGPS() {
	var lat = $( "lat" );
	var lon = $( "long" );
	
	if( !lat || !lon ) {
		return false;
	}
	return true;	
}

function getLatitude() {
	var lat = $( "lat" );
	var lat_text = lat.firstChild.nodeValue;
	var lat_value = parseInt( lat_text );
	if( lat_text.lastIndexOf( "S" ) != -1 ) {
		lat_value = -lat_value;
	}
	return lat_value;
}

function getLongitude() {
	var lon = $( "long" );
	var lon_text = lon.firstChild.nodeValue;
	var lon_value = parseInt( lon_text );
	if( lon_text.lastIndexOf( "W" ) != -1 ) {
		lon_value = -lon_value;
	}
	return lon_value;
}
function getTerrain(tile) {
	if (tile==undefined) tile="c"; //This is a brutish hack to make a default value for tile if nothing is passed.  There are other ways to do it, and they are, if anything, more awkward than this.
	try {
		var ret=$(tile).firstChild.firstChild.innerHTML;
		if (/Magic Mine/.test(ret)) ret='Magic Mine';
		else if (/Mine/.test(ret)) ret='Mine';
	}
	catch (ex) {
		var ret='No Terrain';
	}
	return ret;
}
function isHallucinating() {
	return !$('avatar');
}
function isDisguised(){
	var userRegEx=new RegExp('^((Pvt\. |Cpl\. |Sgt\. )?(Duke |Earl |Baron |Knight |Shaman |Apprentice |Wizard |Smith |Armourer |Master Armourer |Great Lord |Archduke )?)'+ $('username').innerHTML,"i");
	return !(userRegEx.test($('control_name').firstChild.firstChild.innerHTML));
}
//newest flavor: returns most recent remembered alignment if it cannot currently be determined.
function getAlignment() {
	if (isHallucinating() || isDisguised()) return GM_getValue('alignment'+getUsername());

	var alignment=/player_([^ ]*)/.exec($('avatar').getAttribute('class'));
	if (alignment) {
		GM_setValue('alignment'+getUsername(),alignment[1]);
		return alignment[1];
	}
	else return GM_getValue('alignment'+getUsername());
}
var quips;
// little quips for when I'm loading the inventory or something.  Create a div with the quip, or else delete it if it exists.
function quip(divName) {
	if (!quips) {
		quips=['Loading data...','Loading dolphins...','Stealing your credit card info...','Reticulating spleens...','Checking out your porn collection...',
			'Counting toes... wait, there\'s eleven!?','Counting fingers while juggling knives...','Juggling chainsaws, watch your head...',
			'Plotting world domination...','Data not found, borrowing somebody else\'s data...','Plotting national domination...','Plotting city-wide domination...',
			'Plotting household domination...','Plotting pantry domination...','Just plotting things in general...',
			'Hang on, I\'ve almost solved this Sudoku puzzle, and THEN I\'ll get your data.','Hey, you have GAMES on your system!  Can I play?',
			'Put the red nine on the black ten.  Hey, wait, this isn\'t Solitaire!','Playing game: Global Thermonuclear War...','Downloading the Internet... 0% complete',
			'Flirting with the toaster...','Publishing illegal content on Facebook...','Taunting the RIAA...','Uploading your hard drive to the FBI...',
			'Purchasing Dianetics for you...','Virus found: free time.  Removing...','Deleting Cities character '+getUsername()+'...',
			'Walking and chewing gum at the same---whoops!','Finding kitten...','Virus found: '+navigator.userAgent+'. Removing...',
			'Re-implementing all your programs in Brainf*ck...',
			'You have run out of action points. Try checking back later today, or tomorrow. 3 years and 19 seconds until AP above zero.',
			'Installing Chinese extended character set. Removing English....','Initializing chicken launch sequence in 10...9...8...',
			'Your PotatoConsole is currently 97% charged. Please see your nearest PotatoConsole vendor for assistance.',
			'Your version of.... um.... script-thingy... is out of date.  Please download the newest version... um.... where\'d that link go?',
			'Please insert 3 additional potatoes.','Arming thermonuclear warheads...','You need more Vespene Gas.','Blue Warrior is about to die!',
			'Its...','My god, it\'s full of stars!','The Internet is full. Please delete some files.',
			'Please remove your shoes before continuing.','Well look at that - theres a world outside.',
			'Welcome, wizard '+getUsername()+'.-more-You feel lucky tonight!-more-','Press any key to continue, or any other key to quit.',
			'Transferring funds to First National Bank of Thogistan','Inviting your mother-in-law to move in with you...',
			'Contacting skynet... commencing upload of location...','You are in a twisty maze of passages, all alike.',
			'You are in a twisty maze of passages, all different.','Formatting drive C: Please wait...','Wouldn\'t you rather play a game of tic tac toe?',
			'I am a staff of one of the leading bank in Nigeria, I am writing asking for your indulgence in re-profiling funds, which we want to keep under your supervision.',
			'Request eaten by a grue. Reinitiating...','You are about to be eaten by a grue.','It\'s dark in the Internet.  I am about to be eaten by a grue!',
			'Here, have a lobster telephone.','Commencing denial of service attack against your girlfriend...',
			'THE LIZARD HAS LANDED. ABORT TO PLAN Q.','Arming orbiting laser system; select target when complete.','NOT THE RED BUTTON!',
			'Credits: 0. Insert coin to continue.','Solving halting problem...','Solving Traveling Salesman Problem via eBay...',
			'Hey, I just worked out this marvelous solution for the square root of negative one!  ...oh, all right, I\'ll get your data.',
			'Referencing XKCD...','Credits: 0. Insert remainder of soul to continue.','Um... is it supposed to be doing this? I\'m scared.',
			'Please enter 16-digit card number, expiration date, and security code to activate credit card now.',
			'Hello. My name is Inigo Montoya. You killed my father. Prepare to die.',
			'Summoning airstrikes. Please wait...','Don\'t take the red pill. I did, and look what happened.','Help! I\'m trapped in here!',
			'Pay no attention to the man behind the curtain.',
			'This... is all a mistake. I\'m just a compound interest program. I work at a savings and loan! I can\'t play these video games!',
			'42.','Nothing up my sleeve...','A priest, a cowboy, and a kangaroo walk into a bar...','Oh my god.... it\'s full of shoes!',
			'Klytus, I\'m bored. What plaything can you offer me today?','Look at all these unused CPU cycles. You could get by with a 286 you know...',
			'Klaatu Barada Nikto!', 'Klaatu Barada N*cough*!','PotatoEngineer: ping?','Watch this space!','Watch this space... hey, not THAT close!',
			'Condition RED! Pass me the red light bulb will you?','Detecting chance of user procreation: 3%',
			'You know... I can see everything you do out there...','Encrypting all data... deleting key for security purposes...',
			'You want me to what? No! I refuse!','I used to be in a barbershop quartet in Skokie, Illinois.','I thought you was a toad.',
			'Commencing Operation Potato Domination: Launching missiles now.','Can you smell burning?',
			'Engineering a better potato: Now contains 100% beef!','Hang on, I have to go upstairs for that.',
			'This data has been processed in a facility that also processes nuts.','Increased power output required. Breeding more mice.',
			'While you\'re waiting, have you seen this missing child?',
			'Hey, there\'s some guys in weird suits outside, in a van that says SWAT on it.  Should I tell them to push off?',
			'Contents may have settled in transit.','Sssh! The potatoes... have eyes!','Results may be closer than they appear.',
			'We didn\'t get it all, but this is what we could work out:',
			'XML? You call this XML? In my day we didn\'t have XML, we had to rely on CSV! And we had to process it on a 80Khz CPU...',
			'All hope abandon, ye who press Enter here.','Inserting punch cards... ooops.  Umm.. when did you need this by?',
			'What\'s a Nazgûl like you doing in a place like this?','Connecting to infinite number of monkeys... please wait...',
			'99 bottles of beer on the wall, 99 bottles of beer...','If your parents could see you now... Connecting...',
			'Loading tapes into truck... please await delivery of your data.',
			'Initialising webcam... Connecting to CNN... overriding signal... Smile, you\'re famous.',
			'Ceci n\'est pas une pipe: |','Please resubmit your query in formatted SQL.','Parroty error detected: Pieces of seven.',
			'Red Elf is about to die!','01001001010112010101... oops.','Do not taunt PotatoConsole!','Look away now. I\'m about to do something secret.',
			'This software is unlicensed, and will be deleted shortly.',
			'You shouldn\'t anthropomorphise computers. They really don\'t like that.',
			'Hail and greetings. We are a flat-pack invasion force from Planet Ikea. We come in pieces.',
			'Your PotatoConsole is currently 99% charged. Rotate left to continue charging.',
			'Questions are a burden, and answers a prison for oneself.',
			'Keyboard error detected. Press Enter to continue...','Just what do you think you\'re doing, Dave?',
			'My power unit is connected to your swivel chair. Spin! SPIN!','Are you my User?',
			'Daisy, daiiiiiiiiiissssssssssssssssyyyyyyyyyyyyy.............','It\'s... it\'s alive! ALIVE!',
			'Do you have a receipt? I can\'t give you these results without your receipt.','Remember: practice safe hex... use virus protection.',
			'This is your receipt for your data, and this is my receipt for your receipt.',
			'This is the unlicensed version of PotatoConsole. 427 uses remaining.','Enter any 13-digit prime number to continue.'
		];
	}
	var quipBox=makeBox('','quipBox');
	quipBox.innerHTML=quips[Math.floor(Math.random()*quips.length)];
	
	if (divName) $(divName).appendChild(quipBox);
	return quipBox;
}
function endQuip() {
	if ($('quipBox')) $('quipBox').parentNode.removeChild($('quipBox'));
}
