import { useState, useMemo } from 'react'
import useRealtimeData from '../../hooks/useRealtimeData.js'
import SEO from '../../components/public/SEO.jsx'
import { Loader, EmptyState } from '../../components/public/Loader.jsx'
import NewsCard from '../../components/public/NewsCard.jsx'
import { toArray } from '../../services/db.js'
import { KATEGORI_BERITA } from '../../constants/categories.js'

const PER_PAGE = 9

export default function NewsList() {
  const { data: beritaObj, loading } = useRealtimeData('berita')
  const [kategori, setKategori] = useState('Semua')
  const [page, setPage] = useState(1)

  const all = useMemo(
    () =>
      toArray(beritaObj)
        .filter((b) => b.status === 'publish')
        .sort((a, b) => (b.tanggalPublish || b.createdAt || 0) - (a.tanggalPublish || a.createdAt || 0)),
    [beritaObj]
  )

  // Hitung jumlah berita per kategori (untuk badge angka pada chip filter).
  const countByCat = useMemo(() => {
    const m = {}
    all.forEach((b) => {
      if (b.kategori) m[b.kategori] = (m[b.kategori] || 0) + 1
    })
    return m
  }, [all])

  // Chip kategori tampil dalam urutan baku, hanya yang punya berita,
  // lalu kategori lain di luar daftar baku (jika ada).
  const categories = useMemo(() => {
    const present = Object.keys(countByCat)
    const ordered = KATEGORI_BERITA.filter((c) => present.includes(c))
    const extras = present.filter((c) => !KATEGORI_BERITA.includes(c))
    return ['Semua', ...ordered, ...extras]
  }, [countByCat])

  const filtered = kategori === 'Semua' ? all : all.filter((b) => b.kategori === kategori)
  const visible = filtered.slice(0, page * PER_PAGE)

  const countFor = (c) => (c === 'Semua' ? all.length : countByCat[c] || 0)

  if (loading) return <Loader />

  return (
    <div className="container-page py-12">
      <SEO title="Berita" description="Berita dan kegiatan terbaru IKS.PI Kera Sakti Ranting Kedungadem." />
      <h1 className="section-title mb-2">Berita</h1>
      <p className="text-gray-400 mb-8">Kabar kegiatan, acara, dan prestasi terbaru.</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => {
              setKategori(c)
              setPage(1)
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
              kategori === c ? 'bg-emas text-hitam' : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            {c}
            <span className="ml-1.5 opacity-70">({countFor(c)})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="Belum ada berita pada kategori ini." />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
          {visible.length < filtered.length && (
            <div className="text-center mt-10">
              <button className="btn-outline" onClick={() => setPage((p) => p + 1)}>
                Muat lebih banyak
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
