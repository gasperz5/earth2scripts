// ==UserScript==
// @name         Hide Activity Feed
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @description  try to take over the world!
// @author       GasperZ5-- Gašper#9055
// @match        https://app.earth2.io
// @icon         https://www.google.com/s2/favicons?sz=64&domain=earth2.io
// @support      https://www.buymeacoffee.com/gasper
// ==/UserScript==

(function() {
    'use strict';
    window.addEventListener('load', function() {
        var elementToRemove = document.querySelector("#main-menu > div > div.bg-black.flex.items-center.pl-2\\.5.pr-7.ActivityWidget_widget__2jA0a.ml-auto");
        elementToRemove.remove();
        console.log("Activity feed element removed by the tampermonkey script");
    });
})();