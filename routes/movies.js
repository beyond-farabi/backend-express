import express from 'express'
import * as controller from '../controllers/movies.js'

const router = express.Router()

router.get('/', controller.getAllMovies)
router.get('/:id', controller.getMovieById)
router.post('/', controller.createMovie)
router.put('/:id', controller.updateMovie)
router.delete('/:id', controller.deleteMovie)

export default router