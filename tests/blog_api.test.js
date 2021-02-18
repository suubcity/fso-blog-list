const supertest = require('supertest');
require('express-async-errors');
const mongoose = require('mongoose');
const Blog = require('../models/blog');
const app = require('../app');
const helper = require('./test_helper');

const api = supertest(app);

beforeEach(async () => {
	await Blog.deleteMany({});

	const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
	const promiseArray = blogObjects.map((blog) => {
		blog.save();
	});
	await Promise.all(promiseArray);
});

test('get all blogs works', async () => {
	await api
		.get('/api/blogs/')
		.expect(200)
		.expect('Content-Type', /application\/json/);

	const response = await api.get('/api/blogs/');
	expect(response.body).toHaveLength(helper.initialBlogs.length);
});

afterAll(() => {
	mongoose.connection.close();
});
