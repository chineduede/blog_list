const bcrypt = require('bcrypt')
const User = require('../models/users')
const jwt = require('jsonwebtoken')
const router = require('express').Router()
const config = require('../utils/config')

router.post('/', async (request, response) => {
	const body = request.body

	const user = await User.findOne({ username: body.username })
	
	const passwordCheck = (user === null) 
		? false 
		: await bcrypt.compare(body.password, user.password )

	if (!(user && passwordCheck)) {
		response.status(401).json({error: 'Invalid username or password'})
	}

	const userToToke = {
		username: user.username,
		id: user._id
	}

	const token = await jwt.sign(userToToke, config.SECRET, {expiresIn: 60*60})

	response
		.status(200)
		.json({
			token,
			username: user.username,
			name: user.name
	  })

})

module.exports = router

