import { Link } from 'react-router-dom'
import { FiMapPin, FiUser } from 'react-icons/fi'

const PLACEHOLDER = 'https://placehold.co/600x400/1D3557/D4AF37?text=Sub+Ranting'

export default function SubRantingCard({ item }) {
  return (
    <Link to={`/sub-ranting/${item.slug}`} className="card group hover:border-emas/40 transition">
      <div className="aspect-video overflow-hidden">
        <img
          src={item.fotoUtamaUrl || PLACEHOLDER}
          alt={item.nama}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-white group-hover:text-emas transition">{item.nama}</h3>
        <div className="mt-2 space-y-1 text-sm text-gray-400">
          {item.alamat && (
            <p className="flex items-center gap-2"><FiMapPin className="text-emas" /> {item.alamat}</p>
          )}
          {item.namaKetua && (
            <p className="flex items-center gap-2"><FiUser className="text-emas" /> Ketua: {item.namaKetua}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
