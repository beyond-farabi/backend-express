import express from 'express'
import * as controller from '../controllers/auth.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', controller.register)
router.post('/login', controller.login)

router.get('/me', requireAuth, controller.me)

export default router