import express from 'express'
import * as controller from '../controllers/movies.js'
import { requireAuth } from '../middleware/auth.js'

// console.log('requireAuth:', typeof requireAuth)
// console.log('createMovie:', typeof controller.createMovie)

const router = express.Router()

router.get('/', controller.getAllMovies)
router.get('/:id', controller.getMovieById)
router.post('/', requireAuth, controller.createMovie)
router.put('/:id', requireAuth, controller.updateMovie)
router.delete('/:id', requireAuth, controller.deleteMovie)

export default router