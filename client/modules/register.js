const Web3 = require('web3');
const ganache = require('ganache-cli');
const provider = ganache.provider();
import fs from 'fs';
import path from 'path';
export const web3 = new Web3(provider);

export const w3hash = (a , b) => {
    return web3.utils.soliditySha3(
        {
            type: 'string', 
            value: a + web3.utils.soliditySha3(
                {
                    type: 'string', 
                    value: b 
                }
            )
        }
    )
}

const filePath = path.resolve(__dirname, '../db/', 'clientKeys.json')

export const createAccount = () => {
    const userAccount = web3.eth.accounts.create();
    let accountList = []
    if (fs.existsSync(filePath)) {   
        accountList = require('../db/'+'clientKeys.json') 
    }
    accountList.push({
        address: userAccount.address,
        privateKey: userAccount.privateKey
    })
    fs.writeFileSync(filePath, JSON.stringify(accountList), null, 2)
    return accountList;
}

export const signTx = (transaction, privateKey) => {
    const account = web3.eth.accounts.privateKeyToAccount(privateKey)
    return account.sign(transaction)
}