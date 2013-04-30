// ==UserScript==
// @name           Cities Golden Condor Navigator
// @namespace      http://potatoengineer.110mb.com
// @description    Tells you where the Golden Condor is, and prevents you from going onto the High Plateau.
// @include        http://cities.totl.net/cgi-bin/game*
// @include		   http://carmilla.ecs.soton.ac.uk:8080/cgi-bin/game*
// @require	http://potatoengineer.110mb.com/cities_potatolibrary.user.js
// ==/UserScript==
//
// Created by Paul Marshall, a.k.a. Cor, a.k.a. PotatoEngineer.
// The WTH EULA applies to this script: you may do WHATEVER THE HELL YOU WANT to it.
//
// Version 1.52: better Healer regex.
//
// Version 1.51: Bugfix for not displaying search results in newfangled interface.
//
// Version 1.5: Now with Newfangled!
//
// Version 1.4: When in the Vent Tunnels, the available roads will report to the BB database, and the page will refresh every hour.
//
// Version 1.3: The map is now searchable!  There's a few built-in searches, but you can add your own.
//				Default search distance limit is 40, but you can change that (or even make it negative).
//
// Version 1.26: Terrain which is (dark) or (too bright) is no longer tested for the sanity check.
//
// Version 1.25: Bugfix for complete failure.  Stupid parentheses-vs.-square-brackets.
//
// Version 1.24: Added the "unpathed" terrain category, which describes the terrains which are missing several paths.  It's
//					treated like a wall, and there's a note that navigation *might* be off.
//				Improved terrain-classification speed.
//
// Version 1.23: More minor display tweaks (to tell you if you're in Tunnels/Guildspace), and the GCN now handles Guildspace.
//				GCN's "lost" variable is now individualized for each character.
//
// Version 1.22: More minor display tweaks, to show it's not the condor's location being reported, but yours.
//
// Version 1.21: Minor display tweak, won't report location if we're lost, only reports location if you just hit a Condor button.
//
// Version 1.2: Added option to replace GPS with GCN coords when in Condor (with slightly off-color text)
//				GCN remembers local terrain; if terrain doesn't match remembered terrain, displays "Help!  I'm lost"
//					instead of coords.
//
// Version 1.12: ACTUALLY checks updates.  I keep forgetting this kind of thing on these scripts.
//
// Version 1.11: Updated to handle alts much better.
//
// Version 1.1: The script will now call home and tell you the location of the Condor, but only if you've entered a 
//					data-entry key (which is the same key as for Big Brother).
//				Also: the script will keep track of your position if you go underground, though there's nothing for the
//					Harvey's Farm entrance method yet.
//
// Version 1.0: The script keeps track of where you are when you're in the Condor, and displays this information somewhere handy. It also prevents you from moving onto Strange Crags or the High Plateau. You may choose to have the script display data in one place normally, and in a different one when you are in the Condor. The script requires a copy of the world map to work properly, but it's quite helpful about pointing out when you need to download the map.


GM_setValue('scriptVersion','1.52');

var debug=GM_getValue('debug');
if (debug)var startTime=new Date();
doIt();
if (debug) var endTime=new Date();
if (debug) GM_log('time elapsed (ms):'+(endTime.getTime()-startTime.getTime()));


// What can I say?  I like wrapping up my script in a single function.  Timing is easy, and it lets me run it on a timeout or even disable the entire script if I find some arcane reason to do it later, and it's not much effort.
function doIt() {
	checkUpdates('Golden Condor Navigator','gcnav','cities_golden_condor_nav.user.js');
	if ($('updateBox')) {
		GM_setValue('tweakMap',true);
	}
	else if (GM_getValue('tweakMap',false)){
		GM_setValue('tweakMap',false);
		tweakMap();
	}

	spamListeners();
	updateLocation();
	makeConfig();
	//reportVentTunnels();
}

function locationText() {
	var locationSpan=document.createElement('span');
	if (GM_getValue('lost'+getUsername(),false)) {
		locationSpan.innerHTML=' GCN doesn\t know where you are because somebody moved the Condor.';
		locationSpan.setAttribute('style','color: red');
	}
	else {
		locationSpan.innerHTML=' GCN thinks you are at: '+Math.abs(GM_getValue('long'+getUsername()))+ (GM_getValue('long'+getUsername())<0?'W':'E')+' '+Math.abs(GM_getValue('lat'+getUsername()))+ (GM_getValue('lat'+getUsername())<0?'S':'N');
		if (parseInt(GM_getValue('long'+getUsername()))>2000)  {
			var kingLong=(parseInt(GM_getValue('long'+getUsername()))-3000)/5;
			var kingLat=parseInt(GM_getValue('lat'+getUsername()))/5;
			locationSpan.innerHTML+=' in Guildspace. Your location in the \'Kingdom is '+Math.abs(kingLong)+ (kingLong<0?'W':'E')+' '+Math.abs(kingLat)+ (kingLat<0?'S':'N')+'. ';
		}
		else if (parseInt(GM_getValue('long'+getUsername()))>1000) {
			var kingLong=(parseInt(GM_getValue('long'+getUsername()))-1000);
			var kingLat=parseInt(GM_getValue('lat'+getUsername()))-1000;
			locationSpan.innerHTML+=' in the Tunnels. Your location in the \'Kingdom is '+Math.abs(kingLong)+ (kingLong<0?'W':'E')+' '+Math.abs(kingLat)+ (kingLat<0?'S':'N')+(GM_getValue('slightlyLost'+getUsername(),false)?'*':'')+'. ';
		}
		else locationSpan.innerHTML+='. ';
		if (!haveGPS() && GM_getValue('condorLocation','nowhere')=='PotatoConsoleOther') {
			locationSpan.setAttribute('style','color:#000060');
		}
	}
	return locationSpan;
}

function makeConfig() {
	if (!haveGPS() && GM_getValue('condorLocation','nowhere')=='PotatoConsoleOther') {
		addAfter(locationText(),document.getElementById('abilities').firstChild);
	}


	var box=makeBox('Golden Condor Navigator: ','CitiesGoldenCondorNavigator');
	
	box.appendChild(locationText());

	var configButton = makeButton('Configure','gcnavConfigButton');
	configButton.addEventListener('click',function(){ toggleConfig('gcnavConfig');},true);
	box.appendChild(configButton);
	
	// search entry
	var searchSelect=document.createElement('select');
	searchSelect.innerHTML='<option value="Healer|First Aid Point|Hospital|Old John|Kill or Cure|J\\.D\'s|Turk\'s|Carla\'s|Eliot\'s|Jude|Arctic Rescue Cent[er][re]">Healer</option><option value="Pasture|Meadow">Pasture/Meadow</option><option value="Standing Stone">Standing Stone</option><option disabled="disabled">---User Searches---</option>';
	var firstUserSearch=4;
	for (var i=0;i<GM_getValue('searchCount'+getUsername(),0);i++) {
		//GM_log(i+' searchCount:'+GM_getValue('searchCount'+getUsername(),0));
		searchSelect.innerHTML+='<option value="'+GM_getValue('search'+i+getUsername())+'">'+GM_getValue('search'+i+getUsername()).substr(0,20)+'</option>';
	}
	box.appendChild(searchSelect);
	//GM_log('search select:'+searchSelect.innerHTML);
	
	var searchButton = makeButton('Find nearest');
	searchButton.addEventListener('click',
			function() {
				var found=findLocation(new RegExp(searchSelect.options[searchSelect.selectedIndex].value,'i'));
				var messages=document.getElementById('messages');
				var newMessage;
				if (found) {
					newMessage='Found the nearest '+found[3]+' at '+found[0]+(found[0]>0?'E':'W')+' '+found[1]+(found[1]>0?'N':'S')+', '+found[2]+' spaces away.';
				}
				else {
					newMessage='Did not find a '+searchSelect.options[searchSelect.selectedIndex].innerHTML;
					if (GM_getValue('searchLimit'+getUsername())<0) newMessage+=' anywhere.';
					else newMessage+=' within '+GM_getValue('searchLimit'+getUsername())+' spaces.';
				}
				if (isNewfangled()) {
					messages.innerHTML=newMessage+'<br>'+messages.innerHTML;
				}
				else {
					messages.value=newMessage+"\n"+messages.value;
				}
			},true);
	
	box.appendChild(document.createTextNode(' '));
	box.appendChild(searchSelect);
	box.appendChild(document.createTextNode(' '));
	box.appendChild(searchButton);

	var configDiv=document.createElement('div');
	var emergencyDisplay=false;
	if (GM_getValue('1%1','NO MAP')=='NO MAP') {
		var warningDiv=document.createElement('div');
		warningDiv.innerHTML='There is no map installed.  Please click "Get new map", and wait until it is fully downloaded and installed.  The control panel for this script will display RIGHT HERE until you install the map, so please, save yourself the trouble.';
		warningDiv.setAttribute('style','color:#060000');
		configDiv.appendChild(warningDiv);
		emergencyDisplay=true;
	}
	else {
		configDiv.setAttribute('style', "display:none");
	}
	configDiv.id='gcnavConfig';
	
	// yes, this particular section relates directly to the search functions above, but I'd rather display warnings above this stuff.
	var limitInput = document.createElement("input");
	limitInput.setAttribute('type',"text");
	limitInput.setAttribute("size", "2");
	limitInput.setAttribute('value',GM_getValue('searchLimit'+getUsername(),40));
	limitInput.addEventListener(
				'change',
				function (event) {
					var newLimit=parseInt(limitInput.value);
					if (!isNaN(newLimit)) {
						GM_setValue('searchLimit'+getUsername(),newLimit);
						GM_log('search threshold changed:'+newLimit);
					}
				}
				,true);
	configDiv.appendChild(document.createTextNode('Maximum distance to search to (negative = no limit): '));
	configDiv.appendChild(limitInput);
	configDiv.appendChild(document.createElement('br'));
	
	configDiv.appendChild(document.createTextNode('Enter your own case-insensitive search (note: this is a '));
	var regexLink=document.createElement('a');
	regexLink.setAttribute('href',"http://wiki.cities.totl.net/index.php/Regex");
	regexLink.innerHTML='regex';
	configDiv.appendChild(regexLink);
	configDiv.appendChild(document.createTextNode('): '));
	var inputRE = document.createElement("input");
	inputRE.setAttribute("type", "text");
	configDiv.appendChild(inputRE);
	configDiv.appendChild(document.createTextNode(' '));
	
	var reButton = makeButton('Add to searches');
	reButton.addEventListener(
		'click',
		function(event) {
			GM_setValue('search'+GM_getValue('searchCount'+getUsername(),0)+getUsername(),inputRE.value);
			GM_setValue('searchCount'+getUsername(),GM_getValue('searchCount'+getUsername(),0)+1);
			searchSelect.innerHTML+='<option value="'+inputRE.value+'">'+inputRE.value.substr(0,20)+'</option>';
			searchSelect.selectedIndex=searchSelect.options.length-1;
		},
		true);
	configDiv.appendChild(reButton);
	configDiv.appendChild(document.createTextNode(' '));
	
	var removeButton = makeButton('Remove current user search');
	removeButton.addEventListener(
		'click',
		function(event) {
			if (searchSelect.selectedIndex>=firstUserSearch) {
				searchSelect.removeChild(searchSelect.options[searchSelect.selectedIndex]);
				for (var i=searchSelect.selectedIndex-firstUserSearch;i<GM_getValue('searchCount'+getUsername(),0);i++) {
					GM_setValue('search'+i+getUsername(),GM_getValue('search'+(i+1)+getUsername(),'NOTHING'));
				}
				searchSelect.selectedIndex=0;
				GM_setValue('searchCount'+getUsername(),GM_getValue('searchCount',0)-1);
				if (GM_getValue('searchCount'+getUsername(),0)<0) GM_setValue('searchCount'+getUsername(),0);
			}
		},
		true);
	configDiv.appendChild(removeButton);
	configDiv.appendChild(document.createElement('br'));
	
	
	if (GM_getValue('slightlyLost'+getUsername(),false)) {
		var lostDiv=document.createElement('div');
		div.innerHTML='* GCN may be lost. You passed through a tile that the GLs specifically programmed to be missing one or more paths, and GCN does not track these missing paths.  You\'re probably not lost, though.';
		box.appendChild(lostDiv);
	}
	box.appendChild(configDiv);
	
	
	var mapButton = makeButton ('Get new map');
	mapButton.addEventListener(
		'click',
		function(event) {
			updateMap();
		},
		true);
	configDiv.appendChild(mapButton);
	
	configDiv.appendChild(document.createElement('br'));
	if (!GM_getValue('CDC_key',0)) {
		configDiv.appendChild(document.createTextNode('You have no data-entry key.  The Golden Condor Navigator will normally report the location of the Condor so that other players can find it.  If you have a Golden Condor Navigator/Big Brother key, enter that key here.  If you do not have a GCN/BB key, palantir Cor to get one, or bug PotatoEngineer on IRC/wiki.  (While you\'re at it, why not install Big Brother?)  The Golden Condor Navigator will still work without a data-reporting key, but will not report the Condor\'s location.'));
		configDiv.appendChild(document.createElement('br'));
	}
	configDiv.appendChild(document.createTextNode('Data-entry key:'));
	var keyInput = document.createElement("input");
	keyInput.setAttribute("type", "text");
	if(GM_getValue('CDC_key',0))
	{
		keyInput.setAttribute("value", GM_getValue('CDC_key',0));
	}
	configDiv.appendChild(keyInput);
	var okbtn = makeButton('OK');
	okbtn.addEventListener(
		'click',
		function(event)
		{
			if(keyInput.value != "")
			{
				GM_setValue("CDC_key", keyInput.value);
				alert("Key set.");
			}
			else
			{
				alert("Invalid key - please palantir Cor for one!");
			}
		},
		true);
	configDiv.appendChild(okbtn);
	configDiv.appendChild(makeCheckbox('debug','Debug Mode'));

	if (emergencyDisplay) {
		// until the map is downloaded, display the control panel at the top of the page.
		insertAt(box,'PageTop');
	}
	// If we're in the Condor, we may have a different display location.
	else if (getTerrain()=='Inside Condor' || GM_getValue('long'+getUsername())>1000) {
		insertAt(box,GM_getValue('condorLocation','PotatoConsole'));
	}
	else {
		insertAt(box,GM_getValue('displayLocation','PotatoConsole'));
	}
	
	// add the usual potatoConsole selector, and then 
	configDiv.appendChild(locationSelect());
	
	
	// the SECOND display section: where to display when the Condor is present.
	configDiv.appendChild(document.createElement('br'));
	configDiv.appendChild(document.createTextNode('Display when in Condor (or no GPS):'));
	var condorLocation = document.createElement('select');
	condorLocation.id='CondorLocation';
	condorLocation.addEventListener('change',
			function() {
				GM_setValue('condorLocation',condorLocation.options[condorLocation.selectedIndex].value);
				//if (debug) GM_log(displayLocation.options[displayLocation.selectedIndex].value);
			}, true);
	condorLocation.innerHTML="<option value='PotatoConsoleOther'>Replace GPS</option><option value='PotatoConsole'>In PotatoConsole</option><option value='PageTop'>Top of Page</option><option value='AboveUsername'>Above Name</option><option value='UnderAbilities'>Under Abilities</option><option value='UnderItem'>Under Item</option><option value='UnderEquipment'>Under Equipment</option><option value='UnderPrefs'>Under Preferences</option><option value=UnderMap>Under Map</option><option value='PageBottom'>Bottom of Page</option>";
	for (var i=0;i<condorLocation.options.length;i++) {
		if (condorLocation.options[i].value==GM_getValue('condorLocation','PotatoConsole')) {
			condorLocation.selectedIndex=i;
			break;
		}
	}
	
	configDiv.appendChild(condorLocation);
	
}
// brushfire algorithm: start HERE, and branch outward.  Good ol' queues.  Decent test of Greasemonkey 0.8, too.  Arguably, I could simply use a single massively-growing array with a pointer to the "beginning" of the queue; I don't particularly care about memory management on a roughly-60,000-item set.
function findLocation(regex){
	var visitedMap=new Object();
	var queue=[];
	var directions=[[0,1],[1,0],[0,-1],[-1,0]];
	var currentLoc,newLoc;
	var first=getCurLoc();
	first.push(0);
	visitedMap[first[0]+'%'+first[1]]=1;
	queue.push(first);
	currentLoc=queue[0];
	var maxDist=0;
	for (var it=0;queue.length>it && (currentLoc[2]<GM_getValue('searchLimit'+getUsername(),40) || GM_getValue('searchLimit'+getUsername(),40)<0);it++) {
		
		currentLoc=queue[it];
		maxDist=currentLoc[2];
		//GM_log(currentLoc+' '+printObject(visitedMap));
		// visit current location; no need for double-subscripting.
		//if (visitedMap[currentLoc[0]+'%'+currentLoc[1]]==undefined) visitedMap[currentLoc[0]+'%'+currentLoc[1]]=1;
		//else visitedMap[currentLoc[0]+'%'+currentLoc[1]]+=1;
		
		// we're here!  Return the pair, plus their description.
		if (regex.test(GM_getValue(currentLoc[0]+'%'+currentLoc[1],'OFF THE MAP'))) {
			currentLoc.push(GM_getValue(currentLoc[0]+'%'+currentLoc[1],'OFF THE MAP'));
			GM_log('found it! '+currentLoc+' regex:'+regex+' distance:'+(Math.abs(getCurLoc()[0]-currentLoc[0])+Math.abs(getCurLoc()[1]-currentLoc[1]))+' steps taken:'+it+' travel distance:'+currentLoc[2]);
			return currentLoc;
		}
		
		// branch out in all 4 directions, if possible
		for (var i=0;i<4;i++) {
			newLoc=[currentLoc[0]+directions[i][0],currentLoc[1]+directions[i][1], currentLoc[2]+1];
			test=newLoc[0]+'%'+newLoc[1];
			//GM_log('testing '+newLoc+' as '+newLoc[0]+'%'+newLoc[1]+'.  terraintype at that location:'+terrainType(GM_getValue(test,'OFF THE MAP')));
			if (visitedMap[test]==undefined && terrainType(GM_getValue(test,'OFF THE MAP'))=='unblocked') {
				//GM_log('enqueueing '+newLoc);
				visitedMap[test]=0;
				queue.push(newLoc);
			}
		}
	}
	// if we got here, then we searched the entire map and failed to find it, whatever it was.
	GM_log('did not find it after '+it+' at a distance of '+maxDist);
	return false;
}

function getMoveLocation(buttonName) {
	var move=calcMove(buttonName);
	//if (debug) GM_log("getMoveLocation's move:"+move);
	move[0]+=GM_getValue('long'+getUsername());
	move[1]+=GM_getValue('lat'+getUsername());
	return move;
}

function calcMove(buttonName) {
	var move=[0,0];
	var condorMoveRE=/^act_(n|e|w|s)(1|2|3)/;
	var walkRE=/^act_move_([news])$/;
	if (condorMoveRE.test(buttonName)) {
		//we're in the Condor, and we just did a Condor movement.  So break apart the regex to find the direction & distance.
		var results=condorMoveRE.exec(buttonName);
		//some awkward direction-setting, so the move-distance handling is simpler.
		var horizontal=0;
		var vertical=0;
		switch (results[1]) {
			case 'e': horizontal=1; break;
			case 'w': horizontal=-1; break;
			case 'n':  vertical=1; break;
			case 's':  vertical=-1; break;
		}
		// finding the distance
		var distance=0;
		switch (results[2]) {
			case '1':
			distance=1; break;
			case '2': 
			distance=8; break;
			case '3':
			distance=64; break;
		}
		// now see how easy it is to set the new coordinate?
		// On a side note, would anyone like to take bets on how long it'll take for me to implement some kind of vector library once Greasemonkey 0.8 comes out, and libraries become available?
		move[0]=horizontal*distance;
		move[1]=vertical*distance;
		
		if (debug) GM_log('move found:'+results[1]+results[2]+' vertical:'+vertical+' horizontal:'+horizontal);
	}
	else if (walkRE.test(buttonName)){
		var results=walkRE.exec(buttonName);
		switch (results[1]) {
			case 'e': move[0]=1; break;
			case 'w': move[0]=-1; break;
			case 'n': move[1]=1; break;
			case 's': move[1]=-1; break;
		}
	}
	else return false;
	if (debug) GM_log('calcMove:'+buttonName+' '+move);
	return move;
}
function getCurLoc() {
	return [GM_getValue('long'+getUsername()),GM_getValue('lat'+getUsername())];
}

function updateLocation() {
	var directions=['n','ne','nw','w','e','s','sw','se'];

	// if we just moved, update all surrounding terrain
	if (GM_getValue('moved',false)) {
		for (var i=0;i<directions.length;i++) {
			if (debug) GM_log('we moved; remembering '+directions[i]+' as '+getTerrain(directions[i]));
			GM_setValue(directions[i]+getUsername(),getTerrain(directions[i]));
		}
	}
	
	if (haveGPS()) {
		GM_setValue('lat'+getUsername(),getLatitude());
		GM_setValue('long'+getUsername(),getLongitude());
		GM_setValue('lost'+getUsername(),false);
		GM_setValue('slightlyLost'+getUsername(),false);
	}
	else if (getTerrain()=='Inside Condor' && !GM_getValue('moved',false)) {
		// on the other hand, if we DIDN'T move, then the terrain had better match what we last saw.  If it doesn't, we're lost.
		for (var i=0;i<directions.length;i++) {
			if (debug) GM_log('comparing '+directions[i]+' terrain: '+getTerrain(directions[i])+' vs. remembered '+GM_getValue(directions[i]+getUsername(),'lost'+getUsername()));
			if (getTerrain(directions[i])!=GM_getValue(directions[i]+getUsername(),'lost'+getUsername()) && GM_getValue(directions[i]+getUsername())!='No Terrain' && getTerrain(directions[i])!='No Terrain') {
				GM_setValue('lost'+getUsername(),true);
			}
		}
	}
	GM_setValue('moved',false);
}


// tell me if a terrain is forbidden, a wall, slow, or unpathed; O(1) lookup.
var type;
function terrainType(terrain) {
	if (!type) {
		type=new Object;
		type['FORBIDDEN']='forbidden';
		
		type['Barrier Mountains']='wall';
		type['Dark Mountains']='wall';
		type['Troll Mountains']='wall';
		type['Grey Mountains']='wall';
		type['Death Mountains']='wall';
		type['The Rurals']='wall';
		type['Andies']='wall';
		type['Mountains of the Son']='wall';
		type['Lava']='wall';
		type['Forbidden City']='wall';
		type['Darksatanic\'s House']='wall';
		type['OFF THE MAP']='wall';
		
		type['Thick Jungle']='slow';
		type['Coral']='slow';
		type['Hexed Ocean']='slow';
		
		type['Donation Point']='unpathed';
		type['Charity Handouts']='unpathed';
		type['Morgue']='unpathed';
		type['Great Hall']='unpathed';
		type['Supplies']='unpathed';
		type['K.O.T. Guards']='unpathed';
		type['K.O.T. TP']='unpathed';
		type['Kings Palace']='unpathed';
		type['Kings Library']='unpathed';
		type['Knights Registry']='unpathed';
		type['Guild Registry']='unpathed';
		type['Royal Wine Bar']='unpathed';
		type['Throne Room']='unpathed';
		type['Kings Store']='unpathed';
		type['Stocks']='unpathed';
	}
	if (type[terrain]) return type[terrain];
	else return 'unblocked';
}

// in desperation, the third method for collision detection is to do NONE of it until the user actually clicks the button, and then use the "move one tile at a time" method, which was collision detection #2.  It should take about 1/4 of the time of method #2 in the worst case, and it's all when the user clicks, not on page load.
// recent tweak: terrain type detection is now MUCH faster.  O(1) rather than O(n) for each tile.
function condorButton(name) {
	//if (debug) GM_log('spammed listener:'+name);
	return function (event) {
		if (debug) GM_log('MY NAME IS....'+name);
		var moveButton=/act_([news])([123])/.exec(name);
		GM_setValue('moved',true);
		if (moveButton) {
			if (debug) GM_log('it\'s a Condor button!');
			var vert=0,horiz=0;
			switch (moveButton[1]) {
				case 'n': vert=1; break;
				case 'e': horiz=1; break;
				case 's': vert=-1; break;
				case 'w': horiz=-1; break;
			}
			var dist=0;
			switch (moveButton[2]) {
				case '1': dist=1; break;
				case '2': dist=8; break;
				case '3': dist=64;break;
			}
			//if (debug) GM_log ('vert:'+vert+' horiz:'+horiz+' dist:'+dist+' moveButton:'+moveButton);
			
			var terrain;
			for (var i=1;i<=dist;i++) {
				terrain=GM_getValue((parseInt(GM_getValue('long'+getUsername()))+i*horiz)+'%'+(parseInt(GM_getValue('lat'+getUsername()))+i*vert),'OFF THE MAP');
				//if (debug) GM_log('testing '+(parseInt(GM_getValue('long'+getUsername()))+i*horiz)+'E '+(parseInt(GM_getValue('lat'+getUsername()))+i*vert)+'N, '+terrain);
				if (terrainType(terrain)=='forbidden') {
					this.style.opacity=.3;
					this.disabled=true;
					
					var warningDiv=document.getElementById('NavigatorStopWarning');
					if (!warningDiv) { 
						warningDiv=document.createElement('div');
						warningDiv.class='controls';
						warningDiv.id='NavigatorStopWarning';
						warningDiv.setAttribute('style','color:red');
						warningDiv.innerHTML='That move-button would take you into forbidden territory!';
						
						// if I'm counting my nodes right, this should insert just below the title of the Condor division.
						this.parentNode.parentNode.parentNode.parentNode.parentNode.firstChild.appendChild(warningDiv);
					}
					// trying every method to stop the propagation of the event.
					event.stopPropagation();
					event.target=document;
					return false;
				}
				else if (terrainType(terrain)=='wall'){
					i=i-1;
					break;
				}
				else if (terrainType(terrain)=='slow'){
					if (i>1) i=i-1;
					break;
				}
				// if it's an "unpathed"-type terrain, assume it's a wall, and then display that we might, maybe, be lost.
				else if (terrainType(terrain)=='unpathed'){
					i=i-1;
					GM_setValue('slightlyLost'+getUsername(),true);
					break;
				}
			}
			if (i>dist) i=dist;	// just catching the last case where we didn't hit anything.  We still want to test the last tile, but we also don't want to increment past there.
			GM_setValue('long'+getUsername(),parseInt(GM_getValue('long'+getUsername()))+i*horiz);
			GM_setValue('lat'+getUsername(),parseInt(GM_getValue('lat'+getUsername()))+i*vert);
			
			// finally, once we're done with that movement stuff, report the new location.
			if (!GM_getValue('lost'+getUsername(), false)) reportCondorLocation();
		}
		//normal moves.  Note that if we're aboveground, then this will immediately be replaced by updateLocation().
		else if (/*GM_getValue('long'+getUsername(),0)>1000 &&*/ calcMove(name)) {
			GM_setValue('long'+getUsername(),parseInt(GM_getValue('long'+getUsername()))+calcMove(name)[0]);
			GM_setValue('lat'+getUsername(),parseInt(GM_getValue('lat'+getUsername()))+calcMove(name)[1]);
		}
		// if we entered a tunnel, then we're shifted 1000 north and east.
		else if (name=='act_down') {
			GM_setValue('long'+getUsername(),parseInt(GM_getValue('long'+getUsername()))+1000);
			GM_setValue('lat'+getUsername(),parseInt(GM_getValue('lat'+getUsername()))+1000);
		}
		// if we entered guildspace, then shift us 5000 east, plus 5* lat and 5* long
		else if (name=='act_guildenter') {
			GM_setValue('long'+getUsername(),parseInt(GM_getValue('long'+getUsername()))*5+3000);
			GM_setValue('lat'+getUsername(),parseInt(GM_getValue('lat'+getUsername()))*5);
		}
	}
}

function spamListeners() {
	var buttonxpath ='//input[(@type="submit" or @type="image") and (@class="button" or @class="moveicon" or @class="condorbutton")]';
	//var buttonxpath ='//input[@class="button" or @class="moveicon"]';
	var buttons = document.evaluate(buttonxpath, document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
	
	// Watch it, the code gets kinda hairy here.  The intent is to create an eventListener function for each and every button, with a slightly different interior.  Javascript 1.7 (which comes with Firefox 2.0) would handle this by assigning variables with the "let" keyword, which would create a new instance of the variable for each iteration of the loop.  Unfortunately, Greasemonkey doesn't label its scripts as using 1.7 (which is silly, because greasemonkey only runs on FF, anyway), so we're stuck with the 1.6 method of doing it.  The solution is to create a function that returns a function, and then call that function-creator while assigning the callback function.
	var button;
	while (button=buttons.iterateNext()) {
		if (/^act_[news][123]|^act_move_|^act_down$|^act_go_enter$|^act_guildenter$/.test(button.name)) {
			button.addEventListener('click',
				condorButton(button.name)	// this returns a function that does what we want!
				,true);
		}
	}
}

function updateMap() {
	var downloadBox=makeBox('Golden Condor Navigator:');
	downloadBox.appendChild(document.createTextNode('The map is currently downloading.  Please don\'t do anything that will reload the page!'));
	downloadBox.appendChild(document.createElement('br'));
	downloadBox.appendChild(document.createTextNode('The complete file is 2.4 megabytes, and just under 62,000 lines. Your web browser will tell you a script is taking too long.  Click CONTINUE each time this happens, and the line counter will update.  Currently working on: '));
	var lineSpan=document.createElement('span');
	lineSpan.innerHTML='downloading';
	downloadBox.appendChild(lineSpan);
	document.body.insertBefore(downloadBox, document.body.firstChild);
	var responseDiv;
	GM_xmlhttpRequest({
		method:'GET',
		url: 'http://www.glendale.org.uk/cities/data.txt',
		headers: {'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey','Accept': 'text/html',},
		onload: function(responseDetails) {
			if (responseDetails.status == '200') {
				GM_log('file received!');
				var file=responseDetails.responseText;
				
				var lines=file.split("\n");
				
				for (var i=0;i<lines.length;i++) {
					// the breakdown: Token 0 is X, token 1 is Y, token 2 is the terrain texture, token 3 is the last update time, and token 4 is the terrain name.
					tokens=lines[i].split("\t");
					if (tokens.length<5) break;	// the last line is different from the rest.
					GM_setValue(tokens[0]+'%'+tokens[1],tokens[4]);
					if (i%200==0) {
						lineSpan.innerHTML='line '+i;
						if (debug) GM_log('processing: '+tokens[0]+'E'+tokens[1]+'N='+tokens[4]);
					}
				}
				if (lines.length>1000) GM_log('update successful!  ...probably.');
				
				responseDiv=document.createElement('div');
				responseDiv.innerHTML='Map download succeeded!  The Golden Condor Navigator will now properly detect walls, jungles, and forbidden territory.';
				responseDiv.setAttribute('style','color:red');
				downloadBox.appendChild(responseDiv);
				GM_log('done processing. 1N1E='+GM_getValue('1%1'));
			}
			else {
				var responseDiv=document.createElement('div');
				responseDiv.innerHTML='Map download failed: '+responseDetails.responseText;
				responseDiv.setAttribute('style','color:red');
				downloadBox.appendChild(responseDiv);
			}
		},
		onerror: function (responseDetails) {
			var responseDiv=document.createElement('div');
			responseDiv.innerHTML='Map download failed: '+responseDetails.responseText;
			responseDiv.setAttribute('style','color:red');
			downloadBox.appendChild(responseDiv);
		}
	});
	
}

// a small number of locations which must be tweaked manually.
function tweakMap() {
	GM_setValue('97%79','K.O.T. TP');
	GM_setValue('20%129','FORBIDDEN');
	GM_setValue('21%129','FORBIDDEN');
	GM_setValue('22%129','FORBIDDEN');
	GM_setValue('20%128','FORBIDDEN');
	GM_setValue('21%128','FORBIDDEN');
	GM_setValue('22%128','FORBIDDEN');
	GM_setValue('20%127','FORBIDDEN');
	GM_setValue('21%127','FORBIDDEN');
	GM_setValue('22%127','FORBIDDEN');
}

function reportCondorLocation() {
	if (getTerrain()!='Inside Condor' || !GM_getValue('CDC_key',0)) return;

	var args='dataType=CondorLocation&x='+GM_getValue('long'+getUsername())+'&y='+GM_getValue('lat'+getUsername())+'&key='+GM_getValue('CDC_key',0)+'&username='+getUsername()+'&version='+GM_getValue('scriptVersion',0)+'&dataCount=1&script=GoldenCondorNavigator';
	GM_log('sent:'+args);
	try {
		GM_xmlhttpRequest({
			method: 'POST',
			url: 'http://potatoengineer.110mb.com/dbaseInserter.php',
			headers: {'Content-type': 'application/x-www-form-urlencoded'},
			data: args,
			onerror: function(details) {
				var messages=document.getElementById('messages').innerHTML;
				messages.value += "Condor data-sending error: "+details.status+"\n";
			},
			onload: function (responseDetails) {
				strHTML = responseDetails.responseText;
				if (strHTML.substr(0,8)=='Bad Key!') {
					//GM_log(strHTML);
					var msgHandle=document.getElementById('messages');
					msgHandle.value="Your Condor Navigator/Big Brother key is bad, or the Big Brother data server is down.  Try re-entering your key.  (Palantir Cor if you don't have a key.)\n"+msgHandle.value;
				}
			}
		});
	}
	catch (ex) {
		GM_log('Posting error: '+ex);
	}
}
// disabled until I can find a More Better Way.
/*
function reportVentTunnels() {

	var curLoc=[GM_getValue('long'+getUsername()), GM_getValue('lat'+getUsername())];
	// if you're in the vents...
	if (curLoc[0]>35 && curLoc[0]<50 && curLoc[1]>35 && curLoc[1]<50) {
		var moveButtons=document.evaluate('descendant::input[@type="image" and @class="moveicon"]', document.getElementById('viewport'), null,XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
		var moves=[];
		
		var moveRE=/^act_move_(n|e|w|s)/
		var button;
		while (button=moveButtons.iterateNext()) {
			var direction=moveRE.exec(button.name);
			if (direction) {
				moves.push(direction[1]);
			}
		}
		// there's no terribly-good method for picking out the time, so just regex for it.
		var abilities=document.getElementById('abilities');
		var timeRE=/\d?\d:\d\d(?:a|p)m/;
		var time=timeRE.exec(abilities.innerHTML);
		var timestamp=new Date();
		//timestamp.setMinutes(timestamp.getMinutes()+timestamp.getTimezoneOffset());
		var hours=/\d+(?=:)/.exec(time);
		// if correcting to GMT doesn't get us Cities time, then we must be in BST; add an hour. (and cross your fingers.)
		if (hours!=(timestamp.getHours()==0?12:(timestamp.getHours()<12?timestamp.getHours():(timestamp.getHours()==12?12:timestamp.getHours()%12)))) {
			timestamp.setHours(timestamp.getHours()+1);
		}
		
		// build & send data string
		if (moves.length && time) {
			var sendIt='dataType=VentRoads&script=GoldenCondorNavigator&dataCount=1&key='+GM_getValue('CDC_key',0)+'&username='+getUsername()+'&x='+curLoc[0]+'&y='+curLoc[1]+'&dirCount='+moves.length+'&version='+GM_getValue('scriptVersion',0)+'&time='+timestamp.getTime();
			for (var i=0;i<moves.length;i++) {
				sendIt+='&dir'+i+'='+moves[i];
			}
			if (debug) GM_log('data sent:'+sendIt);
			GM_xmlhttpRequest({
				method: 'POST',
				url: 'http://potatoengineer.110mb.com/dbaseInserter.php',
				headers: {'Content-type': 'application/x-www-form-urlencoded'},
				data: sendIt,
				onerror: function(details) {
					var messages=document.getElementById('messages').innerHTML;
					messages.value += "Condor data-sending error: "+details.status+"\n";
				},
				// not much of a response.  This script is quiet when it's working properly, and users don't care about HTTP errors.
				onload: function (responseDetails) {
					strHTML = responseDetails.responseText;
					if (strHTML.substr(0,8)=='Bad Key!') {
						//GM_log(strHTML);
						var msgHandle=document.getElementById('messages');
						msgHandle.value="Your Condor Navigator/Big Brother key is bad.  Try re-entering your key.  (Palantir Cor if you don't have a key.)\n"+msgHandle.value;
					}
				}
			});
		}
		// if we're honestly in the vents, then refresh the screen in an hour.
		setTimeout(
				function() {
					document.forms.namedItem('controls').submit();
				},
				60*60*1000);
	}
	
}
*/
