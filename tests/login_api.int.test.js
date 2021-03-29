const supertest = require('supertest');
const userHelper = require('./user_test_helper');
const User = require('../models/user');
const app = require('../app');
const mongoose = require('mongoose');

const api = supertest(app);

beforeEach(async () => {
	await User.deleteMany({});
	//changed this code to use the application to initialise the database so it has the password hashes
	for (let user of userHelper.initialUsers) {
		await api.post('/api/users/').send(user);
	}
});

describe('login', () => {
	test('succeeds with correct password', async () => {
		const { username, password } = userHelper.initialUsers[0];

		const login = {
			username,
			password,
		};

		const result = await api.post('/api/login').send(login).expect(200);

		expect(result.body).toHaveProperty('token');
		expect(result.body.username).toContain('daveDingo');
		expect(result.body.name).toContain('dave');
	});

	test('fails with incorrect password', async () => {
		const { username, password } = userHelper.initialUsers[0];

		const login = {
			username,
			password: 'wrong password',
		};

		await api.post('/api/login').send(login).expect(401);
	});
	test('fails if username is not in database', async () => {
		const { username, password } = userHelper.initialUsers[0];

		const login = {
			username: 'not a user',
			password,
		};

		await api.post('/api/login').send(login).expect(401);
	});
});

afterAll(async () => {
	await mongoose.connection.close();
});
