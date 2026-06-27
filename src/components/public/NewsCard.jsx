import { Link } from 'react-router-dom'

const PLACEHOLDER = 'https://placehold.co/600x400/16161D/D4AF37?text=IKS.PI+Kera+Sakti'

export function formatDate(ts) {
  if (!ts) return ''
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function NewsCard({ item }) {
  return (
    <Link to={`/berita/${item.slug}`} className="card group hover:border-emas/40 transition">
      <div className="aspect-video overflow-hidden">
        <img
          src={item.gambarUtamaUrl || PLACEHOLDER}
          alt={item.judul}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
      </div>
      <div className="p-4">
        {item.kategori && (
          <span className="inline-block text-[11px] font-semibold uppercase tracking-wide bg-merah/20 text-merah-light px-2 py-0.5 rounded mb-2">
            {item.kategori}
          </span>
        )}
        <h3 className="text-lg font-bold text-white leading-snug line-clamp-2 group-hover:text-emas transition">
          {item.judul}
        </h3>
        <p className="text-xs text-gray-500 mt-1">{formatDate(item.tanggalPublish || item.createdAt)}</p>
        <p className="text-sm text-gray-400 mt-2 line-clamp-3">{item.ringkasan}</p>
      </div>
    </Link>
  )
}
