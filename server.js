import express from 'express'
import { read } from 'node:fs'
import fs from 'node:fs/promises'

const app = express()
const DATA_FILE = './data.json'

async function readMovies() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch (err) {
    return []
  }
}

async function writeMovies(movies) {
  await fs.writeFile(DATA_FILE, JSON.stringify(movies, null, 2))
}

let writeQueue = Promise.resolve()
async function withLock(fn) {
  const result = writeQueue.then(fn)
  writeQueue = result.catch(() => {})
  return result
}

// logger- cetak method and path, lalu next()
app.use((req, res, next) => {
  console.log(`[LOG] ${req.method} ${req.path}`)
  next()
})

// express.json() untuk parsing body
app.use(express.json())

// middleware yang menambahkan waktu proses
app.use((req, res, next) => {
  const start = Date.now()

  // event finish dipanggil otomatis oleh node.js saat respon selesai dikirim ke klien
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`[PERFORMANCE] ${req.method} ${req.path} selesai dalam ${duration}ms`)
  })

  next()
})


app.get('/', (req, res) => {
  res.json({ message: 'API berjalan' })
})

// GET /movies
app.get('/movies', async (req, res) => {
  const movies = await readMovies()
  res.json(movies)
})

// GET /movies/:id
app.get('/movies/:id', async (req, res) => {
  // ambil id dari req.params.id dan ubah ke tipe angka
  const id = Number(req.params.id)

  // validasi yang bukan angka -> 400 bad request
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID harus berupa angka' })
  }

  // cari filmnya
  const movies = await readMovies()
  const movie = movies.find(m => m.id === id)

  if (!movie) {
    return res.status(404).json({ error: 'Film tidak ditemukan' })
  }

  // kalau ketemu
  res.json(movie)
})

// POST
app.post('/movies', async (req, res) => {
  const { title, year } = req.body
  // validasi req.body.title and req.body.year
  // tidak ada JSON.parse, tidak ada try/catch - express.json sudah menanganinya
  if (!title || !year || typeof year !== 'number') {
    return res.status(400).json({ error: 'Title dan year tidak boleh kosong, dan year haruslah number.' })
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
  
  // responsstates created
  res.status(201).json(newMovie)

})

// PUT /movies/:id
app.put('/movies/:id', async (req, res) => {
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
})

// DELETE /movies/:id
app.delete('/movies/:id', async (req, res) => {
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
})

app.use((err, req, res, next) => {
  console.log(err)

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Body harus JSON valid' })
  }

  res.status(500).json({ error: 'Terjadi kesalahan pada server' })
})

app.listen(7200, () => {
  console.log('Server berjalan di http://localhost:7200')
})