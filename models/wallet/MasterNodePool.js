
class MasterNodePool {
  constructor() {
    this.index = 1;
    this.masterNodes = [];
  }

  addToMasterNodePool(masterNode) {
    this.masterNodes.push(masterNode);
  }
}

module.exports = MasterNodePool;
