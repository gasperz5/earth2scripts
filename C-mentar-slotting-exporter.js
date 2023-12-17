// ==UserScript==
// @name         Mentar Slotting Exporter
// @version      0.4.0
// @description  Downloads a file containing all your mentars and their slotting efficency and empty slots count (and brilliants count)
// @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
// @support      https://www.buymeacoffee.com/gasper
// ==/UserScript==

console.log('Mentar Slotting Exporter Script by Gašper added');


(async function () {

    const T1_MIN_PROPERTY_SIZE = 1;
    const T2_MIN_PROPERTY_SIZE = 1; // set to 4 if you want to filter out T2 properties with size 1-3

    const PER_PAGE = 100;

    let properties = [];
    let count = 0;
    let page = 1;
    let pageCount = 1;

    const MAX_ERROR_COUNT = 5;
    let error_count = 0;

    let react = getReactInstance();

    do {
        const { data, meta } = await grabPage(page);
        if (data.length === 0) {
            if (error_count > MAX_ERROR_COUNT) {
                console.log(`Page ${page} / ${pageCount} encountered an error - stopping`);
                break;
            }
            console.log(`Page ${page} / ${pageCount} encountered an error - retrying`);
            await sleep(5000 + error_count * 2000);
            error_count++;
            continue;
        }

        for (let i = 0; i < data.length; i++) {
            const element = data[i];
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
        count = meta.count;
        pageCount = Math.ceil(count / PER_PAGE);
        console.log(`Retrieved page ${page} / ${pageCount}`);
        page++;
        await sleep(1000);


    } while (pageCount >= page);

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
        data += `${element.description.split(',').join('')},${element.tiles},${element.slots_count},${element.empty_slots_count},${parseFloat(element.efficency).toFixed(2)},=HYPERLINK("https://app.earth2.io/#resources/storage/jewels/slotting/${element.id}"),${element.brilliants}\r\n`;
        if (element.brilliants > 0) {
            console.log(`Property ${element.id} has ${element.brilliants} brilliants. Check it at https://app.earth2.io/#resources/storage/jewels/slotting/${element.id}`);
        }
    }

    const metadata = `For properties with size ${T1_MIN_PROPERTY_SIZE} or more for T1 and ${T2_MIN_PROPERTY_SIZE} for T2\r\nThere is ${unslottedProps} unslotted properties and ${unefficient} properties with clashing jewel sloting\r\nThere is ${emptyJewelSlots} empty jewel slots out of ${totalJewelSlots} total jewel slots\r\n`;
    console.log(metadata);
    await createDownloadFile(metadata + data, 'slottings');

    async function grabPage(page) {
        let res = await react.api.getMyMentars({ page: page, perPage: PER_PAGE, sortBy: 'tiles_count', sortDir: 'desc' });
        return res || { data: [], meta: {} };
    };

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

    function getReactInstance() {
        return Object.values(document.querySelector('.app'))[0].return.dependencies.firstContext.context._currentValue;
    };

})();
