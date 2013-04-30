// ==UserScript==
// @name           Cites Expander
// @namespace      http://potatoengineer.110mb.com/
// @description    Clicks the expand button on load
// @include        http://cities.totl.net/cgi-bin/game*
// @include        http://carmilla.ecs.soton.ac.uk:8080/cgi-bin/game*
// ==/UserScript==
var evObj = document.createEvent('MouseEvents');
evObj.initEvent( 'click', true, false );
document.getElementById('messages_expand').dispatchEvent(evObj);
