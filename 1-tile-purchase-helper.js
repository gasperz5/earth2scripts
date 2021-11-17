// ==UserScript==
// @name         1 Tile Purchase Helper
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @description  Helper for 1 tile purchases, jewel farms, tilearts
// @author       GasperZ5 -- Gašper#9055 -- 41NFAM269W
// @include      https://*app.earth2.io/
// @icon         https://www.google.com/s2/favicons?domain=earth2.io
// @grant        none
// ==/UserScript==

console.log('1 Tile Purchase Helper Script added');

let delay = 2000;

(async function() {
    'use strict';
    if (JSON.parse(sessionStorage.getItem('proceed')) !== true && localStorage.getItem('SELECTED_TILE_IDS').length > 18){
        sessionStorage.setItem('proceed',confirm('Begin 1 tile buying?'));
        sessionStorage.setItem('TILES_TO_GO',localStorage.getItem('SELECTED_TILE_IDS'));
        sessionStorage.setItem('nextTile',0);
    }

    if (JSON.parse(sessionStorage.getItem('proceed')) === true) {
        let iteration = parseInt(sessionStorage.getItem('nextTile'));


        let tiles = JSON.parse(sessionStorage.getItem('TILES_TO_GO'));

        if (iteration==0) {
            localStorage.setItem('SELECTED_TILE_IDS','['+tiles[0]+']');
            sessionStorage.setItem('nextTile',1);
            location.reload();
            await sleep(3000);
        }else{
            while (!window.location.href.includes('#propertyInfo')) {
                await sleep(200);
            }

            await sleep(delay);
            window.location.href = '#';
            localStorage.setItem('SELECTED_TILE_IDS','['+tiles[iteration]+']');
            sessionStorage.setItem('nextTile',iteration+1);

            if (localStorage.getItem('SELECTED_TILE_IDS')=='[undefined]') {
                localStorage.setItem('SELECTED_TILE_IDS','[]');
                sessionStorage.removeItem('TILES_TO_GO');
                sessionStorage.removeItem('proceed');
                sessionStorage.removeItem('nextTile');
                M.toast({
                    html: `<i class="material-icons">clear</i>Finished!`,
                    classes: `teal accent-2 pulse`,
                    displayLength: 4000
                })
            }else{
                location.reload();
                await sleep(3000);
            }
        }

    }
    if (localStorage.getItem('SELECTED_TILE_IDS')=='[undefined]') {
        localStorage.setItem('SELECTED_TILE_IDS','[]');
    }
    function sleep(duration) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve()
            }, duration)
        })
    }

})();
