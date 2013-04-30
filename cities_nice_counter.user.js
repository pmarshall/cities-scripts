// ==UserScript==
// @name           Cities Nice Counter
// @namespace      http://potatoengineer.110mb.com
// @description    It counts the number of times that a particular phrase has shown up in the messages
// @include        http://cities.totl.net/cgi-bin/game*
// @include        http://carmilla.ecs.soton.ac.uk:8080/cgi-bin/game*
// @require	http://potatoengineer.110mb.com/cities_potatolibrary.user.js
// ==/UserScript==
//
// Created by Paul Marshall, a.k.a. PotatoEngineer (Cor in-game)
// Commissioned for Bubba_est_nKlein.
// The WTH licence applies to this script: you may do WHATEVER THE HELL YOU WANT to it.
//
// Version 1.4: Fixed for newfangled interface.
//
// Version 1.3: Counters can be either ascending, or descending.
//
// Version 1.2: Allows any number of counters to run simultaneously.  Default behavior should still be one counter, and
//					when it uses one counter, it looks (almost) like it always has.
//
// Version 1.11: Bugfix for multiple characters.
//
// Version 1.1: Now works between multiple characters.
//
// Version 1.01: There's now a "set" button instead of auto-setting, and the counter-box now only disappears when you
//					specifically tell it to go away.
//				Also fixed the autoupdate.
//
// Version 1.0: you give it some text to look for, and how many times you want to see it.  The script will print a box
//				at the top of the screen, telling you how many times it still needs to see the text, and what you're 
//				looking for.

GM_setValue('scriptVersion','1.4');

checkUpdates('Nice Counter','counter','cities_nice_counter.user.js');
//GM_log('counter count:'+GM_getValue('counterCount'+getUsername(),'ERROR'));
for (var i=0;i<GM_getValue('counterCount'+getUsername(),1);i++) {
	if (GM_getValue('active'+i+getUsername(),false)) {
		//GM_log('printing counter! Number:'+i+' Event:'+GM_getValue('event'+i+getUsername(),'')+' Count:'+GM_getValue('count'+i+getUsername(),1)+' active:'+GM_getValue('active'+i+getUsername(),'ERROR'));
		var messages=document.getElementById('messages').innerHTML;
		var lines=messages.split("\n");
	
		var eventText=GM_getValue('event'+i+getUsername(),'');
	
		eventText=eventText.replace(/([.+*?/*[()\\^$|{}])/g,'\\$1');
	
		var eventRE = new RegExp(eventText);
		GM_log(eventRE);
		for (var j=0;j<lines.length;j++) {
			if (eventRE.test(lines[j])) {
				GM_setValue('count'+i+getUsername(),parseInt(GM_getValue('count'+i+getUsername(),1))+GM_getValue('increment'+i+getUsername(),-1));
			}
		}
		
		makeCounterBox(i);
	}
}

// creating the interface is last, because I want it to have the correct count, and this is the easiest way.
createInterface();

function makeCounterBox(i) {
	//GM_log('making counter-box.  i:'+i);
	var counterSpan=document.createElement('span');
	if (!document.getElementById('counterBox')) {
		var counterBox=makeBox('Counter state ','counterBox');
		document.body.insertBefore(counterBox, document.body.firstChild);
	}
	// as much as I dislike the funky too-large scope of JavaScript, it's useful here where I don't know if there's a counterBox or not.
	else {
		var counterBox=document.getElementById('counterBox');
		counterSpan.appendChild(document.createElement('br'));
	}
	counterSpan.appendChild(document.createTextNode('Count: '+GM_getValue('count'+i+getUsername(),0)+' Event text: '+GM_getValue('event'+i+getUsername(),'')+' '));
	
	var stopCounter = document.createElement("input");
	stopCounter.setAttribute("type", "button");
	stopCounter.setAttribute("class", "button");
	stopCounter.setAttribute("value", "Stop Counting");
	stopCounter.addEventListener('click',function(event) {
				GM_setValue('count'+i+getUsername(),0);
				GM_setValue('active'+i+getUsername(),false);
				document.getElementById('counterBox').removeChild(document.getElementById('counterSpan'+i));
			},true);
	counterSpan.appendChild(stopCounter);
	counterSpan.id='counterSpan'+i;
	counterBox.appendChild(counterSpan);
}

function setButtonMaker(i) {
	return function(event) {
		GM_setValue('event'+i+getUsername(),document.getElementById('eventBox'+i).value);
		GM_setValue('count'+i+getUsername(),document.getElementById('qtybox'+i).value);
		if (!document.getElementById('Asc'+i).checked) {
			GM_setValue('increment'+i+getUsername(),-1);
		}
		else {
			GM_setValue('increment'+i+getUsername(),1);
		}
		GM_setValue('active'+i+getUsername(),true);
				//GM_log('Event set!  Text:'+GM_getValue('event'+i+getUsername(),'ERROR')+' Count:'+GM_getValue('count'+i+getUsername(),'ERROR')+' box number:'+i);
		makeCounterBox(i);
	}
}

function createInterface() {
	var configDiv = makeBox("Nice Counter: ", 'niceCounterConfig');

	var qtybox = document.createElement('input');
	qtybox.type = 'text';
	qtybox.setAttribute('size', '2');
	qtybox.className = 'textin';
	qtybox.id='counterCountBox';
	qtybox.value=GM_getValue('counterCount'+getUsername(),1);
	configDiv.appendChild(document.createTextNode('Number of Counters: '));
	configDiv.appendChild(qtybox);
	
	var setEvent = document.createElement("input");
	setEvent.setAttribute("type", "button");
	setEvent.setAttribute("class", "button");
	setEvent.setAttribute("value", "Set");
	setEvent.addEventListener('click',function(event) {
			var input=parseInt(document.getElementById('counterCountBox').value);
			if (input && input >0 && input != GM_getValue('counterCount'+getUsername())) {
				GM_setValue('counterCount'+getUsername(),input);
				var configgy=document.getElementById('niceCounterConfig');
				configgy.parentNode.removeChild(configgy);
				createInterface();
			}
		},true);
	configDiv.appendChild(setEvent);
	
	for (var i=0;i<GM_getValue('counterCount'+getUsername(),1);i++) {
		if (i!=0)configDiv.appendChild(document.createElement('hr'));
		else configDiv.appendChild(document.createElement('br'));
		var qtybox = document.createElement('input');
		qtybox.type = 'text';
		qtybox.setAttribute('size', '2');
		qtybox.className = 'textin';
		qtybox.id='qtybox'+i;
		qtybox.value=GM_getValue('count'+i+getUsername(),0);
		configDiv.appendChild(document.createTextNode('Event count: '));
		configDiv.appendChild(qtybox);
		configDiv.appendChild(document.createTextNode(' '));
		
		var ascRadio=document.createElement('input');
		ascRadio.type='radio';
		ascRadio.id='Asc'+i;
		ascRadio.name='AscDesc'+i;
		ascRadio.innerHTML='Asc';
		if (GM_getValue('increment'+i+getUsername(),0)==1) ascRadio.checked='checked';
		
		var descRadio=document.createElement('input');
		descRadio.type='radio';
		descRadio.id='Desc'+i;
		descRadio.name='AscDesc'+i;
		descRadio.innerHTML='Desc';
		if (GM_getValue('increment'+i+getUsername(),-1)==-1) descRadio.checked='checked';
		configDiv.appendChild(document.createTextNode('Asc:'));
		configDiv.appendChild(ascRadio);
		configDiv.appendChild(document.createTextNode(' Desc:'));
		configDiv.appendChild(descRadio);
	
		var setEvent = document.createElement("input");
		setEvent.setAttribute("type", "button");
		setEvent.setAttribute("class", "button");
		setEvent.setAttribute("value", "Set");
		setEvent.addEventListener('click',setButtonMaker(i),true);
		configDiv.appendChild(setEvent);
	
		configDiv.appendChild(document.createElement('br'));
	
	
		var eventBox = document.createElement('input');
		eventBox.type = 'text';
		eventBox.setAttribute('size', '40');
		eventBox.className = 'textin';
		eventBox.id='eventBox'+i;
		eventBox.value=GM_getValue('event'+i+getUsername());
		configDiv.appendChild(document.createTextNode('Event text: '));
		configDiv.appendChild(eventBox);
	}
	
	insertAt(configDiv,GM_getValue('displayLocation','PotatoConsole'));
	configDiv.appendChild(locationSelect());
	
}

