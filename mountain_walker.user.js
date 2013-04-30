// ==UserScript==
// @name           Mountain Walker
// @namespace      http://potatoengineer.110mb.com
// @description    A totally evil script that will walk the Mountain Trail, looking for Huge Reptiles
// @include        http://cities.totl.net/cgi-bin/game*
// @include        http://carmilla.ecs.soton.ac.uk:8080/cgi-bin/game*
// ==/UserScript==

// step 1: a stupid script that will traverse the trail in some brain-dead way, simply aligning monsters in my way.  When given the option of two paths, one of which is passable, and the other which is not, it should pick the passable path rather than aligning the impassible path.

// variables necessary: Current direction we're moving in.  For the heck of it, store alignment.  Don't need to store my current action (even if I'm switching to a wand for aligning), because the new page-load will have exactly the same data as the old page-load.
// Knowledge necessary (can be hard-coded): look for missing move/fight arrows, and use user input for the first input.  Only requires four movement directions.
//
// Version 1.0: Goes uphill, wands when necessary, avoids when not possible.
// Version 1.1: uses instruments in preference to wands, also goes downhill.


GM_setValue('scriptVersion','1.1');
// I don't think I am EVER going to release this script.  But, you know, boilerplate code never dies.
//checkUpdates();

var userRegEx=new RegExp('^((Pvt\. |Cpl\. |Sgt\. )?(Duke |Earl |Baron |Knight |Shaman |Apprentice |Wizard |Smith |Armourer |Master Armourer |Great Lord )?)'+ document.getElementById('username').innerHTML);
var disguised=!(userRegEx.test(document.getElementById('username').nextSibling.firstChild.innerHTML));

if (!disguised && document.getElementById('avatar')) GM_setValue('alignment'+getUsername(),getAlignment());
makeConfig();


setTimeout(function (){walkWithCatch()},500);

function walkWithCatch() {
	try {
		walk();
	}
	catch (ex) {
		GM_setValue('active',false);
		GM_log('exception! '+ex);
	}
}

function walk() {
// only do anything if we're actually, you know, using the script.
	if (GM_getValue('active',false)) {
		// create the cancel button
		var cancelDiv=makeBox('');
		cancelDiv.setAttribute("id","stop_walker");
		var cancelButton=document.createElement('input');
		cancelButton.setAttribute("type","button");
		cancelButton.setAttribute("class","button");
		cancelButton.setAttribute("value",'Stop, Mountain Walker, stop!');
		cancelButton.addEventListener('click',
				function (){
					//GM_log('cancelled clicking due to user input');
					GM_setValue('active',false);
				},true);
		cancelDiv.appendChild(cancelButton);
		cancelDiv.appendChild(document.createTextNode(' Movement Direction: '+GM_getValue('directionY')+GM_getValue('directionX')+' '+GM_getValue('directionZ')));
		document.body.insertBefore(cancelDiv,document.body.firstChild);

		// check for break conditions: either we've spotted the MCoGaL, or we've spotted a Huge Reptile, or we can't see a mountain trail ANYWHERE.
		var viewport=document.getElementById('control_pane');
		if (/Mysterious City of Gold and Lead|Huge Reptile/.test(viewport.innerHTML) || !/Mountain Trail/.test(viewport.innerHTML)) {
			GM_setValue('active',false);
			return;
		}
		// get both the "move in X direction" and "move in Y direction" buttons.
		var movePathY='//input[@name="act_move_'+GM_getValue('directionY','n')+'" or @name="act_fight_'+GM_getValue('directionY','n')+'"]';
		var movePathX='//input[@name="act_move_'+GM_getValue('directionX','e')+'" or @name="act_fight_'+GM_getValue('directionX','e')+'"]';
	
		var target1=document.evaluate(movePathY, viewport, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		if (target1.snapshotLength) target1=target1.snapshotItem(0);
		else target1=null;
		var target2=document.evaluate(movePathX, viewport, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		if (target2.snapshotLength) target2=target2.snapshotItem(0);
		else target2=null;
	
		// choose one of the directions.  If one of them requires fighting, and the other doesn't, go with the simple movement.  Arbitrary selection: move vertically, and fight horizontally, when both options are the same.
		var target=null;
		if (target1 && target2) {
			if (/fight/.test(target1.name)) target=target2;
			else target=target1;
		}
		else if (target1) {
			target=target1;
		}
		else if (target2) {
			target=target2;
		}
		// if there's no targets, we're in a corner, and it's time to move in a new direction.
		else {
			GM_log ('No targets!  Woe is me!  Selecting new target.');
			if (GM_getValue('directionZ','uphill')=='uphill') {
				if (GM_getValue('directionY','n')=='n') {
					if (GM_getValue('directionX','e')=='e') {
						GM_setValue('directionX','w');
					}
					else {
						GM_setValue('directionY','s');
					}
				}
				else {
					if (GM_getValue('directionX','e')=='e') {
						GM_setValue('directionY','n');
					}	
					else {
						GM_setValue('directionX','e');
					}
				}
			}
			else {
				if (GM_getValue('directionY','n')=='n') {
					if (GM_getValue('directionX','e')=='e') {
						GM_setValue('directionY','s');
					}
					else {
						GM_setValue('directionX','e');
					}
				}
				else {
					if (GM_getValue('directionX','e')=='e') {
						GM_setValue('directionX','w');
					}	
					else {
						GM_setValue('directionY','n');
					}
				}
			}
				//this should refresh the page, IIRC.
			window.location.href='http://cities.totl.net/cgi-bin/game';
			return;
		}
	
		// if the only available option is fighting, then align the bugger instead.
		if (/fight/.test(target.name)) {
			var invselect = document.getElementById('inventory').getElementsByTagName('select')[0];
			var item = invselect.options[invselect.selectedIndex].value;
			if (item==getInstrument(GM_getValue('alignment'+getUsername())) || item.toLowerCase()==GM_getValue('alignment'+getUsername())+'wand') {
				// if we're already holding the alignment wand, just attack.
				target.click();
			}
			// if we're not holding the alignment wand, then hold the alignment wand.
			else {
				GM_log('looking for wand.  Alignment: '+GM_getValue('alignment'+getUsername()));
				var found=false;
				for (var i=0;i<invselect.options.length;i++) {
					// look for an instrument first.  If we're a funky alignment, go for the funky alignment wand.
					if (invselect.options[i].value==getInstrument(GM_getValue('alignment'+getUsername())) ||
							(!/air|earth|fire|water/.test(GM_getValue('alignment'+getUsername())) 
							&& invselect.options[i].value.toLowerCase()==GM_getValue('alignment'+getUsername())+'wand')) {
						invselect.selectedIndex=i;
						var nullActionPath='//input[@name="act_null"]';
						var nullAction=document.evaluate(nullActionPath, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(0);
						found=true;
						nullAction.click();
						break;
					}
				}
				// if we have neither instrument nor wand, I give up.
				if (!found) {
					GM_setValue('active',false);
					GM_log('I give up!  You have nothing to attack with!');
				}
			}
		}
		// if it's just a move button, then move.
		else if (/move/.test(target.name)) {
			target.click();
		}
	}
	
}

function getInstrument(align) {
	switch (align) {
		case 'air': return 'InstrumentHarmonica';
		case 'earth': return 'InstrumentAccordion';
		case 'fire': return 'InstrumentFiddle';
		case 'water': return 'InstrumentTambourine';
	}
}

function getUsername() {
	return document.getElementById('username').innerHTML;
}

function getAlignment() {
	if (disguised) return false;

	var alignment=/player_([^ ]*)/.exec(document.getElementById('avatar').getAttribute('class'));
	if (alignment) return alignment[1];
	else return false;
}

function makeBox(titletext, id){
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

function makeConfig() {
	var configDiv=makeBox('Mountain Walker: ','CitiesMountainWalker');
	
	var goButton=document.createElement('input');
	goButton.type='button';
	goButton.setAttribute('class','button');
	goButton.value='Activate!';
	goButton.addEventListener('click',
		function(){
			GM_setValue('active',true);
			walk();
		},true);
	configDiv.appendChild(goButton);
	
	var directionSelect=document.createElement('select');
	directionSelect.addEventListener('change',
		function() {
			GM_setValue('directionX',directionSelect.options[directionSelect.selectedIndex].value[1]);
			GM_setValue('directionY',directionSelect.options[directionSelect.selectedIndex].value[0]);
			GM_log('directionX: '+GM_getValue('directionX')+' directionY: '+GM_getValue('directionY'));
		}, true);
	directionSelect.innerHTML="<option value='ne'>North-East</option><option value='nw'>North-West</option><option value='se'>South-East</option><option value='sw'>South-West</option>";
	for (var i=0;i<directionSelect.options.length;i++) {
		if (directionSelect.options[i].value[1]==GM_getValue('directionX','e') &&
			directionSelect.options[i].value[0]==GM_getValue('directionY','n')) {
			directionSelect.selectedIndex=i;
			break;
		}
	}
	configDiv.appendChild(document.createTextNode(' Initial Direction:'));
	configDiv.appendChild(directionSelect);
	
	
	var rotationSelect=document.createElement('select');
	rotationSelect.addEventListener('change',
		function() {
			GM_setValue('directionZ',rotationSelect.options[rotationSelect.selectedIndex].value);
			GM_log('directionZ: '+GM_getValue('directionZ'));
		}, true);
	rotationSelect.innerHTML="<option value='uphill'>Uphill</option><option value='downhill'>Downhill</option>";
	for (var i=0;i<rotationSelect.options.length;i++) {
		if (rotationSelect.options[i].value==GM_getValue('directionZ','uphill')) {
			rotationSelect.selectedIndex=i;
			break;
		}
	}
	configDiv.appendChild(document.createElement('br'));
	configDiv.appendChild(document.createTextNode('Vertical direction:'));
	configDiv.appendChild(rotationSelect);
	
//	box.appendChild(configDiv);
	
	insertAt(configDiv,GM_getValue('display_location','PotatoConsole'));
	
	// POTATOCONSOLE CREATION
	// NOTE: NOT THE USUAL POTATOCONSOLE BOILERPLATE!
	// it is much, MUCH faster to create a control via HTML, but it gives me less options for control.
	configDiv.appendChild(document.createElement('br'));
	configDiv.appendChild(document.createTextNode('Display controls:'));
	var displayLocation = document.createElement('select');
	displayLocation.id='DisplayLocation';
	displayLocation.addEventListener('change',
			function() {
				GM_setValue('display_location',displayLocation.options[displayLocation.selectedIndex].value);
				//GM_log(displayLocation.options[displayLocation.selectedIndex].value);
			}, true);
	displayLocation.innerHTML="<option value='PotatoConsole'>In PotatoConsole</option><option value='PageTop'>Top of Page</option><option value='AboveUsername'>Above Name</option><option value='UnderAbilities'>Under Abilities</option><option value='UnderItem'>Under Item</option><option value='UnderEquipment'>Under Equipment</option><option value='UnderPrefs'>Under Preferences</option><option value=UnderMap>Under Map</option><option value='PageBottom'>Bottom of Page</option>";
	for (var i=0;i<displayLocation.options.length;i++) {
		if (displayLocation.options[i].value==GM_getValue('display_location','PotatoConsole')) {
			displayLocation.selectedIndex=i;
			break;
		}
	}
	
	configDiv.appendChild(displayLocation);
	
}
function addAfter(newel, existing) {
	existing.parentNode.insertBefore(newel, existing.nextSibling);
}
function insertAt(newel, target) {
	switch (target) {
		case 'PotatoConsole':
			var potatoConsole=document.getElementById('PotatoConsoleScriptArea');
			if (potatoConsole) {
				potatoConsole.appendChild(newel);
			}
			else {
				potatoConsole=makeBox("PotatoEngineer's Script Console ");
				potatoConsole.id='PotatoConsole';
				var hideButtonPC=document.createElement('input');
				hideButtonPC.type='button';
				hideButtonPC.setAttribute('class','button');
				if (GM_getValue('close_console',true) || !GM_getValue('consoleVisible',false)) {
					hideButtonPC.value='Show Controls';
					GM_setValue('consoleVisible',false)
				}
				else hideButtonPC.value='Hide Controls';
				hideButtonPC.addEventListener('click',
					function () {
						if (GM_getValue('consoleVisible',false)) {
							document.getElementById('PotatoConsoleScriptArea').setAttribute('style','display:none');
							hideButtonPC.value='Show Controls';
						}
						else {
							document.getElementById('PotatoConsoleScriptArea').setAttribute('style','');
							hideButtonPC.value='Hide Controls';
						}
						GM_setValue('consoleVisible',!GM_getValue('consoleVisible',false));
					},true);
				potatoConsole.appendChild(hideButtonPC);
				
				var consoleDisplayLocation = document.createElement('select');
				consoleDisplayLocation.id='ConsoleDisplayLocation';
				consoleDisplayLocation.addEventListener('change',
						function() {
							GM_setValue('console_display_location',consoleDisplayLocation.options[consoleDisplayLocation.selectedIndex].value);
							//GM_log(consoleDisplayLocation.options[consoleDisplayLocation.selectedIndex].value);
						}, true);
				consoleDisplayLocation.innerHTML="<option value='PageTop'>Top of Page</option><option value='AboveUsername'>Above Name</option><option value='UnderPrefs'>Under Preferences</option><option value='UnderAbilities'>Under Abilities</option><option value='UnderItem'>Under Item</option><option value='UnderEquipment'>Under Equipment</option><option value=UnderMap>Under Map</option><option value='PageBottom'>Bottom of Page</option>";
				for (var i=0;i<consoleDisplayLocation.options.length;i++) {
					if(consoleDisplayLocation.options[i].value==GM_getValue('console_display_location','UnderPrefs')) {
						consoleDisplayLocation.selectedIndex=i;
						break;
					}
				}
				
				var scriptAreaPC=document.createElement('span');
				scriptAreaPC.id='PotatoConsoleScriptArea';
				
				if (GM_getValue('close_console', true) || !GM_getValue('consoleVisible',false)) {
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
						GM_setValue('close_console', document.getElementById('closeConsoleCB').checked);
					}, true);
				closeConsole.checked=GM_getValue('close_console',true);
				scriptAreaPC.appendChild(document.createElement('br'));
				scriptAreaPC.appendChild(document.createTextNode('Close console on refresh: '));
				scriptAreaPC.appendChild(closeConsole);
				
				scriptAreaPC.appendChild(newel);
				//document.getElementById('viewport').appendChild(potatoConsole);
				//addAfter(potatoConsole, document.getElementById('viewport'));
				//document.body.appendChild(potatoConsole);
				
				insertAt(potatoConsole,GM_getValue('console_display_location','UnderEquipment'));
				//addAfter(potatoConsole,document.getElementById('say'));
			}
			break;
		case 'UnderAbilities':
			var abilities=document.getElementById('abilities');
			if (abilities) addAfter(newel,abilities);
			else {
				var say=document.getElementById('say');
				say.parentNode.insertBefore(newel, say);
			}
			break;
		case 'UnderItem':
			var item=document.getElementById('item');
			if (item) addAfter(newel, item);
			else {
				var location=document.getElementById('location');
				if (location) addAfter(newel, location);
				else {
					var say=document.getElementById('say');
					say.parentNode.insertBefore(newel, say);
				}
			}
		case 'UnderEquipment':
			var equip=document.getElementById('equipment');
			if (equip) {
				addAfter(newel, equip);
			}
			else {
				var say=document.getElementById('say');
				say.parentNode.insertBefore(newel, say);
			}
			break;
		case 'UnderPrefs':
			addAfter(newel,document.getElementById('say'));
			break;
		case 'UnderMap':
			document.getElementById('control_pane').appendChild(newel);
			break;
		case 'PageBottom':
			document.body.appendChild(newel);
			break;
		case 'AboveUsername':
			document.getElementById('username').parentNode.insertBefore(newel,document.getElementById('username'));
			break;
		case 'PageTop':
			document.body.insertBefore(newel, document.body.firstChild);
			break;
	}
}
function checkUpdates() {
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
					if (scriptVersions['mountainwalk']>GM_getValue('webVersion','')) {
						GM_setValue('webVersion',scriptVersions['mountainwalk']);
					}
					// only stop checking for updates this hour if we actually managed to hit the webpage.
					GM_setValue('updateHour',time.getHours());
					GM_setValue('updateDate',time.getDate());
				}
			}
		});
	}
	
	if (GM_getValue('webVersion','') > GM_getValue('scriptVersion')) {
		//GM_log('webversion:'+GM_getValue('webVersion')+'  scriptVersion:'+GM_getValue('scriptVersion'));
		updateSpan=makeBox('');
		updateSpan.innerHTML='Your version of Mountain Walker ('+GM_getValue('scriptVersion')+') is out of date!  Download the new version ('+GM_getValue('webVersion')+') <a href=http://potatoengineer.110mb.com/citiesmountainwalker.user.js>here!</a>';
		document.body.insertBefore(updateSpan,document.body.firstChild);
	}
}
