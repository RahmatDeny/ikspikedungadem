import { useState } from 'react'
import { Outlet, useNavigate, Link } from 'react-router-dom'
import { FiMenu, FiLogOut, FiExternalLink } from 'react-icons/fi'
import toast from 'react-hot-toast'
import Sidebar from './Sidebar.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Berhasil keluar.')
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-hitam">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-hitam-soft">
          <button className="lg:hidden text-white text-xl" onClick={() => setOpen(true)}>
            <FiMenu />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <Link to="/" target="_blank" className="text-sm text-gray-400 hover:text-emas flex items-center gap-1">
              <FiExternalLink /> Lihat Situs
            </Link>
            <span className="text-sm text-gray-400 hidden sm:inline">{user?.email}</span>
            <button onClick={handleLogout} className="text-sm text-merah-light hover:text-merah flex items-center gap-1">
              <FiLogOut /> Keluar
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
