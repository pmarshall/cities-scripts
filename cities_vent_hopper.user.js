// ==UserScript==
// @name           Cities Vent Hopper
// @namespace      http://potatoengineer.110mb.com/
// @description    Moves you in the named direction at the named time.
// @include        http://cities.totl.net/cgi-bin/game*
// @include        http://carmilla.ecs.soton.ac.uk:8080/cgi-bin/game*
// @require	http://potatoengineer.110mb.com/cities_potatolibrary.user.js
// ==/UserScript==
// At the given time, it walks, once, in the given direction.  So yes, it requires resetting each time.

GM_setValue('scriptVersion','1.0');

checkUpdates('Cities Vent Hopper','venthop','cities_vent_hopper.user.js');
makeConfig();
walkOnTimer();

var timeoutName;

function walkOnTimer() {
	if (GM_getValue('time'+getUsername()) && GM_getValue('active')) {
		var userTime=GM_getValue('time'+getUsername(),'');
		times=userTime.split(':');
		// if the date isn't properly formatted, forget it.
		if (times.length=2) {
			times[0]=parseInt(times[0]);
			times[1]=parseInt(times[1]);
			// a little bit of multi-compatibility: if they use a HH:MMpm time format, then add 12 hours.
			if (/pm/i.test(userTime) && times[0]!=12) times[0]+=12;
			var curDate=new Date();
			var moveDate=new Date();
			moveDate.setHours(times[0]);
			moveDate.setMinutes(times[1]);
			moveDate.setSeconds(0);
			if (moveDate.getTime()-curDate.getTime() < 0) moveDate.setDate(moveDate.getDate()+1);
			
			timeoutName=setTimeout(move, moveDate.getTime()-curDate.getTime());
			GM_log ('milliseconds to moving: '+(moveDate.getTime()-curDate.getTime())+' moveDate:'+moveDate.getTime()+' curDate:'+curDate.getTime());
		}
	}
	else { 
		GM_log('timer not set. '+GM_getValue('time'+getUsername())+'   '+GM_getValue('active'));
	}
}

function move() {
	GM_setValue('active',false);
	location.href=location.href.split('?')[0].split('#')[0]+'?act_move_'+$('ventDirection').options[$('ventDirection').selectedIndex].value+'=1';
}

function makeConfig() {
	var configDiv=makeBox('Vent Hopper: ','CitiesVentHopper');
	
	var cb=document.createElement('input');
	cb.setAttribute("type","checkbox");
	cb.checked=GM_getValue('active', false);
	cb.addEventListener('click',
		function() {
			if (cb.checked) {
				walkOnTimer();
				GM_setValue('active',true);
			}
			else {
				GM_setValue('active',false);
			}
		},
		true);
	var result=document.createElement('span');
	result.appendChild(cb);
	result.appendChild(document.createTextNode('Active?'));
	result.setAttribute('style','color:red');
	configDiv.appendChild(result);
	
	var directionSelect=document.createElement('select');
	directionSelect.id='ventDirection';
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
	configDiv.appendChild(document.createTextNode(' Direction:'));
	configDiv.appendChild(directionSelect);
	
	var timeBox=makeTextin(6,GM_getValue('time'+getUsername(),''),'time');
	timeBox.addEventListener('change',
		function() {
			GM_setValue('time'+getUsername(),$('time').value);
			clearTimeout(timeoutName);
			walkOnTimer();
		},true);
	configDiv.appendChild(document.createTextNode(' Local time to walk: '));
	configDiv.appendChild(timeBox);
	configDiv.appendChild(locationSelect());
	
	insertAt(configDiv,GM_getValue('displayLocation','PotatoConsole'));
	
}
