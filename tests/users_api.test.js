const User = require('../models/users')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./helper_funcs')

const api = supertest(app)

beforeEach(async () => {
	await User.deleteMany()
	await User.insertMany(helper.sampleUsers)
})

describe('users can be created and returned', () => {

	test('all users are returned', async () => {

		const returnedUsers = await api
			.get('/api/users')
			.expect(200)
			.expect('Content-Type', /application\/json/)

		expect(returnedUsers.body).toHaveLength(helper.sampleUsers.length)
	})

	test('a new user can be created and returned', async () => {

		const usersBefore = await helper.usersInDb()
		const newUser = {
			name: 'john',
			username: 'morriati',
			password: 'johnmorriati'
		}

		const returnedUser = await api
			.post('/api/users')
			.send(newUser)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		const usersAfter = await helper.usersInDb()

		expect(usersAfter).toHaveLength(usersBefore.length + 1)
		expect(usersAfter.map(u => u.username)).toContain(returnedUser.body.username)
	})
})

describe('invalid user not created and proper error message returned', () => {

	test('check that a username must be unique', async () => {
		const usersBefore = await helper.usersInDb()
		const aUserInDb = usersBefore[0]

		const repeatUsername = {
			name: 'limitless',
			password: 'test123',
			username: aUserInDb.username
		}

		const response = await api
			.post('/api/users')
			.send(repeatUsername)
			.expect(400)

		const usersAfter = await helper.usersInDb()
		expect(usersBefore).toHaveLength(usersAfter.length)
		expect(response.body.error).toContain('`username` to be unique')
	})

	test('check that a user without username is not created', async () => {
		const usersBefore = await helper.usersInDb()

		const invalidUsername = {
			name: 'limitless',
			password: 'test123'
		}

		const response = await api
			.post('/api/users')
			.send(invalidUsername)
			.expect(400)

		const usersAfter = await helper.usersInDb()
		expect(usersBefore).toHaveLength(usersAfter.length)
		expect(response.body.error).toContain('`username` is required')
	})

	test('check that a user with username with length less than 3 is not created', async () => {
		const usersBefore = await helper.usersInDb()
		const invalidUsername = {
			name: 'limitless',
			password: 'test123',
			username: 'ab'
		}

		const response = await api
			.post('/api/users')
			.send(invalidUsername)
			.expect(400)

		const usersAfter = await helper.usersInDb()
		expect(usersBefore).toHaveLength(usersAfter.length)
		expect(response.body.error).toContain("User validation failed: username: Path `username` (`ab`) is shorter than the minimum allowed length (3).")
	})

	test('check that a user without password is not created', async () => {
		const usersBefore = await helper.usersInDb()
		const invalidPassword = {
			name: 'limitless',
			username: 'invaliduser'
		}
		const response = await api
			.post('/api/users')
			.send(invalidPassword)
			.expect(400)

		const usersAfter = await helper.usersInDb()
		expect(usersBefore).toHaveLength(usersAfter.length)
		expect(response.body.error).toContain("User validation failed: password: Path `password` is required.")
	})

	test('check that a user with password length less than 3 is not created', async () => {
		const usersBefore = await helper.usersInDb()
		const invalidPassword = {
			name: 'limitless',
			username: 'invaliduser',
			password: 'ab'
		}
		const response = await api
			.post('/api/users')
			.send(invalidPassword)
			.expect(400)
		const usersAfter = await helper.usersInDb()
		expect(usersBefore).toHaveLength(usersAfter.length)
		expect(response.body.error).toContain("password must be at least three characters")
	})
})

describe('an invalid user cannot login and gets the right error message', () => {

	test('a user with invalid username cannot login', async () => {

		const invalidUser = {
			username: 'nameNotInDb',
			password: 'wrongPassword'
		}
		const response = await api
			.post('/api/login')
			.send(invalidUser)
			.expect(401)
		
			expect(response.body.error).toContain('Invalid username or password')
	})

	test('a valid user with the wrong password cannot login', async () => {

		const usersInDb  = await helper.usersInDb()
		const randomUser = usersInDb[0]
		const invalidUser = {
			username: randomUser.username,
			password: 'wrongPassword'
		}

		const response = await api
			.post('/api/login')
			.send(invalidUser)
			.expect(401)

		expect(response.body.error).toContain('Invalid username or password')
	})
})

test('a valid receives a token', async () => {

	const userCred = {
		username: 'averynewuser',
		name: 'averynewuser',
		password: 'test123'
	}

	const newUser = await api	
		.post('/api/users')
		.send(userCred)
	
	let newUserCred = newUser.body

	const loginCred = await api	
		.post('/api/login')
		.send({username: newUserCred.username, password: userCred.password})
		.expect(200)

	expect(loginCred.body.token).toBeDefined()
})

test('an invalid user does not receive a token', async () => {
	const userCred = {
		username: 'testuser',
		name: 'testuser',
		password: 'test123'
	}

	const response = await api	
		.post('/api/login')
		.send({username: userCred.username, password: userCred.password})
		.expect(401)

	expect(response.body.token).not.toBeDefined()
	expect(response.body.error).toContain('Invalid username or password')
})

afterAll(() => {
	mongoose.connection.close()
})