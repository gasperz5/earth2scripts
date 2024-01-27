// ==UserScript==
// @name         Cydroid Civilian Count Script
// @namespace    http://tampermonkey.net/
// @version      0.1.6
// @description  Checks if there are any droids and civilians on the property, displays their count and the tier of the property
// @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
// @support      https://www.buymeacoffee.com/gasper
// @include      https://*app.earth2.io/
// @icon         https://www.google.com/s2/favicons?domain=earth2.io
// @grant        none
// ==/UserScript==

(async function () {

    console.log('Cydroid Civilian Count Script by Gašper added');

    'use strict';
    let react = null;
    let lastMap = null;

    function waitForElementToExist(selector, callback) {
        const interval = setInterval(() => {
            const element = document.getElementsByClassName(selector);
            if (element) {
                clearInterval(interval);
                callback();
            }
        }, 100);
    }

    function init() {
        let style = document.createElement('style');
        style.innerHTML = '.styles_menu__8fRGE {    width: 750px; }';
        document.head.appendChild(style);

        react = getReactInstance();
        setInterval(checker, 100);
    }
    async function checker() {
        const currentExpandedRaidMenuLandfieldId = react.theGridStore.raidMenuStore.expandedRaidMenuLandfieldId;
        if (currentExpandedRaidMenuLandfieldId == null) return;

        let index = react.theGridStore.raidMenuStore.raidMenuLandfields.findIndex(x => x.landfieldId == currentExpandedRaidMenuLandfieldId);

        let myMap = react.theGridStore.raidMenuStore.raidMenuLandfields[index].propertiesStore.data.data_;
        if (myMap == lastMap) return;
        lastMap = myMap;

        let head = document.querySelector("#main-menu > div > div > div:nth-child(3) > div > div.customScrollBar.h-full.overflow-y-auto > div.divide-base-900.divide-y-2 > div.duration-300.ease-in-out.transition-colors.bg-base-800 > div.overflow-hidden > div.relative > div > div:nth-child(9) > div > table > thead > tr");
        if (head == null) return;
        if (head.children.length < 7) {
            let th1 = document.createElement('th');
            th1.classList.add('text-sm');
            head.appendChild(th1);
            th1.innerHTML = 'CD';
            let th2 = document.createElement('th');
            th2.classList.add('text-sm');
            head.appendChild(th2);
            th2.innerHTML = 'CIV';
            let th3 = document.createElement('th');
            th3.classList.add('text-sm');
            head.appendChild(th3);
            th3.innerHTML = 'Tier';
        }


        let i = 1;
        for (const [key, value] of myMap) {
            let land = value.value_;
            let element = document.querySelector("#main-menu > div > div > div:nth-child(3) > div > div.customScrollBar.h-full.overflow-y-auto > div.divide-base-900.divide-y-2 > div.duration-300.ease-in-out.transition-colors.bg-base-800 > div.overflow-hidden > div.relative > div > div:nth-child(9) > div > table > tbody > tr:nth-child(" + i + ")");
            if (element.children.length < 7) {
                let td1 = document.createElement('td');
                td1.innerHTML = land.numberOfDroids;
                td1.classList.add('text-sm');
                element.appendChild(td1);

                let td2 = document.createElement('td');
                td2.innerHTML = land.numberOfCivilians;
                td2.classList.add('text-sm');
                element.appendChild(td2);

                let td3 = document.createElement('td');
                td3.innerHTML = land.landfield.landfieldTier;
                td3.classList.add('text-sm');
                element.appendChild(td3);
            }
            i++;
        }
    }


    waitForElementToExist('app antialiased Layout', init);

    function getReactInstance() {
        return Object.values(document.querySelector('.app'))[0].return.dependencies.firstContext.context._currentValue;
    };

})();