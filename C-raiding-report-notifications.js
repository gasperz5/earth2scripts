// ==UserScript==
// @name         Raiding report from notificatios
// @version      0.1.2
// @description  Checks failed and successful raids and puts them in a file
// @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
// @support      https://www.buymeacoffee.com/gasper
// ==/UserScript==


(async () => {

    let react = getReactInstance();

    const PLAIN = false; // change to true if your spreadsheet doesn't format correctly

    let properties = {};


    let notifications = (await react.api.getMyMessages({limit:9999,message_class:'NOTIFICATION'})).results;
    for (let index = 0; index < notifications.length; index++) {

        const element = notifications[index];
        if (element.event_type == "DROID_RAID_SUCCESSFUL") {
            if (!properties[element.data.homeLandfield.id]) {
                properties[element.data.homeLandfield.id] = {};
            }
            if (!properties[element.data.homeLandfield.id][element.data.victim.id]) {
                properties[element.data.homeLandfield.id][element.data.victim.id] = [];
            }
            properties[element.data.homeLandfield.id][element.data.victim.id].push(element);
        }
        if (element.event_type == "DROID_RAID_FAILED") {
            if (!properties[element.data.homeLandfield.id]) {
                properties[element.data.homeLandfield.id] = {};
            }
            if (!properties[element.data.homeLandfield.id][element.data.victim.id]) {
                properties[element.data.homeLandfield.id][element.data.victim.id] = [];
            }
            properties[element.data.homeLandfield.id][element.data.victim.id].push(element);
        }
    }

    let csv = 'Home property,Home link/Victim name,Victim profile/Event type,Ether Amount,Cydroids,Datetime,Property,Property Link\n'
    let unsorted = Object.entries(properties);

    let sorted = unsorted.sort((b, a) => Object.values(a[1]).reduce((e, f) => e + f.reduce((c, d) => c + d.data?.etherAmount || 0, 0), 0) - Object.values(b[1]).reduce((e, f) => e + f.reduce((c, d) => c + d.data?.etherAmount || 0, 0), 0))

    sorted.forEach(([homeId, victims]) => {

        let victimArray = Object.entries(victims);

        let homeDescription = victimArray[0][1][0].data.homeLandfield.description.split(',').join('').slice(0, 30);
        let homeLink = makeItHyperlink(makePropertyLink(homeId), 'Property');
        let totalHome = victimArray.reduce((a, b) => a + b[1].reduce((c, d) => c + d.data?.etherAmount || 0, 0), 0).toFixed(2);

        csv += `\n${homeDescription},${homeLink},,${totalHome}\n`

        victimArray.forEach(([victimId, raids]) => {

            let victimName = raids[0].data.victim.username.split(',').join('').slice(0, 30);
            let victimProfile = makeItHyperlink(makeProfileLink(victimId), 'Profile');
            let victimSum = raids.reduce((c, d) => c + d.data?.etherAmount || 0, 0);

            csv += `,${victimName},${victimProfile},${victimSum}\n`

            for (let index = 0; index < raids.length; index++) {
                const element = raids[index];
                let type = element.event_type == "DROID_RAID_SUCCESSFUL" ? 'Success' : 'Fail';
                let ether = element.data?.etherAmount || 0;
                let cydroids = element.data.droidsCount;
                let datetime = element.created.slice(0, 16);
                let enemyDescription = element.data.enemyLandfield.description.split(',').join('').slice(0, 30);
                let enemyLink = makeItHyperlink(makeMapLink(element.data.enemyLandfield.id), 'Map Link');

                csv += `,,${type},${ether},${cydroids},${datetime},${enemyDescription},${enemyLink}\n`
            }
        });
    });

    createDownloadFile(csv, 'raid-notifications');

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

    function makePropertyLink(id) {
        return 'https://app.earth2.io/#propertyInfo/' + id;
    }
    function makeMapLink(id) {
        return 'https://app.earth2.io/#thegrid/' + id;
    }
    function makeProfileLink(id) {
        return 'https://app.earth2.io/#profile/' + id;
    }

    function makeItHyperlink(link, placeholder) {
        if (PLAIN) return link;
        return '"=HYPERLINK("' + link + '"\;"' + placeholder + '")"'
    }
})();