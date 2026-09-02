export function errorHandler(err, req, res, next) {
    console.error(err)

    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Body harus json valid' })
    }

    res.status(500).json({ error: 'Terjadi kesalahan pada server' })
}