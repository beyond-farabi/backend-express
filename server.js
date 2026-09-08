import app from './app.js'

const PORT = 7200

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server berjalan di http://localhost:${PORT}`)
})