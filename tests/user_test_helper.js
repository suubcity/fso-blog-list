const User = require('../models/user');

const initialUsers = [
	{
		username: 'daveDingo',
		name: 'dave',
		password: 'pass123',
	},
	{
		username: 'MartyMcfly',
		name: 'Martyn',
		password: 'pass123',
	},
	{
		username: 'TIMOTIMO',
		name: 'Raul',
		password: 'pass123',
	},
];

const usersInDb = async () => {
	const users = await User.find({});
	return users.map((u) => u.toJSON());
};

module.exports = {
	initialUsers,
	usersInDb,
};
