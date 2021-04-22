
const dummy = (blogs) => {
	return 1
}

const totalLikes = (blogsArray) => {
	
	const reducer = (accum, curr) => {
		return accum + curr.likes
	}
	
	return blogsArray.reduce(reducer, 0)
}

const favouriteBlog = (blogs) => {
	const reducer = (a, b) => {
		return (a.likes > b.likes)
			? {title: a.title,
				author: a.author,
				likes: a.likes}
			: {title: b.title,
				author: b.author,
			likes: b.likes}
	}
	return blogs.reduce(reducer)
}

const mostBlogs = (blogsArray) => {
	let maxObject;
	let maxNumber = -Infinity;
	
	let countedBlogs = blogsArray.reduce((allAuthors, curr) => {
		if (curr.author in allAuthors) {
			allAuthors[curr.author]++
		} else {
			allAuthors[curr.author] = 1
		}
		if (allAuthors[curr.author] > maxNumber) {
			maxNumber = allAuthors[curr.author]
			maxObject = {
				author: curr.author,
				blogs: allAuthors[curr.author]
			}
		}
		return allAuthors
	}, {})
	return maxObject
}

const mostLikes = (blogsArray) => {
	let maxObject;
	let maxNumber = -Infinity;
	
	let countedBlogs = blogsArray.reduce((allAuthors, curr) => {
		if (curr.author in allAuthors) {
			allAuthors[curr.author] += curr.likes
		} else {
			allAuthors[curr.author] = curr.likes
		}
		if (allAuthors[curr.author] > maxNumber) {
			maxNumber = allAuthors[curr.author]
			maxObject = {
				author: curr.author,
				likes: allAuthors[curr.author]
			}
		}
		return allAuthors
	}, {})
	return maxObject
}

module.exports = {
	dummy,
	totalLikes,
	favouriteBlog,
	mostBlogs,
	mostLikes
}					