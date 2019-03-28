const express = require("express");
const bodyParser = require("body-parser");
const P2pServer = require("./p2p");
const BlockChain = require("./../models/BlockChain");

const initHttpServer = (http_port = process.env.HTTP_PORT) => {
  if (!http_port) {
    return false;
  }
  var app = express();
  app.use(bodyParser.json());

  app.get("/blocks", (req, res) => res.send(JSON.stringify(BlockChain.blocks)));

  app.post("/forgeBlock", (req, res) => {
    var newBlock = BlockChain.generateNextBlock(req.body.data);
    BlockChain.addBlock(newBlock);
    P2pServer.broadCastResponseLatestMsg();
    log("block added: " + JSON.stringify(newBlock));
    res.send();
  });

  app.get("/peers", (req, res) => {
    res.send(
      P2pServer.sockets.map(
        s => s._socket.remoteAddress + ":" + s._socket.remotePort
      )
    );
  });

  app.post("/addPeer", (req, res) => {
    P2pServer.connectToPeers([req.body.peer]);
    res.send();
  });

  app.listen(http_port);
  return true;
};

module.exports = {
  initHttpServer: initHttpServer
};
