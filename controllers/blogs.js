const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (req, res) => {
	console.log('getting');
	const blogs = await Blog.find({}).populate('user');
	res.json(blogs);
});

blogsRouter.post('/', async (req, res) => {
	const blog = new Blog(req.body);

	const user = await User.findOne({ username: 'daveDingo' });

	blog.user = user.id;

	blog.likes = blog.likes || 0;

	if (blog.title === undefined && blog.url === undefined) {
		res.status(400).end();
	} else {
		user.blogs = user.blogs.concat(blog._id);
		await user.save();
		const savedBlog = await blog.save();
		res.json(savedBlog);
	}
});

blogsRouter.delete('/:id', async (req, res) => {
	await Blog.findByIdAndRemove(req.params.id);
	res.status(204).end();
});

blogsRouter.put('/:id', async (req, res) => {
	const likes = req.body.likes;
	const updatedLikes = {
		likes,
	};
	const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updatedLikes, { new: true });

	res.json(updatedBlog);
});

module.exports = blogsRouter;
