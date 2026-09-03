import { pool } from '../db/pool.js'

export async function findAll({ page=1, limit=10, search=''}) {
    const offset = (page - 1) * limit
    const searchPattern = `%${search}%`

    // query dengan LIMIT, OFFSET, dan pencarian ILIKE
    const moviesQuery = await pool.query(
        'SELECT * FROM movies WHERE title ILIKE $1 ORDER BY id LIMIT $2 OFFSET $3',
        [searchPattern, limit, offset]
    )

    // query untuk menghitung total seluruh data yang cocok dengan pencarian
    const countQuery = await pool.query(
        'SELECT COUNT(*) FROM movies WHERE title ILIKE $1',
        [searchPattern]
    )

    const total = Number(countQuery.rows[0].count)
    const totalPages = Math.ceil(total / limit)

    // kembalikan objek lengkap
    return {
        movies: moviesQuery.rows,
        total,
        page: Number(page),
        totalPages
    }

}

export async function findById(id) {
    const result = await pool.query('SELECT * FROM movies WHERE id = $1', [id])
    return result.rows[0]
}

export async function create(title, year) {
    const result = await pool.query('INSERT INTO movies (title, year) VALUES ($1, $2) RETURNING *', [title, year])
    return result.rows[0]
}

export async function update(id, title, year) {
    const result =await pool.query('UPDATE movies SET title=$1, year=$2 WHERE id=$3 RETURNING *', [title, year, id])
    return result.rows[0]
}

export async function remove(id) {
    const result = await pool.query('DELETE FROM movies WHERE id=$1 RETURNING id', [id])
    return result.rows[0]

}

