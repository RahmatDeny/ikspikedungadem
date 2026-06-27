import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Login() {
  const { login, user, isAdmin, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user && isAdmin) navigate('/admin')
  }, [user, isAdmin, loading, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login(email, password)
      toast.success('Login berhasil.')
      navigate('/admin')
    } catch (err) {
      toast.error('Email atau kata sandi salah.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-hitam px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-emas">Panel Admin</h1>
          <p className="text-sm text-gray-400 mt-1">IKS.PI Kera Sakti Kedungadem</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Kata Sandi</label>
            <input type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={submitting} className="btn-gold w-full">
            {submitting ? 'Memproses...' : 'Masuk'}
          </button>
        </div>
      </form>
    </div>
  )
}
