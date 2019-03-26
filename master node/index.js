const Blockchain = require("./models/Blockchain");
const net = require("net");
const nodes = require("./hosts/node");

const blockchain = new Blockchain();

net
  .createServer(function(socket) {
    socket.on("data", function(data) {
      console.log("====MASTER NODE RECIEVED BLOCK======\n");
      console.log("====ADDING BLOCK TO CHAIN======\n");
      const added_block = blockchain.addBlock(JSON.parse(data));
      console.log("====TELLING OTHER NODES======\n");
      broadcast(`${JSON.stringify(added_block)} \n`);
    });

    socket.on("end", function() {});

    function broadcast(message) {
      nodes.forEach(function(node) {
        client = net.createConnection({ port: node.PORT, host: node.HOST });
        client.write(message);
        client.on("error", () => {
          console.log(`node ${node.HOST}:${node.PORT} offline`);
        });
      });
    }
  })
  .listen(5003);
