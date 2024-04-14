// ==UserScript==
// @name         Slotted jewels in properties
// @version      0.1.0
// @description  Downloads a file containing all your jewels slotted in properties
// @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
// @support      https://www.buymeacoffee.com/gasper
// ==/UserScript==

console.log('Slotted jewels in properties Script by Gašper added');


(async function () {

    'use strict';
    const PER_PAGE = 250;

    let count = 0;
    let page = 1;
    let pageCount = 1;

    const MAX_ERROR_COUNT = 5;
    let error_count = 0;

    let jewels = [];
        

    let react = getReactInstance();

    do {
        const { data, meta } = await grabPage(page);
        if (meta.error) {
            if (error_count > MAX_ERROR_COUNT) {
                console.log(`Page ${page} / ${pageCount} encountered an error - stopping`);
                break;
            }
            console.log(`Page ${page} / ${pageCount} encountered an error - retrying`);
            await sleep(5000 + error_count * 2000);
            error_count++;
            continue;
        }

        count = meta.count;
        pageCount = Math.ceil(count / PER_PAGE);
        console.log(`Retrieved page ${page} / ${pageCount}`);

        addJewel(data);
        page++;

        await sleep(1000);


    } while (pageCount >= page);

    localStorage.setItem('jewels', JSON.stringify(jewels));
    console.log('Jewels:',jewels);

    jewels = JSON.parse(localStorage.getItem('jewels'));
    let jewel_overview = {};

    for (let i = 0; i < jewels.length; i++) {
        let jewel = jewels[i];
        let jewel_name = jewel.attributes.qualityLevel+' '+jewel.attributes.colorName;
        if (jewel_overview[jewel_name] == null) {
            jewel_overview[jewel_name] = {
                count: 0,
                landfields: [],
            };
        }
        jewel_overview[jewel_name].count++;
        jewel_overview[jewel_name].landfields.push(jewel.attributes.slottedIntoLandfieldId);
    }

    downloadJewelOverview(jewel_overview);



    async function grabPage(page) {
        let res = await react.api.getMyMentars({ page: page, perPage: PER_PAGE, sortBy: 'tiles_count', sortDir: 'desc' });
        return res || { data: [], meta: {error:true} };
    };

    function addJewel(data) {
        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            let jewelsSlotted = element.attributes.jewels.data;
            jewels.push(...jewelsSlotted);
        }
    };

    function downloadJewelOverview(jewel_overview) {
        if(confirm('Do you want to download the jewel overview?')) {
            let content = 'Jewel,Count,LandfieldId\n';
            for (let key in jewel_overview) {
                let jewel = jewel_overview[key];
                content += `\n${key},${jewel.count},${jewel.landfields[0]}\n`;
                for (let i = 1; i < jewel.landfields.length; i++) {
                    const landfield = jewel.landfields[i];
                    content += `,,${landfield}\n`;
                }

            }
            createDownloadFile(content, 'jewel-overview-slotted-in-properties');
        }
    };

    function sleep(ms) {
        if (ms > 2000) console.log(`Sleeping for ${ms}ms`);
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    async function createDownloadFile(content, prefix) {
        let link = document.createElement('a');
        link.download = `${prefix}.csv`;
        let blob = new File(["\uFEFF" + content], { type: 'text/csv;charset=utf-8' });
        let file = new File([blob], link.download);
        link.href = window.URL.createObjectURL(file);
        link.click()
        console.log(`Downloaded file ${prefix}.csv`);
    };

    function getReactInstance() {
        return Object.values(document.querySelector('.app'))[0].return.dependencies.firstContext.context._currentValue;
    };

})();
