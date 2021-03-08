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

describe('Adding a new user', () => {
	test('succeeds when all data is present and correct', async () => {
		const newUser = {
			username: 'correctUserName',
			name: 'Correct Name',
			password: 'password1234',
		};

		await api
			.post('/api/users/')
			.send(newUser)
			.expect(200)
			.expect('Content-Type', /application\/json/);

		usersAtEnd = await helper.usersInDb();

		userNames = usersAtEnd.map((u) => u.name);
		expect(userNames).toContain('Correct Name');
		expect(usersAtEnd).toHaveLength(helper.initialUsers.length + 1);
	});

	test('fails when password is less than 3 characters', async () => {
		const newUser = {
			username: 'Password too short',
			name: 'Password too short',
			password: '1',
		};

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(422)
			.expect('Content-Type', /application\/json/);

		expect(result.body.error).toContain('Password must be longer than 3 characters.');

		const usersAtEnd = await helper.usersInDb();
		expect(usersAtEnd).toHaveLength(helper.initialUsers.length);
	});

	test('fails when username is less than 3 characters', async () => {
		const newUser = {
			username: '12',
			name: 'Username too short',
			password: 'Username too short',
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

	test('fails when username is missing', async () => {
		const newUser = {
			name: 'Martyn',
			password: 'pass1245',
		};

		const result = await api
			.post('/api/users/')
			.send(newUser)
			.expect(422)
			.expect('Content-Type', /application\/json/);

		expect(result.body.error).toContain('Username or password missing.');

		const usersAtEnd = await helper.usersInDb();
		expect(usersAtEnd).toHaveLength(helper.initialUsers.length);
	});

	test('fails when password is missing', async () => {
		const newUser = {
			username: 'user12345',
			name: 'Martyn',
		};

		const result = await api
			.post('/api/users/')
			.send(newUser)
			.expect(422)
			.expect('Content-Type', /application\/json/);

		expect(result.body.error).toContain('Username or password missing.');

		const usersAtEnd = await helper.usersInDb();
		expect(usersAtEnd).toHaveLength(helper.initialUsers.length);
	});

	test('fails when username is not unique', async () => {
		const newUser = {
			username: 'daveDingo',
			name: 'dave',
			password: 'pass123',
		};

		//end of logging

		const result = await api
			.post('/api/users/')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/);
	});
});

afterAll(async () => {
	await mongoose.connection.close();
});
