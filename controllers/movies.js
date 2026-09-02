import { readMovies, writeMovies, withLock } from "../data/movies.js";

export async function getAllMovies(req, res) {
    const movies = await readMovies()
    res.json(movies)
}

export async function getMovieById(req, res) {
    const id = Number(req.params.id)
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID harus berupa angka' })
    }

    const movies = await readMovies()
    const movie = movies.find(m => m.id === id)

    if (!movie) {
        return res.status(404).json({ error: 'Film tidak ditemukan' })
    }

    // kalau ketemu
    res.json(movie)
}

export async function createMovie(req, res) {
    const { title, year } = req.body
    
    // validasi req.body.title and req.body.year
    // tidak ada JSON.parse, tidak ada try/catch - express.json sudah menanganinya
    if (!title || !year || typeof year !== 'number') {
        return res.status(400).json({ error: 'Title dan year tidak boleh kosong, dan year haruslah number' })
    }

    // pakai withLock seperti sebelumnya
    // baca movies, buat film baru, simpan 
    const newMovie = await withLock(async () => {
        const movies = await readMovies()

        // generate ID baru
        const maxId = movies.length > 0 ? Math.max(...movies.map(m => m.id)) : 0
        const movie = {
            id: maxId + 1,
            title,
            year
        }

        movies.push(movie)
        await writeMovies(movies)
        return movie
    })

    // respons state created
    res.status(201).json(newMovie)
}

export async function updateMovie(req, res) {
    const id = Number(req.params.id)
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID harus berupa angka' })
    }

    const { title, year } = req.body
    if (!title || !year || typeof year !== 'number') {
        return res.status(400).json({ error: 'Data film tidak valid' })
    }

    const updatedMovie = await withLock(async () => {
        const movies = await readMovies()
        const index = movies.findIndex(m => m.id === id)

        if (index === -1) return null

        // update data film
        movies[index] = { id, title, year }
        await writeMovies(movies)
        return movies[index]
    })

    if (!updatedMovie) {
        return res.status(404).json({ error: 'Film tidak ditemukan' })
    }

    res.json(updatedMovie)
}

export async function deleteMovie(req, res) {
    const id = Number(req.params.id)

    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID harus berupa angka' })
    }

    // eksekusi dalam withLock
    const isDeleted = await withLock(async () => {
        const movies = await readMovies()
        const index = movies.findIndex(m => m.id === id)

        if (index === -1) return false

        // hapus film dari array
        movies.splice(index, 1)

        await writeMovies(movies)
        return true
    })

    if (!isDeleted) {
        return res.status(404).json({ error: "Film tidak ditemukan" })
    }

    return res.status(204).end()
}