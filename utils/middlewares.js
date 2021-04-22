const logger = require('./logger');
const jwt = require('jsonwebtoken')
const config = require('../utils/config')

const errorHandler = (error, request, response, next) => {
	logger.error(error.message)

	if (error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message })
	} else if (error.name === 'JsonWebTokenError') {
		return response.status(401).json({error: 'missing or invalid token'})
	} else if (error.name === 'TokenExpiredError') {
		return response.status(401).json({error: 'token expired'})
	}
	next(error)
}

const retrieveToken = (request, response, next) => {

	const authorization = request.get('authorization')
	if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
		request.token =  authorization.substring(7)
	} else {
		request.token = null
	}

	next()
}

const userExtractor = async (request, response, next) => {
	const verifiedUser = (request.token === null ) 
	? null
	: await jwt.verify(request.token, config.SECRET)

	request.user = verifiedUser

	next()
}

module.exports = {
	errorHandler,
	retrieveToken,
	userExtractor
}