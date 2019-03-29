"use strict";

const P2pServer = require("./network/p2p");
const HttpServer = require("./network/http");
const BlockChain = require("./models/BlockChain");
const Wallet = require("./models/wallet/Wallet");
const TransactionPool = require("./models/TransactionPool");

P2pServer.connectToPeers();
HttpServer.initHttpServer();
P2pServer.initP2PServer();
Wallet.initWallet();


module.exports = ({ http_port, p2p_port, peers, isGodWallet }) => {
  P2pServer.connectToPeers(peers);
  Wallet.initWallet(isGodWallet);
  const httpServer = HttpServer.initHttpServer(http_port);
  const p2pServer = P2pServer.initP2PServer(p2p_port);
  return {
    status:
      httpServer && p2pServer
        ? "Running"
        : "Stopped",
    http_port: http_port,
    p2p_port: p2p_port,
    peers: peers,
    blockchain: BlockChain,
    wallet: Wallet,
    transaction_pool: TransactionPool,
    kill: () => { httpServer.close(); p2pServer.close(); },
  };
};
