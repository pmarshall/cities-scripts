// ==UserScript==
// @name           Cities Universal Solver
// @namespace      http://potatoengineer.110mb.com
// @description    You ask for particular letters; the script tells you what to dissolve.
// @include        http://cities.totl.net/cgi-bin/game*
// @include		   http://carmilla.ecs.soton.ac.uk:8080/cgi-bin/game*
// @require	http://potatoengineer.110mb.com/cities_potatolibrary.user.js
// ==/UserScript==
// Copyright 2007 Paul Marshall
// The WTH EULA applies to this script: you may do WHATEVER THE HELL YOU WANT TO with it.
//
// Version 1.5: quips!
//
// Version 1.41: PotatoLibrary update for Firefox 3.
//
// Version 1.4: Update for newfangled interface
//
// Version 1.3: PotatoConsole update: you can leave it open if you unset the checkbox.
//
// Version 1.2: Added to PotatoConsole.
//				Output cleaned up.
//
// Version 1.1: BAH.  Forgot to remove some old debug code.  The script will ignore duplicate letters now.
//				Also strips " x 1.221345e+35" from kipple.  (or anything else, but really, where are you going to get
//					that much of ANY other item in the game?)
//				Also stripped the debug statements.  The script should run marginally faster now.
//				Added a feature, because I can't resist: you can insist that the returned words contain at 
//					least one of each letter.
//				Let back in the few items properly named with parentheticals, like Stranger In A Strange Land (Hardback)
//				Kicked out unique items.
//
// Version 1.01: Of course it didn't work perfectly the first time.  It now uses capital letters, too.
//				Oh, and the auto-updating was hosed in a variety of ways.
//
// Version 1.0: It works!  Just enter the letters you're interested in into the box, and click FIND ITEMS!


GM_setValue('scriptVersion',"1.5");

checkUpdates('Universal Solver','unisolv','cities_universal_solver.user.js');


var calcbtn;
var targetLetters;
var resultDiv = document.createElement('span');
resultDiv.id='uniSolvResults';

makeDisp();

var consoleVisible=false;
function makeDisp() {
	var box = makeBox("Universal Solver:");
	var configDiv = document.createDocumentFragment();
	configDiv.appendChild(document.createTextNode(" Enter the letters you want: "));
	
	targetLetters=document.createElement('input');
	targetLetters.type = 'text';
	targetLetters.setAttribute('size', '6');
	targetLetters.className = 'textin';
	
	calcbtn = document.createElement("input");
	calcbtn.setAttribute("type", "button");
	calcbtn.setAttribute("class", "button");
	calcbtn.setAttribute("value", "Find Items!");
	
	calcbtn.addEventListener(
		'click',
		function(event)
		{
			if(calcbtn.getAttribute("value") == "Find Items!")
			{
				calcbtn.setAttribute("value", "Erase Results");
				findItems(targetLetters.value);
			}
			else
			{
				calcbtn.setAttribute("value", "Find Items!");
				resultDiv.innerHTML='';
			}
		},
		true);
	configDiv.appendChild(targetLetters);
	configDiv.appendChild(calcbtn);

	configDiv.appendChild(document.createElement('br'));
	
	var mustHaveAllCB=document.createElement('input');
    mustHaveAllCB.setAttribute("type","checkbox");
    mustHaveAllCB.setAttribute("id","allLetters");
    mustHaveAllCB.checked=false;
    
    configDiv.appendChild(document.createTextNode('Must have at least one of each requested letter: '));
    configDiv.appendChild(mustHaveAllCB);
	
	box.appendChild(configDiv);
	box.appendChild( resultDiv );
	
	insertAt(box,GM_getValue('display_location','PotatoConsole'));
	
	configDiv.appendChild(locationSelect());
	
}

//Bah.  Classes in Javascript.  Kinda ugly-looking, if you ask me.
wordScore.prototype._word;
wordScore.prototype._scores;
wordScore.prototype.getScores=function(){return this._scores;}
wordScore.prototype.getWord=function(){return this._word;}
wordScore.prototype.addScore=function (letter, score) {this._scores[letter]=score;}
wordScore.prototype.calcScore=function () {
	var count=0;
	for (m in this._scores) {
		count+=this._scores[m];
	}
	//GM_log('wordScore in comparison:'+count);
	return count;
}
wordScore.prototype.getScore=function(letter) {
	if (this._scores[letter]) return this._scores[letter];
	return 0;
}
function wordScore (word) {
	this._word=word;
	this._scores={};
}


var letters;
function findItems(inputString) {
	// first, sanitize the input string.  I only want the alphabetical letters.
	inputString=inputString.toLowerCase();
	inputString.replace(/[^a-z]/g,'');
	
	// now, get the UNIQUE letters from the input string.  Have you noticed that I'm assuming the user is a complete and utter idiot?  Am I wasting my time?  Possibly, but now, it's GUARANTEED!  ....for what it's worth.  I'm tired, and I'm adding features for the hell of it before I even make the script WORK.  I think there's something fundamentally wrong with programmers.  :)
	inputString=inputString.split('');
	inputString.sort();
	inputString=inputString.join('');
	letters= [];
	var j=-1;
	for (var i=0;i<inputString.length;i++) {
		// if I have my rules right, when j is -1, it should short-circuit and never test letters [-1]
		if (letters.length==0 || letters[j]!=inputString[i]) {
			letters.push(inputString[i]);
			j++;
		}
	}
	quip('uniSolvResults');
	getInventory('name:value',processInventory);
}

function processInventory(inv){
	var valuableWords=new Array();
	for (var word in inv) {
		// unique items are not candidates for dissolving.  Ban them!
		if (/[^.]*\.\d+$/.test(inv[i])) continue;
		
		var ws = new wordScore(word);
		// there is probably a better way to do this.  Ah, well, O(N^3), here we come!
		for (var k=0;k<letters.length;k++) {
			var foundLetter=false;
			var letter='';
			var score=0;
			for (var j=0;j<word.length;j++) {
				if (word[j].toLowerCase()==letters[k]) {
					//GM_log('found match! '+word[j]+' and '+letters[k]+' in '+word);
					if (!foundLetter) {
						letter=letters[k];
						score=1;
						foundLetter=true;
					}
					else score++;
				}
			}
			if (letter) ws.addScore(letter,score);
		}
		if (ws.calcScore()) {
			valuableWords.push(ws);
		}
		else delete ws;
	}
	
	valuableWords.sort(function (a,b) {return b.calcScore()-a.calcScore();});
	
	// if they want their words to have one of each letter, that's what they get.
	if ($('allLetters').checked) {
		for (var i=0;i<valuableWords.length;i++) {
			for (var j=0;j<letters.length;j++) {
				if (valuableWords[i].getScore(letters[j])==0) {
					valuableWords.splice(i,1);
					i--;
					break;
				}
			}
		}
	}
	var output=document.createElement('table');
	for (var i=0;i<valuableWords.length;i++) {
		var row=document.createElement('tr');
		var itemName=document.createElement('td');
		itemName.innerHTML=valuableWords[i].getWord();
		row.appendChild(itemName);
		var spacer=document.createElement('td');
		spacer.innerHTML='   ';
		row.appendChild(spacer);
		
		var scoreArray=valuableWords[i].getScores();
		GM_log(printObject(scoreArray));
		for (var j in scoreArray) {
			var oneScore=document.createElement('td');
			oneScore.innerHTML=' '+j+': '+scoreArray[j]+' ';
			row.appendChild(oneScore);
		}
		output.appendChild(row);
	}
	resultDiv.appendChild(output);
	endQuip();
}

