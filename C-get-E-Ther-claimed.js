// ==UserScript==
// @name         Get E-Ther claimed
// @version      0.1.2
// @description  Get E-Ther claim transactions for E2 and export them to CSV file
// @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
// @support      https://www.buymeacoffee.com/gasper
// ==/UserScript==


(async function () {
    'use strict';

    await sleep(1);
    console.log('Get E-Ther claimed script by Gašper added - please wait for the script to finish and don\'t claim E-Ther while the script is running');

    try {
        validateUserLogin();
    } catch (error) {
        console.error(error.message);
        return;
    }

    const HOURS_FOR_TRANSACTIONS = 10;
    const ITEMS = 100;
    const TICKER = 'ETHR';
    const TYPE = 'GENERATED_RESOURCE_CLAIM';

    const react = getReactInstance();

    let includedProps = {};
    let transactions = await getTransactionsForDays(HOURS_FOR_TRANSACTIONS);

    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('includedProps', JSON.stringify(includedProps));

    /*
    let transactions = JSON.parse(localStorage.getItem('transactions'));
    includedProps = JSON.parse(localStorage.getItem('includedProps'));
    
    console.log(transactions, includedProps);
    */

    const { t1, t2, t3 } = getTiers(transactions, includedProps);

    logByProperty(t3, 3);
    donwloadCSV(t1, t2, t3);

    console.log('Script finished');

    function validateUserLogin() {
        if (typeof auth0user === 'undefined' || !auth0user) {
            throw new Error('Please login first to use this script');
        }
    }

    function getReactInstance() {
        return Object.values(document.querySelector('.app'))[0].return.dependencies.firstContext.context._currentValue;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function getTransactionPage(page) {
        let res = await react.api.getTransactions({
            items: ITEMS,
            ticker: TICKER,
            page: page,
            type: TYPE
        });
        return res;
    }

    async function getTransactionsForDays(hours) {
        console.log(`Getting transactions for the last ${hours} hours`);

        const pageSize = 100;
        let page = 1;
        let pageCount = 1;
        let transactions = [];
        let end_date = new Date();
        end_date.setDate(end_date.getDate() - hours / 24);

        while (page <= pageCount) {

            const { data, included, meta } = await getTransactionPage(page);

            if (transactions.length === 0) {
                pageCount = Math.ceil(meta.totalCount / pageSize);
            }

            included.forEach(el => {
                includedProps[el.id] = el.attributes;
            });

            if (data.length > 0 && new Date(data[data.length - 1].attributes.created) < end_date) {
                let filtered = data.filter(el => new Date(el.attributes.created) > end_date);
                transactions = [...transactions, ...filtered];
                console.log(`Page ${page} / ${pageCount} retrieved - stopping because of date`);
                break;
            }

            transactions = [...transactions, ...data];
            console.log(`Page ${page} / ${pageCount} retrieved`);
            await sleep(1000 + (page % 10 === 0 ? 2000 : 0));
            page++;
        }

        return transactions;
    }

    function getTiers(transactions, includedProps) {

        let landfields = {
            1: {},
            2: {},
            3: {}
        };

        transactions.forEach(el => {
            const landfieldId = el.relationships.linkedObject.data.id;
            let landfield = includedProps[landfieldId];
            const tier = landfield.landfieldTier;
            if (landfields[tier][landfieldId]) {
                landfields[tier][landfieldId].amount += parseFloat(el.attributes.amount);
            } else {
                landfields[tier][landfieldId] = {
                    amount: parseFloat(el.attributes.amount),
                    landfield: landfield,
                    id: landfieldId
                };
            }
        });

        logTotalByTier(Object.values(landfields[1]), 1);
        logTotalByTier(Object.values(landfields[2]), 2);
        logTotalByTier(Object.values(landfields[3]), 3);

        return { t1: Object.values(landfields[1]), t2: Object.values(landfields[2]), t3: Object.values(landfields[3]) };
    }

    function logByProperty(landfields, tier) {
        console.log('E-ther from each landfield for tier', tier);
        Object.values(landfields).forEach(el => {
            console.log(`E-ther from landfield ${el.landfield.description}: ${el.amount.toFixed(2)}, link: https://app.earth2.io/#propertyInfo/${el.id}`);
        });
    }

    function logTotalByTier(landfields, tier) {
        let totalAmount = landfields.reduce((a, b) => a + parseFloat(b.amount), 0);
        let totalTileCount = landfields.reduce((a, b) => a + parseInt(b.landfield.tileCount), 0);
        console.log(`Total E-ther from tier ${tier}: ${totalAmount.toFixed(2)} for ${totalTileCount} tiles, average: ${(totalAmount / totalTileCount).toFixed(2)} per tile`);
    }

    function donwloadCSV(t1, t2, t3) {
        if (confirm('Do you want to download the CSV file with the transactions?')) {
            let csv = 'Location,Tier,Tile Count,Ammount,Link\n';
            t1.forEach(el => {
                csv += `${el.landfield.location.split(',').join('')},1,${el.landfield.tileCount},${el.amount.toFixed(2)},=HYPERLINK("https://app.earth2.io/#propertyInfo/${el.id}")\n`;
            });
            t2.forEach(el => {
                csv += `${el.landfield.location.split(',').join('')},2,${el.landfield.tileCount},${el.amount.toFixed(2)},=HYPERLINK("https://app.earth2.io/#propertyInfo/${el.id}")\n`;
            });
            t3.forEach(el => {
                csv += `${el.landfield.location.split(',').join('')},3,${el.landfield.tileCount},${el.amount.toFixed(2)},=HYPERLINK("https://app.earth2.io/#propertyInfo/${el.id}")\n`;
            });
            createDownloadFile(csv, 'E-Ther-claimed');
        }
    }

    async function createDownloadFile(content, prefix) {
        let link = document.createElement('a');
        link.download = `${prefix}.csv`;
        let blob = new File(["\uFEFF" + content], { type: 'text/csv;charset=utf-8' });
        let file = new File([blob], link.download);
        link.href = window.URL.createObjectURL(file);
        link.click()
        console.log(`Downloaded file ${prefix}.csv`);
    };
})();