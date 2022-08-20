// 1 run on https://app.earth2.io/#activities
// It will scan the activities page and check if there is a new claim
// If there is a new claim, it will save the claim to local storage

(async function() {
    'use strict';
    let total = 0;
    while (true) { // TODO: remove this loop and trigger on change event
        //console.log("new");
        await checkForClaims();
        await sleep(250);
    }
    //document.querySelector("#root > div > div.content-holder.isolate.z-10 > div > div.md\\:py-10.lg\\:px-7.pb-5.w-full > div > div").addEventListener('change', await checkForClaims()); //non functional

    async function checkForClaims() {
        let len = document.querySelector("#root > div > div.content-holder.isolate.z-10 > div > div.md\\:py-10.lg\\:px-7.pb-5.w-full > div > div").children.length;
        for (let i = 1; i <= len; i++) {
            if (total < len) {
                if (document.querySelector(`#root > div > div.content-holder.isolate.z-10 > div > div.md\\:py-10.lg\\:px-7.pb-5.w-full > div > div > div:nth-child(${i}) > div.text-sm.ActivityItem_text__ptjJ2 > div`).innerText.includes('just submitted a new Claim')) {
                    console.log("found")

                    console.log(document.querySelector(`#root > div > div.content-holder.isolate.z-10 > div > div.md\\:py-10.lg\\:px-7.pb-5.w-full > div > div > div:nth-child(${i}) > div.text-sm.ActivityItem_text__ptjJ2 > div`).textContent);
                    localStorage.setItem('notification', document.querySelector(`#root > div > div.content-holder.isolate.z-10 > div > div.md\\:py-10.lg\\:px-7.pb-5.w-full > div > div > div:nth-child(${i}) > div.text-sm.ActivityItem_text__ptjJ2 > div`).textContent + "" + Math.random());
                }
            } else {
                break;
            }
            total++;
        }
        console.log(total + " " + len);
    }
    async function sleep(duration) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve()
            }, duration)
        })
    }


})();

// 2 run on https://app.earth2.io/
// It will check if there is a new claim in local storage
// If there is a new claim, it will display a toast notification
// Works best if you are just browsing arround the app, not on the claims page
// You can click the notification to go to the claims page

window.addEventListener('storage', function(event) {
    console.log(localStorage.getItem('notification'))
        (M.toast({
            html: `<i class="material-icons">clear</i> <a style = "color : white" href=https://app.earth2.io/#claims/all>New Claim Incoming</a>`,
            classes: `teal accent-2 pulse`,
            displayLength: 15000
        }))
});