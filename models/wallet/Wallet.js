const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const fs = require("fs");
const __ = require("lodash");
const Transaction = require("./../Transaction");
const addToTransactionPool = require("./../TransactionPool")
  .addToTransactionPool;

const privateKeyLocation = "models/wallet/private.key";

class Wallet {
  constructor() {
    this.address = this.address;
    this.balance = this.balance;
  }

  initWallet() {
    if (!fs.existsSync(privateKeyLocation)) {
      if (!this.address) {
        this.address = this.generatePrivateKey();
      }
      fs.writeFileSync(privateKeyLocation, this.address);
    }
  }

  getPrivateFromWallet() {
    const buffer = readFileSync(privateKeyLocation, "utf8");
    return buffer.toString();
  }

  makeTransaction(address, amount, privateKey) {
    tx = new Transaction(this.getPublicFromWallet(), address, amount);
    addToTransactionPool(transaction);
    broadCastTransactionPool();
    return tx;
  }

  getPublicFromWallet() {
    const privateKey = getPrivateFromWallet();
    const key = ec.keyFromPrivate(privateKey, "hex");
    return key.getPublic().encode("hex");
  }

  getBalance(address, unspentTxOuts) {
    return __(findUnspentTxOuts(address, unspentTxOuts))
      .map(uTxO => uTxO.amount)
      .sum();
  }

  findUnspentTxOuts(ownerAddress, unspentTxOuts) {
    return __.filter(unspentTxOuts, uTxO => uTxO.address === ownerAddress);
  }

  deleteWallet() {
    if (fs.existsSync(privateKeyLocation)) {
      fs.unlinkSync(privateKeyLocation);
    }
  }

  generatePrivateKey() {
    const keyPair = ec.genKeyPair();
    const privateKey = keyPair.getPrivate();
    return privateKey.toString(16);
  }
}

module.exports = Wallet;
