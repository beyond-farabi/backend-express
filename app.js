import express from "express"
import moviesRouter from './routes/movies.js'
import { logger, timer } from './middleware/logger.js'
import { errorHandler } from './middleware/errorHandler.js'
import authRouter from './routes/auth.js'
import cors from 'cors'

const app = express()

app.set('etag', false)

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173']
}))

app.use(logger)
app.use(express.json()) // ini untuk parsing body JSON
app.use(timer)

app.get('/', (req, res) => {
    res.json({ message: 'API berjalan' })
})

app.use('/auth', authRouter)

app.use('/movies', moviesRouter)


app.use(errorHandler)

export default app