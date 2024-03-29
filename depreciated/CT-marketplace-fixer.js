// ==UserScript==
// @name         Extra Marketplace Filters
// @namespace    http://tampermonkey.net/
// @version      0.1.4
// @description  Adds a filter to hide locked countries and frozen properties
// @author       GasperZ5 -- Gasper#9055 -- 41NFAM269W
// @support      https://www.buymeacoffee.com/gasper
// @include      https://*app.earth2.io/
// @icon         https://www.google.com/s2/favicons?domain=earth2.io
// @grant        none
// ==/UserScript==

console.log('Extra Marketplace Filters Script by Gašper added');

(async function () {

    'use strict';
    let fpb, lcb;
    let fpbi, lcbi;
    let froz = []; //['0146ef5e-75d9-4834-9586-ef1cae5e4086', 'fe93cb11-7b07-460d-9e41-1ac3de659740', '91739b0b-936b-4473-9212-c5c4bfce61c3', '6e5c28fb-f48f-4c45-bc53-424ca21223d0', '7b3d7e4c-d65b-4078-bf74-45720df92f3f', 'b87f5c45-e5c5-481b-a55b-4640fbbec8a8', 'a9c8603c-54f9-43ae-a4ac-deb1713d8e58', 'ce77ccf1-2f0b-4265-a9c0-966670e73cfb', '4b89485e-a1dc-433f-8db0-91d0f326d69b', '353b488b-8934-46c3-a8d4-c802823d28f2', '5c4faa8a-4691-40cc-850f-255deba977d0', 'f4b23850-9054-43a2-af95-63cc2708cff3', '1d7f0de8-e9df-43b7-be21-ebd87d4aa278', 'adeddceb-de5e-4f68-8420-0e597143876b', '88f9d4d5-5261-462d-9511-b98a77dd60e7', 'c4c0daeb-7430-4711-b234-d315e7e0d578', '52b12510-1b1e-4ed2-a159-aac9b90ba742', '89c059c6-5424-4e6a-8db3-4883a817fd70', '2d4d066b-480c-4a21-b82c-7537507013c1', 'b2d9e6b8-6c55-4f13-90d6-368f1252b7ae', 'd8389179-1547-48aa-a8e1-13c1ba594125', 'f9993da6-ee64-4fd5-ae82-39fd822fe3ac', 'fbda69a3-3d44-4cb5-bc0b-97f2ccb389af', '1b782a1c-6914-4445-a944-687a7d1109b6', '19459fe8-3642-4300-889e-69dd921279fe', '89decd47-c9b0-424b-ba26-9b1b503b933b', '74977eb6-aa1a-4314-8cc5-3cf0d8b79b7d', '516ad1c1-a6b8-4454-809a-4b86e6268e2d', '342a5a9c-f4da-406b-82b9-e3e5da03f3fd', 'ecb5812a-74e0-46af-b05d-6f96b6b85b08', 'de1325db-0d94-440e-b740-aac65ddafa01', '9c487627-12da-4a13-86e4-ea141f2e45f0', 'd30fd63b-8438-4007-8130-a3be757083e2', '14e5bb57-60d8-4e2e-935e-cb0fe048ddea', '8a6bc8e9-6a2c-4d81-af1d-152e5727861c', '5eab3592-614e-4c9a-b165-209db9b81180', '7ca636b0-30c7-4cc6-a17c-31c8a49af2f8', 'ee1e4b63-443d-4d35-899b-5a272f6b4aaf', '9cc24314-b6f8-4548-afc6-22edc4c2f001', '6e9a4488-2f1c-4a53-827f-8a54e34cc25e', '95a9ec1f-c4a9-4a30-a57f-51e8da50dce3', 'd816939d-66a7-4964-8c75-ee51ded27dc1', '9df19f93-d6d4-4c74-9125-abd396b111bc', '323fc8ff-395f-481a-ba7b-4df0834f0958', '6897b879-c1c8-43f9-9cde-a8bf7b470b6a', '44b9bca2-860b-4287-9a7e-1cc97cb860f4', '9cb126f9-78fd-4034-a151-73582e36100a'];
    let loct = ['py.png', 'st.png', 'km.png', 'tm.png', 'sz.png', 'nr.png', 'dz.png', 'pr.png', 're.png', 'wf.png', 'yt.png', 'mq.png', 'pf.png', 'hk.png'];
    let k = '';

    async function init() {
        while (true) {
            if (document.getElementsByClassName('flex flex-shrink-0 self-center')[0] != null) {
                fpb = lcb = false;
                fpbi = lcbi = false;
                document.getElementsByClassName('flex flex-shrink-0 self-center')[0].appendChild((document.createElement('div')));
                document.getElementsByClassName('flex flex-shrink-0 self-center')[0].getElementsByTagName('div')[13].innerHTML = '<div><div class="mb-4 text-baseLegacy-700">Features by Gašper:</div><div class="flex flex-col space-y-2.5"><div class="inline-flex items-center"><label class="cursor-pointer flex items-center relative w-auto"><input class="opacity-0 styles_primaryInputNative__3eLt_" type="checkbox"><div class="flex styles_primaryInput__HdiI7 bg-white border-baseLegacy-850 hover:border-baseLegacy-700"></div><span class="leading-none ml-2.5 text-baseLegacy-900 text-sm">Remove Locked Countries</span></label></div><div class="inline-flex items-center"><label class="cursor-pointer flex items-center relative w-auto"><input class="opacity-0 styles_primaryInputNative__3eLt_" type="checkbox"><div class="flex styles_primaryInput__HdiI7 bg-white border-baseLegacy-850 hover:border-baseLegacy-700"></div><span class="leading-none ml-2.5 text-baseLegacy-900 text-sm">Remove Frozen Properties</span></label></div></div></div>';
                document.getElementsByClassName('flex flex-shrink-0 self-center')[0].getElementsByTagName('div')[13].getElementsByClassName("inline-flex items-center")[0].addEventListener("click", lc);
                document.getElementsByClassName('flex flex-shrink-0 self-center')[0].getElementsByTagName('div')[13].getElementsByClassName("inline-flex items-center")[1].addEventListener("click", fp);
                let el = document.querySelector("#page-wrapper > div > ul > li.bg-primaryLegacy.cursor-pointer.flex.ml-2\\.5.p-2.rounded-full.text-white");
                if (el) {
                    el.addEventListener("click", run);
                }
                break;
            }
            await sleep(500);
        }
    }

    await init();
    await run();

    async function run() {
        while (true) {
            while (document.getElementsByClassName("big-table table-legacy")[0].getElementsByClassName("row").length == 1) {
                await sleep(100);
            }
            if (document.getElementsByClassName("big-table table-legacy")[0].getElementsByClassName("row").length == 0) {
                break;
            }
            while (document.getElementsByClassName("big-table table-legacy")[0].getElementsByClassName("row")[1].innerHTML == k) {
                await sleep(100);
            }
            k = document.getElementsByClassName("big-table table-legacy")[0].getElementsByClassName("row")[1].innerHTML;
            if (fpb) {
                hideFP();
            } else {
                unhideFP()
            }
            if (lcb) {
                hideLC();
            } else {
                unhideLC();
            }
            await sleep(100);
        }
    }

    function sleep(duration) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve()
            }, duration)
        })
    }

    function lc() {
        lcbi = !lcbi;
        if (lcbi) {
            lcb = !lcb;
            if (lcb) {
                hideLC();
            } else {
                unhideLC();
            }
        }
    }

    function hideLC() {
        for (let index = 1; index < document.getElementsByClassName("big-table table-legacy")[0].getElementsByClassName("row").length; index++) {
            for (let index2 = 0; index2 < loct.length; index2++) {
                if (document.getElementsByClassName("big-table table-legacy")[0].getElementsByClassName("row")[index].getElementsByTagName("img")[0].getAttribute("src").toString().substring(47) == loct[index2]) {
                    document.getElementsByClassName("big-table table-legacy")[0].getElementsByClassName("row")[index].style.display = "none";
                    break;
                }
            }
        }
    }

    function unhideLC() {
        for (let index = 1; index < document.getElementsByClassName("big-table table-legacy")[0].getElementsByClassName("row").length; index++) {
            document.getElementsByClassName("big-table table-legacy")[0].getElementsByClassName("row")[index].removeAttribute("style");
        }
        if (fpb) {
            hideFP()
        }
    }

    function fp() {
        fpbi = !fpbi;
        if (fpbi) {
            fpb = !fpb;
            if (fpb) {
                hideFP();
            } else {
                unhideFP();
            }
        }
    }

    function hideFP() {
        for (let index = 1; index < document.getElementsByClassName("big-table table-legacy")[0].getElementsByClassName("row").length; index++) {
            for (let index2 = 0; index2 < froz.length; index2++) {
                if (document.getElementsByClassName("big-table table-legacy")[0].getElementsByClassName("row")[index].getElementsByTagName("a")[0].href.substring(36) == froz[index2]) {
                    document.getElementsByClassName("big-table table-legacy")[0].getElementsByClassName("row")[index].style.display = "none";
                    break;
                }
            }
        }
    }

    function unhideFP() {
        for (let index = 1; index < document.getElementsByClassName("big-table table-legacy")[0].getElementsByClassName("row").length; index++) {
            document.getElementsByClassName("big-table table-legacy")[0].getElementsByClassName("row")[index].removeAttribute("style");
        }
        if (lcb) {
            hideLC();
        }
    }

})();