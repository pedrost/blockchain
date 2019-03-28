'use strict';
const express = require("express");
const bodyParser = require('body-parser');
const WebSocket = require("ws");

var sockets = [];
var MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};

const Chain = require("./models/BlockChain");
const BlockChain = new Chain();

var initHttpServer = (http_port = process.env.HTTP_PORT) => {
    if(!http_port) { return false; }
    var app = express();
    app.use(bodyParser.json());

    app.get('/blocks', (req, res) => res.send(JSON.stringify(BlockChain.blocks)));

    app.post('/forgeBlock', (req, res) => {
        var newBlock = BlockChain.generateNextBlock(req.body.data);
        BlockChain.addBlock(newBlock);
        broadcast(responseLatestMsg());
        log('block added: ' + JSON.stringify(newBlock));
        res.send();
    });

    app.get('/peers', (req, res) => {
        res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });

    app.post('/addPeer', (req, res) => {
        connectToPeers([req.body.peer]);
        res.send();
    });

    app.listen(http_port);
    return true;
};


var initP2PServer = (p2p_port = process.env.P2P_PORT) => {
    if(!p2p_port) { return false; }
    var server = new WebSocket.Server({port: p2p_port});
    server.on('connection', ws => initConnection(ws));
    return true;
};

var initConnection = (ws) => {
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
};

var initMessageHandler = (ws) => {
    ws.on('message', (data) => {
        var message = JSON.parse(data);
        log('Received message' + JSON.stringify(message));
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

var initErrorHandler = (ws) => {
    var closeConnection = (ws) => {
        log('connection failed to peer: ' + ws.url);
        sockets.splice(sockets.indexOf(ws), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};

var connectToPeers = (newPeers = process.env.PEERS ? process.env.PEERS.split(',') : null ) => {
    if(!newPeers) { return false; }
    newPeers.forEach((peer) => {
        var ws = new WebSocket(peer);
        ws.on('open', () => initConnection(ws));
        ws.on('error', () => {
            log('connection failed')
        });
    });
};

var handleBlockchainResponse = (message) => {
    var receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
    var latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    var latestBlockHeld = BlockChain.getLatestBlock();
    if (latestBlockReceived.index > latestBlockHeld.index) {
        log('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            log("We can append the received block to our chain");
            BlockChain.addBlock(latestBlockReceived);
            broadcast(responseLatestMsg());
        } else if (receivedBlocks.length === 1) {
            log("We have to query the chain from our peer");
            broadcast(queryAllMsg());
        } else {
            log("Received blockchain is longer than current blockchain");
            if(BlockChain.replaceChain(receivedBlocks)) {
                broadcast(responseLatestMsg());
            }
        }
    } else {
        log('received blockchain is not longer than current blockchain. Do nothing');
    }
};

const queryChainLengthMsg = () => ({'type': MessageType.QUERY_LATEST});
const queryAllMsg = () => ({'type': MessageType.QUERY_ALL});
const responseChainMsg = () =>({
    'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(BlockChain.blocks)
});
const responseLatestMsg = () => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify([BlockChain.getLatestBlock()])
});

const write = (ws, message) => ws.send(JSON.stringify(message));
const broadcast = (message) => sockets.forEach(socket => write(socket, message));

const log = msg => process.env.NODE_ENV == 'test' ? '' : console.log(msg);

connectToPeers();
initHttpServer();
initP2PServer();

module.exports = ({http_port, p2p_port, peers}) => {
    connectToPeers(peers);
    return {
        status: initHttpServer(http_port) && initP2PServer(p2p_port) ? 'Running' : 'Stopped',
        http_port: http_port,
        p2p_port: p2p_port,
        peers: peers,
        blockchain: BlockChain,
    }
}