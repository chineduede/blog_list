const router =  require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/users')



router.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})
  
	response.json(blogs)
  
})

router.post('/', async (request, response) => {
	const body = request.body
	const user = request.user

	if (!user ) {
		response.status(401).json({error: 'missing or invalid token'})
	}

	const userVerified = await User.findById(user.id)

	const newBlog = new Blog({
		title: body.title,
		author: userVerified.username,
		url: body.url,
		likes: body.likes || 0,
		user: userVerified.id
	})

	const createdBlog = await newBlog.save()

	userVerified.blogs = userVerified.blogs.concat(createdBlog._id)

	await userVerified.save()

	response.status(201).json(createdBlog)
})

router.delete('/:id', async (request, response) => {

	const user = request.user
	if (!user) {
		response.status(401).json({error: 'missing or invalid token'})
	}

	const blogToDelete = await Blog.findById(request.params.id)

	if (blogToDelete.user.toString() !== user.id) {
		response.status(401).json({error: 'You are not authorized to delete this note'})
	}

	await blogToDelete.delete()

	response.status(204).end()

})

router.put('/:id', async (request, response) => {

	const user = request.user
	if (!user) {
		response.status(401).json({error: 'missing or invalid token'})
	}

	const blogToUpdate = await Blog.findById(request.params.id)
	if (blogToUpdate.user.toString() !== user.id) {
		response.status(401).json({error: 'You are not authorized to update this note'})
	}

	blogToUpdate.likes = request.body.likes

	await blogToUpdate.save()

	response.json(blogToUpdate)
})


module.exports = router