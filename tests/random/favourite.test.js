const favouriteBlog = require('../../utils/list_helpers').favouriteBlog
const { blogs } = require('./blogsExample')

describe('favouriteBlog', () => {
	test('return the blog with the most likes', () => {
		expect(favouriteBlog(blogs)).toEqual(		{
			title: "Canonical string reduction",
			author: "Edsger W. Dijkstra",
			likes: 12,
		})
	})
})