// ==UserScript==
// @name         Jewel Prices
// @version      0.1.0
// @description  Gets bazaar prices of jewels
// @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
// @support      https://www.buymeacoffee.com/gasper
// ==/UserScript==



(async function () {

    console.log('Jewel Prices Script by Gašper added');

    const T3_COLORED = ["ANDALUSITE", "AMBER", "AQUAMARINE", "AZURITE", "BLOODSTONE", "CATSEYE", "CHRYSOCOLLA", "EMERALD", "GARNET", "JADE", "MALACHITE", "OBSIDIAN", "OPAL", "ORANGE", "PREHNITE", "PERIDOT", "PURPLE", "PYRITE", "RUBY", "SERPENTINE", "SLATE", "SODALITE", "SPINEL", "SUNSTONE", "TIGEREYE", "TOPAZ", "TURQUOISE", "TITANITE", "TANZANITE", "ZIRCON"];

    const QUALITY = "LUMINOUS";
    const MAX_FETCH_ERRORS = 5;

    const react = getReactInstance();

    let minimums = [];
    let error_count = 0;

    for (let i = 0; i < T3_COLORED.length; i++) {
        if (i % 5 == 0) console.log(`Getting jewel prices ${i + 1} of ${T3_COLORED.length}`);
        const colorName = T3_COLORED[i];
        const { data, meta } = await react.api.fetchJewelOffers({ colorName: colorName, tier: 3, qualityLevel: QUALITY }) || { meta: { error: true } };
        if (meta?.error && error_count < MAX_FETCH_ERRORS) {
            console.log(`Failed to get ${colorName} prices`);
            error_count++;
            i--;
            await sleep(1000 + error_count * 2000);
            continue;
        }
        if (data.length == 0) {
            console.log(`No ${colorName} ${QUALITY} jewels on the market`);
            continue;
        }
        minimums.push({ colorName: colorName, price: parseFloat(data[0].full_price), seller: data[0].user.username });
        await sleep(500 + i%5 == 0 ? 1000 : 0);
    }

    console.table(minimums);

    function sleep(ms) {
        if (ms > 2000) console.log(`Sleeping for ${ms}ms`);
        return new Promise(resolve => setTimeout(resolve, ms));
    };


    function getReactInstance() {
        return Object.values(document.querySelector('.app'))[0].return.dependencies.firstContext.context._currentValue;
    }

    console.log('Jewel Prices Script by Gašper finished');
})();