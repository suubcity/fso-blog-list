const supertest = require('supertest');
require('express-async-errors');
const app = require('../app.js');
const User = require('../models/user');
const helper = require('./user_test_helper');
const mongoose = require('mongoose');

const api = supertest(app);

beforeEach(async () => {
	await User.deleteMany({});

	const userObjects = helper.initialUsers.map((u) => new User(u));
	const promiseArray = userObjects.map((u) => u.save());

	await Promise.all(promiseArray);
});

test('get all users', async () => {
	await api
		.get('/api/users/')
		.expect(200)
		.expect('Content-Type', /application\/json/);

	const response = await api.get('/api/users/');
	expect(response.body).toHaveLength(helper.initialUsers.length);
});

describe('when adding a new user', () => {
	test('username must be at least 3 characters', async () => {
		//
		const newUser = {
			username: '12',
			name: 'Username too short',
			password: 'pass123',
		};

		const result = await api
			.post('/api/users/')
			.send(newUser)
			.expect(422)
			.expect('Content-Type', /application\/json/);

		expect(result.body.error).toContain('Username must be more than 3 characters.');
		const usersAtEnd = await helper.usersInDb();
		expect(usersAtEnd).toHaveLength(helper.initialUsers.length);
	});
});

afterAll(async () => {
	await mongoose.connection.close();
});
