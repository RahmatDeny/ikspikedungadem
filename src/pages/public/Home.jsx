import { Link } from 'react-router-dom'
import useRealtimeData from '../../hooks/useRealtimeData.js'
import SEO from '../../components/public/SEO.jsx'
import { Loader } from '../../components/public/Loader.jsx'
import NewsCard from '../../components/public/NewsCard.jsx'
import Gallery from '../../components/public/Gallery.jsx'
import RichHtml from '../../components/public/RichHtml.jsx'
import { toArray } from '../../services/db.js'

const HERO_FALLBACK = 'https://placehold.co/1600x900/0B0B0F/D4AF37?text=IKS.PI+Kera+Sakti'
const TOKOH_FALLBACK = 'https://placehold.co/600x800/16161D/D4AF37?text=Foto'

function TokohFoto({ fotoUrl, nama }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-36 sm:w-48 md:w-60 aspect-[3/4] rounded-xl overflow-hidden border-4 border-emas/70 shadow-lg">
        <img src={fotoUrl || TOKOH_FALLBACK} alt={nama || 'Tokoh'} className="w-full h-full object-cover" />
      </div>
      <p className="mt-4 font-heading font-semibold text-white text-sm sm:text-base md:text-lg">{nama || '-'}</p>
    </div>
  )
}

export default function Home() {
  const { data: beranda, loading } = useRealtimeData('settings/beranda')
  const { data: beritaObj } = useRealtimeData('berita')

  if (loading) return <Loader />

  const hero = beranda?.hero || {}
  const sambutan = beranda?.sambutan || {}
  const tokoh = beranda?.tokoh || {}
  const galeri = toArray(beranda?.galeri).sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0))

  const latestNews = toArray(beritaObj)
    .filter((b) => b.status === 'publish')
    .sort((a, b) => (b.tanggalPublish || b.createdAt || 0) - (a.tanggalPublish || a.createdAt || 0))
    .slice(0, 4)

  return (
    <div>
      <SEO description={hero.subjudul} image={hero.gambarUrl} />

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[420px] flex items-center">
        <img src={hero.gambarUrl || HERO_FALLBACK} alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-hitam via-hitam/80 to-transparent" />
        <div className="container-page relative">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              {hero.judul || 'IKS.PI Kera Sakti'}
            </h1>
            <p className="mt-4 text-lg text-gray-200">
              {hero.subjudul || 'Ranting Kedungadem, Cabang Bojonegoro'}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/sub-ranting" className="btn-gold">Jelajahi Sub Ranting</Link>
              <Link to="/berita" className="btn-outline">Berita Terbaru</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tokoh & Semboyan */}
      <section className="bg-biru-dark border-y border-emas/20">
  <div className="container-page py-12">
    <div className="flex items-center justify-between gap-4 sm:gap-8">
      <TokohFoto fotoUrl={tokoh.kiri?.fotoUrl} nama={tokoh.kiri?.nama} />

      <div className="flex-1 text-center px-2">
        <p
          className="text-emas text-2xl sm:text-4xl md:text-5xl font-bold leading-snug whitespace-pre-line"
          style={{
            fontFamily: "'Cinzel', serif",
            textShadow: '0 0 12px rgba(212,175,55,0.25)',
            letterSpacing: '0.03em'
          }}
        >
          {tokoh.semboyan || 'Semboyan organisasi'}
        </p>
      </div>

      <TokohFoto fotoUrl={tokoh.kanan?.fotoUrl} nama={tokoh.kanan?.nama} />
    </div>
  </div>
</section>

      {/* Motto & Falsafah */}
      {(tokoh.motto || tokoh.falsafah) && (
        <section className="container-page py-14">
          <div className="grid sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {tokoh.motto && (
              <div className="card p-8 md:p-10 text-center border-t-4 border-merah">
                <h3 className="font-heading text-merah-light uppercase tracking-wide text-2xl md:text-3xl font-bold mb-4">Motto</h3>
                <p className="text-gray-200 text-base md:text-lg whitespace-pre-line">{tokoh.motto}</p>
              </div>
            )}
            {tokoh.falsafah && (
              <div className="card p-8 md:p-10 text-center border-t-4 border-sky-400">
                <h3 className="font-heading text-emas uppercase tracking-wide text-2xl md:text-3xl font-bold mb-4">Falsafah</h3>
                <p className="text-gray-200 text-base md:text-lg whitespace-pre-line">{tokoh.falsafah}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Sambutan */}
      {sambutan.isiHtml && (
        <section className="container-page py-14">
          <h2 className="section-title mb-6">Sambutan</h2>
          <RichHtml html={sambutan.isiHtml} className="prose-content max-w-3xl" />
        </section>
      )}

      {/* Berita terbaru */}
      <section className="container-page py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title">Berita Terbaru</h2>
          <Link to="/berita" className="text-emas text-sm font-semibold hover:underline">Lihat semua &rarr;</Link>
        </div>
        {latestNews.length === 0 ? (
          <p className="text-gray-500">Belum ada berita.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {latestNews.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Galeri */}
      {galeri.length > 0 && (
        <section className="container-page py-14">
          <h2 className="section-title mb-8">Galeri Kegiatan</h2>
          <Gallery items={galeri} columns={4} />
        </section>
      )}
    </div>
  )
}
