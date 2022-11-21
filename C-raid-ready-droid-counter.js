// ==UserScript==
// @name         Raid ready droid counter
// @version      0.1
// @description  Calculates the number of raid ready droids you can support
// @author       GasperZ5 -- Gašper#9055 -- 41NFAM269W
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
                data = JSON.parse(responseData);
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


    const total = await getDroidCount(properties);
    console.log('Properties with less that 4 tiles skipped as they support 0 raid ready droids');
    console.log(`In total you can support ${total} raid ready droids`);


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
        for (let i = properties.length - 1; i >= 0; i--) {
            const element = properties[i];
            const tileCount = element.attributes.tileCount;
            const droidCount = await maxDroidPerProperty(element.attributes.tileCount);
            count += droidCount;
            console.log(`${droidCount} raid ready droids are supported on the property ${element.attributes.description} with ${tileCount} tiles: https://app.earth2.io/#propertyInfo/${element.id}`);
        }
        return count;
    }

    async function maxDroidPerProperty(tiles) {
        return tiles >= 4 ? tiles >= 10 ? tiles >= 30 ? tiles >= 60 ? tiles >= 100 ? tiles >= 200 ? tiles >= 325 ? tiles >= 475 ? tiles >= 650 ? tiles >= 750 ? 10 : 9 : 8 : 7 : 6 : 5 : 4 : 3 : 2 : 1 : 0;
    }

    async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

})();
