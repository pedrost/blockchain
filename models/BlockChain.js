const Block = require("./Block");

class BlockChain {
  constructor() {
    this.blocks = [new Block(0, "0", "my genesis block!!", 1465154705, "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7")];
    this.index = 1;
  }

  addBlock(newBlock) {
    if (this.isValidNewBlock(newBlock, this.getLatestBlock())) {
      this.blocks.push(newBlock);
    }
  };

  isValidNewBlock(newBlock, previousBlock) {
    if (previousBlock.index + 1 !== newBlock.index) {
      console.log('invalid index');
      return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
      console.log('invalid previoushash');
      return false;
    } else if (newBlock.hash !== newBlock.hash) {
      console.log(typeof (newBlock.hash) + ' ' + typeof newBlock.hash);
      console.log('invalid hash: ' + newBlock.hash + ' ' + newBlock.hash);
      return false;
    }
    return true;
  } 

  getLatestBlock() {
    return this.blocks[this.blocks.length - 1];
  }
    
  getGenesisBlock() {
    return this.blocks[0];
  }

  generateNextBlock(blockData) {
    var previousBlock = this.getLatestBlock();
    var nextIndex = previousBlock.index + 1;
    return new Block(nextIndex, previousBlock.hash, blockData);
  }

  replaceChain(newBlocks) {
    console.log('newblocks length', newBlocks.length);
    console.log('blocks length', this.blocks.length);

    if (this.isValidChain(newBlocks) && newBlocks.length > this.blocks.length) {
      console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
      this.blocks = newBlocks;
      return true;
    } else {
      console.log('Received blockchain invalid');
      return false;
    }
  };

  isValidChain(blockchainToValidate) {
    if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(this.getGenesisBlock())) {
      console.log(JSON.stringify(blockchainToValidate[0]));
      console.log(JSON.stringify(this.getGenesisBlock()));
      return false;
    }
    var tempBlocks = [blockchainToValidate[0]];
    for (var i = 1; i < blockchainToValidate.length; i++) {
      if (this.isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
        tempBlocks.push(blockchainToValidate[i]);
      } else {
        console.log('2');
        return false;
      }
    }
    return true;
  };

}

module.exports = BlockChain;