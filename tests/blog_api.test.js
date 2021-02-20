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
	//if you forget await here the tests will run before DB is populated
	await Promise.all(promiseArray);
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

	//logging response.body
	console.log(
		'######',
		'VARIABLE NAME:',
		'response.body',
		'TYPEOF:',
		typeof response.body,
		'VALUE:',
		response.body,
		'######'
	);
	//end of logging

	response.body.forEach((blog) => {
		expect(blog.id).toBeDefined();
	});
});

test('post a new blog entry works', async () => {
	const newBlog = {
		title: 'Test Blog',
		author: 'Michael Chan',
		url: 'https://reactpatterns.com/',
		likes: 7,
	};

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(200)
		.expect('Content-Type', /application\/json/);

	const blogsAtEnd = await helper.blogsInDb();

	expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

	const titles = blogsAtEnd.map((blog) => blog.title);

	expect(titles).toContain('Test Blog');
});

afterAll(() => {
	mongoose.connection.close();
});
