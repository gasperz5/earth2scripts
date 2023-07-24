// ==UserScript==
// @name         List unslotted properties
// @version      0.3.4
// @description  Downloads a file containing all your properties that are not fully slotted or slotted with jewels clashing
// @author       GasperZ5 -- Gašper#9055 -- 41NFAM269W
// @support      https://www.buymeacoffee.com/gasper
// ==/UserScript==

console.log('List unslotted properties Script by Gašper added');


(async function () {

    // Change the following values to your liking
    const T1_MIN_PROPERTY_SIZE = 1;
    const T2_MIN_PROPERTY_SIZE = 1;

    let properties = [];
    let count = 0;
    let page = 1;

    do {
        await grabPage(page)
            .then(responseData => {
                const data = JSON.parse(responseData);
                console.log(data);
                for (let i = 0; i < data.data.length; i++) {
                    const element = data.data[i];


                    let efficency = 1;
                    let brilliants = 0;
                    element.attributes.jewels.data.forEach(e => {
                        if (e.attributes.qualityLevel == 'BRILLIANT') brilliants++;
                        efficency *= e.attributes.effectStrengthCoefficient;
                    });
                    properties.push({
                        id: element.id,
                        tiles: element.attributes.tilesCount,
                        description: element.attributes.description,
                        slots_count: element.attributes.slotsCount,
                        empty_slots_count: element.attributes.slotsCount - element.attributes.jewels.data.length,
                        efficency: efficency,
                        brilliants: brilliants,
                        tier: element.attributes.landfieldTier,
                    });
                }
                count = data.meta.count;
            })
            .catch(err => {
                console.log(err);
                console.log('error on page ' + page);
                console.log('canceling');
                return;
            });
        console.log(`Got page ${page} of ${Math.floor(count / 20)}`);
        page++;
        await sleep(1000);

    } while (count > page * 20);

    let unefficient = 0;
    let unslottedProps = 0;
    let data = 'Description,Tiles,Total Slots,Empty Slots,Efficency,Link,Brilliants\r\n';

    properties.sort((a, b) => {
        if (b.empty_slots_count - a.empty_slots_count != 0) return b.empty_slots_count - a.empty_slots_count;
        return b.efficency - a.efficency;
    });
    properties.sort((a, b) => {
        if (a.empty_slots_count * b.empty_slots_count != 0) return b.tiles - a.tiles;
        return 0;
    });

    let totalJewelSlots = 0;
    let emptyJewelSlots = 0;
    for (let index = 0; index < properties.length; index++) {
        const element = properties[index];
        if (element.tier == 1 && element.tiles < T1_MIN_PROPERTY_SIZE) continue;
        if (element.tier == 2 && element.tiles < T2_MIN_PROPERTY_SIZE) continue;
        if (element.efficency != 1) {
            unefficient++;
            // console.log(`Property ${element.id} has some clasing problems. Fix it at https://app.earth2.io/#resources/storage/jewels/slotting/${element.id}`);
        }

        if (element.empty_slots_count > 0) {
            unslottedProps++;
            emptyJewelSlots += element.empty_slots_count;
            // console.log(`Property ${element.id} has ${element.empty_slots_count} empty slots. Slot it at https://app.earth2.io/#resources/storage/jewels/slotting/${element.id}`);
        }
        totalJewelSlots += element.slots_count;
        data += `${element.description.split(',').join('')},${element.tiles},${element.slots_count},${element.empty_slots_count},${parseFloat(element.efficency).toFixed(2)},"=HYPERLINK("https://app.earth2.io/#resources/storage/jewels/slotting/${element.id}")",${element.brilliants}\r\n`;
        if (element.brilliants > 0) {
            console.log(`Property ${element.id} has ${element.brilliants} brilliants. Check it at https://app.earth2.io/#resources/storage/jewels/slotting/${element.id}`);
        }
    }

    const metadata = `For properties with size ${T1_MIN_PROPERTY_SIZE}+ or more for T1 and ${T2_MIN_PROPERTY_SIZE}+ for T2\r\nThere is ${unslottedProps} unslotted properties and ${unefficient} properties with clashing jewel sloting\r\nThere is ${emptyJewelSlots} empty jewel slots out of ${totalJewelSlots} total jewel slots\r\n`;
    console.log(metadata);
    await createDownloadFile(metadata + data, 'slottings');

    async function grabPage(page) {
        const promise = new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `https://r.earth2.io/mentars/?page=${page}&perPage=20&sortBy=tiles_count&sortDir=desc`);
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

    async function sleep(ms) {
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

})();
