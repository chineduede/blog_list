const totalLikes = require('../../utils/list_helpers').totalLikes
const { listWithManyBlogs, listWithOneBlog, listWithNoBlog} = require('./blogsExample')

describe('total likes', () => {
	test('when list has only one blog, equals the likes of that', () => {
		const result = totalLikes(listWithOneBlog)
		expect(result).toBe(7)
	})

	test('of empty list is zero', () => {
		const result = totalLikes(listWithNoBlog)
		expect(result).toBe(0)
	})

	test('of a list of plenty blogs calculated right', () => {
		expect(totalLikes(listWithManyBlogs)).toBe(29)
	})
})