const User = require('../models/users')
const router = require('express').Router()
const bcrypt = require('bcrypt')

router.post('/', async (request, response) => {
	const body = request.body
	const saltRounds = 10

	let password
	if (body.password) {

		password = (body.password.length >= 3)
			? await bcrypt.hash(body.password, saltRounds)
			: false

		if (!password) {
			response.status(400).json({error : 'password must be at least three characters'})
		}	

	}

	const user = new User({
		username: body.username,
		name: body.name,
		password: password || body.password
	})

	const savedUser = await user.save()

	response.status(201).json(savedUser)

})

router.get('/', async (request, response) => {
	const users = await User.find({}).populate('blogs', {url: 1, title: 1, author: 1})

	response.json(users)
})

module.exports = router