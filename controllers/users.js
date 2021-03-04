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
