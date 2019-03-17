import sodium from 'sodium-native';
import fs from 'fs';
import path from 'path';

const filePath = path.resolve(__dirname, '../db/', 'enKey.json');

const newKeys = () => {
    let key = sodium.sodium_malloc(sodium.crypto_secretbox_KEYBYTES)
    sodium.randombytes_buf(key);
    return key;
}

export const newNonce = () => {
    let nonce = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES)
    sodium.randombytes_buf(nonce);
    return JSON.parse(JSON.stringify(nonce)).data;
}

const genKeys = () => {
    let key;
    if (!fs.existsSync(filePath)) {
        key = newKeys();
        fs.writeFileSync(filePath, JSON.stringify({secretKey: key}))
        return key;       
    } else {
        let oldkey = require('../db/enKey.json')
        return Buffer.from(oldkey.secretKey)
    }
}

// Nonce should be passed as a JSON.stringify string object right after creation
// Data should be passes as JSON.stringified string object
export const encrypt = (data, nonce) => {
    let originalNonce = Buffer.from(nonce)
    let originalData = Buffer.from(data);
    let key = genKeys();
    let ciphertext = Buffer.alloc(originalData.length + sodium.crypto_secretbox_MACBYTES)
    sodium.crypto_secretbox_easy(ciphertext, originalData, originalNonce, key)
    return ciphertext;
}

export const decrypt = (fileName) => {
    const cipher = require('../db/' + fileName)
    const ciphertext = Buffer.from(cipher.value.data)
    let nonce = Buffer.from(cipher.nonce);
    
    let key = genKeys();
    let plaintext = Buffer.alloc(ciphertext.length - sodium.crypto_secretbox_MACBYTES)
    if(!sodium.crypto_secretbox_open_easy(plaintext, ciphertext, nonce, key)) {
        console.log('decryption failed')
    } else {
        return JSON.parse(plaintext.toString('utf-8'));
    }
}