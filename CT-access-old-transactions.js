// ==UserScript==
// @name         Access old transaction pages
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Wait for an element to load and then changes the itemsPerPage to 10
// @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
// @support      https://www.buymeacoffee.com/gasper
// @include      https://*app.earth2.io/
// @icon         https://www.google.com/s2/favicons?domain=earth2.io
// @grant        none
// ==/UserScript==

console.log('Access old transaction pages Script by Gašper added');

(function () {
    'use strict';

    function waitForElementToExist(selector, callback) {
        const interval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(interval);
                callback(element);
            }
        }, 100);
    }
    function accessAndLogProperty(element) {
        let propertyValue = element[Object.keys(element)[0]].return.dependencies.firstContext.context._currentValue.transactionsStore.itemsPerPage;
        console.log("Existing Transaction Pages itemsPerPage:", propertyValue);
        element[Object.keys(element)[0]].return.dependencies.firstContext.context._currentValue.transactionsStore.itemsPerPage = 10;
        propertyValue = element[Object.keys(element)[0]].return.dependencies.firstContext.context._currentValue.transactionsStore.itemsPerPage;
        console.log("Fixed Transaction Pages itemsPerPage:", propertyValue);
    }

    waitForElementToExist('.app.antialiased.Layout', accessAndLogProperty);
})();
