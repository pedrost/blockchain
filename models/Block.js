const sha256 = require("crypto-js/sha256");

class Block {
  constructor(
    index,
    previousHash,
    data,
    timestamp,
    hash,
    minterAddress
  ) {
    this.index = index;
    this.previousHash = previousHash.toString();
    this.timestamp = timestamp || this.getCurrentTimestamp();
    this.data = data;
    this.minterAddress = minterAddress;
    this.hash = hash || this.calculateHash().toString();
  }

  calculateHash(
    index = this.index,
    previousHash = this.previousHash,
    timestamp = this.timestamp,
    data = this.data,
    balance = this.getAccountBalance(),
    address = this.getPublicFromWallet()
  ) {
    return sha256(
      (index + previousHash + address + timestamp + data + 2) ^ (256 * balance)
    ).toString();
  }

  isBlockStakingValid(
    prevhash,
    address,
    timestamp,
    balance,
    difficulty,
    index
  ) {
    difficulty = difficulty + 1;

    // Allow minting without coins for a few blocks
    if (index <= 10) {
      balance = balance + 1;
    }

    const balanceOverDifficulty = 2 ** 256 * (balance / difficulty);
    const stakingHash = sha256(prevhash + address + timestamp);
    const decimalStakingHash = new BigInt(stakingHash, 16);
    const difference = Number(balanceOverDifficulty - decimalStakingHash);

    return difference >= 0;
  }

  findBlock(index, previousHash, data, difficulty) {
    //if(typeof data != Transaction ) { return; }

    let pastTimestamp = 0;
    while (true) {
      let timestamp = this.getCurrentTimestamp();
      if (pastTimestamp !== timestamp) {
        let hash = this.calculateHash();
        if (
          this.isBlockStakingValid(
            previousHash,
            this.getPublicFromWallet(),
            timestamp,
            this.getAccountBalance(),
            index
          )
        ) {
          return new Block(
            index,
            previousHash,
            data,
            timestamp,
            hash,
            this.getAccountBalance(),
            this.getPublicFromWallet()
          );
        }
        pastTimestamp = timestamp;
      }
    }
  }

  getCurrentTimestamp() {
    return new Date().getTime() / 1000;
  }

  getAccountBalance() {
    return 1;
  }

  getPublicFromWallet() {
    return "PUBLICK_KEY_WALLET_ADDRESS";
  }

  isValidTimestamp(newBlock, previousBlock) {
    return (
      previousBlock.timestamp - 60 < newBlock.timestamp &&
      newBlock.timestamp - 60 < getCurrentTimestamp()
    );
  }
}

module.exports = Block;
