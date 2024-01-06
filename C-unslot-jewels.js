// ==UserScript==
// @name         Unslot properties
// @version      0.1.1
// @description  Unslot all the jewels from your properties
// @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
// @support      https://www.buymeacoffee.com/gasper
// ==/UserScript==

console.log('Unslot properties Script by Gašper added');


(async function () {

    'use strict';

    const ARE_YOU_SURE = false; // set to true if you want to unslot all your jewels

    if (!ARE_YOU_SURE) {
        console.log('Are you sure you want to unslot all your jewels, this cannot be undone and you will lose all the time you spent slotting them?');
        console.log('If you are sure, set the "ARE_YOU_SURE" variable to true');
        return;
    }

    const PER_PAGE = 1000;

    let jewelIds = [];
    let page = 1;
    let pageCount = 1;

    let react = getReactInstance();

    const MAX_MENTARS_ERROR_COUNT = 5;
    const MAX_UNSLOT_ERROR_COUNT = 50;
    let error_count = 0;

    do {
        const { data, meta } = await grabPage(page);

        if (meta.error) {
            if (error_count > MAX_MENTARS_ERROR_COUNT) {
                console.log(`Page ${page} / ${pageCount} encountered an error - stopping`);
                break;
            }
            console.log(`Page ${page} / ${pageCount} encountered an error - retrying`);
            await sleep(5000 + error_count * 2000);
            error_count++;
            continue;
        }

        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            element.attributes.jewels.data.forEach(e => {
                jewelIds.push(e.id);
            });
        }

        pageCount = Math.ceil(meta.count / PER_PAGE);
        console.log(`Got page ${page} of ${pageCount}`);
        page++;
        await sleep(1000);

    } while (pageCount >= page);

    console.log(`Total jewels slotted : ${jewelIds.length}`);
    console.log('This will take about ' + parseInt(jewelIds.length / 60) + ' minutes to complete')

    error_count = 0;

    for (let i = 0; i < jewelIds.length; i++) {
        const element = jewelIds[i];
        let { info, meta } = await unslotJewel(element);
        if (meta?.error) {
            if (error_count > MAX_UNSLOT_ERROR_COUNT) {
                console.log(`Error unslotting - stopping`);
                break;
            }
            console.log(`Error unslotting ${i} / ${jewelIds.length} - retrying`);
            await sleep(5000 + error_count * 2000);
            error_count++;
            i--;
            continue;
        }
        if (i % 10 == 0) {
            console.log('Unslotted ' + i + ' / ' + jewelIds.length);
            await sleep(2500);
        } else {
            await sleep(500);
        }
    }

    console.log('Finished unslotting all jewels');

    async function grabPage(page) {
        let res = await react.api.getMyMentars({ page: page, perPage: PER_PAGE, sortBy: 'tiles_count', sortDir: 'desc' });
        return res || { data: [], meta: { error: true } };
    };

    function sleep(ms) {
        if (ms > 2000) console.log(`Sleeping for ${ms}ms`);
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    async function unslotJewel(el) {
        if (!ARE_YOU_SURE) return console.log('Not unslotting, because you have not set the "ARE_YOU_SURE" variable to true');
        let info = await react.api.updateJewel({ id: el, slotted_into_landfield_id: null });
        return info || { meta: { error: true } };
    }

    function getReactInstance() {
        return Object.values(document.querySelector('.app'))[0].return.dependencies.firstContext.context._currentValue;
    };

})();
