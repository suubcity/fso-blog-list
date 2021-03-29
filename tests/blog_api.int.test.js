const supertest = require('supertest');
require('express-async-errors');
const app = require('../app.js');
const loginRouter = require('../controllers/login');
const Blog = require('../models/blog');
const User = require('../models/user');
const blogHelper = require('./blog_test_helper');
const userHelper = require('./user_test_helper');

const mongoose = require('mongoose');

const api = supertest(app);

beforeEach(async () => {
	await User.deleteMany({});
	for (let user of userHelper.initialUsers) {
		await api.post('/api/users/').send(user);
	}

	await Blog.deleteMany({});

	const blogObjects = blogHelper.initialBlogs.map((b) => new Blog(b));
	let promiseArray = blogObjects.map((b) => b.save());
	//if you forget await here the tests will run before DB is populated
	await Promise.all(promiseArray);

	const user = userHelper.initialUsers[0];
	const res = await loginRouter.post({ user: user.name, password: user.password });
});

test('get all blogs', async () => {
	await api
		.get('/api/blogs/')
		.expect(200)
		.expect('Content-Type', /application\/json/);

	const response = await api.get('/api/blogs');
	expect(response.body).toHaveLength(blogHelper.initialBlogs.length);
});

test('the unique identifier property of the blog posts is named id?', async () => {
	const response = await api.get('/api/blogs');
	response.body.forEach((blog) => {
		expect(blog.id).toBeDefined();
	});
});

test.only('post a new blog entry works', async () => {
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

	const blogsAtEnd = await blogHelper.blogsInDb();

	expect(blogsAtEnd).toHaveLength(blogHelper.initialBlogs.length + 1);

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

	const blogsAtEnd = await blogHelper.blogsInDb();

	const blogToTest = blogsAtEnd.filter((blog) => {
		return blog.title === 'blog without likes';
	});

	expect(blogToTest[0].likes).toBe(0);
});

test(' if the title and url properties are missing from the request data, the response is status code 400 Bad Request.', async () => {
	const newBlogMissingData = { author: 'Michael Chan', likes: 300 };

	await api.post('/api/blogs').send(newBlogMissingData).expect(400);
});

describe('deletion of note', () => {
	test('succeeds with valid id', async () => {
		const blogsAtStart = await blogHelper.blogsInDb();
		const blogToDelete = blogsAtStart[0];

		await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

		const blogsAtEnd = await blogHelper.blogsInDb();

		expect(blogsAtEnd).toHaveLength(blogHelper.initialBlogs.length - 1);

		const titles = blogsAtEnd.map((blog) => {
			return blog.title;
		});

		expect(titles).not.toContain(blogToDelete.title);
	});
});

describe('update of blog', () => {
	test('works when updating likes', async () => {
		const blogsAtStart = await blogHelper.blogsInDb();
		const blogToUpdate = blogsAtStart[0];
		const updatedBlogLikes = {
			likes: 1000,
		};

		await api.put(`/api/blogs/${blogToUpdate.id}`).send(updatedBlogLikes).expect(200);

		const blogsAtEnd = await blogHelper.blogsInDb();

		const updatedBlog = blogsAtEnd.filter((blog) => {
			return blog.id === blogToUpdate.id;
		});

		expect(updatedBlog[0].likes).toEqual(1000);
	});
});

afterAll(async () => {
	await mongoose.connection.close();
});
