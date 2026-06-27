import imageCompression from 'browser-image-compression'
import { auth } from './firebase.js'

const WORKER_URL = import.meta.env.VITE_R2_WORKER_URL

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 5

/**
 * Validate, compress (client-side), then upload an image to Cloudflare R2 via
 * the Cloudflare Worker. Returns the public URL string to store in Realtime DB.
 *
 * @param {File} file
 * @param {(percent:number)=>void} [onProgress]
 * @param {string} [folder] logical folder, e.g. 'berita' | 'sub-ranting' | 'pengurus' | 'beranda'
 * @returns {Promise<string>} public URL of the uploaded file
 */
export async function uploadImage(file, onProgress = () => {}, folder = 'umum') {
  if (!file) throw new Error('Tidak ada file yang dipilih.')
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Tipe file tidak diizinkan. Gunakan JPG, PNG, atau WEBP.')
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024 * 4) {
    throw new Error('Ukuran file terlalu besar (maksimum 20MB sebelum kompresi).')
  }

  onProgress(5)

  // ---- Client-side compression / resize ----
  const compressed = await imageCompression(file, {
    maxSizeMB: 1.2,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp',
  })
  onProgress(30)

  // ---- Auth: send Firebase ID token so the Worker can verify admin ----
  const user = auth.currentUser
  if (!user) throw new Error('Anda harus login sebagai admin untuk mengunggah.')
  const idToken = await user.getIdToken()

  const form = new FormData()
  const safeName = `${folder}/${Date.now()}-${slugifyFileName(file.name)}.webp`
  form.append('file', compressed, safeName)
  form.append('key', safeName)

  onProgress(45)

  const res = await fetch(`${WORKER_URL}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` },
    body: form,
  })

  onProgress(85)

  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error(`Upload gagal (${res.status}). ${msg}`)
  }

  const data = await res.json()
  onProgress(100)
  // Worker returns { url: 'https://media.example.com/berita/...' }
  return data.url
}

function slugifyFileName(name) {
  return name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}
