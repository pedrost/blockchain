const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

class Transaction {
  constructor(from, to, amount) {
    this.index = 1;
    this.from = from;
    this.to = to;
    this.amount = amount;
  }
}

module.exports = Transaction;
