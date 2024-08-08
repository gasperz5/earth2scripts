// ==UserScript==
// @name         Remove jewels from bazaar
// @version      0.1.1
// @description  Remove jewels from bazaar you can set the color and quality level if you want to remove only specific jewels
// @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
// @support      https://www.buymeacoffee.com/gasper
// ==/UserScript==

(async function () {
    'use strict';
    console.log('Starting removeOffer.js');
    let react = getReactInstance();
    let error_count = 0;
    let data = await react.api.fetchMyOffers({ page: 1 }) || { pagesCount: 1 };
    await sleep(1000);
    let pages = data.pagesCount;
    for (let index = pages; index > 0; index--) {
        let data = await react.api.fetchMyOffers({ page: index }) || { error: true };
        if (data?.error) {
            error_count++;
            await sleep(1000);
            if (error_count > 5) {
                console.log('Too many errors, stopping');
                break;
            }
            continue;
        }
        for (let index2 = 0; index2 < data.data.length; index2++) {
            const element = data.data[index2];
            if (element.jewel.color_name == "TOPAZ" && element.jewel.quality_level == "CRACKED" && element.jewel.tier == 3 && element.price > 0.07) { } // Add your own conditions here and move the line below inside the if statement {}
            await removeOffer(element);

        }
        pages = data.pagesCount;
        console.log('Page ' + index + ' of ' + pages);
        await sleep(100 + index % 10 ? 250 : 0);
    }
    console.log('Done removeOffer.js');

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function removeOffer(element) {
        console.log('Removing', element.jewel.color_name);
        await react.api.removeMyOffer({ offerId: element.id });
        await sleep(300 + Math.random() * 200);
    }


    async function updateOffer(element, price) {
        console.log('Update', element.jewel.color_name, price);
        await react.api.updateMyOffer({ offerId: element.id, price: price });
        await sleep(300 + Math.random() * 200);
    }


    function getReactInstance() {
        return Object.values(document.querySelector('.app'))[0].return.dependencies.firstContext.context._currentValue;
    }

})();