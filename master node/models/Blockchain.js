const Block = require("./Block");

module.exports = class Blockchain {
  constructor() {
    this.blocks = [new Block()];
    this.index = 1;
  }

  getLastBlock() {
    return this.blocks[this.blocks.length - 1];
  }

  addBlock(data) {
    const index = this.index;
    const previousHash = this.getLastBlock().hash;

    const block = new Block(index, previousHash, data);

    console.log("====ADDING BLOCK======\n");
    this.index++;
    this.blocks.push(block);

    console.log("====VALIDATING CHAIN======\n");
    if (this.isValid()) {
      console.log("====VALID!====");
      return block;
    } else {
      console.log("====INVALID!====");
      this.index--;
      this.blocks.pop();
      return false;
    }
  }

  clearBlocks() {
    this.blocks = [new Block()];
    this.index = 1;
  }

  isValid() {
    for (let i = 1; i < this.blocks.length; i++) {
      const currentBlock = this.blocks[i];
      const previousBlock = this.blocks[i - 1];

      if (currentBlock.hash !== currentBlock.generateHash()) {
        return false;
      }

      if (currentBlock.index !== previousBlock.index + 1) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
};
