const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const fs = require("fs");
const __ = require("lodash");
const Transaction = require("./../Transaction");
const addToTransactionPool = require("./../TransactionPool").addToTransactionPool;
const broadCastTransactionPool = require("./../../network/p2p").broadCastTransactionPool;

const privateKeyLocation = "models/wallet/private.key";
const GOD_AMOUNT_LOCATION = "config/god_amount";

class Wallet {
  constructor() {
    this.address = null;
    this.balance = [];
  }

  initWallet(secret) {
    if (!fs.existsSync(privateKeyLocation)) {
      if (!this.address) {
        this.address = this.generatePrivateKey(secret);
      }
      fs.writeFileSync(privateKeyLocation, this.address);
    }
  }

  getPrivateFromWallet() {
    const buffer = fs.readFileSync(privateKeyLocation, "utf8");
    return buffer.toString();
  }

  makeTransaction(address, amount, transactionCreationDate) {
    transaction = new Transaction(this.getPublicFromWallet(), address, amount, transactionCreationDate);
    addToTransactionPool(transaction);
    broadCastTransactionPool();
    return transaction;
  }

  createGodAmount() {
    if (!fs.exists(GOD_AMOUNT_LOCATION)) {
      fs.writeFileSync(GOD_AMOUNT_LOCATION, 10000);
    }
  }

  getGodAmount() {
    const buffer = fs.readFileSync(GOD_AMOUNT_LOCATION, "utf8");
    return buffer.toString();
  }

  makeIcoTransaction(amount, creation_date) {
    return new Promise((resolve, reject) => {
      const takedFromGodAmount = Number(this.getGodAmount()) - Number(amount);
      if (takedFromGodAmount > 0) {
        fs.writeFileSync(GOD_AMOUNT_LOCATION, takedFromGodAmount)
        this.balance.push(
          new Transaction('GENESIS', this.getPublicFromWallet(), Number(amount), creation_date)
        );
        resolve(this.balance);
      }
    })
  }

  getPublicFromWallet() {
    const privateKey = this.getPrivateFromWallet();
    const key = ec.keyFromPrivate(privateKey, "hex");
    return key.getPublic().encode("hex");
  }

  deleteWallet() {
    if (fs.existsSync(privateKeyLocation)) {
      fs.unlinkSync(privateKeyLocation);
    }
  }

  deleteGodAmount() {
    if (fs.existsSync(GOD_AMOUNT_LOCATION)) {
      fs.unlinkSync(GOD_AMOUNT_LOCATION);
    }
  }

  generatePrivateKey(secret) {
    const keyPair = ec.genKeyPair(secret);
    const privateKey = keyPair.getPrivate();
    return privateKey.toString(16);
  }
  
}

const MyWallet = new Wallet();

module.exports = {
  initWallet: MyWallet.initWallet,
  deleteWallet: MyWallet.deleteWallet,
  makeTransaction: MyWallet.makeTransaction,
  getPublicFromWallet: MyWallet.getPublicFromWallet,
  createGodAmount: MyWallet.createGodAmount,
  getGodAmount: MyWallet.getGodAmount,
  makeIcoTransaction: MyWallet.makeIcoTransaction,
  generatePrivateKey: MyWallet.generatePrivateKey,
  getPrivateFromWallet: MyWallet.getPrivateFromWallet,
  deleteGodAmount: MyWallet.deleteGodAmount,
  balance: MyWallet.balance,
};
