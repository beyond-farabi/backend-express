export function logger(req, res, next) {
    console.log(`[LOG] ${req.method} ${req.path}`)
    next()
}

export function timer(req, res, next) {
    const start = Date.now()

    res.on('finish', () => {
        const duration = Date.now() - start
        console.log(`[PERFORMANCE] ${req.method} ${req.path} selesai dalam ${duration}ms`)
    })
    next()
}

