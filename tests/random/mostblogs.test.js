const mostBlogs = require('../../utils/list_helpers').mostBlogs
const { blogs }  = require('./blogsExample')

describe('most blogs', () => {
	test('writer with the most blogs', () => {
		expect(mostBlogs(blogs)).toEqual({
			author: "Robert C. Martin",
			blogs: 3
		})

	})
})