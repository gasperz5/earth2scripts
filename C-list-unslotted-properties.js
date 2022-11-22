// ==UserScript==
// @name         List unslotted properties
// @version      0.3.2
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
                for (let i = 0; i < data.results.length; i++) {
                    const element = data.results[i];


                    let efficency = 1;
                    element.slotted_jewel_set.forEach(e => {
                        efficency *= e.effect_strength_coefficient;
                    });
                    properties.push({
                        id: element.landfield_id,
                        tiles: element.tiles_count,
                        description: element.description,
                        slots_count: element.slots_count,
                        empty_slots_count: element.slots_count - element.slotted_jewel_set.length,
                        efficency: efficency,
                        tier: element.landfield_tier,
                    });
                }
                count = data.count;
            })
            .catch(err => {
                console.log(err);
                console.log('error on page ' + page);
                console.log('canceling');
                return;
            });
        console.log(`Got page ${page} of ${Math.floor(count / 100)}`);
        page++;
        await sleep(1000);

    } while (count > page * 100);

    let unefficient = 0;
    let unslottedProps = 0;
    let data = 'Description,Tiles,Total Slots,Empty Slots,Efficency,Link\r\n';

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
        data += `${element.description.split(',').join('')},${element.tiles},${element.slots_count},${element.empty_slots_count},${element.efficency},"=HYPERLINK("https://app.earth2.io/#resources/storage/jewels/slotting/${element.id}")"\r\n`;
    }

    const metadata = `For properties with size ${T1_MIN_PROPERTY_SIZE}+ or more for T1 and ${T2_MIN_PROPERTY_SIZE}+ for T2\r\nThere is ${unslottedProps} unslotted properties and ${unefficient} properties with clashing jewel sloting\r\nThere is ${emptyJewelSlots} empty jewel slots out of ${totalJewelSlots} total jewel slots\r\n`;
    console.log(metadata);
    await createDownloadFile(metadata + data, 'slottings');

    async function grabPage(page) {
        const promise = new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `https://app.earth2.io/api/v2/my/mentars/?ordering=-tiles_count,id&search=&limit=100&offset=${(page - 1) * 100}`);
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
