const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
require('express-async-errors');

blogsRouter.get('/', async (request, response) => {
	console.log('getting');
	const blogs = await Blog.find({});
	response.json(blogs);
});

blogsRouter.post('/', (request, response) => {
	const blog = new Blog(request.body);

	blog.likes = blog.likes || 0;

	if (blog.title === undefined && blog.url === undefined) {
		response.status(400).end();
	} else {
		Blog.save().then((result) => {
			response.status(200).json(result);
		});
	}
});

blogsRouter.delete('/:id', async (request, response) => {
	await Blog.findByIdAndRemove(request.params.id);
	response.status(204).end();
});

blogsRouter.put('/:id', async (request, response) => {
	const likes = request.body.likes;
	const updatedLikes = {
		likes,
	};
	const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, updatedLikes, { new: true });

	response.json(updatedBlog);
});

module.exports = blogsRouter;
