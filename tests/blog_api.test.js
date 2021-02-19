const supertest = require('supertest');
require('express-async-errors');
const app = require('../app.js');
const Blog = require('../models/blog');
const helper = require('./test_helper');
const mongoose = require('mongoose');

const api = supertest(app);

beforeEach(async () => {
	await Blog.deleteMany({});
	const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
	const promiseArray = blogObjects.map((blog) => blog.save());
	Promise.all(promiseArray);
});

test('get all blogs', async () => {
	await api
		.get('/api/blogs')
		.expect(200)
		.expect('Content-Type', /application\/json/);

	const response = await api.get('/api/blogs');
	expect(response.body).toHaveLength(helper.initialBlogs.length);
});

test('the unique identifier property of the blog posts is named id?', async () => {
	const response = await api.get('/api/blogs');

	response.body.forEach((blog) => {
		expect(blog.id).toBeDefined();
	});
});

afterAll(() => {
	mongoose.connection.close();
});
