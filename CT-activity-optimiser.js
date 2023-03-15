// ==UserScript==
// @name         Activity Optimiser
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Deletes old activity feed items to improve performance
// @author       GasperZ5 -- Gašper#9055
// @match        https://app.earth2.io
// @icon         https://www.google.com/s2/favicons?sz=64&domain=earth2.io
// @support      https://www.buymeacoffee.com/gasper
// ==/UserScript==

console.log('Activity Optimiser Script by Gašper added');

const MIN_ACTIVITY_ITEMS = 500;
const MAX_ACTIVITY_ITEMS = 1000;
const DELETE_INTERVAL = 5000;

setInterval(function () {
    const container = document.querySelector("#root > div > div.content-holder.isolate.z-10 > div > div.lg\\:px-7.md\\:py-10.pb-5.w-full > div > div > div.space-y-5");
    if (container != null) {

        const numChildren = container.children.length;

        if (numChildren > MAX_ACTIVITY_ITEMS) {
            for (let i = MIN_ACTIVITY_ITEMS; i < numChildren; i++) {
                container.children[MIN_ACTIVITY_ITEMS].remove();
            }
        }
    }
}, DELETE_INTERVAL);