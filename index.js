const app = require('express')();
const Blockchain = require('./models/Blockchain');

app.listen(3001);
app.set('view engine', 'ejs');

const blockchain = new Blockchain()
blockchain.addBlock({ amount: 4 });
blockchain.addBlock({ amount: 50 });

app.get('/blocks', function(req, res, next) {
	res.render('blocks', {
		blockchain: blockchain,
		blocks: blockchain.blocks,
		colors: ['red', 'green', 'blue', 'pink', 'orange', 'purple']
	});
});

app.get('/add', function(req, res, next) {
	blockchain.addBlock({amount: (Math.random() * 10)})
	res.send('ok');
});

app.get('/clear', function(req, res, next) {
	blockchain.clearBlocks();
	res.send('ok');
});

app.get('/attack', function(req, res, next) {
	if(!req.query.amount) { req.query.amount = (Math.random() * 10)}
	const beforeValue = blockchain.blocks[1].data.amount;
	blockchain.blocks[1].data.amount = req.query.amount;
	res.send({
		beforeAmount: beforeValue,
		afterAttackAmount: req.query.amount,
	});
});