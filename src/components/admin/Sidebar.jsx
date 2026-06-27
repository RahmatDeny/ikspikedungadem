import { NavLink } from 'react-router-dom'
import { FiHome, FiFileText, FiGrid, FiUsers, FiSettings, FiMonitor, FiShield } from 'react-icons/fi'

const menu = [
  { to: '/admin', label: 'Dashboard', icon: FiMonitor, end: true },
  { to: '/admin/beranda', label: 'Kelola Beranda', icon: FiHome },
  { to: '/admin/berita', label: 'Kelola Berita', icon: FiFileText },
  { to: '/admin/sub-ranting', label: 'Kelola Sub Ranting', icon: FiGrid },
  { to: '/admin/kepengurusan', label: 'Kepengurusan', icon: FiUsers },
  { to: '/admin/verifikasi', label: 'Verifikasi Keaslian', icon: FiShield },
  { to: '/admin/settings', label: 'Settings Umum', icon: FiSettings },
]

export default function Sidebar({ open, onClose }) {
  const cls = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
      isActive ? 'bg-emas text-hitam' : 'text-gray-300 hover:bg-white/5'
    }`
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:sticky lg:top-0 lg:self-start lg:h-screen overflow-y-auto z-40 inset-y-0 left-0 w-64 bg-hitam-soft border-r border-white/10 p-4 transform transition-transform ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-2 mb-6">
          <p className="font-heading font-bold text-emas text-lg">Panel Admin</p>
          <p className="text-xs text-gray-500">IKS.PI Kera Sakti</p>
        </div>
        <nav className="space-y-1">
          {menu.map((m) => (
            <NavLink key={m.to} to={m.to} end={m.end} onClick={onClose} className={cls}>
              <m.icon className="text-lg" />
              {m.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
