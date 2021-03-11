const logger = require('./logger');

const tokenExtractor = (req, res, next) => {
	const authorization = req.get('authorization');
	if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
		req.token = authorization.substring(7);
	}
	next();
};

const errorHandler = (err, request, res, next) => {
	logger.error(err.message);

	if (err.name === 'ValidationError') {
		return res.status(400).json({ error: err.message });
	} else if (err.name === 'JsonWebTokenError') {
		res.status(401).json({ error: 'invalid token' });
	}

	next(err);
};

module.exports = {
	tokenExtractor,
	errorHandler,
};
