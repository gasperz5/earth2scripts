// ==UserScript==
// @name         Get resources claimed
// @version      0.1.6
// @description  Get resources transactions for E2 and export them to CSV file
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
    
    const map = {
        resource_read_and_lost: "Read & Failed to store",
        resource_read_and_stored: "Read & Stored",
        holobuilding_resource_loss: "Holobuilding Resource Loss",
    }

    const HOURS_FOR_TRANSACTIONS = 10;
    const ITEMS = 25;

    const react = getReactInstance();

    let includedProps = {};
    let transactions = await getResourceTransactionsForHours(HOURS_FOR_TRANSACTIONS);

    localStorage.setItem('resourceTransactions', JSON.stringify(transactions));
    localStorage.setItem('resourceIncludedProps', JSON.stringify(includedProps));

    /*
    let transactions = JSON.parse(localStorage.getItem('resourceTransactions'));
    includedProps = JSON.parse(localStorage.getItem('resourceIncludedProps'));
    
    console.log(transactions, includedProps);
    */

    donwloadCSV(transactions, includedProps);

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
        if (ms > 2000) console.log(`Sleeping for ${ms}ms`);
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function getTransactionPage(page) {
        let res = await react.api.getResourceTransactions({
            perPage: ITEMS,
            sort: '-created_at',
            createdAt: 'all_times',
            page: page
        })
        return res || { data: [], included: [], meta: {} };
    }

    async function getResourceTransactionsForHours(hours) {
        console.log(`Getting resource transactions for the last ${hours} hours`);

        let page = 1;
        let pageCount = 1;
        let transactions = [];
        let end_date = new Date();
        let max_error_count = 5;
        let error_count = 0;
        end_date.setHours(end_date.getHours() - hours);

        while (page <= pageCount) {

            const { data, included, meta } = await getTransactionPage(page);

            if (data.length === 0) {
                if (error_count > max_error_count) {
                    console.log(`Page ${page} / ${pageCount} encountered an error - stopping`);
                    break;
                }
                console.log(`Page ${page} / ${pageCount} encountered an error - retrying`);
                await sleep(5000 + error_count * 2000);
                error_count++;
                continue;
            }

            if (transactions.length === 0) {
                pageCount = meta.page.total;
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

    function getValue(balanceChangeType){
        return map[balanceChangeType] || balanceChangeType;
    }

    function donwloadCSV(transactions, includedProps) {
        if (confirm('Do you want to download the CSV file with the transactions?')) {
            let csv = 'Description,Quantity,Activity,Asset,Unit,Link\n';

            transactions.forEach(el => {
                let included = includedProps[el.attributes.landfieldId];
                let description = included ? included.description.split(',').join('') : '';
                let ammount = el.attributes.amount;
                let balanceChangeType = getValue(el.attributes.balanceChangeType);
                let ticker = el.attributes.ticker;
                let unit = el.attributes.unit;
                let link = `https://app.earth2.io/#propertyInfo/${el.attributes.landfieldId}`;
                csv += `${description},${ammount},${balanceChangeType},${ticker},${unit},=HYPERLINK("${link}")\n`;
            });
          
            createDownloadFile(csv, 'ResourceTransactions');
        }
    }

    function createDownloadFile(content, prefix) {
        let link = document.createElement('a');
        link.download = `${prefix}.csv`;
        let blob = new File(["\uFEFF" + content], { type: 'text/csv;charset=utf-8' });
        let file = new File([blob], link.download);
        link.href = window.URL.createObjectURL(file);
        link.click()
        console.log(`Downloaded file ${prefix}.csv`);
    };
})();