import { pool } from '../db/pool.js'

export async function findAll({ page = 1, limit = 10, search = '' }) {
  const offset = (page - 1) * limit
  const searchPattern = `%${search}%`

  const result = await pool.query(
    `SELECT movies.*, users.email AS owner_email
     FROM movies
     JOIN users ON movies.user_id = users.id
     WHERE movies.title ILIKE $1
     ORDER BY movies.id DESC
     LIMIT $2 OFFSET $3`,
    [searchPattern, limit, offset]
  )

  const countResult = await pool.query(
    'SELECT COUNT(*) FROM movies WHERE title ILIKE $1',
    [searchPattern]
  )

  const total = Number(countResult.rows[0].count)

  return {
    movies: result.rows,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit)
  }
}

export async function findById(id) {
    const result = await pool.query('SELECT * FROM movies WHERE id = $1', [id])
    return result.rows[0]
}

export async function create(title, year, userId) {
    const result = await pool.query('INSERT INTO movies (title, year, user_id) VALUES ($1, $2, $3) RETURNING *', [title, year, userId])
    return result.rows[0]
}

export async function update(id, title, year, userId) {
    // todo: tambahkan and user_id = $4 di WHERE
    const result =await pool.query('UPDATE movies SET title=$2, year=$3 WHERE id=$1 AND user_id = $4 RETURNING *', [id, title, year, userId])
    return result.rows[0]
}

export async function remove(id, userId) {
    // tambahkan AND user_id = $2 di WHERE
    const result = await pool.query('DELETE FROM movies WHERE id=$1 AND user_id = $2 RETURNING id', [id, userId])
    return result.rows[0]

}

