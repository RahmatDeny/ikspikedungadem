import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { findByField } from '../../services/db.js'
import SEO from '../../components/public/SEO.jsx'
import { Loader, ErrorState } from '../../components/public/Loader.jsx'
import RichHtml from '../../components/public/RichHtml.jsx'
import Gallery from '../../components/public/Gallery.jsx'
import { formatDate } from '../../components/public/NewsCard.jsx'

export default function NewsDetail() {
  const { slug } = useParams()
  const [item, setItem] = useState(undefined)

  useEffect(() => {
    let active = true
    findByField('berita', 'slug', slug)
      .then((res) => active && setItem(res))
      .catch(() => active && setItem(null))
    return () => {
      active = false
    }
  }, [slug])

  if (item === undefined) return <Loader />
  if (!item || item.status !== 'publish') return <ErrorState message="Berita tidak ditemukan." />

  return (
    <article className="container-page py-12 max-w-3xl">
      <SEO title={item.judul} description={item.ringkasan} image={item.gambarUtamaUrl} type="article" />
      <Link to="/berita" className="text-emas text-sm hover:underline">&larr; Kembali ke Berita</Link>

      {item.kategori && (
        <span className="inline-block mt-4 text-xs font-semibold uppercase bg-merah/20 text-merah-light px-2 py-0.5 rounded">
          {item.kategori}
        </span>
      )}
      <h1 className="text-3xl md:text-4xl font-bold text-white mt-3">{item.judul}</h1>
      <p className="text-sm text-gray-500 mt-2">{formatDate(item.tanggalPublish || item.createdAt)}</p>

      {item.gambarUtamaUrl && (
        <img src={item.gambarUtamaUrl} alt={item.judul} className="w-full rounded-xl mt-6" />
      )}

      <RichHtml html={item.isiHtml} className="prose-content mt-6" />

      {Array.isArray(item.galeriTambahan) && item.galeriTambahan.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-white mb-4">Galeri</h2>
          <Gallery items={item.galeriTambahan} columns={3} />
        </div>
      )}
    </article>
  )
}
