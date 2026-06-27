import QRCode from 'qrcode'

/**
 * Membuat data URL (PNG) dari sebuah teks/URL menjadi QR Code.
 * @param {string} text
 * @param {number} size px
 * @returns {Promise<string>} dataURL image/png
 */
export async function makeQrDataUrl(text, size = 720) {
  return QRCode.toDataURL(text, {
    width: size,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#0B0B0F', light: '#FFFFFF' },
  })
}

/** Memicu unduhan sebuah data URL sebagai file. */
export function downloadDataUrl(dataUrl, filename = 'qr.png') {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

/** URL publik halaman verifikasi untuk sebuah kode. */
export function buildVerifikasiUrl(kode) {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}/verifikasi/${encodeURIComponent(kode)}`
}

/**
 * Membuat kode verifikasi unik: KDM-<YY>-<XXXX>-<XXXX> (hex, huruf besar).
 * @param {string[]} existing daftar kode yang sudah dipakai (untuk hindari duplikat)
 */
export function generateKode(existing = []) {
  const yy = String(new Date().getFullYear()).slice(-2)
  const taken = new Set(existing)
  const seg = () => {
    const buf = new Uint8Array(2)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(buf)
    } else {
      buf[0] = Math.floor(Math.random() * 256)
      buf[1] = Math.floor(Math.random() * 256)
    }
    return Array.from(buf).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
  }
  let kode
  let guard = 0
  do {
    kode = `KDM-${yy}-${seg()}-${seg()}`
    guard += 1
  } while (taken.has(kode) && guard < 50)
  return kode
}
