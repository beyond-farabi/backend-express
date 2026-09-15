import { pool } from '../db/pool.js'
import bcrypt from 'bcrypt'

export async function resetDatabase() {
    await pool.query('TRUNCATE movies, users RESTART IDENTITY CASCADE')
}

export async function createTestUser(email='test@test.com', password='rahasia123') {
    const hash = await bcrypt.hash(password, 10)
    const result = await pool.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
        [email, hash] 
    )
    return result.rows[0]
}