// ==UserScript==
// @name           Moat Walker
// @namespace      http://potatoengineer.110mb.com/
// @description    A slightly-less-evil (but still evil) script that walks around the Moat in Water City, slaughtering everything.  You must have a Ghastly Bling equipped to use this script, and be holding your weapon of choice.
// @include        http://cities.totl.net/cgi-bin/game*
// @include        http://carmilla.ecs.soton.ac.uk:8080/cgi-bin/game*
// ==/UserScript==


GM_setValue('scriptVersion','1.0');
// I don't think I am EVER going to release this script.  But, you know, boilerplate code never dies.
makeConfig();
checkUpdates();

setTimeout(walkWithCatch,500);

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
		cancelDiv.setAttribute("id","stop_moat_walker");
		var cancelButton=document.createElement('input');
		cancelButton.setAttribute("type","button");
		cancelButton.setAttribute("class","button");
		cancelButton.setAttribute("value",'Stop, Moat Walker, stop!');
		cancelButton.addEventListener('click',
				function (){
					//GM_log('cancelled clicking due to user input');
					GM_setValue('active',false);
				},true);
		cancelDiv.appendChild(cancelButton);
		cancelDiv.appendChild(document.createTextNode(' Movement Direction: '+GM_getValue('direction') + ' noMonsterCount: '+GM_getValue('noMonsterCount')));
		document.body.insertBefore(cancelDiv,document.body.firstChild);

		// check for break conditions: Either we've moved 24 times (the distance of one lap around the moat), or we can't find The Moat anywhere on the screen.
		var viewport=document.getElementById('control_pane');
		if (GM_getValue('noMonsterCount')>=4 || !/The Moat|Learners Pool|Temple of Water|Fish Pond/.test(viewport.innerHTML) || / has worn out./.test(document.getElementById('messages'))) {
			GM_setValue('active',false);
			return;
		}
		// get both the "move in X direction" and "move in Y direction" buttons.
		var fightPath='//input[@name="act_fight_n" or @name="act_fight_e" or @name="act_fight_w" or @name="act_fight_s"]';
		//GM_log('looking for fight path');
		// first, look for a fight button.  If there's a fight button, then click it.  Otherwise, look for the move button.
		var target=document.evaluate(fightPath, viewport, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		if (target.snapshotLength) {
			target=target.snapshotItem(0);
			GM_setValue('noMonsterCount',0);
		}
		else {
			if (GM_getValue('direction','n')=='n' && getLatitude()>=98) {
				GM_setValue('direction','w');
			}
			else if (GM_getValue('direction','n')=='w' && getLongitude()<=92) {
				GM_setValue('direction','s');
			}
			else if (GM_getValue('direction','n')=='s' && getLatitude()<=92) {
				GM_setValue('direction','e');
			}
			else if (GM_getValue('direction','n')=='e' && getLongitude()>=98) {
				GM_setValue('direction','n');
			}
			//GM_log('looking for move path');
			var movePath='//input[@name="act_move_'+GM_getValue('direction','n')+'"]';
			target=document.evaluate(movePath, viewport, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
			if (target.snapshotLength) target=target.snapshotItem(0);
			GM_setValue('noMonsterCount',1+GM_getValue('noMonsterCount',0));
		}
		target.click();
	}
	
}

function haveGPS() {
	var lat = document.getElementById( "lat" );
	var lon = document.getElementById( "long" );
	
	if( !lat || !lon ) {
		return false;
	}
	return true;	
}

function getLatitude() {
	var lat = document.getElementById( "lat" );
	var lat_text = lat.firstChild.nodeValue;
	var lat_value = parseInt( lat_text );
	if( lat_text.lastIndexOf( "S" ) != -1 ) {
		lat_value = -lat_value;
	}
	return lat_value;
}

function getLongitude() {
	var lon = document.getElementById( "long" );
	var lon_text = lon.firstChild.nodeValue;
	var lon_value = parseInt( lon_text );
	if( lon_text.lastIndexOf( "W" ) != -1 ) {
		lon_value = -lon_value;
	}
	return lon_value;
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
	var configDiv=makeBox('Moat Walker: ','CitiesMoatWalker');
	
	var goButton=document.createElement('input');
	goButton.type='button';
	goButton.setAttribute('class','button');
	goButton.value='Activate!';
	goButton.addEventListener('click',
		function(){
			GM_setValue('active',true);
			GM_setValue('noMonsterCount',0);
			walkWithCatch();
		},true);
	configDiv.appendChild(goButton);
	
	var directionSelect=document.createElement('select');
	directionSelect.addEventListener('change',
		function() {
			GM_setValue('direction',directionSelect.options[directionSelect.selectedIndex].value);
			GM_log('direction: '+GM_getValue('direction'));
		}, true);
	directionSelect.innerHTML="<option value='n'>North</option><option value='e'>East</option><option value='s'>South</option><option value='w'>West</option>";
	for (var i=0;i<directionSelect.options.length;i++) {
		if (directionSelect.options[i].value==GM_getValue('direction','e') ) {
			directionSelect.selectedIndex=i;
			break;
		}
	}
	configDiv.appendChild(document.createTextNode(' Initial Direction:'));
	configDiv.appendChild(directionSelect);
	
	
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
				
				insertAt(potatoConsole,GM_getValue('console_display_location','UnderPrefs'));
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
