    // ==UserScript==
    // @name         Content staking report
    // @version      0.1.0
    // @description  Calculates your staking rewards for content contributions backings
    // @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
    // @support      https://www.buymeacoffee.com/gasper
    // ==/UserScript==

    (async function () {

        console.log('Staking report Script by Gašper added');

        'use strict';

        let react = getReactInstance();

        let staked = await getAllEssenceTransactionsByType('YELLOW_ENERGY_CLAIM_STAKE');
        let stakeRewards = await getAllEssenceTransactionsByType('YELLOW_ENERGY_CLAIM_STAKE_REWARD');
        let stakeRefunds = await getAllEssenceTransactionsByType('YELLOW_ENERGY_CLAIM_STAKE_REFUND');
        //let stakeReinbursements = await getAllEssenceTransactionsByType('MAIL_ATTACHMENT_CLAIM');

        console.log(staked, stakeRewards, stakeRefunds/*, stakeReinbursements*/);
     
        let stakedTotal = staked.reduce((a, b) => a + parseFloat(b.attributes.amount), 0).toFixed(2);
        let stakeRewardsTotal = stakeRewards.reduce((a, b) => a + parseFloat(b.attributes.amount), 0).toFixed(2);
        let stakeRefundsTotal = stakeRefunds.reduce((a, b) => a + parseFloat(b.attributes.amount), 0).toFixed(2);
        //let stakeReinbursementsTotal = stakeReinbursements.reduce((a, b) => a + parseFloat(b.attributes.amount), 0).toFixed(2);

        let total = (parseFloat(stakedTotal) + parseFloat(stakeRewardsTotal) + parseFloat(stakeRefundsTotal) /*+ parseFloat(stakeReinbursementsTotal)*/).toFixed(2);

        printRewards(stakedTotal, stakeRewardsTotal, stakeRefundsTotal/*, stakeReinbursementsTotal*/, total, 'All');

        let openStakesNumber = staked.length - stakeRewards.length - stakeRefunds.length;

        console.log(`----- ----- ----- ----`);
        console.log(`(${openStakesNumber} claims open / investigated / rejected)`);

        let totalBalance = (parseFloat(total)).toFixed(2);

        console.log(`----- ----- ----- ----`);
        console.log(totalBalance > 0 ? `%cYou are in good profit ${totalBalance} essence` : `%cYou are in the negative ${totalBalance} essence`, totalBalance > 0 ? 'color: green' : 'color: red')



        function printRewards(staked, stakeRewards, stakeRefunds/*, stakeReinbursements*/, total, percent) {
            if(percent != 'All') {
                percent = percent + ' %';
            }

            console.log(`----- ----- ----- ----`);
            console.log(`Stake Amount ${percent}:%c ${staked}`,'color: red', 'essence');
            console.log(`Stake Rewards ${percent}:%c ${stakeRewards}`, 'color: green', 'essence');
            console.log(`Stake Refunds ${percent}: ${stakeRefunds} essence`);
            //console.log(`Stake Reinbursements ${percent}: ${stakeReinbursements} essence`);
            console.log(`Total ${percent}:%c ${total}`,total>0?'color: green':'color: red', 'essence');
        }

        async function getAllEssenceTransactionsByType(type) {
            let pageSize = 100;
            let firstPageData = await getClaimTransactionsByType(1, pageSize, type);
            console.log(`Page 1 done for ${type}`);

            let result = firstPageData.data;

            let pageCount = Math.ceil(parseFloat(firstPageData.meta.totalCount) / pageSize);

            for (let i = 2; i <= pageCount; i++) {
                let pageData = await getClaimTransactionsByType(i, pageSize, type);
                result.push(...pageData.data);
                await sleep(1000 + (i % 10 == 0 ? 2000 : 0));
                console.log(`Page ${i} / ${pageCount} done for ${type}`);
            }

            return result;
        }


        async function getClaimTransactionsByType(page, items, type) {
            let res = await react.api.getTransactions({
                items: items,
                ticker: 'ESNC',
                page: page,
                type: type
            });
            return res || {data: [], included: [], meta: {}};
        }

        function sleep(duration) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve()
                }, duration)
            })
        }

        function getReactInstance() {
            return Object.values(document.querySelector('.app'))[0].return.dependencies.firstContext.context._currentValue;
        }
    })();