import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../app.js'
import { resetDatabase, createTestUser } from './setup'

describe('DELETE /movies/:id - otorisasi', () => {
    let tokenUser1, tokenUser2, movieId

    beforeEach(async () => {
        await resetDatabase()

        await createTestUser('user1@test.com', 'rahasia123')
        await createTestUser('user2@test.com', 'rahasia123')

        // todo: login user1, simpan ke tokenUser1
        const resUser1 = await request(app).post('/auth/login').send({ email: 'user1@test.com', password: 'rahasia123' })

        tokenUser1 = resUser1.body.token

        // todo: login user2, simpan ke tokenUser2
        const resUser2 = await request(app).post('/auth/login').send({ email: 'user2@test.com', password: 'rahasia123' })

        // todo: buat film dengan tokenUser1, simpan res.body.id ke movieId
        tokenUser2 = resUser2.body.token

        const resMovie = await request(app)
            .post('/movies')
            .set('Authorization', `Bearer ${tokenUser1}`)
            .send({ title: 'Film milik user1', year: 2026 })
        movieId = resMovie.body.id
    })

    it('pemilik bisa menghapus filmnya', async () => {
        // todo: delete /movies/${movieId} dengan token user1 -> 204
        const res = await request(app)
            .delete(`/movies/${movieId}`)
            .set('Authorization', `Bearer ${tokenUser1}`)
        
    })

    it('user lain tidak bisa menghapus', async () => {
        // todo: delete dengan token user2 -> 404
        const res = await request(app).delete(`/movies/${movieId}`).set('Authorization', `Bearer ${tokenUser2}`)

        expect(res.status).toBe(404)
    })

    it('film tetap ada setelah percobaan gagal', async () => {
        // todo: delete dengan tokenUser2
        // lalu GET /movies/${movieId} -> status 200
        await request(app).delete(`/movies/${movieId}`).set('Authorization', `Bearer ${tokenUser2}`)

        const res = await request(app).get(`/movies/${movieId}`)

        expect(res.status).toBe(200)
    })
})