const mongoose = require('mongoose');
const config = require('../utils/config');

mongoose
	.connect(config.MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	})
	.then(console.log('Connected to MongoDB'));

const blogSchema = new mongoose.Schema({
	title: String,
	author: String,
	url: String,
	likes: Number,
});

module.exports = mongoose.model('Blog', blogSchema);
