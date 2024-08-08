// ==UserScript==
// @name         Get skin gift codes
// @version      0.1.0
// @description  Get skin gift codes from the inbox
// @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
// @support      https://www.buymeacoffee.com/gasper
// ==/UserScript==

(async function () {

    console.log('Get skin gift codes script by Gašper added');
    let react = getReactInstance();

    while (react == null) {
        console.log('Waiting for react instance');
        await sleep(1000);
        react = getReactInstance();
    }

    while(react.notificationHubStore.inboxStore.isLoading) {
        console.log('Waiting for inbox to load');
        await sleep(1000);
    }
    await sleep(100);

    const visible = react.notificationHubStore.inboxStore.visibleMails.filter(e => e.messageCategory == 'AVATAR_SKIN_SHOP');
    const archived = react.notificationHubStore.inboxStore.archivedMails.filter(e => e.messageCategory == 'AVATAR_SKIN_SHOP');

    let data = [];
    for (let index = 0; index < visible.length; index++) {
        data.push({ name: visible[index].data.name, giftCode: visible[index].data.giftCode, price: visible[index].data.price, currency: visible[index].data.isEssence ? '$ESS' : 'E$', expiresAt: visible[index].expiresAt, expired: Date.now() > new Date(visible[index].expiresAt) ? 'YES' : 'NO' });
    }
    for (let index = 0; index < archived.length; index++) {
        data.push({ name: archived[index].data.name, giftCode: archived[index].data.giftCode, price: archived[index].data.price, currency: archived[index].data.isEssence ? '$ESS' : 'E$', expiresAt: archived[index].expiresAt, expired: Date.now() > new Date(archived[index].expiresAt)? 'YES' : 'NO' });
    }

    console.table(data);

    function getReactInstance() {
        return Object.values(document.querySelector('.app'))[0].return.dependencies.firstContext.context._currentValue;
    }

    function sleep(ms) {
        if (ms > 2000) console.log(`Sleeping for ${ms}ms`);
        return new Promise(resolve => setTimeout(resolve, ms));
    }

})();