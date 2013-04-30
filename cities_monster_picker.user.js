// ==UserScript==
// @name           Cities Monster Picker
// @namespace      http://potatoengineer.110mb.com/
// @include        http://cities.totl.net/cgi-bin/kills
// ==/UserScript==

var monsters=[];

pickMonster();

function pickMonster() {
	if (monsters.length==0) {
		var i, xpr = document.evaluate('//tr/td[3]/text()', document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		for (i = 0; item = xpr.snapshotItem(i); i++) monsters.push(item.nodeValue);
		
		var box = document.createElement("div");
		box.setAttribute("class", "controls");
		box.id='monsterPicker';
		var title = document.createElement("span");
		title.setAttribute("class", "control_title");
		title.innerHTML = 'Random Monster: ';
		box.appendChild(title);
		var span=document.createElement('span');
		box.appendChild(span);
		box.appendChild(document.createTextNode(' '));
		
		var button = document.createElement("input");
		button.setAttribute("type","button");
		button.setAttribute("class","button");
		button.setAttribute("value",'Pick another monster');
		button.addEventListener('click',pickMonster,true);
		box.appendChild(button);
		
		document.body.insertBefore(box,document.body.firstChild);
	}
	var mp=document.getElementById('monsterPicker');
	mp.firstChild.nextSibling.innerHTML=monsters[Math.floor(Math.random()*monsters.length)];
	
}