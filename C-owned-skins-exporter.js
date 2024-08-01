// ==UserScript==
// @name         Export owned skins
// @version      0.1.0
// @description  Downloads a file containing all your skins
// @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
// @support      https://www.buymeacoffee.com/gasper
// ==/UserScript==
(async function () {
    'use strict';

    await sleep(1);

    console.log('Export owned skins script by Gašper added');

    let react = getReactInstance();

    let skins = await getAllSkins();

    let total = skins.reduce((a,b)=>a+b.attributes.quantity,0);

    let csv =  'Total number of skins:,'+ total +'\n\nName,Quantity,Image,Url,Avatar Id,Can Be Resold\n';

    for (let index = 0; index < skins.length; index++) {
        csv += `${skins[index].attributes.name},${skins[index].attributes.quantity},${skins[index].attributes.image},${skins[index].attributes.url},${skins[index].attributes.avatarId},${skins[index].attributes.canBeResold}\n`;
    }

    console.log('Exported skins:', skins.length);
    console.log('Total number of skins:', total);


    createDownloadFile(csv, 'owned-skins');

    async function createDownloadFile(content, prefix) {
        let link = document.createElement('a');
        link.download = `${prefix}.csv`;
        let blob = new File(["\uFEFF" + content], { type: 'text/csv;charset=utf-8' });
        let file = new File([blob], link.download);
        link.href = window.URL.createObjectURL(file);
        if (confirm('Download the file?')) {
            link.click()
            console.log(`Downloaded file ${prefix}.csv`);
        };
    };


    async function getAllSkins() {
        let page = 1;
        let pageCount = 1;

        let skins = [];
        let MAX_ERROR_COUNT = 5;
        let error_count = 0;


        while (page <= pageCount) {
            const { data, meta } = await react.api.getMyAvatarSkins({page:page}) || { data: [], meta: { error: true } };
            if (meta?.error) {
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

            pageCount = meta.pages;
            console.log(`Page ${page} / ${pageCount} done`);
            skins.push(...data);
            page++;
        }
        return skins;
    }

    function sleep(ms) {
        if (ms > 2000) console.log(`Sleeping for ${ms}ms`);
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function getReactInstance() {
        return Object.values(document.querySelector('.app'))[0].return.dependencies.firstContext.context._currentValue;
    };


})();