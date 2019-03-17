const jsonStream = require('duplex-json-stream');
const net = require('net');
const clientKeys = require('./db/clientKeys')
import { signTx } from './modules/register'

const client = jsonStream(net.connect(3876))

const prepMsg = (cmd, amount, privateKey) => {
    let hash = signTx(JSON.stringify({
        cmd,
        amount,
    }), privateKey)
    return {
        cmd,
        amount,
        privateKey,
        hash
    }
}

let cmd = process.argv[2]
let amount = parseInt(process.argv[3])
let privateKey = clientKeys[parseInt(process.argv[4])].privateKey

client.write(prepMsg(cmd, amount, privateKey))

client.on('data', (msg => {
    console.log('Teller Recieved:', msg)
}))

client.end(prepMsg('balance', 0, privateKey))