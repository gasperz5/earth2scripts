// ==UserScript==
// @name         Skin Inventory Exporter
// @version      0.1.0
// @description  Downloads a file containing all your skins in the inventory
// @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
// @support      https://www.buymeacoffee.com/gasper
// ==/UserScript==

(async function () {
    'use strict';
    let react = getReactInstance();

    console.log('Skin Inventory Exporter Script by Gašper added');

    let page = 1;
    let pages = 1;

    let errorCount = 0;
    let maxErrorCount = 5;

    let data = [];

    while (page <= pages) {
        let res = await react.api.getMyAvatarSkins({ page: page }) || { data: [], meta: { error: true } };
        if (res.meta?.error) {
            console.log('Error loading page ' + page + ' of ' + pages);
            errorCount++;
            if (errorCount == maxErrorCount) {
                console.log('Max error count reached, stopping');
                break;
            }
            await sleep(1000 * errorCount);
        }
        else {
            console.log('Page ' + page + ' of ' + pages + ' loaded');
            errorCount = 0;
            data = data.concat(res.data);
            pages = res.meta.pages;
            page++;
        }
        await sleep(1000);
    }

    let csv = 'AvatarId,Name,Quantity,Image,Description,Video\r\n';

    data.reverse();

    let total = 0;
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        csv += `${element.attributes.avatarId},${element.attributes.name.split(',').join('')},${element.attributes.quantity},${element.attributes.image},${element.attributes.description.split(',').join('')},${element.attributes.url}\r\n`;
        total += element.attributes.quantity;
    }
    console.log('Total skins in the inventory: ' + total);

    await createDownloadFile(csv, 'skins-inventory');

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

    console.table(data);

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function getReactInstance() {
        return Object.values(document.querySelector('.app'))[0].return.dependencies.firstContext.context._currentValue;
    };

})();