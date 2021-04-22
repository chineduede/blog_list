const Blog = require('../models/blog')
const User = require('../models/users')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const blogSample = require('./random/blogsExample')
const helper = require('./helper_funcs')

const api = supertest(app)

beforeEach(async () => {
	await Blog.deleteMany()
	await Blog.insertMany(blogSample.blogs)
	await User.deleteMany()
	await User.insertMany(helper.sampleUsers)
})


test('check correct amount of blogs are returned', async () => {
	const returnedBlogs = await api
		.get('/api/blogs')
		.expect(200)
		.expect('Content-Type', /application\/json/)

	expect(returnedBlogs.body).toHaveLength(blogSample.blogs.length)
})

test('check a returned note has an id property', async () => {
	const returnedBlogs = await api.get('/api/blogs')
	const checkBlog = returnedBlogs.body[0]

	expect(checkBlog.id).toBeDefined()
})



describe('blog creation by authorized users', () => {

	test('a new blog can be created by authorized and logged in users', async () => {

		const uncreatedBlog = {
			title: "On life and its idiosyncracies",
			author: "Chinedu .P. Ede",
			url: "http://www.onlife.com",
			likes: 29
		}
		
		const randomUser = await helper.randomUser()

		const newBlog = await api
			.post('/api/blogs')
			.send(uncreatedBlog)
			.set('Authorization', `Bearer ${randomUser.token}`)
			.expect(201)
			.expect('Content-Type', /application\/json/)
	
		const returnedBlogs = await helper.blogsInDb()
	
		expect(returnedBlogs).toHaveLength(blogSample.blogs.length + 1)
	
		const newBlogCred = newBlog.body

		expect(newBlogCred.author).toBe(randomUser.username)
		expect(newBlogCred.user).toBe(randomUser.id)
		
		
	})

	test('a new blog cannot be created by unauthorized users', async () => {
		const blogsBefore = await helper.blogsInDb()

		const newBlog = {
			title: "On life and its idiosyncracies",
			author: "Chinedu .P. Ede",
			url: "http://www.onlife.com",
			likes: 29
		}
			
		const response = await api
			.post('/api/blogs')
			.send(newBlog)
			.expect(401)

		const returnedBlogs = await helper.blogsInDb()

		expect(returnedBlogs).toHaveLength(blogsBefore.length)
		expect(response.body.error).toContain('missing or invalid token')

	})

	test('a new blog cannot be created with illegal token', async () => {
		const blogsBefore = await helper.blogsInDb()

		const unCreated = {
			title: "On life and its idiosyncracies",
			author: "Chinedu .P. Ede",
			url: "http://www.onlife.com",
			likes: 29
		}
		
		const randomUser = await helper.randomUser()

		const token = 's9s' + randomUser.token

		const response = await api
			.post('/api/blogs')
			.send(unCreated)
			.set('Authorization', `Bearer ${token}`)
			.expect(401)
			
	
		const returnedBlogs = await helper.blogsInDb()

		expect(returnedBlogs).toHaveLength(blogsBefore.length)
		expect(response.body.error).toContain('missing or invalid token')
	})
})

describe('verify likes defaults to zero', () => {

	test('verify that likes defaults to zero if not present', async () => {
		const blogsBefore = await helper.blogsInDb()

		const likelessBlog = {
			title: "likeless Blog",
			author: "Peter .C. Ede",
			url: "http://www.onlifeemptylikes.com",
		}

		const randomUser = await helper.randomUser()
	
		await api
			.post('/api/blogs')
			.send(likelessBlog)
			.set('Authorization', `Bearer ${randomUser.token}`)
			.expect(201)
			.expect('Content-Type', /application\/json/)
	
		const returnedBlogs = await helper.blogsInDb()
	
		expect(returnedBlogs).toHaveLength(blogsBefore.length + 1)

		const newlyCreated = returnedBlogs.filter(blog => blog.title === "likeless Blog")[0]
		expect(newlyCreated.likes).toBe(0)
	})
})

describe('cant create blog withot author or title', () => {

	test('verify 400 response on creation of blog without title', async () => {

		const authorlessBlog = {
			url: "http://www.onlifeemptylikes.com",
		}

		const randomUser = await helper.randomUser()
	
		await api
			.post('/api/blogs')
			.send(authorlessBlog)
			.set('Authorization', `Bearer ${randomUser.token}`)
			.expect(400)
	
		const returnedBlogs = await helper.blogsInDb()
		expect(returnedBlogs).toHaveLength(blogSample.blogs.length)
	})
})

describe('verify only the user that created a blog can update or delete it', () => {

	test('verify 204 response on deletion of blog by the creator', async () => {

		const randomUser = await helper.randomUser()
		const newBlog = {
			title: "On life and its idiosyncracies",
			url: "http://www.onlife.com",
			likes: 29
		}
		
		const createdBlog = await api
			.post('/api/blogs')
			.send(newBlog)
			.set('Authorization',`Bearer ${randomUser.token}`)
		
		const afterCreate = await helper.blogsInDb()

		await api
			.delete(`/api/blogs/${createdBlog.body.id}`)
			.set('Authorization', `Bearer ${randomUser.token}`)
			.expect(204)

		const afterDelete = await helper.blogsInDb()
		
		expect(afterDelete).toHaveLength(afterCreate.length - 1)
		expect(afterDelete.map(r => r.id)).not.toContain(createdBlog.body.id)
	})

	test('a user with valid token cannot delete a blog he did not create', async () => {
		
		const randomUser = await helper.randomUser()
		const secondRandomUser = await helper.secondRandomUser()
		
		const newBlog = {
			title: "On life and its idiosyncracies",
			author: "Chinedu .P. Ede",
			url: "http://www.onlife.com",
			likes: 29
		}

		const createdBlog = await api
			.post('/api/blogs')
			.send(newBlog)
			.set('Authorization', `Bearer ${randomUser.token}`)
			
		const afterCreate = await helper.blogsInDb()

		await api
			.delete(`/api/blogs/${createdBlog.body.id}`)
			.send('Authorization', `Bearer ${secondRandomUser.token}`)
			.expect(401)

		const afterFailedDelete = await helper.blogsInDb()

		expect(afterCreate).toHaveLength(afterFailedDelete.length)
		expect(afterFailedDelete.map(r => r.id)).toContain(createdBlog.body.id)

	})
})

test('verify that an update of likes updates a document and can be done by an authorized user', async () => {

	const randomUser = await helper.randomUser()
	
	const newBlog = {
		title: "On life and its idiosyncracies",
		url: "http://www.onlife.com",
		likes: 29
	}
	const updatelikes = {
		likes: 290
	}
	
	const createdBlog = await api
		.post('/api/blogs')
		.send(newBlog)
		.set('Authorization',`Bearer ${randomUser.token}`)
	
	const afterCreate = await helper.blogsInDb()

	await api
		.put(`/api/blogs/${createdBlog.body.id}`)
		.send(updatelikes)
		.set('Authorization', `Bearer ${randomUser.token}`)
		.expect(200)
		.expect('Content-Type', /application\/json/)

	const afterUpdate = await helper.blogsInDb()

	const updatedBlog = afterUpdate.filter(b => b.title === newBlog.title)[0]
	expect(updatedBlog.likes).toBe(updatelikes.likes)

})


afterAll(() => {
	mongoose.connection.close()
})