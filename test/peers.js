const expect = require('chai').expect;
const app = require('./../main');

const nodes = [
  {
    http_port: 3002,
    p2p_port: 6002,
    peers: [],
  },
  {
    http_port: 3003,
    p2p_port: 6003,
    peers: ['ws://localhost:6002'],
  }
]

describe("Creation of two nodes and transaction between", function() {
  const node1 = app(nodes[0]);
  const node2 = app(nodes[1]);

  it("Create node 1", function() {
    expect(node1.status).to.equal("Running");
    expect(node1.http_port).to.equal(3002);
    expect(node1.p2p_port).to.equal(6002);
    expect(node1.peers.length).to.equal(0);
  });

  it("Create node 2 with node 1 as peer", function() {
    expect(node2.status).to.equal("Running");
    expect(node2.http_port).to.equal(3003);
    expect(node2.p2p_port).to.equal(6003);
    expect(node2.peers.length).to.equal(1);
  });

  it("Check node 1 and node 2 genesis block", function() {
    const genesis = [{
    index: 0,
    previousHash: "0",
    timestamp: 1465154705,
    data: "my genesis block!!",
    hash: "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7"}];

    expect(node1.blockchain.blocks).to.deep.equal(genesis);
    expect(node2.blockchain.blocks).to.deep.equal(genesis);
  });

  it("Forge Block to node 2", function() {
    const newBlock = node2.blockchain.generateNextBlock('amount');
    node2.blockchain.addBlock(newBlock);
    expect(node2.blockchain.getLatestBlock()).to.deep.equal(newBlock);
  });

  it("Node 2 broadcast new block to all peers", function() {
    expect(node1.blockchain.getLatestBlock()).to.deep.equal(node2.blockchain.getLatestBlock());
  });

});
