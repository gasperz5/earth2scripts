// ==UserScript==
// @name         Chance for a brilliant
// @version      0.1.2
// @description  Uses leaderboard's data to calculate the chance for a brilliant
// @author       GasperZ5 -- Gašper#9055 -- 41NFAM269W
// @support      https://www.buymeacoffee.com/gasper
// ==/UserScript==

console.log('Chance for a brilliant Script by Gašper added');


(async function () {
    const jewelTypes = ['LUMINOUS', 'BRILLIANT'];
    let results = {};
    for (let i = 0; i < jewelTypes.length; i++) {
        const jewelType = jewelTypes[i];
        const query = await getQuery(jewelType);
        const count = await getCount(query);
        console.log(`${jewelType} - ${count}`);
        results[jewelType] = count;
    }
    const luminousCount = results['LUMINOUS'];
    const brilliantCount = results['BRILLIANT'];
    console.log(`Chance to craft a brilliant is 1 in ${parseInt((luminousCount + brilliantCount) / brilliantCount)}`)

    async function getQuery(jewelType) {
        return `https://r.earth2.io/leaderboards/player_continents?sort_by=hq_jewels_count&jewel_quality=${jewelType}`;
    }

    async function getCount(query) {
        return await fetch(query)
            .then(res => res.json())
            .then(r => {
                let total = 0;
                for (let index = 0; index < r.data.length; index++) {
                    total += parseInt(r.data[index].attributes.value);
                }
                return total;
            })
            .catch(err => {
                console.log(err)
            });
    }
})();