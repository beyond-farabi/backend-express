import fs from 'node:fs/promises';

const DATA_FILE = './data.json'

let writeQueue = Promise.resolve()

function withLock(fn) {
    const result = writeQueue.then(fn)
    writeQueue = result.catch(() => {})
    return result
}

export async function readMovies() {
    try {
        const raw = await fs.readFile(DATA_FILE, 'utf-8')
        return JSON.parse(raw)
    } catch (err) {
        return []
    }
}

export async function writeMovies(movies) {
    await fs.writeFile(DATA_FILE, JSON.stringify(movies, null, 2))
}

export { withLock }