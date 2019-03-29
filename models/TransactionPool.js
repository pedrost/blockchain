class TransactionPool {
  constructor() {
    this.index = 1;
    this.transactions = [];
  }

  addToTransactionPool(transaction) {
    this.transactions.push(transaction);
  }

  getTransactionPool() {
    return this.transactions;
  }

}

const Pool = new TransactionPool();

module.exports = {
  addToTransactionPool: Pool.addToTransactionPool,
  getTransactionPool: Pool.getTransactionPool,
};
