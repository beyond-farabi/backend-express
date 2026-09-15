import { describe, it, expect, beforeEach } from "vitest"
import request from 'supertest'
import app from '../app.js'
import { resetDatabase, createTestUser } from "./setup.js"

describe('POST /movies', () => {
  let token

  beforeEach(async () => {
    await resetDatabase()
    await createTestUser('user1@test.com', 'rahasia123')

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user1@test.com', password: 'rahasia123' })

    token = res.body.token
  })

  it('berhasil membuat film', async () => {
    const res = await request(app)
      .post('/movies')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Film Tes', year: 2026 })

    expect(res.status).toBe(201)
    expect(res.body.title).toBe('Film Tes')
  })

  it('menolak tanpa token', async () => {
    const res = await request(app)
      .post('/movies')
      .send({ title: 'Tanpa Token', year: 2026 })

    expect(res.status).toBe(401)
  })

  it('menolak token palsu', async () => {
    const res = await request(app)
      .post('/movies')
      .set('Authorization', 'Bearer token.palsu.sekali')
      .send({ title: 'Palsu', year: 2026 })

    expect(res.status).toBe(401)
  })

  it('menolak header tanpa kata Bearer', async () => {
    const res = await request(app)
      .post('/movies')
      .set('Authorization', 'token.tanpa.bearer')
      .send({ title: 'Kosong', year: 2026 })

    expect(res.status).toBe(401)
  })

  it('menolak title kosong', async () => {
    const res = await request(app)
      .post('/movies')
      .set('Authorization', `Bearer ${token}`)
      .send({ year: 2026 })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty("error")
  })

  it('menolak year berupa string', async () => {
    const res = await request(app)
      .post('/movies')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: "New Movie", year: '2026' })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty("error")
  })
})