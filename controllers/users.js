const bcrypt = require('bcrypt');
const User = require('../models/user');
const usersRouter = require('express').Router();

usersRouter.post('/', async (req, res) => {
	const body = req.body;

	const saltRounds = 10;
	const passwordHash = await bcrypt.hash(body.password, saltRounds);

	//logging passwordHash
	console.log(
		'######',
		'VARIABLE NAME:',
		'passwordHash',
		'TYPEOF:',
		typeof passwordHash,
		'VALUE:',
		passwordHash,
		'######'
	);
	//end of logging

	const user = new User({
		userName: body.userName,
		name: body.name,
		passwordHash: passwordHash,
	});

	const savedUser = await user.save();
	res.json(savedUser);
});

module.exports = usersRouter;
