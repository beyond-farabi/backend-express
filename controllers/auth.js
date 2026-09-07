import bcrypt from 'bcrypt'
import * as db from '../data/users.js'
import jwt from 'jsonwebtoken'

export async function register(req, res) {
    try {
        const { email, password } = req.body

        // validasi: email dan password wajib ada, dan password minimal 8 karakter
        if (!email || !password || password.length < 8) {
            return res.status(400).json({ error: 'email dan password wajib diisi. Password minimal 8 karakter'})
        }

        // cek email apakah sudah terdaftar
        const existingUser = await db.findByEmail(email)
        if (existingUser) {
            return res.status(409).json({ error: 'Email sudah terdaftar' })
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10) // 10 means 10 rounds of hashing

        // simpan ke database dan kirim respons
        const newUser = await db.createUser(email, hashedPassword)

        return res.status(201).json({
            message: 'Registrasi berakhir',
            user: {
                id: newUser.id,
                email: newUser.email
            }
        }) 

    } catch (err) {
        console.error('Register gagal:', err)
        return res.status(500).json({ error: 'Terjadi kesalahan pada server' })
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body

        // validasi email dan password ada
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password wajib diisi' })
        }

        // cari user berdasarkan email
        const user = await db.findByEmail(email)

        // varifikasi password (gunakan guard clause jika user tidak ditemukan)
        const match = user ? await bcrypt.compare(password, user.password_hash) : false
        
        // jika user tidak ada dan password salah
        if (!user || !match) {
            return res.status(401).json({ error: 'Email atau password salah' })
        }

        // buat token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )

        // kirim token
        return res.json({ token })

    } catch (err) {
        return res.status(500).json({ error: 'Terjadi kesalahan pada server' })
    }
}
    