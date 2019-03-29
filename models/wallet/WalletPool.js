class WalletPool {
  constructor() {
    this.index = 1;
    this.wallets = [];
  }

  addToWalletPool(wallet) {
    this.wallets.push(wallet);
  }
}

module.exports = WalletPool;
