const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

userSchema = new mongoose.Schema({
	username : {
		type: String,
		unique: true,
		required: true,
		minLength: 3
	},
	name: String,
	password: {
		type: String,
		required: true
	},
	blogs: [{
		ref: 'Blog',
		type: mongoose.Schema.Types.ObjectId,
	}],
})

userSchema.set('toJSON', {
	transform: (document, returnedObj) => {
		returnedObj.id = document._id.toString()
		delete returnedObj._id
		delete returnedObj.__v
		delete returnedObj.password
	}
})

userSchema.plugin(uniqueValidator)

module.exports = mongoose.model('User', userSchema)