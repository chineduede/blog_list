const Blog = require('../models/blog')
const User = require('../models/users')
const supertest = require('supertest')
const app = require('../app')

const sampleUsers = [
	{
		username: "chndvz",
		name: "peteru",
		password: "prof1997"
	},
	{
		username: "chandus",
		name: "chinedu",
		password: "prof1998"
	},
	{
		username: "sirEd",
		name: "peter",
		password: "prof1999"
	},
]

const api = supertest(app)

async function usersInDb () {
	const returned = await User.find({})
	return returned.map(user => user.toJSON())
}

async function blogsInDb() {
	const returned = await Blog.find({})
	return returned.map(user => user.toJSON())
}

async function randomUser () {

	const userCred = {
		username: 'testuser',
		name: 'testuser',
		password: 'test123'
	}

	const newUser = await api	
		.post('/api/users')
		.send(userCred)
	
	let newUserCred = newUser.body

	const loginCred = await api	
		.post('/api/login')
		.send({username: newUserCred.username, password: userCred.password})


	const username = loginCred.body.username
	const id = newUserCred.id
	const token = loginCred.body.token

	return { username, id, token }
}

async function secondRandomUser () {

	const userCred = {
		username: 'testuser2',
		name: 'testuser2',
		password: 'test123'
	}

	const newUser = await api	
		.post('/api/users')
		.send(userCred)
	
	let newUserCred = newUser.body

	const loginCred = await api	
		.post('/api/login')
		.send({username: newUserCred.username, password: newUserCred.password})

	const username = newUserCred.username
	const id = newUserCred.id
	const token = loginCred.body.token

	return { username, id, token }
}

module.exports = {
	usersInDb, 
	blogsInDb,
	randomUser,
	secondRandomUser,
	sampleUsers
}