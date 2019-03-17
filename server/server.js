const jsonStream = require('duplex-json-stream');
import net from 'net';
import Ledger from './modules/ledger'
import Tx from './modules/transaction'
import {verifyMsg} from './modules/hashing'

const lg = new Ledger('transactions.json');
const dbSafe = lg.checksumLogger();


const server = net.createServer(socket => {
    
    socket = jsonStream(socket);
    socket.on('data', (msg => {
        let tx = new Tx({
            cmd: msg.cmd,
            amount: msg.amount
        });
        
        if ( verifyMsg(msg) && dbSafe ) {
            switch(msg.cmd) {                
                case 'deposit':
                    lg.pushTx(tx);
                    break;
                case 'withdraw':
                    lg.validateTx(tx) ? lg.pushTx(tx) : socket.write('No Balance available')
                    break;
                case 'balance':
                    socket.write({cmd: 'balance', balance: lg.reduce()})
                    break;
                default:
                    console.log('Wrong command:', msg.cmd)
            }
        }
    }))
});

server.listen(3876)




// const writeToFileLog = (log) => new Promise((resolve, reject) => {
//     fs.writeFile(dbPath, JSON.stringify(log), 'utf-8', (err) => {
//         if (err) {
//             reject(err)
//         } else {
//             resolve();
//         }
//     })
// })