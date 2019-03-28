const Transaction = require("./Transaction");

class TransactionPool {
  constructor() {
    this.index = 1;
    this.transactions = [];
  }

  addToTransactionPool(transaction) {
    this.transactions.push(transaction);
  }
}

module.exports = TransactionPool;
