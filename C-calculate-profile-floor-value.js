// ==UserScript==
// @name         Calculate current floor value for a profile
// @version      0.1.0
// @description  Downloads a file containing all your properties and their current floor value (based on the cheapest landfield on the market for that country, tier, class) - this script is not 100% accurate and is only meant to give you a rough estimate of your current floor value - it can take a while to run so please be patient
// @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
// @support      https://www.buymeacoffee.com/gasper
// ==/UserScript==
(async function () {
    'use strict';

    await sleep(1);

    console.log('Calculate current floor value script by Gašper added');
    console.log('%cThis script is not 100% accurate and is only meant to give you a rough estimate of your current floor value', 'color: red');

    let react = getReactInstance();

    let PROFILE_ID = null; // Set this to a custom profile id if you want to check for a different profile
    if (PROFILE_ID == null) {
        try { PROFILE_ID = auth0user.id } catch (error) {
            console.log('You need to be logged in to use this script');
            return;
        }
    }

    let properties = await getAllProperties();
    let landfields = new Set();

    for (let index = 0; index < properties.length; index++) {
        const element = properties[index];
        let key = {
            country: element.attributes.country,
            landfieldTier: element.attributes.landfieldTier,
            tileClass: element.attributes.tileClass,
        };
        landfields.add(JSON.stringify(key));
    }

    let landfieldsArray = [];
    for (let item of landfields) {
        landfieldsArray.push(JSON.parse(item));
    }

    let MAX_ERROR_COUNT = 15;
    let error_count = 0;

    for (let index = 0; index < landfieldsArray.length; index++) {
        const element = landfieldsArray[index];

        let query = {
            country: element.country,
            tier: element.landfieldTier,
            sorting: 'price_per_tile',
            items: 1,
        };
        if (query.tier == 1) {
            query.tileClass = element.tileClass;
        }
        const {landfields, meta} = await react.api.fetchLandfields(query) || { landfields: [], meta: { error: true } };


        if (meta?.error) {
            if (error_count > MAX_ERROR_COUNT) {
                console.log(`Price ${index + 1} / ${landfieldsArray.length} encountered an error - stopping`);
                break;
            }
            console.log(`Page ${index + 1} / ${landfieldsArray.length} encountered an error - retrying`);
            await sleep(5000 + error_count * 2000);
            error_count++;
            index--;
            continue;
        }

        if (landfields.length > 0) landfieldsArray[index].price = parseFloat(landfields[0].price / landfields[0].tileCount).toFixed(2);
        await sleep(500 + index % 10 == 0 ? 2500 : 0);
        console.log(`Price ${index + 1} / ${landfieldsArray.length} done`)
    }

    let csv = 'Link,Country,Tier,Class,Price,Location\n';

    let totalValue = 0;
    for (let index = 0; index < properties.length; index++) {
        const element = properties[index];
        let key = {
            country: element.attributes.country,
            landfieldTier: element.attributes.landfieldTier,
            tileClass: element.attributes.tileClass,
        };
        let landfield = landfieldsArray.find(x => x.country == key.country && x.landfieldTier == key.landfieldTier && x.tileClass == key.tileClass);
        if (landfield) {
            if (landfield.price) totalValue += parseFloat(landfield.price * element.attributes.tileCount);
        }
        csv += `"=HYPERLINK("https://app.earth2.io/#propertyInfo/${element.id}")",${element.attributes.country},${element.attributes.landfieldTier},${element.attributes.tileClass},${landfield ? (landfield.price * element.attributes.tileCount) : 0},${element.attributes.location}\n`;
    }

    console.log('%cTotal value of all your properties is: E$' + totalValue.toFixed(2), 'color: green');   

    createDownloadFile(csv, 'current_market_value');

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
        let PER_PAGE = 1000;
        let page = 1;
        let pageCount = 1;

        let properties = [];
        let MAX_ERROR_COUNT = 5;
        let error_count = 0;


        while (page <= pageCount) {
            const { data, meta } = await react.api.getUserLandfields({ page: page, perPage: PER_PAGE, userId: PROFILE_ID }) || { data: [], meta: { error: true } };
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