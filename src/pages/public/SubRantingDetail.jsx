import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { findByField } from '../../services/db.js'
import SEO from '../../components/public/SEO.jsx'
import { Loader, ErrorState } from '../../components/public/Loader.jsx'
import RichHtml from '../../components/public/RichHtml.jsx'
import Gallery from '../../components/public/Gallery.jsx'
import { FiMapPin, FiUser, FiClock, FiPhone } from 'react-icons/fi'

export default function SubRantingDetail() {
  const { slug } = useParams()
  const [item, setItem] = useState(undefined)

  useEffect(() => {
    let active = true
    findByField('subRanting', 'slug', slug)
      .then((res) => active && setItem(res))
      .catch(() => active && setItem(null))
    return () => {
      active = false
    }
  }, [slug])

  if (item === undefined) return <Loader />
  if (!item) return <ErrorState message="Sub ranting tidak ditemukan." />

  const hasCoords = item.koordinatLat && item.koordinatLng
  const mapsUrl = hasCoords
    ? 'https://www.google.com/maps/search/?api=1&query=' +
      item.koordinatLat +
      ',' +
      item.koordinatLng
    : null

  return (
    <div className="container-page py-12">
      <SEO title={item.nama} description={'Profil sub ranting ' + item.nama} image={item.fotoUtamaUrl} />
      <Link to="/sub-ranting" className="text-emas text-sm hover:underline">&larr; Kembali ke Daftar Sub Ranting</Link>

      {item.fotoUtamaUrl && (
        <div className="mt-4 rounded-xl overflow-hidden aspect-[21/9]">
          <img src={item.fotoUtamaUrl} alt={item.nama} className="w-full h-full object-cover" />
        </div>
      )}

      <h1 className="text-3xl md:text-4xl font-bold text-white mt-6">{item.nama}</h1>

      <div className="grid md:grid-cols-3 gap-8 mt-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-8">
          {item.deskripsiHtml && (
            <section>
              <h2 className="text-xl font-bold text-white mb-3">Profil</h2>
              <RichHtml html={item.deskripsiHtml} />
            </section>
          )}

          {Array.isArray(item.pengurusInti) && item.pengurusInti.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-white mb-3">Susunan Pengurus Inti</h2>
              <ul className="divide-y divide-white/5 card">
                {item.pengurusInti.map((p, i) => (
                  <li key={i} className="flex justify-between px-4 py-3">
                    <span className="text-gray-200">{p.nama}</span>
                    <span className="text-emas text-sm">{p.jabatan}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {Array.isArray(item.galeri) && item.galeri.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-white mb-3">Galeri Kegiatan</h2>
              <Gallery items={item.galeri} columns={3} />
            </section>
          )}
        </div>

        {/* Sidebar info */}
        <aside className="space-y-4">
          <div className="card p-5 space-y-3 text-sm">
            {item.namaKetua && (
              <p className="flex gap-3 text-gray-300"><FiUser className="text-emas mt-0.5" /> <span><span className="block text-gray-500 text-xs">Ketua</span>{item.namaKetua}</span></p>
            )}
            {item.alamat && (
              <p className="flex gap-3 text-gray-300"><FiMapPin className="text-emas mt-0.5" /> <span><span className="block text-gray-500 text-xs">Alamat</span>{item.alamat}</span></p>
            )}
            {item.jadwalKegiatan && (
              <p className="flex gap-3 text-gray-300"><FiClock className="text-emas mt-0.5" /> <span><span className="block text-gray-500 text-xs">Jadwal Latihan</span>{item.jadwalKegiatan}</span></p>
            )}
            {item.kontakPerson && (
              <p className="flex gap-3 text-gray-300"><FiPhone className="text-emas mt-0.5" /> <span><span className="block text-gray-500 text-xs">Kontak</span>{item.kontakPerson}</span></p>
            )}
          </div>
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn-outline w-full">
              Lihat di Google Maps
            </a>
          )}
        </aside>
      </div>
    </div>
  )
}
