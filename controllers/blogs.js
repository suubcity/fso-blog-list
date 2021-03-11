const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

blogsRouter.get('/', async (req, res) => {
	console.log('getting');
	const blogs = await Blog.find({}).populate('user');
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
