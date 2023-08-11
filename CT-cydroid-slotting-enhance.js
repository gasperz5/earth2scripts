// ==UserScript==
// @name         Speed up Cydroid Slotting
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adds buttons to switch between droids in the slotting menu
// @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
// @support      https://www.buymeacoffee.com/gasper
// @include      https://*app.earth2.io/
// @icon         https://www.google.com/s2/favicons?domain=earth2.io
// @grant        none
// ==/UserScript==

console.log('Speed up Cydroid Slotting Script by Gašper added');

(function () {
    'use strict';

    let lastSelectedDroidId = null;
    let droidIds = [];
    let react = null;
    let currentIndex = 0;
    let wasNull = true;
    let landfieldIds = {};

    function waitForElementToExist(selector, callback) {
        const interval = setInterval(() => {
            const element = document.getElementsByClassName(selector);
            if (element) {
                clearInterval(interval);
                callback();
            }
        }, 100);
    }

    function checkForDroidIdChange() {
        react = document.getElementsByClassName('app antialiased Layout')[0][Object.keys(document.getElementsByClassName('app antialiased Layout')[0])[0]].return.dependencies.firstContext.context._currentValue;

        const currentSelectedDroidId = react.raidManagementStore.droidManagementStore.selectedDroidId;

        if (currentSelectedDroidId !== lastSelectedDroidId) {
            lastSelectedDroidId = currentSelectedDroidId;
            handleDroidIdChange(currentSelectedDroidId);
        }


        setTimeout(checkForDroidIdChange, 200);
    }

    function handleDroidIdChange(newDroidId) {
        if (!newDroidId) {
            wasNull = true;
            return;
        }

        if (!wasNull) return;

        const arrowContainer = document.createElement('div');
        arrowContainer.innerHTML = `<button id="previousArrow">Previous</button><button id="nextArrow">Next</button>`;
        document.querySelector("#mgmt-right-panel > div.relative.overflow-hidden.styles_cornersFrame__2lJY2 > div > div > div.flex.flex-col.items-center > div.flex.h-40.items-center.justify-center.rounded-full.overflow-hidden.w-40.styles_backgroundGrid__16TvD.styles_fadeBg__2ltM_").appendChild(arrowContainer);

        const previousArrow = document.getElementById('previousArrow');
        const nextArrow = document.getElementById('nextArrow');

        previousArrow.addEventListener('click', () => switchDroid(-1));
        nextArrow.addEventListener('click', () => switchDroid(1));

        droidIds = [];
        wasNull = false;
        if (react.raidManagementStore.droidManagementStore.currentView == 'droids') {
            const n = react.raidManagementStore.droidManagementStore.currentViewStore.droidsIds.length;
            for (let i = 0; i < n; i++) {
                const id = react.raidManagementStore.droidManagementStore.currentViewStore.droidsIds[i];
                if (id == newDroidId) {
                    currentIndex = i;
                }
                droidIds.push(id);
            }
        } else if (react.raidManagementStore.droidManagementStore.currentView == 'properties') {
            const propId = react.raidManagementStore.droidManagementStore.currentViewStore.expandedLandfieldId;
            if (propId == null) {
                currentIndex = 0;
                droidIds.push(newDroidId);
                return;
            }
            const n = react.raidManagementStore.droidManagementStore.currentViewStore.landfields.length;
            let index = 0;
            for (let i = 0; i < n; i++) {
                const landfield = react.raidManagementStore.droidManagementStore.currentViewStore.landfields[i];

                const m = react.raidManagementStore.droidManagementStore.currentViewStore.landfields[i].droidsDetailsStore.droids.length;
                for (let j = 0; j < m; j++) {
                    const droid = landfield.droidsDetailsStore.droids[j];
                    landfieldIds[droid.id] = landfield.landfieldId;
                    if (droid.id == newDroidId) {
                        currentIndex = index;
                    }
                    droidIds.push(droid.id);
                    index++;
                }
                index++;
            }

        }

    }

    function switchDroid(offset) {
        if (currentIndex + offset < 0 || currentIndex + offset >= droidIds.length) return;
        lastSelectedDroidId = droidIds[currentIndex + offset];
        react.raidManagementStore.droidManagementStore.selectedDroidId = lastSelectedDroidId;
        if (react.raidManagementStore.droidManagementStore.currentView == 'properties') react.raidManagementStore.droidManagementStore.currentViewStore.expandedLandfieldId = landfieldIds[lastSelectedDroidId];
        currentIndex += offset;
    }


    waitForElementToExist('app antialiased Layout', checkForDroidIdChange);

})();

