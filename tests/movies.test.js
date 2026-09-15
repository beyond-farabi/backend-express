import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../app.js'

describe('GET /movies', () => {
  it('mengembalikan status 200', async () => {
    const res = await request(app).get('/movies')
    expect(res.status).toBe(200)
  })

  it('mengembalikan objek dengan properti movies', async () => {
    const res = await request(app).get('/movies')
    expect(res.body).toHaveProperty('movies')
    expect(Array.isArray(res.body.movies)).toBe(true)
  })

  it('menghormati parameter limit', async () => {
    const res = await request(app).get('/movies?limit=3')
    expect(res.body.movies.length).toBeLessThanOrEqual(3)
  })
})