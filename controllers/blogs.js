const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
require('express-async-errors');

blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({});
	response.json(blogs);
});

blogsRouter.post('/', (request, response) => {
	const blog = new Blog(request.body);

	blog.save().then((result) => {
		response.status(200).json(result);
	});
});

module.exports = blogsRouter;
