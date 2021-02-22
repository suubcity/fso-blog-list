const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
require('express-async-errors');

blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({});
	response.json(blogs);
});

blogsRouter.post('/', (request, response) => {
	const blog = new Blog(request.body);

	blog.likes = blog.likes || 0;

	if (blog.title === undefined && blog.url === undefined) {
		response.status(400).end();
	} else {
		blog.save().then((result) => {
			response.status(200).json(result);
		});
	}
});

module.exports = blogsRouter;
