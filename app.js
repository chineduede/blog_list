const express = require('express')
const logger = require('./utils/logger')
require('express-async-errors')
const cors = require('cors')
const middleware = require('./utils/middlewares')
const mongoose = require('mongoose')
const blogRouter = require('./controllers/blogController')
const userRouter = require('./controllers/userController')
const loginRouter = require('./controllers/loginController')
const config = require('./utils/config')
const morgan = require('morgan')

const app = express()

logger.info('connecting to ', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
        logger.info('connected to mongodb')
    })
    .catch((error) => {
        logger.error('error connecting to mongodb', err.message)
    })

app.use(cors())
app.use(morgan('dev'))
app.use(middleware.retrieveToken)
app.use(middleware.userExtractor)
app.use(express.json())

app.use('/api/users', userRouter)
app.use('/api/blogs', blogRouter);
app.use('/api/login', loginRouter)
app.use(middleware.errorHandler)

module.exports = app