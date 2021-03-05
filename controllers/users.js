const bcrypt = require('bcrypt');
const User = require('../models/user');
const usersRouter = require('express').Router();

//Get All
usersRouter.get('/', async (req, res) => {
	const users = await User.find({});
	res.json(users);
});

//Post New User
usersRouter.post('/', async (req, res) => {
	const body = req.body;

	if (body.username.length < 3) {
		res.status(422).json({ error: 'Username must be more than 3 characters.' });
	}

	const saltRounds = 10;
	const passwordHash = await bcrypt.hash(body.password, saltRounds);

	const user = new User({
		userName: body.userName,
		name: body.name,
		passwordHash: passwordHash,
	});

	const savedUser = await user.save();
	res.json(savedUser);
});

module.exports = usersRouter;
