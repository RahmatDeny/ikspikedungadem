import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { FiMenu, FiX } from 'react-icons/fi'

const links = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/berita', label: 'Berita' },
  { to: '/sub-ranting', label: 'Sub Ranting' },
  { to: '/kepengurusan', label: 'Kepengurusan' },
]

export default function Navbar({ settings }) {
  const [open, setOpen] = useState(false)
  const nama = settings?.namaOrganisasi || 'IKS.PI Kera Sakti'

  const linkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
      isActive ? 'text-emas' : 'text-gray-200 hover:text-emas'
    }`

  return (
    <header className="sticky top-0 z-50 bg-hitam/95 backdrop-blur border-b border-emas/20">
      <nav className="container-page flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.svg" alt="Logo" className="w-10 h-10" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <div className="leading-tight">
            <span className="block font-heading font-bold text-white text-sm sm:text-base">{nama}</span>
            <span className="block text-[10px] sm:text-xs text-emas">Ranting Kedungadem &middot; Cabang Bojonegoro</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <button className="md:hidden text-white text-2xl" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <FiX /> : <FiMenu />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-hitam">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-6 py-3 text-sm font-semibold uppercase ${
                  isActive ? 'text-emas bg-white/5' : 'text-gray-200'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}
