// ==UserScript==
// @name           Cities Button Masher
// @namespace      http://potatoengineer.110mb.com
// @description    Clicks any button as many times as you want.
// @include        http://cities.totl.net/cgi-bin/game*
// @include		   http://carmilla.ecs.soton.ac.uk:8080/cgi-bin/game*
// @require		http://potatoengineer.110mb.com/cities_potatolibrary.user.js
// ==/UserScript==
// The vast majority of this script is a shameless rip-off of the BulkBuy script, created by Stevie-O.
// The instructions are right there on the tin:  Enter a number in the box, and then click something.
// The script takes care of the rest, and clicks it a bunch of times.
// Names I considered while writing this: OCD, Button Masher, Spaz, ClickMonkey
//
// Version 5.01: I accidentally broke updates while trying to muck about with auto-updates and splitting BM from MM.  Version numbers can only go up, apparently.
//			also: tweaked UI.
//
// Version 2.11: PotatoLibrary update (recursive PotatoConsole placement)
//
// Version 2.1: You can now record & replay set sequences.
//
// Version 2.0: Allows you to specify "stop regexes" if something important happens.
//
// Version 1.9: Fixed for newfangled interface.
//
// Version 1.8: Delay before clicking is user-configurable.
//				Also fixed cancelling button-mashing when you run out of AP.
//
// Version 1.7: Button-mashing is cancelled if you're a werewolf (toggleable via a checkbox).
//
// Version 1.62: ACTUALLY fixed double-display bug.
//
// Version 1.61: Fixed the weird controls-display-twice-when-mashing-ends bug.
//
// Version 1.6: if you're planting beans, it'll climb down the beanstalk (user-configurable).  
//					Will never use your last AP on beanstalk-climbing.
//
// Version 1.5: Leech-farming has been tweaked: now you can set it so you always use the smallest leech available.
//
// Version 1.41: Due to a lack of earlier bugfixing, BM didn't play as well with Secretary as it should.  Now it does.
//
// Version 1.4: PotatoConsole update: you can now leave it open if you like.
//
// Version 1.31: bugfix for PotatoConsole.
//
// Version 1.3: Stops clicking things once you run out of AP.
//				Also, added to PotatoConsole.
//				Also also, the target leech number is selectable.
//
// Version 1.23: Now plays nicely with Item Selector.
//
// Version 1.21: Moved up a bit (to just below the item/location/abilities box, in that order)
//				Now clicks buttons disabled by Don'tBreakIt (or other scripts).  If you really clicked ENABLE and 
//					then MASH BUTTONS, I figure you probably mean it.
//				Bugfix: clicking "STOP, Button Masher, Stop!" actually stops this iteration, if you click fast enough.
//
// Version 1.2: Added Leech Breeder functionality.  If a leech breaks while you attack, it'll automatically select a leech
//					that's smaller than size 9, and it'll stop attacking if it produces a Leech9.
//
// Version 1.11: Stop conditions checked BEFORE the bar at the top is created.  (deleting it occasionally does odd things.)
//				The "boots wore out while walking" condition has been broadened to "something wore out while walking".
//
// Version 1.1: Added various "stop" conditions (mine broke when mining, hat stolen while buying,
//					boots wore out while walking, last weapon broke while fighting, HP too low for fighting)
//				Stripped debug statements
//				Added "Stop Button Masher" button to top of screen
//				Added 500-millisecond delay to clicking the button
//				Cleared the debug code out.
//
// Version 1.0: It clicks things!

var debug=GM_getValue('debug',false);
var doneRecording=false;

GM_setValue('scriptVersion','5.01');

checkUpdates('Button Masher','btnmasher','cities_button_masher.user.js'); // first things first: look for updates.  If there's a crash-bug, it'll update before it crashes.

makeConfig();
doClickyThing();

var clickTimer;
function doClickyThing() {
	var clicks = GM_getValue('clicks', 0);
	if (GM_getValue('recording',false)) {
		spamListeners();	// record-sequence listeners, not "copy this one thing" listeners.
		recordBox();
	}
	else if (clicks > 0) {
		cancelBox();
		// Cancellation tests!
		var messages=document.getElementById('messages').innerHTML;
		// basic cancellation test: if we can't find messages on the screen, and we can find "you are out of action points",
		// then we've run out of AP, and should probably quit.
		if (!messages && /You have run out of action points/.test(document.body.innerHTML)) {
			GM_setValue('clicks', 0);
		}
		//GM_log(messages+'    hp:'+document.getElementById('hp').innerHTML+'   threshold:'+GM_getValue('hpThreshold')+'   button:'+GM_getValue('buttonName'));
		
		weaponCode=getHeldItemValue();
		GM_log(weaponCode);
		
		// increment (loopingly) the sequence, decrement clicks if sequenceCount is 0.
		if (debug) GM_log('pre-use sequence:'+GM_getValue('sequence'+getUsername())+'   sequenceCount:'+GM_getValue('sequenceCount'));
		var sequence=eval(GM_getValue('sequence'+getUsername(),'["act_null"]'));
		var buttonName=sequence[GM_getValue('sequenceCount',0)];
		GM_setValue('sequenceCount',(GM_getValue('sequenceCount',0)+1)%sequence.length);
		if (GM_getValue('sequenceCount',0)==0) GM_setValue('clicks',GM_getValue('clicks',1)-1);
		if (debug) GM_log('post-use sequence:'+sequence+'   sequenceCount:'+GM_getValue('sequenceCount')+'  buttonName:'+buttonName);
		
		// it really isn't worth it to do the new callback-paradigm for leech breeding.  Just make it an oldfangled-only feature.

		//Leech Breeder add-on: if we're holding a leech that broke, and we have other leeches, select another leech and soldier on.
		// if we're always supposed to be using the smallest leech, look for other leeches, and switch if there's a smaller one.
		if (!isNewfangled() && /act_fight_/.test(buttonName) && GM_getValue('leechLimit','1')=='smallest' && (/The leech is sated/.test(messages) || weaponCode.substr(0,5)=='Leech')) {
			var leechRE=/^Leech(\d+)/;
			var leeches = new Array();
			for (var i=0;i<inv.options.length;i++) {
				var leechNumber=leechRE.exec(inv.options[i].value);
				if (leechNumber) {
					leeches.push (new Array(i,leechNumber[1]));
				}
			}
			if (leeches.length) {
				var smallestLeech=99;
				var leechIndex;
				for (var i=0;i<leeches.length;i++) {
					if (leeches[i][1]<smallestLeech) {
						leechIndex=leeches[i][0];
						smallestLeech=leeches[i][1];
					}
				}
				if (leechIndex!=inv.selectedIndex) {
					inv.selectedIndex=leechIndex;
					document.forms[0].submit();
					return;
				}
			}
		}
		
		if (/act_fight_/.test(buttonName) && /Now using Fists/.test(messages) && /The leech is sated/.test(messages) && GM_getValue('leechLimit','1')!='smallest') {
			for (i=0;i<inv.options.length;i++) {
				// a little bit of brute-forcing: run through the inventory to find a leech that's smaller than size 9.
				var leechNumber=leechRE.exec(inv.options[i].value);
				if (leechNumber && leechNumber[1]<GM_getValue('leechLimit')) {
					inv.selectedIndex=i;
					document.forms[0].submit();
					GM_log('my leech broke! Selecting new leech: '+inv.options[i].value);
					return;
				}
			}
		}
		// weird stuff: if we're planting things, and we ended up on top of the Beanstalk, go down the beanstalk.  (But only if the user selected that option, and only if we have over 20 AP.)
		else if (buttonName=='act_bean' && GM_getValue('goDownBeanstalk',false) && parseInt(document.getElementById('ap').innerHTML)>20 && /Bean ?[sS]talk/.test(getTerrain())) {
			GM_setValue('clicks', GM_getValue('clicks',1)+1);	// clickThing() always decrements clicks, so put one back.
			clickThing('act_locuse');
			return;
		}
		// Test 1: we're buying things, we started with a hat, and now we have no hat. 
		else if ((buttonName=='act_buy' && GM_getValue('hat', false) && !haveHat()) ||
				// Test 2: we're mining, we started with a mine, and now there's no mine.
				(buttonName=='act_mine' && GM_getValue('mine', false) && !onMine()) ||
				// if we're a werewolf, and we're not supposed to act when we're a werewolf, then cancel.
				(document.getElementById('avatar') && GM_getValue('cancelWerewolfAction',false) && /werewolf/i.test(document.getElementById('avatar').innerHTML)) || 
				// the next tests require the messages pane.
				(messages && 
				// Test 3: we're moving, and something just wore out.  (In theory, only boots matter, but in practice, if the first of your 10 misril blings wear out, you usually want to stop and remove the rest.)
				(/act_move_/.test(buttonName) && /Your (.+) has worn out/.test(messages)) ||
				// Test 4: we're fighting, and our last weapon just wore out, so now we're fighting with fists. WORKS.
				// Test 4.5: we're fighting, and we're down to our threshold HP. WORKS.
				(/act_fight_/.test(buttonName) && (/Now using Fists/.test(messages) || parseInt(document.getElementById('hp').innerHTML)<=parseInt(GM_getValue('hpThreshold')) || weaponCode=='Leech'+GM_getValue('leechLimit')))
				)) {
			cancelMashing();
			return;
		}
		
		//Test 5: one of the "cancel" regexes has twigged.
		var messages=$('messages').innerHTML;
		var lines;
		if (isNewfangled()) lines=messages.split("<br>");
		else lines=messages.split("\n");
		
		for (var i=0;i<GM_getValue('stopCount'+getUsername(),0);i++) {
			var stopRE=new RegExp(GM_getValue('stopText'+i+getUsername(),'FAIL!'),'i');
			for (var j=0;j<lines.length;j++) {
				if (stopRE.test(lines[j])) {
					cancelMashing();
					return;
				}
			}
		}


		// User-definable delay, because some users are funky that way.
		clickTimer= setTimeout(function() {clickThing(buttonName)}, GM_getValue('delay'));
		
	} 
}

function cancelMashing() {
	GM_setValue('clicks',0);
	document.body.removeChild(document.getElementById('stop_masher'));	// delete the cancel button
	GM_log('cancelled clicking.');
	//clickTimer.clearTimeout();
	window.clearTimeout(clickTimer);
}

function cancelBox() {
	if ($('stopMasher') && GM_getValue('clicks',0)<=0) {
		$('stopMasher').parentNode.removeChild($('stopMasher'));
	}
	else if (!$('stopMasher') && GM_getValue('clicks',0)>0) {
		// create the cancel button
		var cancelDiv=makeBox('','stopMasher');
		var cancelButton=makeButton('Stop, Button Masher, stop!');
		cancelButton.addEventListener('click',
					function (){
						//GM_log('cancelled clicking due to user input');
						cancelMashing();
					},true);
		cancelDiv.appendChild(cancelButton);
		cancelDiv.appendChild(document.createTextNode(' Clicks remaining: '+GM_getValue('clicks')));
		document.body.insertBefore(cancelDiv,document.body.firstChild);
	}
}

function recordBox() {
	if ($('recordMasher') && !GM_getValue('recording',false)) {
		$('recordMasher').parentNode.removeChild($('recordMasher'));
	}
	else if (!$('recordMasher') && GM_getValue('recording',false)) {
		// create the cancel button
		var recordDiv=makeBox('','recordMasher');
		var mashButton=makeButton('Stop recording, and mash this much:');
		mashButton.addEventListener('click',
					function (){
						GM_setValue('recording',false);
						var clicks=parseInt($('recordedSequenceClicks').value);
						if (!isNaN(clicks) && clicks>0) {
							GM_setValue('clicks',clicks);
							doneRecording=true;
							doClickyThing();
						}
					},true);
		recordDiv.appendChild(mashButton);
		recordDiv.appendChild(document.createTextNode(' '));
		var clickInput=makeTextin(2,1,'recordedSequenceClicks');
		recordDiv.appendChild(clickInput);
		recordDiv.appendChild(document.createTextNode(' Sequence so far: '+eval(GM_getValue('sequence'+getUsername(),'["nothing"]'))+' '));
		
		var saveButton=makeButton('Stop recording (without mashing)');
		saveButton.addEventListener('click',
					function (){
						doneRecording=true;
						GM_setValue('recording',false);
						recordBox();
					},true);
		recordDiv.appendChild(saveButton);
		
		document.body.insertBefore(recordDiv,document.body.firstChild);
	}
}

var consoleVisible=false;
function makeConfig() {
	var box = makeBox('Button Masher','ButtonMasherDiv');
	
	box.appendChild(document.createElement('br'));
	box.appendChild(document.createTextNode('Enter the number of repetitions, then click any button: '));
	var qtybox=makeTextin(2,'','BMclicks');
	qtybox.addEventListener('change',
				function () {
					spamListeners();
					GM_setValue('sequenceCount',0);
					GM_setValue('clicks',qtybox.value-1); // minus 1, because the user clicks once.
					GM_log('clicks changed:'+(qtybox.value-1));
				}
				,true);
	box.appendChild(qtybox);
	
	box.appendChild(document.createElement('br'));
	
	var recordDiv=document.createElement('div');
	
	recordDiv.appendChild(document.createTextNode('Action sequence: '));
	var recordButton=makeButton('Record','BMstartRecording');
	recordButton.addEventListener('click',
		function() {
			GM_setValue('sequenceCount',0);
			GM_setValue('sequence'+getUsername(),'[]');
			GM_setValue('recording',true);
			spamListeners();
			recordBox();
		}, false);
	recordDiv.appendChild(recordButton);
	
	recordDiv.appendChild(document.createTextNode(' '));
	var playButton=makeButton('Play','BMplayRecording');
	playButton.addEventListener('click',
		function() {
			var clicks=parseInt($('BMplayClicks').value);
			if (!isNaN(clicks) && clicks>0) {
				GM_setValue('sequenceCount',0);
				GM_setValue('clicks',clicks);
				doClickyThing();
			}
		}, false);
	recordDiv.appendChild(playButton);
	recordDiv.appendChild(document.createTextNode(' this many times: '));
	recordDiv.appendChild(makeTextin(2,1,'BMplayClicks'));
	recordDiv.appendChild(document.createElement('br'));
	recordDiv.appendChild(document.createTextNode('Current sequence: '+eval(GM_getValue('sequence'+getUsername(),'["none"]'))));

	if (!GM_getValue('recordInConfig',false)) box.appendChild(recordDiv);
	
	var configDiv=document.createElement('div');
	configDiv.setAttribute('style','display:none');
	configDiv.id='ButtonMasher';

	var configButton=makeButton('Configure','ButtonMasherButton');
	configButton.addEventListener('click',function(){toggleConfig('ButtonMasher');},true);
	
	box.appendChild(configButton);
	box.appendChild(configDiv);
	if (GM_getValue('recordInConfig',false)) {
		recordDiv.appendChild(document.createElement('hr'));
		configDiv.appendChild(recordDiv);
	}
	
	
	
	//box.appendChild(document.createElement('br'));
	
	var hpbox = document.createElement('input');
	hpbox.type = 'text';
	hpbox.setAttribute('size', '4');
	hpbox.className = 'textin';
	hpbox.addEventListener('change',
				function () {
					GM_setValue('hpThreshold',hpbox.value);
					GM_log('hp threshold changed:'+hpbox.value);
				}
				,true);
	hpbox.value=GM_getValue('hpThreshold');
	configDiv.appendChild(document.createTextNode('HP threshhold for fighting: '));
	configDiv.appendChild(hpbox);
	
	var leechLimit=document.createElement('select');
	leechLimit.addEventListener('change',
			function() {
				GM_setValue('leechLimit',leechLimit.options[leechLimit.selectedIndex].value);
				GM_log(leechLimit.options[leechLimit.selectedIndex].value);
			}, true);
	for (var i=1;i<13;i++) {
		leechLimit.innerHTML+="<option value='"+i+"'>"+Math.pow(2,i-1)+"</option>";
	}
	leechLimit.innerHTML+="<option value='smallest'>Use Smallest Leech</option>";
	configDiv.appendChild(document.createElement('br'));
	configDiv.appendChild(document.createTextNode('When attacking with leeches, stop at size: '));
	configDiv.appendChild(leechLimit);
	for (var i=0;i<leechLimit.options.length;i++) {
		if (leechLimit.options[i].value==GM_getValue('leechLimit','1')) {
			leechLimit.selectedIndex=i;
			break;
		}
	}
	
	configDiv.appendChild(document.createElement("br"));
	configDiv.appendChild(makeCheckbox('goDownBeanstalk','Go down beanstalk if growing beans?',false));
	
	configDiv.appendChild(document.createElement("br"));
	configDiv.appendChild(makeCheckbox('cancelWerewolfAction','Cancel button-mashing if you\'re a werewolf?',false));

	configDiv.appendChild(document.createElement("br"));
	configDiv.appendChild(makeCheckbox('recordInConfig','Move sequence-recording to Config section?',false));
	
	var delayBox = document.createElement('input');
	delayBox.type = 'text';
	delayBox.setAttribute('size', '4');
	delayBox.className = 'textin';
	delayBox.addEventListener('change',
				function () {
					GM_setValue('delay',delayBox.value);
					GM_log('delay changed:'+delayBox.value);
				}
				,false);
	if (undefined==GM_getValue('delay')) GM_setValue('delay',500);
	delayBox.value=GM_getValue('delay');
	configDiv.appendChild(document.createElement("br"));
	configDiv.appendChild(document.createTextNode('Delay before clicking (milliseconds): '));
	configDiv.appendChild(delayBox);
	
	// stop texts
	if (undefined==GM_getValue('stopCount'+getUsername())) GM_setValue('stopCount'+getUsername(),0);
	var stopBox=makeBox('','stopBoxDiv');
	configDiv.appendChild(stopBox);
	// need to insert here, because makeStopTexts assumes the stopBoxDiv already exists on the page.
	insertAt(box,GM_getValue('displayLocation','PotatoConsole'));
	makeStopTexts();
	
	configDiv.appendChild(document.createTextNode(' Version: '+GM_getValue('scriptVersion')));
	configDiv.appendChild(makeCheckbox('debug','Debug mode?',false));
	// boilerplate: location selection.
	configDiv.appendChild(locationSelect());
	
}
function setStopText(index) {
	return function() {GM_setValue('stopText'+index+getUsername(),$('BMfirebox'+index).value);};
}

function makeStopTexts() {
	var stopBox=$('stopBoxDiv');
	while (stopBox.hasChildNodes()) stopBox.removeChild(stopBox.firstChild);
	var qtybox = makeTextin(2,GM_getValue('stopCount'+getUsername(),0),'BMstopCount');
	stopBox.appendChild(document.createTextNode('Number of Stop Texts : '));
	stopBox.appendChild(qtybox);
	
	var setEvent = makeButton('Set');
	setEvent.addEventListener('click',
		function(event) {
			var input=parseInt($('BMstopCount').value);
			GM_log('input:'+input+'  type:'+typeof input+'   raw input:'+$('BMstopCount').value);
			if (!isNaN(input) && input>=0 && input != GM_getValue('stopCount'+getUsername())) {
				GM_setValue('stopCount'+getUsername(),input);
				var configgy=$('ButtonMasherDiv');
				makeStopTexts();
			}
		},false);
	stopBox.appendChild(setEvent);
	
	for (var i=0;i<GM_getValue('stopCount'+getUsername(),0);i++) {
		var stopTextDiv=document.createElement('div');
		if (i!=0)stopTextDiv.appendChild(document.createElement('hr'));
		else stopTextDiv.appendChild(document.createElement('br'));
		var stopText = makeTextin(40,GM_getValue('stopText'+i+getUsername(),0),'BMfirebox'+i);
		stopText.addEventListener('change',setStopText(i),true);
		var regexLink=document.createElement('a');
		regexLink.setAttribute('href','http://wiki.cities.totl.net/index.php/Regex');
		regexLink.innerHTML='regex';
		stopTextDiv.appendChild(document.createTextNode('Stop '));
		stopTextDiv.appendChild(regexLink);
		stopTextDiv.appendChild(document.createTextNode(': '));
		stopTextDiv.appendChild(stopText);
		stopBox.appendChild(stopTextDiv);
	}
}

function clickThing(buttonName) {
	GM_log('clicking button:'+buttonName);
	//var msgs = document.getElementById('messages');
	try {
		//msgs.value += '\nOCD: Clicks Remaining: ' + GM_getValue('clicks') + '\n';
		var target=xpath1('//input[@name="'+buttonName+'"]');
		GM_log(buttonName+'  '+target);
		target.click();
	}
	// if something went wrong, reset to a clear state.
	catch(ex) {
		GM_setValue('clicks',0)
		GM_log('something went horribly wrong here.  Most likely, the button has disappeared.  Setting clicks to 0. '+ex);
		cancelMashing();
		//document.body.removeChild(document.body.firstChild);	// delete the cancel button
	}
}

function onMine() {
	try {
		var ret=document.getElementById('c').firstChild.firstChild.innerHTML;
		if (/Mine/.test(ret)) return true;
	}
	catch (ex) {
		GM_log('error checking for mine terrain: '+ex);
		return false;
	}
	return false;
}

// given a name, creates the callback function for that name.  The recording & non-recording versions are so similar that modifying this was marginally easier than copy-pasting.
function buttonNamer(name) {
	return function () {
		if (doneRecording) return;	// to catch that first nasty click when you do the "done recording, now DO it" click.
		else if (GM_getValue('recording',false)) {
			var sequence=eval(GM_getValue('sequence'+getUsername(),'[]'));
			sequence.push(name);
			GM_setValue('sequence'+getUsername(),uneval(sequence));
		}
		else {
			GM_setValue('sequence'+getUsername(),'["'+name+'"]');
		}
		GM_log('it worked! '+name+'  sequence:'+GM_getValue('sequence'+getUsername(),'FAIL!'));
		GM_setValue('hat',haveHat());
		GM_setValue('mine',onMine());
	}
}
var recordListenersExist=false;
var listenersExist=false;
function spamListeners() {
	if (GM_getValue('recording',false)) {
		if (recordListenersExist) return false;
		recordListenersExist=true;
	}
	else {
		if (listenersExist) return false;
		listenersExist=true;
	}
	var buttons = xpath('//input[@type="submit" or @type="image" and @class="button" or @class="moveicon"]');
	
	// Watch it, the code gets kinda hairy here.  The intent is to create an eventListener function for each and every button, with a slightly different interior.  Javascript 1.7 (which comes with Firefox 2.0) would handle this by assigning variables with the "let" keyword, which would create a new instance of the variable for each iteration of the loop.  Unfortunately, Greasemonkey doesn't label its scripts as using 1.7 (which is silly, because greasemonkey only runs on FF, anyway), so we're stuck with the 1.6 method of doing it.  The solution is to create a function that returns a function, and then call that function-creator while assigning the callback function.
	for (var i=0;i<buttons.length;i++) {
		buttons[i].addEventListener('click',
			buttonNamer(buttons[i].name)	// this returns a function that does what we want!
			,true);
	}
}

// a quick & easy way to test if you're holding a hat: look for the avatar div, then look for Hat*.gif somewhere in it.  If you're hallucinating, in darkness, or otherwise not displaying, it'll return false.
function haveHat() {
	var avatar=document.getElementById('avatar');
	if (avatar) {
		return /Hat[^.]{0,14}\.gif/.test(avatar.innerHTML);
	}
	return false;
}
