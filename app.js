const express = require('express');
const app = express();
const cors = require('cors');
// const mongoose = require('mongoose');

const morgan = require('morgan');
const Blog = require('./models/blog');

app.use(morgan('tiny'));

app.use(cors());
app.use(express.json());

app.get('/api/blogs', (request, response) => {
	Blog.find({}).then((blogs) => {
		response.json(blogs);
	});
});

app.post('/api/blogs', (request, response) => {
	const blog = new Blog(request.body);

	blog.save().then((result) => {
		response.status(201).json(result);
	});
});

module.exports = app;
