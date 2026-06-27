import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { Loader } from '../public/Loader.jsx'

export default function ProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <Loader label="Memeriksa sesi..." />
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />
  return children
}
