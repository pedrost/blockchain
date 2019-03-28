const Transaction = require("./Transaction");

class TransactionPool {
  constructor() {
    this.index = 1;
    this.transactions = [new Transaction()];
  }

}

module.exports = TransactionPool;