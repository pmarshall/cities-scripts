// ==UserScript==
// @name           Cities Monster Masher
// @namespace      http://potatoengineer.110mb.com/
// @description    Tells you which leagues you're top of, and which leagues you're close to topping.
// @include        http://cities.totl.net/cgi-bin/game*
// @include        http://carmilla.ecs.soton.ac.uk:8080/cgi-bin/game*
// @require	http://potatoengineer.110mb.com/cities_potatolibrary.user.js
// ==/UserScript==
//
// Created by PotatoEngineer, a.k.a. Cor, a.k.a. Paul Marshall, as a commission for naath.
//
//The WTH license applies to this script: you may do WHATEVER THE HELL YOU WANT with it.
// And while I'm at it on this legal stuff, there ain't no warranty of no kind on this. (triple-negative FTW!)
//
// Version 1.21: PotatoLibrary update (recursive PotatoConsole placement.)
//			Also gave it its own damn update code, rather than overlapping with Button Masher.
//
// Version 1.2: Added quips!
//
// Version 1.1: Keeps track of any tables you like.
//
// Version 1.0: When you press the button, it tells you which tables you're top of, and which tables you're close to.

GM_setValue('scriptVersion','1.21');

checkUpdates('Monster Masher','monmasher','cities_monster_masher.user.js');
createInterface();

function createInterface() {
	var box=makeBox('Monster Masher ','monsterMasher');
	
	var leagueButton=makeButton('A kingdom for my leagues!');
	leagueButton.addEventListener('click',getLeagues,true);
	box.appendChild(leagueButton);
	box.appendChild(locationSelect());
	
	// not invisible, but only because it's empty by default.
	var leagueResults=document.createElement('div');
	leagueResults.id='leagueResults';
	box.appendChild(leagueResults);
	
	insertAt(box,GM_getValue('displayLocation','PotatoConsole'));
}

function getLeagues() {
	while ($('leagueResults').hasChildNodes()) $('leagueResults').removeChild($('leagueResults').firstChild);
	quip('leagueResults');
	GM_xmlhttpRequest({
		method:'GET',
		url: 'http://cities.totl.net/cgi-bin/kills',
		headers: {'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey','Accept': 'text/html',},
		onload: function(responseDetails) {
			if (responseDetails.status == '200') {
				parseLeagues(responseDetails.responseText);
			}
		}
	});
}

function parseLeagues(page) {
	var parser = new DOMParser();
	// there's an unclosed <link> tag at the top.  Just gimme the damn page so I can use xpath on it.
	var body=page.replace(/\n|\r/g,"");
	body=/<body>.*<\/body>/.exec(body)[0];
	body=body.replace(/&nbsp;/g,"");	// cleanse annoying, pointless entities
	body=body.replace(/&/g,"&amp;");	// convert ampersands to valid xml entities
	// There's ALSO a <td> tag that isn't properly closed.  It renders, of course, but it drives XML parsers up the wall.  It's right after the span, so here's a quick hack which shouldn't crash after it's fixed.
	body=body.replace(/<\/span>(?=<td>)/g,"</span></td>");
	var xmlDoc = parser.parseFromString(body, "text/xml");

	var wins=[];
	var closeLosses=[];
	var watch=[];
	var numberRE=/\d+/;
	var rows=xmlDoc.getElementsByTagName('tr');
	var yourLeagues=eval(GM_getValue('watchLeagues'+getUsername(),'new Object()'));
	GM_log(yourLeagues+'  '+typeof(yourLeagues)+'   '+GM_getValue('watchLeagues'+getUsername(),'NOTHING,REALLY')+'   '+eval('new Object()'));
	GM_log(printObject(yourLeagues));
	//child format: |||number|||(your number)|||Monster name|||Player name (in a span)|||Link to details|||
	for (var i=0;i<rows.length;i++) {
		var winKills=parseInt(rows[i].childNodes[0].firstChild.nodeValue);
		var yourKills=parseInt(numberRE.exec(rows[i].childNodes[1].firstChild.nodeValue)[0]);
		//var monsterCode=xpath1(".//a/@href",rows[i]);
		var monsterCode=rows[i].childNodes[4].childNodes[1].getAttribute('href');
		monsterCode=monsterCode.split('=')[1];
		if (yourLeagues[monsterCode]) {
			watch.push({"kills":winKills,'yourKills':yourKills,'name':rows[i].childNodes[2].firstChild.nodeValue,'code':monsterCode});
		}
		if (yourKills==winKills) {
			wins.push({"kills":winKills,'name':rows[i].childNodes[2].firstChild.nodeValue,'code':monsterCode});
		}
		// close== within 10% or 5 kills.
		else if (yourKills>0 && (winKills*.9 <= yourKills || winKills-5<=yourKills)) {
			closeLosses.push({"kills":winKills,'yourKills':yourKills,'name':rows[i].childNodes[2].firstChild.nodeValue,'code':monsterCode});
		}
	}
	GM_log("after parsing:"+wins.length+"  "+closeLosses.length+'   '+watch.length);
	
	if (watch.length) {
		var heading=document.createElement('h4');
		heading.appendChild(document.createTextNode('League tables you are watching: '+watch.length));
		$('leagueResults').appendChild(heading);
		var watchTable=document.createElement('table');
		watchTable.innerHTML+='<tr><th>Monster</th><th> </th><th>Watching?</th></tr>';
		for (var i=0;i<watch.length;i++) {
			var win=watch[i].kills==watch[i].yourKills;
			var newRow=document.createElement('tr');
			var nameTD=document.createElement('td');
			nameTD.appendChild(document.createTextNode(watch[i].name));
			newRow.appendChild(nameTD);
			var winTD=document.createElement('td');
			winTD.align="center";
			var winSpan=document.createElement('span');
			winSpan.setAttribute('style','color:'+(win?'#229922':'#AA3333'));
			winSpan.appendChild(document.createTextNode((win?'win':('loss by '+(watch[i].kills-watch[i].yourKills)))));
			winTD.appendChild(winSpan);
			newRow.appendChild(winTD);
			var checkItem=document.createElement('td');
			checkItem.align="center";
			checkItem.appendChild(createLeagueCheckbox(watch[i].code,'watch'));
			newRow.appendChild(checkItem);
			watchTable.appendChild(newRow);
		}
		$('leagueResults').appendChild(watchTable);
		$('leagueResults').appendChild(document.createElement('p'));
	}
	
	if (wins.length) {
		var heading=document.createElement('h4');
		heading.appendChild(document.createTextNode('League tables you are winning: '+wins.length));
		$('leagueResults').appendChild(heading);
		var winTable=document.createElement('table');
		winTable.innerHTML+='<tr><th>Monster</th><th>Kills</th><th>Watching?</th>';
		for (var i=0;i<wins.length;i++) {
			var newRow=document.createElement('tr');
			var nameTD=document.createElement('td');
			nameTD.appendChild(document.createTextNode(wins[i].name));
			newRow.appendChild(nameTD);
			var killsTD=document.createElement('td');
			killsTD.align="center";
			killsTD.appendChild(document.createTextNode(wins[i].kills));
			newRow.appendChild(killsTD);
			var checkItem=document.createElement('td');
			checkItem.align="center";
			checkItem.appendChild(createLeagueCheckbox(wins[i].code,'win'));
			newRow.appendChild(checkItem);
			winTable.appendChild(newRow);
		}
		$('leagueResults').appendChild(winTable);
		$('leagueResults').appendChild(document.createElement('p'));
	}
	if (closeLosses.length) {
		var heading=document.createElement('h4');
		heading.appendChild(document.createTextNode('League tables you are losing by a small margin: '+closeLosses.length));
		$('leagueResults').appendChild(heading);
		var lossTable=document.createElement('table');
		lossTable.innerHTML+='<tr><th>Monster</th><th>Winner\'s Kills</th><th>Your Kills</th><th>Watching?</th>';
		for (var i=0;i<closeLosses.length;i++) {
			var newRow=document.createElement('tr');
			var nameTD=document.createElement('td');
			nameTD.appendChild(document.createTextNode(closeLosses[i].name));
			newRow.appendChild(nameTD);
			var killsTD=document.createElement('td');
			killsTD.align="center";
			killsTD.appendChild(document.createTextNode(closeLosses[i].kills));
			newRow.appendChild(killsTD);
			var yourKillsTD=document.createElement('td');
			yourKillsTD.align="center";
			yourKillsTD.appendChild(document.createTextNode(closeLosses[i].yourKills));
			newRow.appendChild(yourKillsTD);
			var checkItem=document.createElement('td');
			checkItem.align="center";
			checkItem.appendChild(createLeagueCheckbox(closeLosses[i].code,'loss'));
			newRow.appendChild(checkItem);
			lossTable.appendChild(newRow);
		}
		$('leagueResults').appendChild(lossTable);
	}
	endQuip();
}

function createLeagueCheckbox(code,table) {
	var currentLeagues=eval(GM_getValue('watchLeagues'+getUsername(),'new Object()'));
	var check=document.createElement('input');
	check.id='mash'+table+code;
	check.type='checkbox';
	if (currentLeagues[code]) check.checked=true;
	check.addEventListener('click',checkboxFunction(code,table),true);
	GM_log('created league checkbox for '+code+'.  Checked:'+check.checked+'  id:'+'mash'+table+code+'  currLe[code]:'+currentLeagues[code]);
	return check;
}

function checkboxFunction(code,table) {
	return function() {
		var currentLeagues=eval(GM_getValue('watchLeagues'+getUsername(),'new Object()'));
		var check=$('mash'+table+code);
		GM_log('createLeagueCheckboxCallback.  Checked:'+check.checked+'   currentLeagues[code]:'+currentLeagues[code]+'  code:'+code);
		var tables=['win','loss','watch'];
		if (check.checked && !currentLeagues[code]) {
			currentLeagues[code]=true;
			for (var i=0;i<tables.length;i++) {
				if (tables[i]!=table && $('mash'+tables[i]+code)) {
					$('mash'+tables[i]+code).checked=true;
				}
			}
			GM_setValue('watchLeagues'+getUsername(),uneval(currentLeagues));
			GM_log(GM_getValue('watchLeagues'+getUsername(),'WAS NOT SAVED'));
		}
		else if (!check.checked && currentLeagues[code]) {
			delete currentLeagues[code];
			for (var i=0;i<tables.length;i++) {
				if (tables[i]!=table && $('mash'+tables[i]+code)) {
					$('mash'+tables[i]+code).checked=false;
				}
			}
			GM_setValue('watchLeagues'+getUsername(),uneval(currentLeagues));
			GM_log(GM_getValue('watchLeagues'+getUsername(),'WAS NOT SAVED'));
		}
	};
}