import { Link } from 'react-router-dom'
import SEO from '../../components/public/SEO.jsx'

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <SEO title="Halaman Tidak Ditemukan" />
      <h1 className="text-6xl font-bold text-emas">404</h1>
      <p className="text-gray-300 mt-4">Halaman yang Anda cari tidak ditemukan.</p>
      <Link to="/" className="btn-gold mt-6">Kembali ke Beranda</Link>
    </div>
  )
}
