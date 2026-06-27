import { Routes, Route } from 'react-router-dom'

// Public layout & pages
import PublicLayout from './components/public/Layout.jsx'
import Home from './pages/public/Home.jsx'
import NewsList from './pages/public/NewsList.jsx'
import NewsDetail from './pages/public/NewsDetail.jsx'
import SubRantingList from './pages/public/SubRantingList.jsx'
import SubRantingDetail from './pages/public/SubRantingDetail.jsx'
import Kepengurusan from './pages/public/Kepengurusan.jsx'
import VerifikasiPublic from './pages/public/VerifikasiPublic.jsx'
import NotFound from './pages/public/NotFound.jsx'

// Admin
import ProtectedRoute from './components/admin/ProtectedRoute.jsx'
import AdminLayout from './components/admin/AdminLayout.jsx'
import Login from './pages/admin/Login.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import ManageHome from './pages/admin/ManageHome.jsx'
import ManageNews from './pages/admin/ManageNews.jsx'
import ManageSubRanting from './pages/admin/ManageSubRanting.jsx'
import ManageKepengurusan from './pages/admin/ManageKepengurusan.jsx'
import ManageVerifikasi from './pages/admin/ManageVerifikasi.jsx'
import VerifikasiDashboard from './pages/admin/VerifikasiDashboard.jsx'
import ManageSettings from './pages/admin/ManageSettings.jsx'

export default function App() {
  return (
    <Routes>
      {/* ---------- Public ---------- */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/berita" element={<NewsList />} />
        <Route path="/berita/:slug" element={<NewsDetail />} />
        <Route path="/sub-ranting" element={<SubRantingList />} />
        <Route path="/sub-ranting/:slug" element={<SubRantingDetail />} />
        <Route path="/kepengurusan" element={<Kepengurusan />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* ---------- Verifikasi publik (tanpa menu, untuk cek sertifikat fisik via link/QR) ---------- */}
      <Route path="/verifikasi/:kode" element={<VerifikasiPublic />} />

      {/* ---------- Admin ---------- */}
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="beranda" element={<ManageHome />} />
        <Route path="berita" element={<ManageNews />} />
        <Route path="sub-ranting" element={<ManageSubRanting />} />
        <Route path="kepengurusan" element={<ManageKepengurusan />} />
        <Route path="verifikasi" element={<ManageVerifikasi />} />
        <Route path="verifikasi/:verId" element={<VerifikasiDashboard />} />
        <Route path="settings" element={<ManageSettings />} />
      </Route>
    </Routes>
  )
}
