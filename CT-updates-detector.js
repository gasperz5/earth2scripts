// ==UserScript==
// @name         Update detector
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Monitor changes in the hash value of a specific <script> tag and take action when it changes, displaying a toast notification.
// @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
// @support      https://www.buymeacoffee.com/gasper
// @include      https://*earth2.io/
// @icon         https://www.google.com/s2/favicons?domain=earth2.io
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    window.addEventListener('load', function () {
        const previousHash = localStorage.getItem('scriptHash') || 'first run';

        function showMessage(message, classes) {
            if(typeof M !== 'undefined') {
                M.toast({
                    html: message,
                    classes: classes,
                    displayLength: 20000
                });
            } else {
                alert("Website Updated");
            }
        }

        function checkHashChange() {
            console.log('Checking hash change...');
            let scriptElement = document.querySelector("body > script[src^='https://frontend.earth2.io/static/js/main']") || document.querySelector("body > script[src^='https://stage2-frontend.earth2.io/static/js/main']") || document.querySelector("body > script[src^='/static/js/main']");

            if (scriptElement) {
                const currentHash = extractHashFromUrl(scriptElement.src);
                console.log('Current hash:', currentHash, 'Previous hash:', previousHash);
                if (currentHash !== previousHash) {
                    console.log('Hash changed:', currentHash);
                    showMessage('<i class="material-icons">clear</i>Website Updated', 'teal accent-2');
                    localStorage.setItem('scriptHash', currentHash);
                }
            }
        }

        function extractHashFromUrl(url) {
            const parts = url.split('/');
            const lastPart = parts[parts.length - 1];
            const withoutExtension = lastPart.replace('.chunk.js', '');
            return withoutExtension;
        }
        checkHashChange();
    });
})();
