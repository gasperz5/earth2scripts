// ==UserScript==
// @name         Get skin gift codes
// @version      0.1.1
// @description  Get skin gift codes from the inbox
// @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
// @support      https://www.buymeacoffee.com/gasper
// ==/UserScript==

(async function () {

    console.log('Get skin gift codes script by Gašper added');
    let react = getReactInstance();

    const LIMIT = 100;
    let visible = [];
    let archived = [];

    const response1 = (await react.api.getMyMessages({limit:LIMIT,message_class:'MAIL',offset:0})) || {error:true};

    if(response1?.error){
        console('Something went wrong, are you logged in?')
        return;
    }

    visible = response1.results;
    let count = response1.count;
    let pages = Math.ceil(count/LIMIT);

    console.log(`Found ${response1.count} visible messages, ${pages} `+ (pages==1 ? 'page' : `pages, fetching...`));

    for (let i = 1; i < pages; i++) {
        const response = (await react.api.getMyMessages({limit:LIMIT,message_class:'MAIL',offset:i*LIMIT})) || {error:true};
        if(response?.error){
            console('Something went wrong')
            return;
        }
        visible.push(...response.results);

        if (i % pages/10 === 0) {
            console.log(`Fetched visible page ${i + 1} of ${pages}`);
        }
    
    }

    const response2 = (await react.api.getMyMessages({limit:LIMIT,message_class:'MAIL',offset:0,archived:true})) || {error:true};

    if(response2?.error){
        console('Something went wrong, are you logged in?')
        return;
    }

    archived = response2.results;
    count = response2.count;
    pages = Math.ceil(count/LIMIT);
    
    console.log(`Found ${response2.count} archived messages, ${pages} `+ (pages==1 ? 'page' : `pages, fetching...`));

    for (let i = 1; i < pages; i++) {
        const response = (await react.api.getMyMessages({limit:LIMIT,message_class:'MAIL',offset:i*LIMIT,archived:true})) || {error:true};
        if(response?.error){
            console('Something went wrong')
            return;
        }
        archived.push(...response.results);

        if (i % pages/10 === 0) {
            console.log(`Fetched archived page ${i + 1} of ${pages}`);
        }
    }
    
    let data = [];
    for (let index = 0; index < visible.length; index++) {
        if (visible[index].message_category !== 'AVATAR_SKIN_SHOP') continue;
        data.push({ name: visible[index].data.name, giftCode: visible[index].data.gift_code, price: visible[index].data.price, currency: visible[index].data.is_essence ? '$ESS' : 'E$', expiresAt: visible[index].expires_at, expired: Date.now() > new Date(visible[index].expires_at) ? 'YES' : 'NO' });
    }
    for (let index = 0; index < archived.length; index++) {
        if (archived[index].message_category !== 'AVATAR_SKIN_SHOP') continue;
        data.push({ name: archived[index].data.name, giftCode: archived[index].data.gift_code, price: archived[index].data.price, currency: archived[index].data.is_essence ? '$ESS' : 'E$', expiresAt: archived[index].expires_at, expired: Date.now() > new Date(archived[index].expires_at)? 'YES' : 'NO' });
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