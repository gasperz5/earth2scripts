// ==UserScript==
// @name         Civilian stats and export
// @version      0.1.0
// @description  Downloads a file containing all your civilians and their stats
// @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
// @support      https://www.buymeacoffee.com/gasper
// ==/UserScript==

console.log('Civilian stats and export Script by Gašper added');

(async function () {

    let civilianIds = [];
    let civilians = [];
    let landfieldNames = [];
    let pageCount = 1;
    let page = 1;
    console.log('---- ---- ---- ----');

    do {
        console.log(`Getting civilian page ${page} / ${pageCount}`);
        await grabPage(page)
            .then(responseData => {
                data = JSON.parse(responseData);
                for (let i = 0; i < data.data.length; i++) {
                    const element = data.data[i];
                    landfieldNames[element.id] = element.attributes.description.split(',').join('');
                    civilianIds.push(element.meta.civilianIds);
                }
                pageCount = data.meta.pages;
            })
            .catch(err => {
                console.log(err);
                console.log('error on page ' + page);
            });
        page++;
        await sleep(1000);

    } while (pageCount >= page);

    civilianIds = civilianIds.flat();

    console.log('---- ---- ---- ----');


    for (let i = 0; i < civilianIds.length; i += 30) {
        const element = civilianIds.slice(i, i + 30);
        await getcivilians(element)
            .then(responseData => {
                const data = JSON.parse(responseData);
                for (let i = 0; i < data.data.length; i++) {
                    const element = data.data[i];
                    civilians.push(element);
                }
            })
            .catch(err => {
                console.log(err);
                console.log('error on civilian ids' + i);
            });
        await sleep(1000);
        console.log(`Getting civilians ${i + 1} - ${i + 30}`);
    }

    let final = [];
    for (let index = 0; index < civilians.length; index++) {
        const civilian = civilians[index];
        let one = {
            'civilianId': civilian.id,
            'propertyId': civilian.attributes.landfieldId,
            'name': civilian.attributes.name,
            'faction': civilian.attributes.faction,
            'appearance': civilian.attributes.appearance,
            'state': civilian.attributes.state,
            'occupation': civilian.attributes.occupation,
            'gender': civilian.attributes.gender,
            'level': civilian.attributes.level,
            'exp': civilian.attributes.exp,
        };
        final.push(one);
    }

    function sortByFaction(a, b) {
        const order = {
            space_force: 1,
            rebels: 2,
            egyptian_gods: 3,
        };
        let ret = order[a.faction] - order[b.faction];
        if (ret === 0) {
            ret = (a.appearance).localeCompare(b.appearance);
        }
        if (ret === 0) {
            ret = (a.exp) - (b.exp);
        }
        return ret;
    }
    final.sort(sortByFaction);


    let skins = {};
    let levels = {};


    for (let index = 0; index < final.length; index++) {
        const civilian = final[index];

        if (!skins[civilian.faction]) {
            skins[civilian.faction] = {};
        }
        if (!skins[civilian.faction][civilian.appearance]) {
            skins[civilian.faction][civilian.appearance] = 0;
        }
        if (!levels[civilian.level]) {
            levels[civilian.level] = 0;
        }
        skins[civilian.faction][civilian.appearance]++;
        levels[civilian.level]++;
    }

    let stats = [];
    const factions = Object.keys(skins);
    console.log('---- ---- ---- ----');
    console.log(`Civilians Total ${final.length}`);
    for (let index = 0; index < factions.length; index++) {
        const faction = factions[index];
        let factionName = faction;
        const appearancesKeys = Object.keys(skins[faction]);
        console.log('---- ---- ---- ----');
        let total = 0;
        for (let index2 = 0; index2 < appearancesKeys.length; index2++) {
            stats.push(`,${factionName},${appearancesKeys[index2]},${skins[faction][appearancesKeys[index2]]}`);
            console.log(`Civilians ${faction} ${appearancesKeys[index2]} ${skins[faction][appearancesKeys[index2]]}`);
            total += skins[faction][appearancesKeys[index2]];
            factionName = '';
        }
        stats.push(`,,Total,${total}`);
        stats.push('');
    }
    stats.push(`,,Civilians Total,${final.length}`);

    stats.push('');
    console.log('---- ---- ---- ----');
    let levelsKeys = Object.keys(levels);
    for (let index = 0; index < levelsKeys.length; index++) {
        const level = levelsKeys[index];
        console.log(`Civilians Level ${level} : ${levels[level]}`);
        stats.push(`,,Civilians Level ${level},${levels[level]}`);
    }

    if (confirm('Download the file?')) {
        let csv = 'Civilian Id,Property Id,Property Descripton,Name,Faction,Appearance,State,Occupation,Gender,Level,Exp,,Faction,Appearance,Number\r\n'

        for (let index = 0; index < final.length; index++) {
            const civilian = final[index];
            csv += `${civilian.civilianId},${civilian.propertyId},${landfieldNames[civilian.propertyId]},${civilian.name},${civilian.faction},${civilian.appearance},${civilian.state},${civilian.occupation},${civilian.gender},${civilian.level},${civilian.exp},`;

            if (index < stats.length) {
                csv += stats[index];
            }

            csv += '\r\n';
        }
        createDownloadFile(csv, 'civilians');
    };

    async function grabPage(page) {
        const promise = new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `https://r.earth2.io/civilians/landfields?filterBy=has_civilians&page=${page}&q=&sortBy=location&sortDir=desc`);
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

    async function getcivilians(civilianIds) {
        if (civilianIds.length === 0) return null;
        let query = getQuery(civilianIds);
        const promise = new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `https://r.earth2.io/civilians?${query}`);
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

    function getQuery(civilianIds) {
        let query = `ids[]=${civilianIds[0]}`;
        for (let i = 1; i < civilianIds.length; i++) {
            const element = civilianIds[i];
            query += `&ids[]=${element}`;
        }
        return query;
    }

    async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

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