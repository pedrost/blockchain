const sha256 = require("crypto-js/sha256");
const BlockChain = require('./../models/BlockChain');

const BLOCK_GENERATION_INTERVAL = 1;
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;

class Block {
  constructor(index, previousHash, data, timestamp, hash, difficulty, minterBalance, minterAddress) {
    this.index = index;
    this.previousHash = previousHash.toString();
    this.timestamp = timestamp || this.getCurrentTimestamp();
    this.data = data;
    this.difficulty = difficulty;
    this.minterBalance = minterBalance;
    this.minterAddress = minterAddress; 
    this.totalDifficulty = this.getTotalDifficulty();
    this.nonce = this.nonce;
    this.hash = hash || this.calculateHash().toString();
  }

  calculateHash(index = this.index, previousHash = this.previousHash, timestamp = this.timestamp, data = this.data, difficulty = this.getDifficulty(), balance=this.getAccountBalance(), address=this.getPublicFromWallet()) {
    return sha256(index + previousHash + address + timestamp + data + 2^256 * balance / difficulty).toString();
  }

  isBlockStakingValid(prevhash, address, timestamp, balance, difficulty, index) {
    difficulty = difficulty + 1;

    // Allow minting without coins for a few blocks
    if(index <= 10) {
      balance = balance + 1;
    }

    const balanceOverDifficulty = (2 ** 256) * (balance / difficulty);
    const stakingHash = sha256(prevhash + address + timestamp);
    const decimalStakingHash = new BigInt(stakingHash, 16);
    const difference = Number(balanceOverDifficulty - decimalStakingHash)

    return difference >= 0;
  }

  findBlock(index, previousHash, data, difficulty) {
    //if(typeof data != Transaction ) { return; }

    let pastTimestamp = 0;
    while (true) {
      let timestamp = this.getCurrentTimestamp();
      if(pastTimestamp !== timestamp) {
        let hash = this.calculateHash();
        if (this.isBlockStakingValid(previousHash, this.getPublicFromWallet(), timestamp, this.getAccountBalance(), difficulty, index)) {
          return new Block(index, previousHash, data, timestamp, hash, difficulty, this.getAccountBalance(), this.getPublicFromWallet());
        }
        pastTimestamp = timestamp;
      }
    }
  };

  getCurrentTimestamp() {
    return new Date().getTime() / 1000;
  }

  getTotalDifficulty() {
    let totalDifficulty = 0;
    BlockChain.blocks.forEach(block => {
      totalDifficulty += 2^block.difficulty;
    });
    return totalDifficulty;
  }

  getAccountBalance() {

  }

  getPublicFromWallet() {
    
  }

  getDifficulty(aBlockchain) {
    const latestBlock = aBlockchain.getLatestBlock();
    if (latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.index !== 0) {
      return getAdjustedDifficulty(latestBlock, aBlockchain);
    } else {
      return latestBlock.difficulty;
    }
  };

  getAdjustedDifficulty(latestBlock, aBlockchain) {
    const prevAdjustmentBlock = aBlockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
    const timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
    if (timeTaken < timeExpected / 2) {
      return prevAdjustmentBlock.difficulty + 1;
    } else if (timeTaken > timeExpected * 2) {
      return prevAdjustmentBlock.difficulty - 1;
    } else {
      return prevAdjustmentBlock.difficulty;
    }
  }

  isValidTimestamp(newBlock, previousBlock) {
    return ( previousBlock.timestamp - 60 < newBlock.timestamp ) && newBlock.timestamp - 60 < getCurrentTimestamp();
  };

}

module.exports = Block;