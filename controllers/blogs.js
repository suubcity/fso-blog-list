const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

blogsRouter.get('/', async (req, res) => {
	const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
	res.json(blogs);
});

//get one
blogsRouter.get('/:id', async (req, res) => {
	const id = req.params.id;
	const blogs = await Blog.findById(id).populate('user', { username: 1, name: 1 });
	res.json(blogs);
});

blogsRouter.post('/', async (req, res) => {
	const decodedToken = jwt.verify(req.token, process.env.SECRET);

	if (!decodedToken || !decodedToken.id) {
		return res.status(401).json({ error: 'token missing or invalid' });
	}

	//from this point on we know the user is verified

	const user = await User.findById(decodedToken.id);

	const blog = new Blog(req.body);

	blog.user = user._id;

	blog.likes = blog.likes || 0;

	if (blog.title === undefined && blog.url === undefined) {
		res.status(400).json({ error: 'Blog title or url missin' });
	} else {
		const savedBlog = await blog.save();
		user.blogs = user.blogs.concat(blog._id);
		await user.save();
		res.json(savedBlog);
	}
});

blogsRouter.delete('/:id', async (req, res) => {
	const decodedToken = jwt.verify(req.token, process.env.SECRET);

	const blog = await Blog.findById(req.params.id);

	if (blog === null) {
		return res.status(204).end();
	}

	if (decodedToken.id.toString() === blog.user.toString()) {
		await Blog.findByIdAndRemove(req.params.id);
		return res.status(204).end();
	} else {
		return res.status(401).json({ error: 'invalid token' });
	}
});

blogsRouter.put('/:id', async (req, res) => {
	const id = req.params.id;

	const blog = req.body;
	delete blog.user;
	//if i didn't delete blog user there was an error

	const updatedBlog = await Blog.findByIdAndUpdate(id, blog, { new: true });

	res.json(updatedBlog);
});

module.exports = blogsRouter;
