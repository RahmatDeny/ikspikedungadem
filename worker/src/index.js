/**
 * Cloudflare Worker - Uploader gambar ke R2 untuk IKS.PI Kera Sakti Kedungadem.
 *
 * Alur:
 *  1. Frontend (admin yang sudah login) mengirim file via multipart/form-data
 *     ke POST /upload dengan header Authorization: Bearer <Firebase ID Token>.
 *  2. Worker memverifikasi ID Token ke Firebase (cek signature via Google public keys
 *     + cek UID ada di daftar ADMIN_UIDS).
 *  3. Worker PUT file ke bucket R2 (binding BUCKET).
 *  4. Worker mengembalikan { url } berupa URL publik (PUBLIC_BASE_URL + key).
 *
 * Secret/credential R2 tidak pernah ada di frontend.
 */

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 6 * 1024 * 1024 // 6MB (sudah dikompres di client)

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '86400',
})

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '*'

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) })
    }

    const url = new URL(request.url)
    if (request.method !== 'POST' || url.pathname !== '/upload') {
      return json({ error: 'Not found' }, 404, origin)
    }

    // ---- 1. Verify Firebase ID token ----
    const authz = request.headers.get('Authorization') || ''
    const token = authz.startsWith('Bearer ') ? authz.slice(7) : null
    if (!token) return json({ error: 'Missing token' }, 401, origin)

    let decoded
    try {
      decoded = await verifyFirebaseToken(token, env.FIREBASE_PROJECT_ID)
    } catch (e) {
      return json({ error: 'Invalid token: ' + e.message }, 401, origin)
    }

    const adminUids = (env.ADMIN_UIDS || '').split(',').map((s) => s.trim()).filter(Boolean)
    if (adminUids.length > 0 && !adminUids.includes(decoded.user_id || decoded.sub)) {
      return json({ error: 'Bukan admin yang diizinkan.' }, 403, origin)
    }

    // ---- 2. Read uploaded file ----
    const form = await request.formData()
    const file = form.get('file')
    let key = form.get('key')
    if (!file || typeof file === 'string') return json({ error: 'File tidak ditemukan.' }, 400, origin)
    if (!ALLOWED_TYPES.includes(file.type)) return json({ error: 'Tipe file tidak diizinkan.' }, 400, origin)
    if (file.size > MAX_BYTES) return json({ error: 'File terlalu besar.' }, 400, origin)

    if (!key) {
      const safeName = (file.name || 'file').replace(/[^a-z0-9.\-_]/gi, '-')
      key = 'umum/' + Date.now() + '-' + safeName
    }

    // ---- 3. Upload to R2 ----
    await env.BUCKET.put(key, file.stream(), {
      httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=31536000, immutable' },
    })

    // ---- 4. Return public URL ----
    const base = (env.PUBLIC_BASE_URL || '').replace(/\/$/, '')
    return json({ url: base + '/' + key, key }, 200, origin)
  },
}

function json(obj, status, origin) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })
}

// ---------------------------------------------------------------------------
// Verify a Firebase ID token (RS256) using Google's public x509 certs.
// ---------------------------------------------------------------------------
const CERT_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
let cachedCerts = null
let cachedAt = 0

async function getCerts() {
  const now = Date.now()
  if (cachedCerts && now - cachedAt < 3600 * 1000) return cachedCerts
  const res = await fetch(CERT_URL)
  cachedCerts = await res.json()
  cachedAt = now
  return cachedCerts
}

async function verifyFirebaseToken(token, projectId) {
  const parts = token.split('.')
  const headerB64 = parts[0]
  const payloadB64 = parts[1]
  const sigB64 = parts[2]
  if (!headerB64 || !payloadB64 || !sigB64) throw new Error('Malformed token')

  const header = JSON.parse(b64urlToString(headerB64))
  const payload = JSON.parse(b64urlToString(payloadB64))

  // Claims validation
  const now = Math.floor(Date.now() / 1000)
  if (payload.exp < now) throw new Error('Token expired')
  if (payload.aud !== projectId) throw new Error('Wrong audience')
  const expectedIss = 'https://securetoken.google.com/' + projectId
  if (payload.iss !== expectedIss) throw new Error('Wrong issuer')

  // Signature validation
  const certs = await getCerts()
  const pem = certs[header.kid]
  if (!pem) throw new Error('Unknown key id')

  const key = await importX509(pem)
  const data = new TextEncoder().encode(headerB64 + '.' + payloadB64)
  const sig = b64urlToBytes(sigB64)
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, sig, data)
  if (!valid) throw new Error('Bad signature')

  return payload
}

function b64urlToString(s) {
  return new TextDecoder().decode(b64urlToBytes(s))
}
function b64urlToBytes(s) {
  const pad = (4 - (s.length % 4)) % 4
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, pad)
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

async function importX509(pem) {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '')
  const der = base64ToBytes(b64)
  return crypto.subtle.importKey(
    'spki',
    extractSpkiFromX509(der),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  )
}

function base64ToBytes(b64) {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

// Minimal ASN.1 walk to pull the SubjectPublicKeyInfo out of an X.509 cert.
function extractSpkiFromX509(der) {
  let pos = 0
  function readLen() {
    let len = der[pos++]
    if (len & 0x80) {
      const n = len & 0x7f
      len = 0
      for (let i = 0; i < n; i++) len = (len << 8) | der[pos++]
    }
    return len
  }
  function expectSeq() {
    if (der[pos++] !== 0x30) throw new Error('Expected SEQUENCE')
    return readLen()
  }
  function skipField() {
    pos++ // tag
    const l = readLen()
    pos += l
  }
  expectSeq() // Certificate
  expectSeq() // tbsCertificate
  if (der[pos] === 0xa0) {
    pos++
    const l = readLen()
    pos += l
  }
  skipField() // serialNumber
  skipField() // signature AlgorithmIdentifier
  skipField() // issuer
  skipField() // validity
  skipField() // subject
  const start = pos
  if (der[pos++] !== 0x30) throw new Error('Expected SPKI SEQUENCE')
  const spkiLen = readLen()
  const contentEnd = pos + spkiLen
  return der.slice(start, contentEnd)
}
