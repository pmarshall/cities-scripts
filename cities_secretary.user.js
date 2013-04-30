// ==UserScript==
// @name		Cities Secretary
// @namespace	http://potatoengineer.110mb.com
// @description 	Adds an editable notepad to the top of the screen
// @include	http://cities.totl.net/cgi-bin/game*
// @include	http://carmilla.ecs.soton.ac.uk:8080/cgi-bin/game*
// @require	http://potatoengineer.110mb.com/cities_potatolibrary.user.js
// ==/UserScript==
//
// Created by Paul Marshall, a.k.a. Cor or PotatoEngineer
// The WTH license applies here: you may do WHATEVER THE HELL YOU WANT to this script.
//
// It occurs to me that, now that I've created PotatoConsole, my scripts are no longer simple enough to be primers for 
// complete Javascript neophytes.  Heck, my boilerplate code is now several pages long.  I suppose that such is the price 
// of massive tweaking.
//
// On another note, this script is the first one I've made where everything is in the controls definition.  I think.
//
// Version 1.1: PotatoLibrary/Newfangled Interface upgrade.
//
// Version 1.03: Tiny PotatoConsole fix.
//				Textarea has the same background as textareas in the game.
//
// Version 1.02: I entirely forgot to put the checkUpdates() command in there.  Well, it's there now.
//
// Version 1.01: It now automatically does a little quick-and-dirty resizing when you move it.  YMMV, I do not know your
//					monitor's resolution, etc., but it should at least keep from destroying the screen.
//
// Version 1.0: Displays a textarea at the top of the screen, and remembers what you write there.
//				In the config area, you can assign the script to one of many places, change the width, or banish it to
//					another location for 3 hours if you've gotten tired of looking at it.
//				This script is also an update to PotatoConsole: it'll stay open if you ask it to.

GM_setValue('scriptVersion','1.1');
var banishDuration=3600*1000*3; //banishing is 3 hours.
checkUpdates('Cities Secretary','secretary','cities_secretary.user.js');

if (GM_getValue('displayLocation','NONE')=='NONE') GM_setValue('displayLocation','PageTop');
GM_log('secretary initialized.  displayLocation:'+GM_getValue('displayLocation'));
makeConfig();


function makeConfig() {
	var box=makeBox('Secretary: ','CitiesSecretary');
	
	var reminder=document.createElement('textarea');
	reminder.id='reminder';
	reminder.setAttribute('class','textin');
	reminderText=GM_getValue('reminder'+getUsername(),'');
	reminderCols=GM_getValue('columns',95);
	
	// auto-adjusting textbox size: the number of lines is the number of newline characters, plus one.  Also check if it's gone past the end of the line, and add more carriage returns if necessary.  It doesn't count spaces when breaking lines, but it should be accurate enough for most uses.
	var newLines=0;
	var lineLength=0;
	for (var i=0; i<reminderText.length;i++) {
		if (reminderText[i]=="\n" || ++lineLength>reminderCols) {
			newLines++;
			lineLength=0;
		}
	}
	if (newLines==0) newLines=1;
	reminder.rows=newLines;
	
	// if we banish from the top (or bottom) to anywhere that is not the top or bottom, shrink the reminder textbox to 40%.
	if ((new Date()).getTime() - GM_getValue('banishTime','0') < banishDuration && ((GM_getValue('displayLocation')=='PageTop' || GM_getValue('displayLocation')=='PageBottom') && (GM_getValue('banish_target')!='PageTop' && GM_getValue('banish_target')!='PageBottom'))) {
		reminderCols *=.4;
	}
	reminder.cols=reminderCols;
	
	reminder.value=reminderText;

	reminder.addEventListener('keyup',
		function() {
			GM_setValue('reminder'+getUsername(), document.getElementById('reminder').value);
			//GM_log(document.getElementById('reminder').value);
			}
		,true);
	
	box.appendChild(reminder);
	
	var configDiv=document.createElement('div');
	configDiv.setAttribute('style', "display:none");
	configDiv.id='reminderConfig';
	
	var hideConfig=document.createElement('input');
	hideConfig.type='button';
	hideConfig.setAttribute('class','button');
	hideConfig.value='Configure';
	hideConfig.id='reminderConfigButton';
	hideConfig.addEventListener('click', function(){toggleConfig('reminderConfig');},true);
	box.appendChild(hideConfig);
	
	var widthBox=document.createElement('input');
	widthBox.type='text';
	widthBox.id='widthBox';
	widthBox.size="2";
	widthBox.addEventListener('keyup',
		function() {
			GM_setValue('columns',parseInt(document.getElementById('widthBox').value));
		}, true);
	widthBox.value=GM_getValue('columns',95);
	configDiv.appendChild(document.createTextNode('Width of reminder (in columns):'));
	configDiv.appendChild(widthBox);
	
	var banishButton=document.createElement('input');
	banishButton.type='button';
	banishButton.setAttribute('class','button');
	banishButton.value='Banish Reminder for 3 hours to:';
	banishButton.addEventListener('click',
		function() {
			GM_setValue('banishTime',(new Date()).getTime()+'');
		},true)
	configDiv.appendChild(document.createElement('br'));
	configDiv.appendChild(banishButton);
	
	var banishTarget=document.createElement('select');
	banishTarget.addEventListener('change',
			function() {
				GM_setValue('banish_target',banishTarget.options[banishTarget.selectedIndex].value);
			}, true);
	banishTarget.innerHTML=standardLocationOptions();
	
	for (var i=0;i<banishTarget.options.length;i++) {
		if (banishTarget.options[i].value==GM_getValue('banish_target','PageBottom')) {
			banishTarget.selectedIndex=i;
			break;
		}
	}

	configDiv.appendChild(banishTarget);
	
	box.appendChild(configDiv);
	
	// if we've clicked the BANISH button, then the reminder is banished elsewhere for three hours.
	if ((new Date()).getTime() - GM_getValue('banishTime','0') < banishDuration) {
		insertAt(box,GM_getValue('banish_target','PageTop'));
	}
	else {
		insertAt(box,GM_getValue('displayLocation','PageTop'));
	}
	
	var locationBlock=locationSelect();
	
	configDiv.appendChild(locationBlock);
	
	var displaySelect=xpath1('//select',locationBlock);
	displaySelect.addEventListener('change',
			function() {
				var newLocation=displayLocation.options[displaySelect.selectedIndex].value;
				var oldLocation=GM_getValue('displayLocation','PageTop');
				// if we're moving from the top to elsewhere, shrink the box size down to 40%.
				if (((oldLocation=='PageTop' || oldLocation=='PageBottom') && (newLocation!='PageTop' && newLocation!='PageBottom'))) {
					GM_setValue('columns',GM_getValue('columns',95)*.4);
				}
				// similarly, if we're moving from elsewhere to the top, increase box size to 250%.
				else if (((oldLocation!='PageTop' && oldLocation!='PageBottom') && (newLocation=='PageTop' || newLocation=='PageBottom'))) {
					GM_setValue('columns',GM_getValue('columns',95)*2.5);
				}
				GM_setValue('displayLocation',displaySelect.options[displaySelect.selectedIndex].value);
				//GM_log(displayLocation.options[displayLocation.selectedIndex].value);
			}, true);
}
