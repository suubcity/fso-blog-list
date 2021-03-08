const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		unique: true,
		required: true,
	},
	name: String,
	passwordHash: String,
});

userSchema.plugin(uniqueValidator);

userSchema.set('toJSON', {
	transform: (doc, ret) => {
		ret.id = ret._id.toString();
		delete ret._id;
		delete ret.__v;
		delete ret.passwordHash;
	},
});

const User = mongoose.model('User', userSchema);

module.exports = User;
