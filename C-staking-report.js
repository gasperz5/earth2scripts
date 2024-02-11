    // ==UserScript==
    // @name         Staking report
    // @version      0.2.1
    // @description  Calculates your staking rewards and refunds for 100%, 50% and 6,5% essence staking pools and prints them in the console
    // @author       GasperZ5 -- gasperz (Discord) -- gasper (7.5% code for E2)
    // @support      https://www.buymeacoffee.com/gasper
    // ==/UserScript==

    (async function () {

        console.log('Staking report Script by Gašper added');

        'use strict';

        let react = getReactInstance();

        let staked = await getAllEssenceTransactionsByType('RESOURCE_CLAIM_STAKE');
        let stakeRewards = await getAllEssenceTransactionsByType('RESOURCE_CLAIM_STAKE_REWARD');
        let stakeRefunds = await getAllEssenceTransactionsByType('RESOURCE_CLAIM_STAKE_REFUND');
        let stakeReinbursements = await getAllEssenceTransactionsByType('MAIL_ATTACHMENT_CLAIM');

        console.log(staked, stakeRewards, stakeRefunds, stakeReinbursements);
        /*
        let all = await getAllEssenceTransactions();
        
        let staked = all.filter(x => x.balanceChangeType == 'resource_claim_stake');
        let stakeRewards = all.filter(x => x.balanceChangeType == 'resource_claim_stake_reward');
        let stakeRefunds = all.filter(x => x.balanceChangeType == 'resource_claim_stake_refund');
        let stakeReinbursements = all.filter(x => x.balanceChangeType == 'mail_attachment_claim');
        
        let types = all.map(x => x.balanceChangeType);
        types = [...new Set(types)];
        console.log(types);
        */

        let cut50 = new Date('2022-08-31Z');
        let cut6point5 = new Date('2023-04-12Z');

        let staked100 = staked.filter(x => new Date(x.attributes.created) < cut50);
        let staked50 = staked.filter(x => new Date(x.attributes.created) >= cut50 && new Date(x.attributes.created) < cut6point5);
        let staked6point5 = staked.filter(x => new Date(x.attributes.created) >= cut6point5);

        let staked100Ids = staked100.map(x => x.relationships.linkedObject.data.id);
        let staked50Ids = staked50.map(x => x.relationships.linkedObject.data.id);
        let staked6point5Ids = staked6point5.map(x => x.relationships.linkedObject.data.id);

        let stakeRewards100 = stakeRewards.filter(x => staked100Ids.includes(x.relationships.linkedObject.data.id));
        let stakeRewards50 = stakeRewards.filter(x => staked50Ids.includes(x.relationships.linkedObject.data.id));
        let stakeRewards6point5 = stakeRewards.filter(x => staked6point5Ids.includes(x.relationships.linkedObject.data.id));

        let stakeRefunds100 = stakeRefunds.filter(x => staked100Ids.includes(x.relationships.linkedObject.data.id));
        let stakeRefunds50 = stakeRefunds.filter(x => staked50Ids.includes(x.relationships.linkedObject.data.id));
        let stakeRefunds6point5 = stakeRefunds.filter(x => staked6point5Ids.includes(x.relationships.linkedObject.data.id));

        let stakeReinbursements100 = stakeReinbursements.filter(x => staked100Ids.includes(x.relationships.linkedObject.data.id));
        let stakeReinbursements50 = stakeReinbursements.filter(x => staked50Ids.includes(x.relationships.linkedObject.data.id));
        let stakeReinbursements6point5 = stakeReinbursements.filter(x => staked6point5Ids.includes(x.relationships.linkedObject.data.id));

        let stakedTotal = staked.reduce((a, b) => a + parseFloat(b.attributes.amount), 0).toFixed(2);
        let stakeRewardsTotal = stakeRewards.reduce((a, b) => a + parseFloat(b.attributes.amount), 0).toFixed(2);
        let stakeRefundsTotal = stakeRefunds.reduce((a, b) => a + parseFloat(b.attributes.amount), 0).toFixed(2);
        let stakeReinbursementsTotal = stakeReinbursements.reduce((a, b) => a + parseFloat(b.attributes.amount), 0).toFixed(2);
        let total = (parseFloat(stakedTotal) + parseFloat(stakeRewardsTotal) + parseFloat(stakeRefundsTotal) + parseFloat(stakeReinbursementsTotal)).toFixed(2);

        printRewards(stakedTotal, stakeRewardsTotal, stakeRefundsTotal, stakeReinbursementsTotal, total, 'All');

        let staked100Total = staked100.reduce((a, b) => a + parseFloat(b.attributes.amount), 0).toFixed(2);
        let stakeRewards100Total = stakeRewards100.reduce((a, b) => a + parseFloat(b.attributes.amount), 0).toFixed(2);
        let stakeRefunds100Total = stakeRefunds100.reduce((a, b) => a + parseFloat(b.attributes.amount), 0).toFixed(2);
        let stakeReinbursements100Total = stakeReinbursements100.reduce((a, b) => a + parseFloat(b.attributes.amount), 0).toFixed(2);
        let total100 = (parseFloat(staked100Total) + parseFloat(stakeRewards100Total) + parseFloat(stakeRefunds100Total) + parseFloat(stakeReinbursements100Total)).toFixed(2);

        printRewards(staked100Total, stakeRewards100Total, stakeRefunds100Total, stakeReinbursements100Total, total100, 100);

        let staked50Total = staked50.reduce((a, b) => a + parseFloat(b.attributes.amount), 0).toFixed(2);
        let stakeRewards50Total = stakeRewards50.reduce((a, b) => a + parseFloat(b.attributes.amount), 0).toFixed(2);
        let stakeRefunds50Total = stakeRefunds50.reduce((a, b) => a + parseFloat(b.attributes.amount), 0).toFixed(2);
        let stakeReinbursements50Total = stakeReinbursements50.reduce((a, b) => a + parseFloat(b.attributes.amount), 0).toFixed(2);
        let total50 = (parseFloat(staked50Total) + parseFloat(stakeRewards50Total) + parseFloat(stakeRefunds50Total) + parseFloat(stakeReinbursements50Total)).toFixed(2);

        printRewards(staked50Total, stakeRewards50Total, stakeRefunds50Total, stakeReinbursements50Total, total50, 50);

        let staked6point5Total = staked6point5.reduce((a, b) => a + parseFloat(b.attributes.amount), 0).toFixed(2);
        let stakeRewards6point5Total = stakeRewards6point5.reduce((a, b) => a + parseFloat(b.attributes.amount), 0).toFixed(2);
        let stakeRefunds6point5Total = stakeRefunds6point5.reduce((a, b) => a + parseFloat(b.attributes.amount), 0).toFixed(2);
        let stakeReinbursements6point5Total = stakeReinbursements6point5.reduce((a, b) => a + parseFloat(b.attributes.amount), 0).toFixed(2);
        let total6point5 = (parseFloat(staked6point5Total) + parseFloat(stakeRewards6point5Total) + parseFloat(stakeRefunds6point5Total) + parseFloat(stakeReinbursements6point5Total)).toFixed(2);

        printRewards(staked6point5Total, stakeRewards6point5Total, stakeRefunds6point5Total, stakeReinbursements6point5Total, total6point5, 6.5);

        let openStakes100 = staked100.filter(x => !stakeRewards100.map(y => y.relationships.linkedObject.data.id).includes(x.relationships.linkedObject.data.id) && !stakeRefunds100.map(y => y.relationships.linkedObject.data.id).includes(x.relationships.linkedObject.data.id) && !stakeReinbursements100.map(y => y.relationships.linkedObject.data.id).includes(x.relationships.linkedObject.data.id));
        let openStakes50 = staked50.filter(x => !stakeRewards50.map(y => y.relationships.linkedObject.data.id).includes(x.relationships.linkedObject.data.id) && !stakeRefunds50.map(y => y.relationships.linkedObject.data.id).includes(x.relationships.linkedObject.data.id) && !stakeReinbursements50.map(y => y.relationships.linkedObject.data.id).includes(x.relationships.linkedObject.data.id));
        let openStakes6point5 = staked6point5.filter(x => !stakeRewards6point5.map(y => y.relationships.linkedObject.data.id).includes(x.relationships.linkedObject.data.id) && !stakeRefunds6point5.map(y => y.relationships.linkedObject.data.id).includes(x.relationships.linkedObject.data.id) && !stakeReinbursements6point5.map(y => y.relationships.linkedObject.data.id).includes(x.relationships.linkedObject.data.id));

        let openStakes100Total = openStakes100.reduce((a, b) => a + parseFloat(b.attributes.amount), 0).toFixed(2);
        let openStakes50Total = openStakes50.reduce((a, b) => a + parseFloat(b.attributes.amount), 0).toFixed(2);
        let openStakes6point5Total = openStakes6point5.reduce((a, b) => a + parseFloat(b.attributes.amount), 0).toFixed(2);

        console.log(`----- ----- ----- ----`);
        console.log(`Pending 100 %: %c${openStakes100Total}`,'color: red',`essence (${openStakes100.length} claims open / investigated / rejected)`);
        console.log(`Pending 50 %: %c${openStakes50Total}`,'color: red',`essence (${openStakes50.length} claims open / investigated / rejected)`);
        console.log(`Pending 6.5 %: %c${openStakes6point5Total}`,'color: red',`essence (${openStakes6point5.length} claims open / investigated / rejected)`);

        let totalBalance = (parseFloat(total100) + parseFloat(total50) + parseFloat(total6point5)).toFixed(2);

        console.log(`----- ----- ----- ----`);
        console.log(totalBalance > 0 ? `%cYou are in good profit ${totalBalance} essence` : `%cYou are in the negative ${totalBalance} essence`, totalBalance > 0 ? 'color: green' : 'color: red')



        function printRewards(staked, stakeRewards, stakeRefunds, stakeReinbursements, total, percent) {
            if(percent != 'All') {
                percent = percent + ' %';
            }

            console.log(`----- ----- ----- ----`);
            console.log(`Stake Amount ${percent}:%c ${staked}`,'color: red', 'essence');
            console.log(`Stake Rewards ${percent}:%c ${stakeRewards}`, 'color: green', 'essence');
            console.log(`Stake Refunds ${percent}: ${stakeRefunds} essence`);
            console.log(`Stake Reinbursements ${percent}: ${stakeReinbursements} essence`);
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

        async function getAllEssenceTransactions() {
            let pageSize = 100;
            let firstPageData = await getClaimTransactions(1, pageSize);
            console.log(`Page 1 done`);

            let result = firstPageData.data;

            let pageCount = Math.ceil(parseFloat(firstPageData.meta.totalCount) / pageSize);

            for (let i = 2; i <= pageCount; i++) {
                let pageData = await getClaimTransactions(i, pageSize);
                result.push(...pageData.data);
                await sleep(1000 + (i % 10 == 0 ? 2000 : 0));
                console.log(`Page ${i} / ${pageCount} done`);
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
        async function getClaimTransactions(page, items) {
            let res = await react.api.getTransactions({
                items: items,
                ticker: 'ESNC',
                page: page,
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