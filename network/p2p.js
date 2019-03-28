const WebSocket = require("ws");
const BlockChain = require("./../models/BlockChain");

const sockets = [];
const MessageType = {
  QUERY_LATEST: 0,
  QUERY_ALL: 1,
  RESPONSE_BLOCKCHAIN: 2,
  QUERY_TRANSACTION_POOL: 3,
  RESPONSE_TRANSACTION_POOL: 4
};

const initP2PServer = (p2p_port = process.env.P2P_PORT) => {
  if (!p2p_port) {
    return false;
  }
  const server = new WebSocket.Server({ port: p2p_port });
  server.on("connection", ws => initConnection(ws));
  return true;
};

const initConnection = ws => {
  sockets.push(ws);
  initMessageHandler(ws);
  initErrorHandler(ws);
  write(ws, queryChainLengthMsg());
};

const initMessageHandler = ws => {
  ws.on("message", data => {
    var message = JSON.parse(data);
    log("Received message" + JSON.stringify(message));
    switch (message.type) {
      case MessageType.QUERY_LATEST:
        write(ws, responseLatestMsg());
        break;
      case MessageType.QUERY_ALL:
        write(ws, responseChainMsg());
        break;
      case MessageType.RESPONSE_BLOCKCHAIN:
        handleBlockchainResponse(message);
        break;
    }
  });
};

var initErrorHandler = ws => {
  var closeConnection = ws => {
    log("connection failed to peer: " + ws.url);
    sockets.splice(sockets.indexOf(ws), 1);
  };
  ws.on("close", () => closeConnection(ws));
  ws.on("error", () => closeConnection(ws));
};

var connectToPeers = (
  newPeers = process.env.PEERS ? process.env.PEERS.split(",") : null
) => {
  if (!newPeers) {
    return false;
  }
  newPeers.forEach(peer => {
    var ws = new WebSocket(peer);
    ws.on("open", () => initConnection(ws));
    ws.on("error", () => {
      log("connection failed");
    });
  });
};

var handleBlockchainResponse = message => {
  var receivedBlocks = JSON.parse(message.data).sort(
    (b1, b2) => b1.index - b2.index
  );
  var latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
  var latestBlockHeld = BlockChain.getLatestBlock();
  if (latestBlockReceived.index > latestBlockHeld.index) {
    log(
      "blockchain possibly behind. We got: " +
        latestBlockHeld.index +
        " Peer got: " +
        latestBlockReceived.index
    );
    if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
      log("We can append the received block to our chain");
      BlockChain.addBlock(latestBlockReceived);
      broadCastResponseLatestMsg();
    } else if (receivedBlocks.length === 1) {
      log("We have to query the chain from our peer");
      broadCastQueryAllMsg();
    } else {
      log("Received blockchain is longer than current blockchain");
      if (BlockChain.replaceChain(receivedBlocks)) {
        broadCastResponseLatestMsg();
      }
    }
  } else {
    log(
      "received blockchain is not longer than current blockchain. Do nothing"
    );
  }
};

const queryChainLengthMsg = () => ({ type: MessageType.QUERY_LATEST });
const queryAllMsg = () => ({ type: MessageType.QUERY_ALL });
const responseChainMsg = () => ({
  type: MessageType.RESPONSE_BLOCKCHAIN,
  data: JSON.stringify(BlockChain.blocks)
});

const responseTransactionPoolMsg = () => ({
  type: MessageType.RESPONSE_TRANSACTION_POOL,
  data: JSON.stringify(getTransactionPool())
});

const responseLatestMsg = () => ({
  type: MessageType.RESPONSE_BLOCKCHAIN,
  data: JSON.stringify([BlockChain.getLatestBlock()])
});

const broadCastResponseLatestMsg = () => {
  broadcast(responseLatestMsg());
};

const broadCastQueryAllMsg = () => {
  broadcast(queryAllMsg());
};

const broadCastTransactionPool = () => {
  broadcast(responseTransactionPoolMsg());
};

const write = (ws, message) => ws.send(JSON.stringify(message));
const broadcast = message => sockets.forEach(socket => write(socket, message));

const log = msg => (process.env.NODE_ENV == "test" ? "" : console.log(msg));

module.exports = {
  initP2PServer: initP2PServer,
  connectToPeers: connectToPeers,
  sockets: sockets,
  broadCastTransactionPool: broadCastTransactionPool,
  broadCastResponseLatestMsg: broadCastResponseLatestMsg,
  broadCastQueryAllMsg: broadCastQueryAllMsg
};
