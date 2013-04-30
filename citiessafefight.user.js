// ==UserScript==
// @name           Cities Safe Fight
// @namespace      http://potatoengineer.110mb.com
// @description    Doesn't let you attack when you're below a (configurable) amount of HP
// @include        http://cities.totl.net/cgi-bin/game*
// @include        http://carmilla.ecs.soton.ac.uk:8080/cgi-bin/game*
// ==/UserScript==
//
// Disables the fight buttons once you're below the user-configurable HP.  
//
// Note: it should be quite possible to create a script that will disable fight buttons selectively, depending
// on the creature being attacked. But that sounds suspiciously like work, so I have left it for future scripters.
//
// Created by PotatoEngineer, a.k.a. Cor, a.k.a. Paul Marshall.
// Some bits stolen from dragon's DontBreakIt script, others plagiarized by my own Button Masher script.
// You may freely use, edit, copy, modify, or excerpt this script for any non-commercial purpose.
//
// Version 1.2: PotatoConsole update: you can leave the console open if you unset the checkbox.
//
// Version 1.1: PotatoConsole added.
//
// Version 1.01: changing the HP threshold happens immediately, not after you leave the textbox.
//
// Version 1.0: Does what it says on the tin!

GM_setValue('scriptVersion','1.2');

disableFighting();
makeConfig();
checkUpdates();

function disableFighting() {
	var HP=document.getElementById('hp').innerHTML;
	if (parseInt(HP)<=parseInt(GM_getValue('hp_threshold','0'))) {
		//GM_log('hp below threshold');
		var viewport=document.getElementById('viewport');
		var fightButtons=viewport.getElementsByTagName('input');
		
		for (var i in fightButtons) {
			//GM_log('button type'+typeof(fightButtons[i]));
			//GM_log('button name:'+fightButtons[i].name);
			if (/^act_fight_/.test(fightButtons[i].name)) {
				//GM_log('disabling');
				fightButtons[i].disabled=true;
				fightButtons[i].style.opacity=.5;
			}
		}
	}
}

function enableFighting() {
	var viewport=document.getElementById('viewport');
	var fightButtons=viewport.getElementsByTagName('input');
	
	for (var i in fightButtons) {
		if (/^act_fight_/.test(fightButtons[i].name)) {
			//GM_log('disabling');
			fightButtons[i].disabled=false;
			fightButtons[i].style.opacity=1.0;
		}
	}
}

function makeConfig() {
	var configDiv = makeBox('Safe Fight:');

	var hpbox = document.createElement('input');
	hpbox.type = 'text';
	hpbox.setAttribute('size', '4');
	hpbox.className = 'textin';
	hpbox.addEventListener('keyup',
				function () {
					GM_setValue('hp_threshold',hpbox.value);
					enableFighting();
					disableFighting();
				}
				,true);
	hpbox.value=GM_getValue('hp_threshold',0);
	configDiv.appendChild(document.createTextNode(' HP threshhold for fighting: '));
	configDiv.appendChild(hpbox);
	
	enableAll = document.createElement("input");
	enableAll.setAttribute("type", "button");
	enableAll.setAttribute("class", "button");
	enableAll.setAttribute("value", "Enable Fighting");
	enableAll.addEventListener('click',function(event) {enableFighting();},true);
	configDiv.appendChild(document.createTextNode(' '));
	configDiv.appendChild(enableAll);
	
	insertAt(configDiv,GM_getValue('display_location','PotatoConsole'));
	// POTATOCONSOLE CREATION
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
		if (displayLocation.options[i].value==GM_getValue('display_location','PageTop')) {
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
			addAfter(newel,document.getElementById('opts'));
			break;
		case 'UnderMap':
			document.getElementById('viewport').appendChild(newel);
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
function makeBox(titletext) {
	var box = document.createElement("div");
	box.setAttribute("class", "controls");
	if(titletext)
	{	
		var title = document.createElement("span");	
		title.setAttribute("class", "control_title");
		title.innerHTML = titletext;
		box.appendChild(title);
	}
	return box;
}

// it's a simple script, yes.  But INEVITABLY, it's going to change.  Here's to hoping it never does.
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
					if (scriptVersions['safefight']>GM_getValue('scriptVersion','')) {
						GM_setValue('webVersion',scriptVersions['safefight']);
					}
					// only stop checking for updates this hour if we actually managed to hit the webpage.
					GM_setValue('updateHour',time.getHours());
					GM_setValue('updateDate',time.getDate());
				}
			}
		});
	}
	
	if (GM_getValue('webVersion','') > GM_getValue('scriptVersion')) {
		GM_log('webversion:'+GM_getValue('webVersion')+'  version:'+GM_getValue('scriptVersion'));
		updateSpan=makeBox('');
		updateSpan.innerHTML='Your version of Safe Fight ('+GM_getValue('scriptVersion')+') is out of date!  Download the new version ('+GM_getValue('webVersion')+') <a href=http://potatoengineer.110mb.com/citiessafefight.user.js>here!</a>';
		document.body.insertBefore(updateSpan,document.body.firstChild);
	}
}
