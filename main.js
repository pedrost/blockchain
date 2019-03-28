"use strict";

const P2pServer = require("./network/p2p");
const HttpServer = require("./network/http");
const BlockChain = require("./models/BlockChain");

P2pServer.connectToPeers();
HttpServer.initHttpServer();
P2pServer.initP2PServer();

module.exports = ({ http_port, p2p_port, peers }) => {
  P2pServer.connectToPeers(peers);
  return {
    status:
      HttpServer.initHttpServer(http_port) && P2pServer.initP2PServer(p2p_port)
        ? "Running"
        : "Stopped",
    http_port: http_port,
    p2p_port: p2p_port,
    peers: peers,
    blockchain: BlockChain
  };
};
