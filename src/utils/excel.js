// Util import/export Excel untuk modul Verifikasi.
// Memakai dynamic import agar bila paket 'xlsx' belum terpasang,
// hanya fitur import/template yang gagal (bukan seluruh halaman).

async function getXLSX() {
  try {
    const mod = await import('xlsx')
    return mod.default || mod
  } catch (e) {
    throw new Error("Paket 'xlsx' belum terpasang. Jalankan: npm install")
  }
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

const KODE_HEADER = 'Kode Verifikasi'

/**
 * Unduh template Excel sesuai kolom yang sudah diset pada sebuah verifikasi.
 * Header = label kolom + kolom "Kode Verifikasi" (opsional bila kode otomatis).
 */
export async function downloadTemplate(ver) {
  const XLSX = await getXLSX()
  const fields = Array.isArray(ver.fields) ? ver.fields : []
  const headers = [...fields.map((f) => f.label), KODE_HEADER]

  // Baris contoh agar admin paham format (boleh dihapus saat mengisi).
  const contoh = fields.map((f) => `Contoh ${f.label}`)
  contoh.push(ver.autoKode ? '(kosongkan = otomatis)' : 'KDM-26-XXXX-XXXX')

  const wsData = XLSX.utils.aoa_to_sheet([headers, contoh])
  wsData['!cols'] = headers.map((h) => ({ wch: Math.max(16, h.length + 4) }))

  const petunjuk = [
    ['PETUNJUK PENGISIAN'],
    [''],
    ['1. Isi data mulai baris ke-2 pada sheet "Data". Hapus baris contoh.'],
    ['2. Jangan mengubah / menghapus baris judul kolom (baris pertama).'],
    ['3. Satu baris = satu sertifikat / satu orang.'],
    [ver.autoKode
      ? '4. Kolom "Kode Verifikasi" boleh dikosongkan; sistem membuat kode otomatis (KDM-...).'
      : '4. Kolom "Kode Verifikasi" WAJIB diisi dan harus unik (tidak boleh sama).'],
    ['5. Foto/preview sertifikat TIDAK lewat Excel. Setelah import, upload foto manual per data lewat tombol Edit.'],
  ]
  const wsInfo = XLSX.utils.aoa_to_sheet(petunjuk)
  wsInfo['!cols'] = [{ wch: 90 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, wsData, 'Data')
  XLSX.utils.book_append_sheet(wb, wsInfo, 'Petunjuk')

  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  triggerDownload(blob, `Template-${ver.slug || 'verifikasi'}.xlsx`)
}

/** Baca file Excel/CSV menjadi array objek (key = judul kolom). */
export async function readRows(file) {
  const XLSX = await getXLSX()
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  // Pakai sheet "Data" bila ada, jika tidak pakai sheet pertama.
  const sheetName = wb.SheetNames.includes('Data') ? 'Data' : wb.SheetNames[0]
  const ws = wb.Sheets[sheetName]
  if (!ws) return []
  return XLSX.utils.sheet_to_json(ws, { defval: '', raw: false })
}

/**
 * Petakan baris-baris mentah menjadi entri siap simpan.
 * @returns  prepared: Array, issues: Array 
 */
export function mapRows(rows, ver, existingKodes = []) {
  const fields = Array.isArray(ver.fields) ? ver.fields : []
  const taken = new Set(existingKodes)
  const prepared = []
  const issues = []

  rows.forEach((row, idx) => {
    const baris = idx + 2 // baris di Excel (header = 1)
    // Normalisasi key kolom -> lowercase trim
    const norm = {}
    Object.keys(row).forEach((k) => { norm[String(k).trim().toLowerCase()] = row[k] })

    const values = {}
    let hasValue = false
    fields.forEach((f) => {
      const v = String(norm[f.label.trim().toLowerCase()] ?? '').trim()
      values[f.key] = v
      if (v) hasValue = true
    })

    let kode = String(norm[KODE_HEADER.toLowerCase()] ?? norm['kode'] ?? '').trim().toUpperCase()
    // Lewati baris contoh / baris kosong
    if (!hasValue && !kode) return
    if (kode.startsWith('CONTOH') || kode.startsWith('(KOSONGKAN')) kode = ''

    if (!kode) {
      if (ver.autoKode) {
        kode = generateUniqueKode(taken)
      } else {
        issues.push({ baris, reason: 'Kode Verifikasi kosong' })
        return
      }
    }
    if (taken.has(kode)) {
      issues.push({ baris, reason: `Kode duplikat: ${kode}` })
      return
    }
    taken.add(kode)
    prepared.push({ values, kode, previewUrl: '' })
  })

  return { prepared, issues }
}

function generateUniqueKode(taken) {
  const yy = String(new Date().getFullYear()).slice(-2)
  const seg = () => {
    const buf = new Uint8Array(2)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(buf)
    else { buf[0] = Math.floor(Math.random() * 256); buf[1] = Math.floor(Math.random() * 256) }
    return Array.from(buf).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
  }
  let kode
  let guard = 0
  do { kode = `KDM-${yy}-${seg()}-${seg()}`; guard += 1 } while (taken.has(kode) && guard < 80)
  return kode
}
