const mostLikes = require('../../utils/list_helpers').mostLikes
const { blogs } = require('./blogsExample')

describe('most likes', () => {
	test('writer with the most likes of all blogs', () => {
		expect(mostLikes(blogs)).toEqual({
			author: "Edsger W. Dijkstra",
			likes: 17
		})
	})
})