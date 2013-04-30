//======================================================================
// ==UserScript==
// @name          Cities DontBreakIt
// @description	  Avoid breaking stuff.
// @include        http://cities.totl.net/cgi-bin/game*
// @include        http://carmilla.ecs.soton.ac.uk:8080/cgi-bin/game*
// @require	http://potatoengineer.110mb.com/cities_potatolibrary.user.js
// ==/UserScript==
//
// Version 2.5 Now works with Newfangled interface!
//
// Version 2.4 modifiled from 2.31 by PotatoEngineer, to add his 
//	now-infamous PotatoConsole and auto-updating.
//
// Version 2.31 created by dragon, 9 September 2007.
// Contains inspirations and code snippets from Stevie-O and jmb.
// Some UI elements have been shamelessly copied from the DSS Automapper
//    (by Darksatanic).
//======================================================================

GM_setValue('scriptVersion','2.5');

checkUpdates('Don\'t Break It','nobreak','cities_dontbreakit.user.js');

//var controlElements = document.forms.namedItem('controls').elements;
var controlElements = document.getElementsByTagName('input');
var replacer, equipped, configbtn, enablebtn;
var aligns = new Array("Air", "Fire", "Earth", "Water", "Spirit");
var baditems = new Array("Talisman", "Stone", "Wand", "Knife", "Sword", "Catana", "Sword2");
var currentItem = getHeldItemValue();

var alignedstuff = GM_getValue("dontbreakitalignedstuff");
var disablebling = GM_getValue("disablebling");
var disablealchemy = GM_getValue("disablealchemy");
var disablediscard = GM_getValue("disablediscard");
var disablehighap = GM_getValue("disablehighap");
var apthreshhold = GM_getValue("apthreshhold");
var disablehighmoveap = GM_getValue("disablehighmoveap");
var moveapthreshhold = GM_getValue("moveapthreshhold");
var disableclose = GM_getValue("disableclose");
var disableattackwithheal = GM_getValue("disableattackwithheal");
var disablesnarkrelease = GM_getValue("disablesnarkrelease");

initvars();
var box = makeBox("DontBreakIt:");
insertAt(box,GM_getValue('display_location','PotatoConsole'));
var configdiv = makeConfig();
var maindiv = makeDisp();
box.appendChild( maindiv );
box.appendChild( configdiv );
disablestuff();

//default values
function initvars(){
  if(!disablebling){
    disablebling = "yes";
    GM_setValue("disablebling", "yes");
  }
  if((!alignedstuff)){ 
    alignedstuff = 16382;  //62 = everything but talismans
    GM_setValue("dontbreakitalignedstuff", 16382);
  }
  if(alignedstuff < 8192){  //updates...
    alignedstuff += 8192+2048+1024+512+256+128+64;
    GM_setValue("dontbreakitalignedstuff", alignedstuff);
  }
  if(!disablealchemy){
    disablealchemy = "yes";    
    GM_setValue("disablealchemy", "yes");
  }
  if(!disablediscard){
    disablediscard = "yes";    
    GM_setValue("disablediscard", "yes");
  }
  if(!disablehighap){
    disablehighap = "yes";    
    GM_setValue("disablehighap", "yes");
  }
  if(!apthreshhold){
    apthreshhold = 100;
    GM_setValue("apthreshhold", 100);
  }
  if(!disablehighmoveap){
    disablehighmoveap = "yes";    
    GM_setValue("disablehighmoveap", "yes");
  }
  if(!moveapthreshhold){
    moveapthreshhold = 2;
    GM_setValue("moveapthreshhold", 2);
  }
  if(!disableclose){
    disableclose = "yes";    
    GM_setValue("disableclose", "yes");
  }
  if(!disableattackwithheal){
    disableattackwithheal = "yes";    
    GM_setValue("disableattackwithheal", "yes");
  }
  if(!disablesnarkrelease){
    disablesnarkrelease = "yes";    
    GM_setValue("disablesnarkrelease", "yes");
  }
}


function disablestuff(){
for(i=0; i<controlElements.length; i++) {
  if (((disablebling == "yes") && isBling(controlElements[i].name)) || 
      ((disablealchemy == "yes") && isAlchemy(controlElements[i].name)) ||
      ((disablediscard == "yes") && isDiscard(controlElements[i].name)) ||
      ((disablehighap == "yes") && isHighAP(controlElements[i])) ||
      ((disablehighmoveap == "yes") && isHighMoveAP(controlElements[i])) ||
      ((disableclose == "yes") && isClose(controlElements[i].name)) ||
      ((disableattackwithheal == "yes") && isAttack(controlElements[i].name) && isHeal(currentItem)) ||
      ((disablesnarkrelease == "yes") && isUse(controlElements[i].name) && isSnark(currentItem)) ||
      isBadToBreak(controlElements[i]))
  {
      makedisabled(controlElements[i]);
  }
}
}

function enablestuff(){
  for(i=0; i<controlElements.length; i++) {
     if(isdisabled(controlElements[i])){
       makeenabled(controlElements[i]);
     }
  }
}

function isBling(actname)
{
   return (actname.substr(0, 12) == 'act_build_un' &&
                      actname.indexOf('bling') > -1);
}

function isAlchemy(actname)
{
   return (actname.substr(0, 11) == 'act_convert');
}

function isDiscard(actname)
{
   return (actname == 'act_item_discard');
}

function isClose(actname)
{
   return (actname == 'act_close');
}

function isAttack(actname)
{
   return (actname.substr(0,10) == 'act_fight_');
}

function isUse(actname)
{
   return (actname == 'act_item_use');
}

function isHeal(itemname)
{
   return ((itemname == 'Bandage') || (itemname == 'DragonStone') || (itemname == 'PotionHeal'));
}

function isSnark(itemname)
{
   return (itemname == 'Snark');
}

function isBadToBreak(act)
{
  if((act.name == 'act_item_use') && 
     (act.value.substr(0,5) == 'Break'))
  {
    equipped = getHeldItemValue();
    for(j=0; j<aligns.length; j++)
    {
      for(k=0; k<baditems.length; k++)
      {
        if(((1<<k)&alignedstuff) && (equipped == aligns[j]+baditems[k]))
        {
//	  GM_log("It's a(n) "+aligns[j]+baditems[k]);
          return true;
        }
      }
    }
  }

  return false;
}

function isHighAP(act){
  if(act.value.substr(-3,3) == 'AP)'){
    return (parseInt(act.value.substring(act.value.lastIndexOf('(')+1,
                                         act.value.length - 3))
            > apthreshhold);
  }
}

function isHighMoveAP(act){
  if(act.name.substr(0,9) == 'act_move_'){
    ti = (act.title || act.getAttribute("onmouseover"));
    ti = ti.substring(0, ti.lastIndexOf(' '));
    ti = ti.substring(ti.lastIndexOf(' ')+1, ti.length);
    return (parseInt(ti) > moveapthreshhold);
  }
}

function isdisabled(btn){
    //checking the opacity to make sure the button was enabled
    //by this script, not something else...
    return (btn.style.opacity == 0.5);
}

function makedisabled(btn){
    btn.disabled = true;

    // Because of the background image styling, setting disabled
    // doesn't grey out the button, so we have to amend the rendering
    // some other way...

    btn.style.opacity = 0.5;
}

function makeenabled(btn){
    btn.disabled = false;
    btn.style.opacity = 1.0;
}

function makeDisp() {
    var dispfrag = document.createDocumentFragment();
    dispfrag.appendChild(document.createTextNode(" "));
    configbtn = document.createElement("input");
    configbtn.setAttribute("type", "button");
    configbtn.setAttribute("class", "button");
    configbtn.setAttribute("value", "Show Config");
    
    configbtn.addEventListener(
        'click',
        function(event)
        {
            if(configbtn.getAttribute("value") == "Show Config")
            {
                configbtn.setAttribute("value", "Hide Config");
                configdiv.setAttribute("style", "");
            }
            else
            {
                configbtn.setAttribute("value", "Show Config");
                configdiv.setAttribute("style", "display:none");
            }
        },
        true);
    dispfrag.appendChild(configbtn);

    dispfrag.appendChild(document.createTextNode(" "));

    enablebtn = document.createElement("input");
    enablebtn.setAttribute("type", "button");
    enablebtn.setAttribute("class", "button");
    enablebtn.setAttribute("value", "Enable Everything");
    
    enablebtn.addEventListener(
        'click',
        function(event)
        {
            if( enablebtn.getAttribute("value") == "Disable Stuff" ) {
                disablestuff();
                enablebtn.setAttribute("value", "Enable Everything");
            }
            else {
                enablestuff();
                enablebtn.setAttribute("value", "Disable Stuff");
            }
        },
        true);
    dispfrag.appendChild(enablebtn);

    return dispfrag;
}

function makeConfig() {
    var confdiv = document.createElement("div");
    confdiv.appendChild(document.createElement("hr"));
    confdiv.appendChild(document.createTextNode("Disable aligned:  "));

    for(k=0; k<baditems.length; k++)
    {
      var chkbox = document.createElement("input");
      chkbox.setAttribute("type", "checkbox");
      chkbox.setAttribute("name", "disable"+k);
      chkbox.setAttribute("id", "disable"+k);

      if(((1<<k)&alignedstuff)){
        chkbox.checked = true;
      }

      chkbox.addEventListener(
        'click',
        makeCheckboxHandler(k),
        true);


      confdiv.appendChild(chkbox);
      confdiv.appendChild(document.createTextNode(baditems[k]+"s "));
    }

    confdiv.appendChild(document.createElement("br"));
    confdiv.appendChild(document.createTextNode("Disable:  "));


    //make "Disable bling-melting" checkbox
    var blingchkbox = document.createElement("input");
    blingchkbox.setAttribute("type", "checkbox");
    blingchkbox.setAttribute("name", "disablebling");
    if(disablebling == "yes"){
      blingchkbox.checked = true;
    }
    blingchkbox.addEventListener(
      'click',
      function(event)
      {
        if( blingchkbox.checked ) {
          disablebling = "yes";    
          GM_setValue("disablebling", "yes");
          disablestuff();
        }
        else {
          disablebling = "no";    
          GM_setValue("disablebling", "no");
          enablestuff();
          disablestuff();
        }
      },
      true);

    confdiv.appendChild(blingchkbox);
    confdiv.appendChild(document.createTextNode("Bling-melting "));



    //make "Disable alchemy" checkbox
    var alchemychkbox = document.createElement("input");
    alchemychkbox.setAttribute("type", "checkbox");
    alchemychkbox.setAttribute("name", "disablealchemy");
    if(disablealchemy == "yes"){
      alchemychkbox.checked = true;
    }
    alchemychkbox.addEventListener(
      'click',
      function(event)
      {
        if( alchemychkbox.checked ) {
          disablealchemy = "yes";    
          GM_setValue("disablealchemy", "yes");
          disablestuff();
        }
        else {
          disablealchemy = "no";    
          GM_setValue("disablealchemy", "no");
          enablestuff();
          disablestuff();
        }
      },
      true);

    confdiv.appendChild(alchemychkbox);
    confdiv.appendChild(document.createTextNode("Alchemy "));



    //make "Disable discards" checkbox
    var discardchkbox = document.createElement("input");
    discardchkbox.setAttribute("type", "checkbox");
    discardchkbox.setAttribute("name", "disablediscard");
    if(disablediscard == "yes"){
      discardchkbox.checked = true;
    }
    discardchkbox.addEventListener(
      'click',
      function(event)
      {
        if( discardchkbox.checked ) {
          disablediscard = "yes";    
          GM_setValue("disablediscard", "yes");
          disablestuff();
        }
        else {
          disablediscard = "no";    
          GM_setValue("disablediscard", "no");
          enablestuff();
          disablestuff();
        }
      },
      true);

    confdiv.appendChild(discardchkbox);
    confdiv.appendChild(document.createTextNode("Discarding "));


    //make "Disable closing stalls/vaults" checkbox
    var closechkbox = document.createElement("input");
    closechkbox.setAttribute("type", "checkbox");
    closechkbox.setAttribute("name", "closediscard");
    if(disableclose == "yes"){
      closechkbox.checked = true;
    }
    closechkbox.addEventListener(
      'click',
      function(event)
      {
        if( closechkbox.checked ) {
          disableclose = "yes";    
          GM_setValue("disableclose", "yes");
          disablestuff();
        }
        else {
          disableclose = "no";    
          GM_setValue("disableclose", "no");
          enablestuff();
          disablestuff();
        }
      },
      true);

    confdiv.appendChild(closechkbox);
    confdiv.appendChild(document.createTextNode("Closing stalls/vaults "));


    //make "Disable attacking w/healing items" checkbox
    var attwhealchkbox = document.createElement("input");
    attwhealchkbox.setAttribute("type", "checkbox");
    attwhealchkbox.setAttribute("name", "disableattackwheal");
    if(disableattackwithheal == "yes"){
      attwhealchkbox.checked = true;
    }
    attwhealchkbox.addEventListener(
      'click',
      function(event)
      {
        if( attwhealchkbox.checked ) {
          disableattackwithheal = "yes";    
          GM_setValue("disableattackwithheal", "yes");
          disablestuff();
        }
        else {
          disableattackwithheal = "no";    
          GM_setValue("disableattackwithheal", "no");
          enablestuff();
          disablestuff();
        }
      },
      true);

    confdiv.appendChild(attwhealchkbox);
    confdiv.appendChild(document.createTextNode("Attacking with healing items "));


    //make "Disable releasing Snark" checkbox
    var snarkchkbox = document.createElement("input");
    snarkchkbox.setAttribute("type", "checkbox");
    snarkchkbox.setAttribute("name", "disablesnark");
    if(disablesnarkrelease == "yes"){
      snarkchkbox.checked = true;
    }
    snarkchkbox.addEventListener(
      'click',
      function(event)
      {
        if( snarkchkbox.checked ) {
          disablesnarkrelease = "yes";    
          GM_setValue("disablesnarkrelease", "yes");
          disablestuff();
        }
        else {
          disablesnarkrelease = "no";    
          GM_setValue("disablesnarkrelease", "no");
          enablestuff();
          disablestuff();
        }
      },
      true);

    confdiv.appendChild(snarkchkbox);
    confdiv.appendChild(document.createTextNode("Releasing the Snark "));


    confdiv.appendChild(document.createElement("br"));

    //make "high-ap" checkbox and input text
    var apchkbox = document.createElement("input");
    apchkbox.setAttribute("type", "checkbox");
    apchkbox.setAttribute("name", "disablehighap");
    if(disablehighap == "yes"){
      apchkbox.checked = true;
    }
    apchkbox.addEventListener(
      'click',
      function(event)
      {
        if( apchkbox.checked ) {
          disablehighap = "yes";    
          GM_setValue("disablehighap", "yes");
          disablestuff();
        }
        else {
          disablehighap = "no";    
          GM_setValue("disablehighap", "no");
          enablestuff();
          disablestuff();
        }
      },
      true);

    confdiv.appendChild(apchkbox);
    confdiv.appendChild(document.createTextNode("Actions requiring over "));  
    var aptextbox = document.createElement("input");
    aptextbox.setAttribute("type", "text");
    aptextbox.setAttribute("name", "apthresh");
    aptextbox.setAttribute("value", apthreshhold);
    aptextbox.size = 4;
    aptextbox.addEventListener(
      'change',
      function(event)
      {
        apthreshhold = aptextbox.value;    
        GM_setValue("apthreshhold", apthreshhold);
        enablestuff();
        disablestuff();
      },
      true);

    confdiv.appendChild(aptextbox);
    confdiv.appendChild(document.createTextNode("AP"));

    confdiv.appendChild(document.createElement("br"));

    //make "high-move-ap" checkbox and input text
    var moveapchkbox = document.createElement("input");
    moveapchkbox.setAttribute("type", "checkbox");
    moveapchkbox.setAttribute("name", "disablehighmoveap");
    if(disablehighmoveap == "yes"){
      moveapchkbox.checked = true;
    }
    moveapchkbox.addEventListener(
      'click',
      function(event)
      {
        if( moveapchkbox.checked ) {
          disablehighmoveap = "yes";    
          GM_setValue("disablehighmoveap", "yes");
          disablestuff();
        }
        else {
          disablehighmoveap = "no";    
          GM_setValue("disablehighmoveap", "no");
          enablestuff();
          disablestuff();
        }
      },
      true);

    confdiv.appendChild(moveapchkbox);
    confdiv.appendChild(document.createTextNode("Moves requiring over "));  
    var moveaptextbox = document.createElement("input");
    moveaptextbox.setAttribute("type", "text");
    moveaptextbox.setAttribute("name", "moveapthresh");
    moveaptextbox.setAttribute("value", moveapthreshhold);
    moveaptextbox.size = 4;
    moveaptextbox.addEventListener(
      'change',
      function(event)
      {
        moveapthreshhold = moveaptextbox.value;    
        GM_setValue("moveapthreshhold", moveapthreshhold);
        enablestuff();
        disablestuff();
      },
      true);

    confdiv.appendChild(moveaptextbox);
    confdiv.appendChild(document.createTextNode("AP"));
    
	confdiv.appendChild(locationSelect());
    

    confdiv.setAttribute("style", "display:none");
    return confdiv;
}

function makeCheckboxHandler(n){
   var x = n;
   return function() { processCheckbox(x)};
}

function processCheckbox(num){
  var chkbox = document.getElementById("disable"+num);
//  GM_log(chkbox.getAttribute("name")+ " was hit");

  alignedstuff ^= (1<<num);
  GM_setValue("dontbreakitalignedstuff", alignedstuff);
  if( enablebtn.getAttribute("value") != "Disable Stuff" ) {
    if(chkbox.checked)
    {
       disablestuff();
    }
    else
    {
       enablestuff();
       disablestuff();
    }
  }
}

function addBox(box)
{
  // Puts before 'talk box' by default.
  var talkbox = document.getElementById("say");
  talkbox.parentNode.insertBefore(box, talkbox);
}
