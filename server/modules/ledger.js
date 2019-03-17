import fs from 'fs';
import path from 'path';
import Tx from './transaction';
import {encrypt, decrypt, newNonce} from './encrypt';

export default class Ledger {

    constructor(fileName) {
        this.genesisHash = Buffer.alloc(32).toString('hex');
        this.logger = []
        this.filePath = path.resolve(__dirname, '../db/',fileName);
        if (!fs.existsSync(this.filePath)) {
            this.pushTx({value:{cmd:'deposit', amount:0}})
        }
        this.logger = decrypt(fileName);
        console.log(this.logger)

    }

    reduce() {
        let currentBalance = 0;
        this.logger.forEach(item => {
            if (item.value.cmd === 'deposit') {
                currentBalance += item.value.amount;
            } else if (item.value.cmd === 'withdraw') {
                currentBalance -= item.value.amount
            } else {
                const logErr = new Error("Log corrupted");
                throw logErr;
            }
        })
        return currentBalance;
    }

    validateTx(transaction) {
        if (transaction.value.cmd === 'withdraw') {
            const currentBalance = this.reduce();
            if (transaction.value.amount > currentBalance) {
                return false;
            }
            return true;
        }
        return true;
    }
    
    pushTx(transaction) {
        const prevHash = this.logger.length ? this.logger[this.logger.length -1].hash : this.genesisHash;
        Tx.hashTx(prevHash, transaction);
        this.logger.push(transaction);

        this.nonce = newNonce()
        let data = JSON.stringify(this.logger)

        const toWrite = JSON.stringify(
            {
                nonce: this.nonce, 
                value: encrypt(data, this.nonce)
            })

        fs.writeFileSync(this.filePath, toWrite)
    }

    checksumLogger() {

        let i = 0
        while (i < this.logger.length) {
            console.log(i)
            if (Tx.verifyTxHash(this.logger[i], (i === 0 ? this.genesisHash : this.logger[i-1].hash)) === false) {
                return false;
            } else {
                i++;
            }
        }
        return true;
    }

}


// checksumLogger() {

//     for (let index = 0 ; index < this.logger.length-1; index++) {

        
//         if (w3hash2(this.logger[index].hash, JSON.stringify(this.logger[index+1].value)) !== this.logger[index+1].hash){
//             return false;

//         } else if (Tx.verifyTxHash(this.logger[index].signature, this.logger[index].hash) === false) {
//             return false;

//         } else if (index === 0) {
//             if (w3hash2(this.genesisHash, JSON.stringify(this.logger[0].value)) !== this.logger[0].hash) {
//                 return false;
//             }
//         }
//     }
//     return true;
// }