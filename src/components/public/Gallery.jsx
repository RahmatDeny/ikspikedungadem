import { useState } from 'react'
import { FiX } from 'react-icons/fi'

// items: array of { gambarUrl, caption } or array of url strings
export default function Gallery({ items = [], columns = 3 }) {
  const [active, setActive] = useState(null)
  const normalized = items
    .map((it) => (typeof it === 'string' ? { gambarUrl: it } : it))
    .filter((it) => it && it.gambarUrl)

  if (normalized.length === 0) return null

  const gridClass =
    columns === 4
      ? 'grid-cols-2 md:grid-cols-4'
      : columns === 2
      ? 'grid-cols-2'
      : 'grid-cols-2 md:grid-cols-3'

  return (
    <>
      <div className={`grid ${gridClass} gap-3`}>
        {normalized.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(img)}
            className="aspect-square overflow-hidden rounded-lg border border-white/5 group"
          >
            <img
              src={img.gambarUrl}
              alt={img.caption || `Foto ${i + 1}`}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
            />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <button className="absolute top-5 right-5 text-white text-3xl" aria-label="Tutup">
            <FiX />
          </button>
          <figure className="max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img src={active.gambarUrl} alt={active.caption || ''} className="max-h-[80vh] rounded-lg" />
            {active.caption && <figcaption className="text-center text-gray-300 mt-3">{active.caption}</figcaption>}
          </figure>
        </div>
      )}
    </>
  )
}
