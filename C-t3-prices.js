// ==UserScript==
// @name         T3 territory prices
// @version      0.1.0
// @description  Displays the prices of open T3 territories
// @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
// @support      https://www.buymeacoffee.com/gasper
// ==/UserScript==

(async function () {
    'use strict';
    
    const ZOOM = 21; // Do not change this, it's hardcoded to 21 in E2 to represent tiles on the map
    const MAX_TERRITORIES = 100; // Maximum number of territories to get prices for
    const SLEEP_BASE = 250;
    const SLEEP_INTERVAL = 1000;
    
    try {
        validateUserLogin();
    } catch (error) {
        console.error(error.message);
        return;
    }

    await sleep(1);
    console.log('T3 territory prices script by Gašper added');

    const react = getReactInstance();
    const now = new Date();
    let territories = await getT3Territories();

    territories = territories.slice(0, MAX_TERRITORIES);
    console.log(`Checking for ${territories.length} T3 territories`);
    await calculatePrices();
    displayTerritoryInfo();

    console.log('Finished getting T3 prices');

    function validateUserLogin() {
        if (typeof auth0user === 'undefined' || !auth0user) {
            throw new Error('Please login first to use this script');
        }
    }

    function getReactInstance() {
        return Object.values(document.querySelector('.app'))[0].return.dependencies.firstContext.context._currentValue;
    }

    async function getT3Territories() {
        let territories = [];
        for (let i = 1, pages = 1; i <= pages && territories.length < MAX_TERRITORIES; i++) {
            const { data, meta } = await react.api.getTerritoryReleases({
                released: true,
                sort_by: 'votes_value',
                sort_dir: 'desc',
                page: i
            });
            territories.push(...data.filter(t => new Date(t.attributes.releaseAt) < now));
            pages = meta.pages;
            console.log(`Getting T3 territories from released page ${i} of ${pages}`);
        }
        return territories;
    }

    async function calculatePrices() {
        for (let i = 0; i < territories.length; i++) {
            logProgress(i);
            const tileId = lngLatToQuadkeyCompress(territories[i].attributes.center, ZOOM);
            territories[i].price = (await react.api.calculatePrice({ tileId, landfieldTier: 3 })).final;
            await sleep(SLEEP_BASE + (i % 10 === 0 ? SLEEP_INTERVAL : 0));
        }
    }

    function displayTerritoryInfo() {
        territories.sort((a, b) => b.price - a.price);
        territories.forEach(t =>
            console.log(`${t.id} - ${t.attributes.territoryName}, ${t.attributes.countryName} - E$${t.price} per Tile, ${react.appStore.url}/?lat=${t.attributes.center[1]}&lng=${t.attributes.center[0]}#`)
        );
    }

    function logProgress(index) {
        if (index % 10 === 0) {
            console.log(`Calculating price for territory #${index}`);
        }
    }

    function lngLatToQuadkeyCompress([lng, lat], zoom) {
        if (typeof Number.prototype.toRad === 'undefined') {
            Number.prototype.toRad = function () {
                return this * Math.PI / 180;
            };
        }
        const tilex = Math.floor((lng + 180) / 360 * (1 << zoom));
        const tiley = Math.floor((1 - Math.log(Math.tan(lat.toRad()) + 1 / Math.cos(lat.toRad())) / Math.PI) / 2 * (1 << zoom));
        const bitmap = Array.from({ length: zoom }, (_, idx) => {
            const mask = 1 << (zoom - 1 - idx);
            let digit = 0;
            if ((tilex & mask) !== 0) digit = 1;
            if ((tiley & mask) !== 0) digit += 2;
            return [...Array(2)].map((_, idx, arr) => (digit >> (arr.length-idx-1)) & 1);
        }).flat();
        return bitmap.reduce((res, val, idx) => res + val * 2 ** idx) * 100 + zoom;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
})();
