import { Link } from 'react-router-dom'
import { FiFileText, FiGrid, FiUsers, FiHome, FiSettings, FiShield } from 'react-icons/fi'
import useRealtimeData from '../../hooks/useRealtimeData.js'
import { toArray } from '../../services/db.js'

function Card({ to, icon: Icon, label, count }) {
  return (
    <Link to={to} className="card p-5 hover:border-emas/40 transition flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg bg-emas/15 text-emas flex items-center justify-center text-2xl">
        <Icon />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{count}</p>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const { data: berita } = useRealtimeData('berita')
  const { data: sub } = useRealtimeData('subRanting')
  const { data: pengurus } = useRealtimeData('kepengurusan')
  const { data: verifikasi } = useRealtimeData('verifikasi')

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
      <p className="text-gray-400 mb-8">Selamat datang di panel admin.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card to="/admin/berita" icon={FiFileText} label="Berita" count={toArray(berita).length} />
        <Card to="/admin/sub-ranting" icon={FiGrid} label="Sub Ranting" count={toArray(sub).length} />
        <Card to="/admin/kepengurusan" icon={FiUsers} label="Pengurus" count={toArray(pengurus).length} />
        <Card to="/admin/verifikasi" icon={FiShield} label="Verifikasi Keaslian" count={toArray(verifikasi).length} />
      </div>

      <h2 className="text-lg font-bold text-white mt-10 mb-4">Aksi Cepat</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/admin/beranda" className="btn-outline justify-start"><FiHome /> Kelola Beranda</Link>
        <Link to="/admin/berita" className="btn-outline justify-start"><FiFileText /> Tambah Berita</Link>
        <Link to="/admin/verifikasi" className="btn-outline justify-start"><FiShield /> Verifikasi Keaslian</Link>
        <Link to="/admin/settings" className="btn-outline justify-start"><FiSettings /> Settings Umum</Link>
      </div>
    </div>
  )
}
