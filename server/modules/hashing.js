const Web3 = require('web3');
const ganache = require('ganache-cli');
const provider = ganache.provider();
import fs from 'fs';
import path from 'path';
const clientKeys = require('../db/clientKeys.json')
export const web3 = new Web3(provider);

export const w3hash2 = (a , b) => {
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

const filePath = path.resolve(__dirname, '../db/', 'w3keygen.json')

const getAccAndKeys = () => {
    let ethAccount;
    if (!fs.existsSync(filePath)) {
        ethAccount = web3.eth.accounts.create();
        fs.writeFileSync(filePath, JSON.stringify({
            address: ethAccount.address,
            privateKey: ethAccount.privateKey
        },null, 2))
    } else {
        const keyRing = require('../db/' + 'w3keygen.json')
        ethAccount = web3.eth.accounts.privateKeyToAccount(keyRing.privateKey)
    }
    return ethAccount;
}

export const account = getAccAndKeys();

export const signHash = (account, hash) => {
    return account.sign(hash);
}

export const verifySig = (account, transaction, prevValue) => {
    if (account.address === web3.eth.accounts.recover({
        messageHash: transaction.hash,
        r: transaction.r,
        s: transaction.s,
        v: transaction.v,
    }) && (account.address === web3.eth.accounts.recover(prevValue + JSON.stringify(transaction.value) ,transaction.signature))){
        return true;
    } else {
        return false;
    }
}

export const verifyMsg = (msg) => {
    const account = web3.eth.accounts.privateKeyToAccount(msg.privateKey)
    if (account.address === web3.eth.accounts.recover({
        messageHash: msg.hash.messageHash,
        r: msg.hash.r,
        s: msg.hash.s,
        v: msg.hash.v,
    })) {
        return true
    }
    else {
        return false
    }
}