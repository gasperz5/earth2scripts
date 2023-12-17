    // ==UserScript==
    // @name         Slotted jewels in cydroids
    // @version      0.1.0
    // @description  Finds jewels in cydroids, logs an overview and if wanted downloads a file with all the jewels
    // @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
    // @support      https://www.buymeacoffee.com/gasper
    // ==/UserScript==

    (async function () {
        'use strict';

        console.log('Slotted jewels in cydroids Script by Gašper added');

        
        let empty_cydroids = false;
        let included_jewels = {};
        let jewels = {};
        
        
        let react = getReactInstance();
        let page = 1;
        let pageCount = 1;


        while (page <= pageCount && !empty_cydroids) {
            console.log(`Getting cydroids page ${page} / ${pageCount}`);

            await sleep(1000);
            let { data, meta, included } = await react.api.getDroids({ page: page, sortBy: 'number_of_slotted_jewels', sortDir: 'desc' }).catch(e => {
                console.log('Error fetching cydroids at page '+page, e);
            });

            addIncluded(included);
            pageCount = meta.pages;
            addJewel(data);
            checkEmpty(data);
            page++;
        }

        localStorage.setItem('jewels', JSON.stringify(jewels));
        console.log('Jewels:',jewels);

    

        jewels = JSON.parse(localStorage.getItem('jewels'));
        let jewel_overview = {};

        for (let key in jewels) {
            let jewel = jewels[key];
            let jewel_name = jewel.attributes.qualityLevel+' '+jewel.attributes.colorName;
            if (jewel_overview[jewel_name] == null) {
                jewel_overview[jewel_name] = {
                    count: 0,
                    landfields: [],
                };
            }
            jewel_overview[jewel_name].count++;
            jewel_overview[jewel_name].landfields.push(jewel.landfieldId);
        }
        console.log('Overview:',jewel_overview);
        //console.log([...new Set(jewel_overview['LUMINOUS SERPENTINE'].landfields)])

        downloadJewelOverview(jewel_overview);

        console.log('Script finished');

        function addIncluded(included) {
            for (let i = 0; i < included.length; i++) {
                const element = included[i];
                if (element.type == 'jewel') {
                    included_jewels[element.id] = element.attributes;
                }
            }
        }

        function checkEmpty(data) {
            if (data.length != 0 && data[data.length - 1].relationships.slottedJewels.data.length == 0) empty_cydroids = true;
        }

        function addJewel(data) {
            for (let index = 0; index < data.length; index++) {
                const element = data[index];
                let landfieldId = element.attributes.landfieldId;
                let jewelsSlotted = element.relationships.slottedJewels.data;
                for (let i = 0; i < jewelsSlotted.length; i++) {
                    const jewel = jewelsSlotted[i];
                    jewels[jewel.id] = {
                        landfieldId: landfieldId,
                        attributes: included_jewels[jewel.id],
                    };
                }
            }
        }

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
                createDownloadFile(content, 'jewel-overview');
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

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        function getReactInstance() {
            return Object.values(document.querySelector('.app'))[0].return.dependencies.firstContext.context._currentValue;
        };

    })();