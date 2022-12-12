// ==UserScript==
// @name         Raid ready droid counter
// @version      0.1.2
// @description  Calculates the number of raid ready droids you can support
// @author       GasperZ5 -- Gašper#9055 -- 41NFAM269W
// @support      https://www.buymeacoffee.com/gasper
// ==/UserScript==

console.log('Raid ready droid counter Script by Gašper added');


(async function () {

    let id;
    try { id = auth0user.id } catch (error) {
        console.log('You need to be logged in to use this script');
        return;
    }

    let properties = [];
    let pageCount = Infinity;
    let page = 1;
    let bitEnough = true;

    do {
        console.log(`Getting page ${page}`);
        await grabPage(id, page)
            .then(responseData => {
                const data = JSON.parse(responseData);
                for (let i = 0; i < data.data.length; i++) {
                    const element = data.data[i];
                    if (element.attributes.tileCount < 4) {
                        bitEnough = false;
                        break;
                    }
                    properties.push(element);
                }
                pageCount = data.meta.count;
            })
            .catch(err => {
                console.log(err);
                console.log('error on page ' + page);
            });
        page++;
        await sleep(1000);

    } while (pageCount > page * 60 && bitEnough);

    const file = await getDroidCount(properties);
    createDownloadFile(file, 'raid-ready-droids');


    async function grabPage(id, page) {
        const promise = new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `https://r.earth2.io/landfields?items=60&page=${page}&search=&sort=-size&userId=${id}`);
            xhr.setRequestHeader('accept', 'application/json, text/plain, */*');
            xhr.setRequestHeader('x-csrftoken', document.querySelector('[name="csrfmiddlewaretoken"]').value);
            xhr.withCredentials = true;
            xhr.onload = () => {
                if (xhr.status >= 400) {
                    reject(xhr.response);
                } else {
                    resolve(xhr.response);
                }
            };
            xhr.onerror = () => {
                reject('Something went wrong!');
            };
            xhr.send();
        });
        return promise;
    };

    async function getDroidCount(properties) {
        let count = 0;
        let data = 'Droid Count, Tile Count, Description, Link\r\n';
        for (let i = 0; i < properties.length; i++) {
            const element = properties[i];
            const tileCount = element.attributes.tileCount;
            const droidCount = await maxDroidPerProperty(tileCount);
            count += droidCount;
            data += `${droidCount},${tileCount},${element.attributes.description.split(',').join('')},"=HYPERLINK("https://app.earth2.io/#propertyInfo/${element.id}")"\r\n`;
            // console.log(`${droidCount} raid ready droids are supported on the property ${element.attributes.description} with ${tileCount} tiles: https://app.earth2.io/#propertyInfo/${element.id}`);
        }
        console.log('Properties with less that 4 tiles skipped as they support 0 raid ready droids');
        console.log(`In total you can support ${count} raid ready droids`);
        console.log('This may change over time as E2 plans evolve');
        return `,Properties with less that 4 tiles skipped as they support 0 raid ready droids\r\n,In total you can support ${count} raid ready droids\r\n,This may change over time as E2 plans evolve\r\n\r\n` + data;
    }

    async function maxDroidPerProperty(tiles) {
        return tiles >= 4 ? tiles >= 10 ? tiles >= 30 ? tiles >= 60 ? tiles >= 100 ? tiles >= 200 ? tiles >= 325 ? tiles >= 475 ? tiles >= 650 ? tiles >= 750 ? 10 : 9 : 8 : 7 : 6 : 5 : 4 : 3 : 2 : 1 : 0;
    }

    async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

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
})();
