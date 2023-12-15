// ==UserScript==
// @name         Chance for a brilliant
// @version      0.3.0
// @description  Uses leaderboard's data to calculate the chance for a brilliant
// @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
// @support      https://www.buymeacoffee.com/gasper
// ==/UserScript==

console.log('Chance for a brilliant Script by Gašper added');


(async function () {
    'use strict';
    const jewelTypes = ['LUMINOUS', 'BRILLIANT'];

    const react = getReactInstance();

    let results = {};
    for (let i = 0; i < jewelTypes.length; i++) {
        const jewelType = jewelTypes[i];
        const count = await getCount(jewelType);
        console.log(`${jewelType} - ${count}`);
        results[jewelType] = count;
    }
    const luminousCount = results['LUMINOUS'];
    const brilliantCount = results['BRILLIANT'];
    console.log(`Chance to craft a brilliant is 1 in ${parseInt((luminousCount + brilliantCount) / brilliantCount)}`);

    if (readLocalStorage('GASPERZ5_JEWELS') != null) {
        diffrenceBetweenLastRun(readLocalStorage('GASPERZ5_JEWELS'), brilliantCount, luminousCount);
    }
    writeLocalStorage('GASPERZ5_JEWELS', { 'BRILLIANT': brilliantCount, 'LUMINOUS': luminousCount, 'DATE': new Date().toJSON().slice(0, 10) });

    async function getCount(jewel_quality) {
        const data = await react.api.getLeaderboards({ kindBy: 'player_continents', sortBy: 'hq_jewels_count', filters: { jewel_quality: jewel_quality } });
        let total = 0;
        for (let index = 0; index < data?.data?.length; index++) {
            total += parseInt(data.data[index].attributes.value);
        }
        return total;
    }

    function readLocalStorage(key) {
        return JSON.parse(localStorage.getItem(key));
    }

    function writeLocalStorage(key, value) {
        localStorage.setItem
            (key, JSON.stringify(value));
    }

    function diffrenceBetweenLastRun(last, brilliantCount, luminousCount) {
        const brilliantDiffrence = brilliantCount - last['BRILLIANT'];
        const luminousDiffrence = luminousCount - last['LUMINOUS'];
        console.log(`There is ${brilliantDiffrence} new brilliants and ${luminousDiffrence} new luminous jewels on the leaderboards since ${last['DATE']}`);
        if (brilliantDiffrence > 0) {
            const chanceDiffrence = parseInt((luminousDiffrence + brilliantDiffrence) / brilliantDiffrence);
            console.log(`New chance to craft a brilliant is 1 in ${chanceDiffrence}`);
        }
    }

    function getReactInstance() {
        return Object.values(document.querySelector('.app'))[0].return.dependencies.firstContext.context._currentValue;
    }
})();