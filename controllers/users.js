const bcrypt = require('bcrypt');
require('express-async-errors');
const usersRouter = require('express').Router();
const User = require('../models/user');

//Get All
usersRouter.get('/', async (req, res) => {
	const users = await User.find({}).populate('blogs');
	res.json(users);
});

//Post New User
usersRouter.post('/', async (req, res) => {
	const body = req.body;

	if (!body.password) {
		return res.status(422).json({ error: 'Password missing.' });
	}
	if (body.username) {
		if (body.username.length < 3) {
			return res.status(422).json({ error: 'Username must be more than 3 characters.' });
		}
	}

	if (body.password.length < 3) {
		return res.status(422).json({ error: 'Password must be longer than 3 characters.' });
	}

	const saltRounds = 10;
	const passwordHash = await bcrypt.hash(body.password, saltRounds);

	const user = new User({
		username: body.username,
		name: body.name,
		passwordHash,
	});

	const savedUser = await user.save();

	res.json(savedUser);
});

module.exports = usersRouter;
