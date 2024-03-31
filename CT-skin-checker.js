// ==UserScript==
// @name         Skin Checker
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Checks if there is a new skin countdown and notifies you when it is first available and 5, 2 and 1 minute before it releases
// @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
// @support      https://www.buymeacoffee.com/gasper
// @include      https://*app.earth2.io/
// @icon         https://www.google.com/s2/favicons?domain=earth2.io
// @grant        none
// ==/UserScript==


(async function () {

    'use strict';
    let react;


    window.addEventListener('load', async function () {
        console.log('Skin Checker Script by Gašper loaded');
        react = getReactInstance();
        checker();
        setInterval(checker, 300000);
    });
    
        
    async function checker() {

        console.log('Checking for new skin');

        let localStorage = getLocaStorage();

        let date = (await react.api.getAvatarSkinSales())?.meta?.nextReleaseAt;

        if (date) {
            if (!(localStorage?.latest == date)) {
                console.log('New skin detected');
                console.log('Next skin release:', date);
                
                localStorage.latest = date;
                setLocalStorage(localStorage);
                
                notify('New skin detected');
                let time = new Date(date).getTime();
                setTimeout(() => {
                    notify('5 minutes before skin release');
                }, time - Date.now() - 300000);
                setTimeout(() => {
                    notify('2 minutes before skin release');
                }, time - Date.now() - 120000);
                setTimeout(() => {
                    notify('1 minute before skin release');
                }, time - Date.now() - 60000);
                return;
            }
        }
        console.log('No new skin detected');
    }

    function getReactInstance() {
        return Object.values(document.querySelector('.app'))[0].return.dependencies.firstContext.context._currentValue;
    }

    function getLocaStorage() {
        return JSON.parse(localStorage.getItem('skinChecker')) || {};
    }

    function setLocalStorage(data) {
        localStorage.setItem('skinChecker', JSON.stringify(data));
    }

    function notify(message) {
        if (typeof M !== 'undefined') {
            M.toast({
                html: message,
                classes: 'teal accent-2',
                displayLength: 20000
            });
        } else {
            alert(message);
        }
    }

})();