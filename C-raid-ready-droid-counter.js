    // ==UserScript==
    // @name         Raid ready droid counter
    // @version      0.2
    // @description  Calculates the number of raid ready cydroids you can support
    // @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
    // @support      https://www.buymeacoffee.com/gasper
    // ==/UserScript==

    console.log('Raid ready cydroid counter Script by Gašper added');


    (async function () {

        let PROFILE_ID = null; // Set this to a custom profile id if you want to check for a different profile
        if (PROFILE_ID == null) {
            try { PROFILE_ID = auth0user.id } catch (error) {
                console.log('You need to be logged in to use this script');
                return;
            }
        }
        let react = document.getElementsByClassName('app antialiased Layout')[0][Object.keys(document.getElementsByClassName('app antialiased Layout')[0])[0]].return.dependencies.firstContext.context._currentValue;
        let properties = await getAllProperties();

        const file = await getCydroidCount(properties);
        createDownloadFile(file, 'raid-ready-cydroids');

        async function getAllProperties() {
            let perPage = 1000;
            let page = 1;

            let properties = [];
            let maxErrorCount = 10;
            let data = await react.api.getUserLandfields({ page: page, perPage: perPage, userId: PROFILE_ID, sort: '-size'}).catch(e => {
                console.log('Error fetching properties', e);
                page--;
                maxErrorCount--;
                return { data: [], meta: { count: 0 } };
            });

            while (data.data.length > 0) {
                await sleep(1000);
                console.log(`Page ${page} / ${Math.ceil(data.meta.count / perPage)} done`);
                properties = properties.concat(data.data);
                page++;
                data = await react.api.getUserLandfields({ page: page, perPage: perPage, userId: PROFILE_ID, sort: '-size' }).catch(e => {
                    console.log('Error fetching properties', e);
                    maxErrorCount--;
                    page--;
                    return { data: [], meta: { count: 0 } };
                });
                if (maxErrorCount === 0) {
                    console.log('Max error count reached');
                    break;
                }
            }
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
                data += `${cydroidCount},${tileCount},${element.attributes.description.split(',').join('')},"=HYPERLINK("https://app.earth2.io/#propertyInfo/${element.id}")"\r\n`;
                console.log(`${cydroidCount} raid ready cydroids are supported on the property ${element.attributes.description} with ${tileCount} tiles: https://app.earth2.io/#propertyInfo/${element.id}`);
            }
            console.log('Properties with less that 4 tiles skipped as they support 0 raid ready cydroids');
            console.log(`In total you can support ${count} raid ready cydroids (Deep Dive Raiding Video and Stage 2 Website)`);
            console.log('This may change over time as E2 plans evolve');
            return `,Properties with less that 4 tiles skipped as they support 0 raid ready cydroids\r\n,In total you can support ${count} raid ready cydroids (Deep Dive Raiding Video and Stage 2 Website)\r\n,This may change over time as E2 plans evolve\r\n\r\n` + data;
        }

        function maxCydroidPerProperty(tiles) {
            return tiles >= 4 ? tiles >= 10 ? tiles >= 30 ? tiles >= 60 ? tiles >= 100 ? tiles >= 200 ? tiles >= 325 ? tiles >= 475 ? tiles >= 650 ? tiles >= 750 ? 10 : 9 : 8 : 7 : 6 : 5 : 4 : 3 : 2 : 1 : 0;
        }

        function sleep(ms) {
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
    })();
