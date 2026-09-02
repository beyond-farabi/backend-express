import express from "express"
import moviesRouter from './routes/movies.js'
import { logger, timer } from './middleware/logger.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(logger)
app.use(express.json()) // ini untuk parsing body JSON
app.use(timer)

app.get('/', (req, res) => {
    res.json({ message: 'API berjalan' })
})

app.use('/movies', moviesRouter)

app.use(errorHandler)

export default app