class Transaction {
  constructor(from, to, amount, creationDate = new Date()) {
    this.index = 1;
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.creationDate = creationDate;
    this.coinAge = (() => this.amount * (this.creationDate - new Date()) )();
  }
}

module.exports = Transaction;
