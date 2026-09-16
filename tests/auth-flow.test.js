import { describe, it, expect, beforeEach } from "vitest"
import request from 'supertest'
import app from '../app.js'
import { createTestUser, resetDatabase } from "./setup"

describe('POST /auth/register', () => {
    beforeEach(async () => {
        await resetDatabase()
    })

    it('berhasil mendaftar user baru', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ email: 'baru@test.com', password: 'rahasia123' })
        expect(res.status).toBe(201)
        expect(res.body.user.email).toBe('baru@test.com')
    })

    it('tidak mengembalikan password_hash', async () => {
        // todo1: daftar, lalu pastikan res.body.user TIDAK punya password_hash]
        const res = await request(app).post('/auth/register').send({ email: 'baru@test.com', password: 'rahasia123' })

        console.log('status:', res.status)
        console.log('body:', JSON.stringify(res.body))
        expect(res.body.user).not.toHaveProperty('password_hash')
    })

    it('menolak email yang sudah terdaftar', async () => {
        // todo2: daftar 2x dengan email yang sama -> 409
        const payload = { email: 'baru@test.com', password: 'rahasia123' }

        await request(app).post('/auth/register').send(payload)

        const res = await request(app)
            .post('/auth/register')
            .send(payload)
        
        expect(res.status).toBe(409)
    })

    it('menolak password kurang dari 8 karakter', async () => {
        // todo3: -> 400
        const res = await request(app)
            .post('/auth/register')
            .send({ email: 'baru@test.com', password: 'rahasia' })
        
        expect(res.status).toBe(400)
    })
})

describe('POST /auth/login', () => {
    beforeEach(async () => {
        await resetDatabase()
        await createTestUser('user@test.com', 'rahasia123')
    })

    it('berhasil login dengan kredensial benar', async () => {
        // todo4: -> 200, res.body punya property token
        const res = await request(app)
            .post('/auth/login')
            .send({ email: "user@test.com", password: "rahasia123" })
            
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('token')
    })

    it('menolak password salah', async () => {
        // todo5: -> 401
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'user@test.com', password: 'salah_password' })
        
        expect(res.status).toBe(401)
    })

    it('pesan error sama untuk password salah dan email tidak ada', async () => {
        // todo7: jalankan keduanya, bandingkan res.body.error
        // expect(resA.body.error).toBe(resB.body.error)
        const resA = await request(app)
            .post('/auth/login')
            .send({ email: 'user@test.com', password: 'rahasia'})
        const resB = await request(app)
            .post('/auth/login')
            .send({ email: 'notuser@test.com', password: 'rahasia123' })
        
        expect(resA.status).toBe(401)
        expect(resB.status).toBe(401)
        expect(resA.body.error).toBe(resB.body.error)
    })
})