// ==UserScript==
// @name           Attacker
// @namespace      http://potatoengineer.110mb.com/
// @description    Attacks things with *weapon* until *line* or "Now using Fists"
// @include        http://cities.totl.net/cgi-bin/game*
// @include        http://carmilla.ecs.soton.ac.uk:8080/cgi-bin/game*
// @require	http://potatoengineer.110mb.com/cities_potatolibrary.user.js
// ==/UserScript==

GM_setValue('scriptVersion','1.0');
// I don't think I am EVER going to release this script.  But, you know, boilerplate code never dies.
makeConfig();

walkWithCatch();

function walkWithCatch() {
	try {
		walk();
	}
	catch (ex) {
		GM_setValue('active',false);
		GM_setValue('attacks',0);
		GM_log('exception! '+ex);
	}
	cancelBox();
}

function walk() {
// only do anything if we're actually, you know, using the script.
	if (GM_getValue('active',false)) {

		// check for break conditions: Either we've attacked X times , we've hit a stop text, or there's no more fight button.
		if (GM_getValue('attacks',1)>=GM_getValue('attackCount'+getUsername(),0)) {
			GM_setValue('active',false);
			return;
		}
		
		var messages=$('messages').innerHTML;
		var lines;
		if (isNewfangled()) lines=messages.split("<br>");
		else lines=messages.split("\n");
		
		for (var i=0;i<GM_getValue('stopCount'+getUsername(),0);i++) {
			var stopRE=new RegExp(GM_getValue('stopText'+i+getUsername(),'FAIL!'));
			for (var j=0;j<lines.length;j++) {
				if (stopRE.test(lines[j])) {
					GM_setValue('active',false);
					return;
				}
			}
		}
		
		var viewport=document.getElementById('control_panet');
		if ($('control_pane').innerHTML.indexOf('act_fight_'+GM_getValue('direction','e'))==-1) {
			GM_setValue('active',false);
			return;
		}
		GM_setValue('attacks',GM_getValue('attacks',0)+1);
		location.href=location.href.split('#')[0].split('?')[0]+'?'+(GM_getValue('weapon'+getUsername(),'')?'item='+GM_getValue('weapon'+getUsername())+'&':'')+'act_fight_'+GM_getValue('direction','e')+'=1';
	}
	
}

function cancelBox() {
	if (GM_getValue('active',false)) {
		var cancelDiv=makeBox('','keepFiringCancel');
		cancelDiv.setAttribute("id","stop_moat_walker");
		var cancelButton=makeButton('Stop Firing, Assholes!');
		cancelButton.addEventListener('click',
				function (){
					//GM_log('cancelled clicking due to user input');
					GM_setValue('active',false);
					cancelBox();
				},true);
		cancelDiv.appendChild(cancelButton);
		cancelDiv.appendChild(document.createTextNode(' Movement Direction: '+GM_getValue('direction') + ' noMonsterCount: '+GM_getValue('noMonsterCount')));
		document.body.insertBefore(cancelDiv,document.body.firstChild);
	}
	else if ($('keepFiringCancel')) {
		document.body.removeChild($('keepFiringCancel'));
	}
}

function makeConfig() {
	var configDiv=makeBox('Auto Attacker: ','CitiesAutoAttacker');
	
	var goButton=makeButton('Activate!');
	goButton.addEventListener('click',
		function(){
			GM_setValue('active',true);
			GM_setValue('attacks',0);
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
	configDiv.appendChild(document.createTextNode(' Direction:'));
	configDiv.appendChild(directionSelect);
	
	var weaponBox=makeTextin(10,GM_getValue('weapon'+getUsername(),''),'weaponbox');
	weaponBox.addEventListener('change',function() {GM_setValue('weapon'+getUsername(),$('weaponbox').value);},true);
	configDiv.appendChild(document.createTextNode('Weapon (if any): '));
	configDiv.appendChild(weaponBox);
	
	var attackCountBox=makeTextin(2,GM_getValue('attackCount'+getUsername(),''),'attackCount');
	attackCountBox.addEventListener('change',function() {GM_setValue('attackCount'+getUsername(),$('attackCount').value);},true);
	configDiv.appendChild(document.createTextNode('Number of attacks: '));
	configDiv.appendChild(attackCountBox);

	
	var qtybox = makeTextin(2,GM_getValue('stopCount'+getUsername()),'stopCount');
	configDiv.appendChild(document.createTextNode('Number of Stop Texts: '));
	configDiv.appendChild(qtybox);
	
	var setEvent = makeButton('Set');
	setEvent.addEventListener('click',function(event) {
			var input=parseInt($('stopCount').value);
			GM_log('input:'+input+'  type:'+typeof input);
			if (input && input >0 && input != GM_getValue('stopCount'+getUsername())) {
				GM_setValue('stopCount'+getUsername(),input);
				var configgy=document.getElementById('CitiesAutoAttacker');
				configgy.parentNode.removeChild(configgy);
				makeConfig();
			}
		},true);
	configDiv.appendChild(setEvent);
	
	for (var i=0;i<GM_getValue('stopCount'+getUsername(),1);i++) {
		if (i!=0)configDiv.appendChild(document.createElement('hr'));
		else configDiv.appendChild(document.createElement('br'));
		var stopBox = makeTextin(40,GM_getValue('stopText'+i+getUsername(),0),'firebox'+i);
		stopBox.addEventListener('change',setStopText(i),true);
		configDiv.appendChild(document.createTextNode('Stop regex: '));
		configDiv.appendChild(stopBox);
	}
	
	configDiv.appendChild(locationSelect());
	
	insertAt(configDiv,GM_getValue('displayLocation','PotatoConsole'));
	
}

function setStopText(index) {
	return function() {GM_setValue('stopText'+index+getUsername(),$('firebox'+index).value);};
}

