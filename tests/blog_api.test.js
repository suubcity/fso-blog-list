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

test('if likes property is missing it will default to 0', async () => {
	const newBlogWithoutLikes = {
		title: 'blog without likes',
		author: 'Michael Chan',
		url: 'https://reactpatterns.com/',
	};

	await api
		.post('/api/blogs')
		.send(newBlogWithoutLikes)
		.expect(200)
		.expect('Content-Type', /application\/json/);

	const blogsAtEnd = await helper.blogsInDb();

	const blogToTest = blogsAtEnd.filter((blog) => {
		return blog.title === 'blog without likes';
	});

	expect(blogToTest[0].likes).toBe(0);
});

test(' if the title and url properties are missing from the request data, the response is status code 400 Bad Request.', async () => {
	const newBlogMissingData = { author: 'Michael Chan', likes: 300 };

	await api.post('/api/blogs').send(newBlogMissingData).expect(400);
});

afterAll(() => {
	mongoose.connection.close();
});
