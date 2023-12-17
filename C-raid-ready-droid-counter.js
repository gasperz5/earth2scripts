// ==UserScript==
// @name         Raid ready droid counter
// @version      0.2.1
// @description  Calculates the number of raid ready cydroids you can support on your properties
// @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
// @support      https://www.buymeacoffee.com/gasper
// ==/UserScript==

console.log('Raid ready cydroid counter Script by Gašper added');


(async function () {

    let PER_PAGE = 1000;

    let PROFILE_ID = null; // Set this to a custom profile id if you want to check for a different profile
    if (PROFILE_ID == null) {
        try { PROFILE_ID = auth0user.id } catch (error) {
            console.log('You need to be logged in to use this script');
            return;
        }
    }
    let react = getReactInstance();
    let properties = await getAllProperties();

    const file = await getCydroidCount(properties);
    createDownloadFile(file, 'raid-ready-cydroids');

    async function getAllProperties() {
        let page = 1;
        let pageCount = 1;

        let properties = [];
        const MAX_ERROR_COUNT = 5;
        let error_count = 0;
        do {

            let { data, meta } = await getPage(page);

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
            await sleep(1000);
            properties.push(...data);
            pageCount = Math.ceil(meta.count / PER_PAGE);
            console.log(`Page ${page} / ${pageCount} done`);
            page++;
        }

        while (page <= pageCount);
        return properties;
    }

    async function getCydroidCount(properties) {
        let count = 0;
        let data = 'Cyroid Count, Tile Count, Description, Link\r\n';
        for (let i = 0; i < properties.length; i++) {
            const element = properties[i];
            const tileCount = element.attributes.tileCount;
            const cydroidCount = maxCydroidPerProperty(tileCount);
            count += cydroidCount;
            data += `${cydroidCount},${tileCount},${element.attributes.description.split(',').join('')},=HYPERLINK("https://app.earth2.io/#propertyInfo/${element.id}")\r\n`;
            //console.log(`${cydroidCount} raid ready cydroids are supported on the property ${element.attributes.description} with ${tileCount} tiles: https://app.earth2.io/#propertyInfo/${element.id}`);
        }
        console.log('Properties with less that 4 tiles skipped as they support 0 raid ready cydroids');
        console.log(`In total you can support ${count} raid ready cydroids`);
        console.log('This may change over time as E2 plans evolve');
        return `,Properties with less that 4 tiles skipped as they support 0 raid ready cydroids\r\n,In total you can support ${count} raid ready cydroids\r\n,This may change over time as E2 plans evolve\r\n\r\n` + data;
    }

    async function getPage(page) {
        let res = await react.api.getUserLandfields({ page: page, perPage: PER_PAGE, userId: PROFILE_ID, sort: '-size' });
        return res || { data: [], meta: { error: true } };
    }

    function maxCydroidPerProperty(tiles) {
        return tiles >= 4 ? tiles >= 10 ? tiles >= 30 ? tiles >= 60 ? tiles >= 100 ? tiles >= 200 ? tiles >= 325 ? tiles >= 475 ? tiles >= 650 ? tiles >= 750 ? 10 : 9 : 8 : 7 : 6 : 5 : 4 : 3 : 2 : 1 : 0;
    }

    function sleep(ms) {
        if (ms > 2000) console.log(`Sleeping for ${ms}ms`);
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function createDownloadFile(content, prefix) {
        let link = document.createElement('a');
        link.download = `${prefix}.csv`;
        let blob = new File(["\uFEFF" + content], { type: 'text/csv;charset=utf-8' });
        let file = new File([blob], link.download);
        link.href = window.URL.createObjectURL(file);
        if (confirm('Download the file?')) {
            link.click()
            console.log(`Downloaded file ${prefix}.csv`);
        } else {
            console.log(`File ${prefix}.csv not downloaded`);
        }
    };

    function getReactInstance() {
        return Object.values(document.querySelector('.app'))[0].return.dependencies.firstContext.context._currentValue;
    };
})();
