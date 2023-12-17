// ==UserScript==
// @name         Cydroids rarities and export
// @version      0.2.0
// @description  Downloads a file containing all your droids and their rarities
// @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
// @support      https://www.buymeacoffee.com/gasper
// ==/UserScript==

console.log('Cydroid rarities and export Script by Gašper added');

(async function () {

    let droidIds = [];
    let droids = [];
    let landfieldNames = [];
    let pageCount = 1;
    let page = 1;
    let bitEnough = true;

    let react = getReactInstance();

    do {
        console.log(`Getting droid page ${page} / ${pageCount}`);
        let data = await grabPage(page);
        for (let i = 0; i < data?.data?.length; i++) {
            const element = data.data[i];
            if (element.meta.droidIds.length === 0) {
                bitEnough = false;
                break;
            }
            landfieldNames[element.id] = element.attributes.description.split(',').join('');
            droidIds.push(...element.meta.droidIds);
        }
        pageCount = data.meta.pages;
        page++;
        await sleep(1000);

    } while (pageCount > page && bitEnough);

    console.log(`Getting ${droidIds.length} droids`);

    for (let i = 0; i < droidIds.length; i += 100) {
        const element = droidIds.slice(i, i + 100);
        await getDroids(element)
            .then(responseData => {
                const data = JSON.parse(responseData);
                for (let i = 0; i < data.data.length; i++) {
                    const element = data.data[i];
                    droids.push(element);
                }
            })
            .catch(err => {
                console.log(err);
                console.log('error on droid ids' + i);
            });
        await sleep(1000);
        console.log(`Getting droids ${i + 1} - ${i + 100}`);
    }

    let final = [];
    for (let index = 0; index < droids.length; index++) {
        const droid = droids[index];
        let one = {
            'droidId': droid.id,
            'propertyId': droid.attributes.landfieldId,
            'name': droid.attributes.name,
            'rarity': droid.attributes.rarity,
            'appearance': droid.attributes.appearance,
            'built': true,
            'state': droid.attributes.state,
            'storage': droid.attributes.storage,
        };
        if (!one.rarity) {
            one.rarity = getRarityByAppearance(one.appearance);
            one.built = false;
        }
        final.push(one);
    }

    function sortByRarity(a, b) {
        const rarityOrder = {
            common: 1,
            uncommon: 2,
            rare: 3,
            epic: 4,
            legendary: 5
        };
        let ret = rarityOrder[a.rarity] - rarityOrder[b.rarity];
        if (ret === 0) {
            ret = (a.appearance).localeCompare(b.appearance);
        }
        return ret;
    }
    final.sort(sortByRarity);

    let rarities = {
        common: { count: 0, building: 0 },
        uncommon: { count: 0, building: 0 },
        rare: { count: 0, building: 0 },
        epic: { count: 0, building: 0 },
        legendary: { count: 0, building: 0 }
    }

    let building = 0;
    let states = {};
    let etherDispensing = 0;

    for (let index = 0; index < final.length; index++) {
        const droid = final[index];
        rarities[droid.rarity].count++;
        if (!droid.built) {
            rarities[droid.rarity].building++;
            building++;
        }
        if (!states[droid.state]) {
            states[droid.state] = 1;
        }
        else {
            states[droid.state]++;
        }
        if (droid.state === 'dispensing') {
            etherDispensing += droid.storage;
        }
    }
    etherDispensing = etherDispensing.toFixed(2);
    let stats = [];
    const keys = Object.keys(rarities);
    console.log(`Rarity: Total ${final.length} (Building) | % built (% total)`);
    for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        console.log(`${key}: ${rarities[key].count} (${rarities[key].building} building)  | ${((rarities[key].count - rarities[key].building) / (final.length - building) * 100).toFixed(2)} % (${(rarities[key].count / final.length * 100).toFixed(2)}% total)`);
        stats.push(`,,${key},${rarities[key].count},${rarities[key].count - rarities[key].building},${rarities[key].building},${((rarities[key].count - rarities[key].building) / (final.length - building) * 100).toFixed(2)}%,${(rarities[key].count / final.length * 100).toFixed(2)}%`);
    }
    stats.push(`,,Total,${final.length},${final.length - building},${building}`);
    console.log(`Ether Dispensing: ${etherDispensing}`);
    stats.push(`,,Ether Dispensing,${etherDispensing}`);
    console.log('States:');
    for (const key in states) {
        console.log(`${key}: ${states[key]}`);
        stats.push(`,,${key},${states[key]}`);
    }
    if (!stats['depowered']) {
        console.log(`depowered: 0`);
    }

    let csv = 'Droid Id,Property Id,Property Descripton,Name,Rarity,Appearance,Built,State,Storage,,Rarity,All,Built,Being Built,% built,% all\r\n'

    for (let index = 0; index < final.length; index++) {
        const droid = final[index];
        csv += `${droid.droidId},${droid.propertyId},${landfieldNames[droid.propertyId]},${droid.name},${droid.rarity},${droid.appearance},${droid.built},${droid.state},${droid.storage}`;

        if (index < stats.length) {
            csv += stats[index];
        }

        csv += '\r\n';
    }

    createDownloadFile(csv, 'droids');

    async function grabPage(page) {
        return await react.api.getLandfieldsDroids({page:page,sortBy:'tethered',sortDir:'desc'});
    };

    async function getDroids(droidIds) {
        if (droidIds.length === 0) return null;
        let query = getQuery(droidIds);
        const promise = new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `https://r.earth2.io/droids?${query}`);
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

    }

    function getQuery(droidIds) {
        let query = `ids[]=${droidIds[0]}`;
        for (let i = 1; i < droidIds.length; i++) {
            const element = droidIds[i];
            query += `&ids[]=${element}`;
        }
        return query;
    }

    function sleep(ms) {
        if (ms > 2000) console.log(`Sleeping for ${ms}ms`);
        return new Promise(resolve => setTimeout(resolve, ms));
    };

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

    function getRarityByAppearance(appearance) {
        const num = parseInt(appearance.slice(2, 5));
        if (num <= 5) {
            return 'common';
        }
        if (num <= 20 && num != 8 && num != 15 && num != 17 && num != 18) {
            return 'uncommon';
        }
        if (num <= 28 && num != 24 && num != 25) {

            return 'rare';
        }
        if (num <= 33) {
            return 'epic';
        }
        if (num <= 38) {
            return 'legendary';
        }
        return 'undefined';
    }

    function getReactInstance() {
        return Object.values(document.querySelector('.app'))[0].return.dependencies.firstContext.context._currentValue;
    }

})();