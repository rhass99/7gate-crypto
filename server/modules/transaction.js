import { account, signHash, verifySig } from './hashing';

export default class Transaction {

    constructor({cmd, amount}) {
        this.value = {
            cmd,
            amount,
        }
        this.hash = '';
        this.signature = '';
    }
    static hashTx(prevHash, transaction){
        const signed = signHash(account, prevHash + JSON.stringify(transaction.value))
        transaction.hash = signed.messageHash;
        transaction.signature = signed.signature;
        transaction.r = signed.r;
        transaction.s = signed.s;
        transaction.v = signed.v;
    }

    static verifyTxHash(transaction, prevValue) {
        return verifySig(account, transaction, prevValue)
    }

}
