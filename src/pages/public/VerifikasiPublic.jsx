import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  FiCheckCircle, FiXCircle, FiFileText, FiUser, FiAward, FiUsers, FiHome,
  FiCalendar, FiInfo, FiKey, FiShield, FiZoomIn,
} from 'react-icons/fi'
import { findByField } from '../../services/db.js'

function iconFor(label = '') {
  const l = label.toLowerCase()
  if (l.includes('nomor') || l.includes('no.')) return FiFileText
  if (l.includes('nama')) return FiUser
  if (l.includes('jenis') || l.includes('award') || l.includes('sertifikat')) return FiAward
  if (l.includes('kategori') || l.includes('peserta')) return FiUsers
  if (l.includes('penyelenggara') || l.includes('lembaga') || l.includes('organisasi')) return FiHome
  if (l.includes('tanggal') || l.includes('tgl') || l.includes('date')) return FiCalendar
  if (l.includes('status')) return FiShield
  if (l.includes('keterangan') || l.includes('catatan')) return FiInfo
  return FiFileText
}

function isStatusField(label = '') {
  return label.toLowerCase().includes('status')
}

export default function VerifikasiPublic() {
  const { kode } = useParams()
  const [state, setState] = useState({ loading: true, item: null })
  const [zoom, setZoom] = useState(false)

  useEffect(() => {
    let active = true
    setState({ loading: true, item: null })
    findByField('verifikasiData', 'kode', kode)
      .then((item) => { if (active) setState({ loading: false, item }) })
      .catch(() => { if (active) setState({ loading: false, item: null }) })
    return () => { active = false }
  }, [kode])

  const { loading, item } = state
  const valid = !!item
  const fields = item && Array.isArray(item.fields) ? item.fields : []

  const pageStyle = { background: 'radial-gradient(1200px 600px at 50% -200px, #ffffff 0%, #f3efe7 45%, #e9e2d4 100%)' }
  const bgAssetStyle = { backgroundImage: "url('/asset_verifikasi.svg')" }

  return (
    <div className="min-h-screen w-full text-[#2b2b2b] relative overflow-hidden" style={pageStyle}>
      <Helmet>
        <title>Verifikasi Keaslian Sertifikat | IKS.PI Kera Sakti Kedungadem</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* aksen emas atas */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#C1121F] via-[#D4AF37] to-[#C1121F]" />
      {/* background asset samar */}
      <div className="pointer-events-none absolute inset-0 bg-no-repeat bg-cover bg-center opacity-[0.05]" style={bgAssetStyle} />

      <div className="relative max-w-4xl mx-auto px-4 py-12 sm:py-16">
        {/* ---------- Header ---------- */}
        <header className="text-center">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-[#B8902A] uppercase">Sistem Verifikasi Resmi</p>
          <h1 className="font-heading uppercase tracking-wide text-3xl sm:text-5xl font-bold text-[#1a1a1a] mt-2 leading-tight">
            Verifikasi Keaslian<br className="hidden sm:block" /> Sertifikat
          </h1>
          <p className="font-heading uppercase tracking-wide text-xl sm:text-3xl font-bold text-[#C1121F] mt-2">
            IKS.PI Kera Sakti
          </p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <span className="w-1.5 h-1.5 rotate-45 bg-[#D4AF37]" />
            <p className="text-[11px] sm:text-sm tracking-[0.2em] text-[#7a7363] uppercase font-medium">
              Ranting Kedungadem &middot; Cabang Bojonegoro
            </p>
            <span className="w-1.5 h-1.5 rotate-45 bg-[#D4AF37]" />
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#D4AF37]" />
          </div>
          <div className="flex justify-center my-6">
            <div className="w-20 h-20 rounded-full bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-2 ring-[#D4AF37]/40 flex items-center justify-center">
              <img src="/IKSPI.png" alt="Logo IKS.PI Kera Sakti" className="h-14 w-14 object-contain" />
            </div>
          </div>
          <p className="text-sm sm:text-[15px] text-[#6b6b6b] max-w-xl mx-auto leading-relaxed">
            Halaman ini digunakan untuk memastikan keaslian sertifikat yang diterbitkan oleh
            IKS.PI Kera Sakti Ranting Kedungadem, Cabang Bojonegoro.
          </p>
        </header>

        {loading ? (
          <div className="mt-12 text-center text-[#6b6b6b]">
            <div className="w-10 h-10 border-4 border-[#D4AF37]/40 border-t-[#D4AF37] rounded-full animate-spin mx-auto" />
            <p className="mt-3 text-sm">Memeriksa keaslian sertifikat...</p>
          </div>
        ) : (
          <>
            {/* ---------- Status ---------- */}
            <section className="mt-10 relative">
              <div className={`absolute -inset-px rounded-3xl bg-gradient-to-r ${valid ? 'from-[#16a34a]/30 via-[#D4AF37]/30 to-[#16a34a]/30' : 'from-[#C1121F]/30 via-[#D4AF37]/20 to-[#C1121F]/30'}`} />
              <div className="relative bg-white/95 backdrop-blur rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] p-6 sm:p-8 flex items-center gap-5">
                {valid ? (
                  <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#16a34a] flex items-center justify-center text-white text-4xl shadow-lg ring-4 ring-[#16a34a]/15">
                    <FiCheckCircle />
                  </div>
                ) : (
                  <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#C1121F] flex items-center justify-center text-white text-4xl shadow-lg ring-4 ring-[#C1121F]/15">
                    <FiXCircle />
                  </div>
                )}
                <div>
                  <p className="text-[11px] tracking-[0.25em] uppercase text-[#9a9a9a] font-semibold">Status Sertifikat</p>
                  <p className={`text-2xl sm:text-[2rem] leading-tight font-bold font-heading uppercase ${valid ? 'text-[#16a34a]' : 'text-[#C1121F]'}`}>
                    {valid ? 'Sertifikat Asli' : 'Tidak Ditemukan'}
                  </p>
                  <p className="text-sm text-[#6b6b6b] mt-1 max-w-md">
                    {valid
                      ? 'Sertifikat ini terdaftar dalam sistem kami dan dinyatakan sah.'
                      : `Kode “${kode}” tidak terdaftar. Pastikan kode/QR sesuai dengan sertifikat fisik Anda.`}
                  </p>
                </div>
              </div>
            </section>

            {/* ---------- Detail + Preview ---------- */}
            {valid && (
              <section className="mt-6 grid md:grid-cols-2 gap-6">
                {/* Detail */}
                <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] p-6 sm:p-7">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="w-8 h-[3px] bg-[#D4AF37] rounded-full" />
                    <h2 className="text-xs tracking-[0.25em] uppercase text-[#8a8a8a] font-bold">Detail Sertifikat</h2>
                  </div>
                  <dl className="space-y-1">
                    {fields.map((f) => {
                      const Icon = iconFor(f.label)
                      const val = item.values?.[f.key] || '-'
                      return (
                        <div key={f.key} className="py-2.5 flex gap-3 items-start border-b border-dashed border-black/5 last:border-0">
                          <span className="shrink-0 w-8 h-8 rounded-lg bg-[#D4AF37]/10 text-[#B8902A] flex items-center justify-center text-sm">
                            <Icon />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] uppercase tracking-wide text-[#a3a3a3] font-medium">{f.label}</p>
                            {isStatusField(f.label) ? (
                              <span className="inline-block mt-1 text-xs font-bold text-[#16a34a] bg-[#16a34a]/10 rounded-full px-3 py-0.5">{val}</span>
                            ) : (
                              <p className="text-[#272727] font-semibold break-words leading-snug">{val}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {/* Kode Verifikasi */}
                    <div className="py-3 mt-2 flex gap-3 items-center rounded-xl bg-[#1a1a1a] px-3">
                      <span className="shrink-0 w-8 h-8 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center">
                        <FiKey />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] uppercase tracking-wide text-[#9a8f6a] font-medium">Kode Verifikasi</p>
                        <p className="text-[#F2D279] font-bold font-mono tracking-wider break-words">{item.kode}</p>
                      </div>
                    </div>
                  </dl>
                </div>

                {/* Preview */}
                {item.usePreview && item.previewUrl && (
                  <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] p-6 sm:p-7">
                    <div className="flex items-center gap-2 mb-5">
                      <span className="w-8 h-[3px] bg-[#D4AF37] rounded-full" />
                      <h2 className="text-xs tracking-[0.25em] uppercase text-[#8a8a8a] font-bold">Preview Sertifikat</h2>
                    </div>
                    <button type="button" onClick={() => setZoom(true)} className="group block w-full relative rounded-xl overflow-hidden border border-black/10">
                      <img
                        src={item.previewUrl}
                        alt="Preview Sertifikat"
                        className="w-full h-auto object-contain bg-white"
                      />
                      <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs rounded-full px-2.5 py-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <FiZoomIn /> Perbesar
                      </span>
                    </button>
                    <p className="text-xs text-[#a3a3a3] mt-3 text-center">Klik gambar untuk memperbesar.</p>
                  </div>
                )}
              </section>
            )}

            {/* ---------- Footer info ---------- */}
            <section className="mt-8 relative overflow-hidden bg-[#15151c] text-gray-300 rounded-3xl p-6 sm:p-8">
              <div className="pointer-events-none absolute -right-6 -bottom-8 opacity-10">
                <FiShield className="text-[140px] text-[#D4AF37]" />
              </div>
              <h3 className="font-heading uppercase tracking-wide text-white text-sm font-bold mb-2 flex items-center gap-2">
                <FiShield className="text-[#D4AF37]" /> Tentang Verifikasi Sertifikat
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-2xl relative">
                Sistem verifikasi sertifikat IKS.PI Kera Sakti digunakan untuk memastikan keaslian sertifikat
                yang diterbitkan oleh organisasi kami. Pastikan data yang ditampilkan sesuai dengan sertifikat
                fisik yang Anda miliki. Bila terdapat perbedaan data, segera hubungi pengurus Ranting Kedungadem.
              </p>
            </section>

            <p className="text-center text-xs text-[#a39a86] mt-8">
              &copy; {new Date().getFullYear()} IKS.PI Kera Sakti Ranting Kedungadem &middot; Cabang Bojonegoro
            </p>
          </>
        )}
      </div>

      {/* ---------- Lightbox ---------- */}
      {zoom && item?.previewUrl && (
        <div className="fixed inset-0 z-[80] bg-black/85 flex items-center justify-center p-4" onClick={() => setZoom(false)}>
          <img src={item.previewUrl} alt="Preview Sertifikat" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
          <button className="absolute top-4 right-4 text-white text-3xl" onClick={() => setZoom(false)}>
            <FiXCircle />
          </button>
        </div>
      )}
    </div>
  )
}
