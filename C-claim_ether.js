// ==UserScript==
// @name         Claim Ether
// @version      0.1.0
// @description  Claim Ether the old way
// @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
// @support      https://www.buymeacoffee.com/gasper
// ==/UserScript==

(async function () {
    'use strict';
    const URL = "https://app.earth2.io/api/v2/my/mentars/claim_ether/";

    let csrftoken = document.querySelector('[name="csrfmiddlewaretoken"]').value;

    let properties = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', "x-csrftoken": csrftoken },
        body: JSON.stringify({})
    }).then(data => {
        console.log(data);
    })

})();
