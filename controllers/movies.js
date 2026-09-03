import * as db from '../data/movies.js'

export async function getAllMovies(req, res) {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const search = req.query.search || ''

    const result = await db.findAll({ page, limit, search })
    res.json(result)
}

export async function getMovieById(req, res) {
    const id = Number(req.params.id)
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID harus berupa angka' })
    }

    const movie = await db.findById(id)
    if (!movie) {
        return res.status(404).json({ error: 'Film tidak ditemukan' })
    }

    res.json(movie)
}

export async function createMovie(req, res) {
    const { title, year } = req.body
    if (!title || typeof year !== 'number') {
        return res.status(400).json({ error: 'Title wajib diisi dan year harus angka' })
    }

    const movie = await db.create(title, year)
    res.status(201).json(movie)
}

export async function updateMovie(req, res) {
    try {
        const { id } = req.params
        const { title, year } = req.body

        // validasi input
        if (!title || !year || typeof year !== 'number') {
            return res.status(400).json({ message: 'Title dan year wajib diisi serta year harus angka' })
        }

        // jalankan update ke database
        const updatedMovie = await db.update(id, title, year)

        if (!updatedMovie) {
            return res.status(404).json({ message: 'Movie tidak ditemukan' })
        }

        // kirim respon sukses
        return res.status(200).json({ message: 'Movie berhasil diperbaharui', data: updatedMovie})
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

export async function deleteMovie(req, res) {
    try {
        const { id } = req.params

        // jalankan hapus dari database
        const deletedMovie = await db.remove(id)

        // jika db.remove returns undefined
        if (!deletedMovie) {
            return res.status(404).json({ message: 'Movie tidak ditemukan' })
        }

        // kirim respons sukses
        return res.status(200).json({
            message: 'Movie berhasil dihapus',
            data: deletedMovie
        })


    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}
