// ==UserScript==
// @name         Gets all the epls for a profile
// @version      0.1.0
// @description  Downloads a file containing all your properties and their epls - it can take a while to run so please be patient
// @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
// @support      https://www.buymeacoffee.com/gasper
// ==/UserScript==
(async function () {
    'use strict';

    await sleep(1);

    console.log('Get all elps script by Gašper added');

    let react = getReactInstance();

    let PROFILE_ID = null; // Set this to a custom profile id if you want to check for a different profile
    if (PROFILE_ID == null) {
        try { PROFILE_ID = auth0user.id } catch (error) {
            console.log('You need to be logged in to use this script');
            return;
        }
    }

    let properties = await getAllProperties();


    let csv = 'Link,Country,Tier,Class,Epl,Description\n';

    let eplCount = 0;
    for (let index = 0; index < properties.length; index++) {
        const element = properties[index];
        const epl = element.attributes.epl;
        if (epl !== null && epl !== undefined) {
            eplCount++;
            csv += `"=HYPERLINK("https://app.earth2.io/#propertyInfo/${element.id}")",${element.attributes.country},${element.attributes.landfieldTier},${element.attributes.tileClass},${element.attributes.epl},${element.attributes.description.split(',').join('')}\n`;
        }
    }

    console.log(`Found ${eplCount} properties with an epl, out of ${properties.length} properties in total`);  

    createDownloadFile(csv, 'epls');

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


    async function getAllProperties() {
        const PER_PAGE = 1000;
        const SORT = '-size';
        let page = 1;
        let pageCount = 1;

        let properties = [];
        let MAX_ERROR_COUNT = 5;
        let error_count = 0;


        while (page <= pageCount) {
            const { data, meta } = await react.api.getUserLandfields({ page: page, perPage: PER_PAGE, userId: PROFILE_ID, sort:SORT}) || { data: [], meta: { error: true } };
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

            pageCount = Math.ceil(meta.count / PER_PAGE);
            console.log(`Page ${page} / ${pageCount} done`);
            properties.push(...data);
            page++;
        }
        return properties;
    }

    function sleep(ms) {
        if (ms > 2000) console.log(`Sleeping for ${ms}ms`);
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function getReactInstance() {
        return Object.values(document.querySelector('.app'))[0].return.dependencies.firstContext.context._currentValue;
    };


})();