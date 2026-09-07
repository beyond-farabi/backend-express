import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization

    // guard clause - kalau header tidak ada tidak diawali 'Bearer' -> 401
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Header harus ada dan diawali dengan dengan bearer" })
    }

    const token = authHeader.split(' ')[1]

    try {
        // verifikasi token
        const payload = jwt.verify(token, process.env.JWT_SECRET)

        // simpan userId ke req supaya controller bisa memakainya
        req.userId = payload.userId

        return next()

    } catch (err) {
        // token tidak valid/kadaluarsa
        res.status(401).json({ err: 'Token tidak valid/kadaluarsa' })
    }
}