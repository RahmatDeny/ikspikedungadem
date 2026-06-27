import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import useRealtimeData from '../../hooks/useRealtimeData.js'
import { setItem } from '../../services/db.js'

const FIELDS = [
  { key: 'namaOrganisasi', label: 'Nama Organisasi' },
  { key: 'alamatSekretariat', label: 'Alamat Sekretariat' },
  { key: 'telepon', label: 'Telepon / WhatsApp' },
  { key: 'email', label: 'Email' },
  { key: 'instagram', label: 'Link Instagram' },
  { key: 'facebook', label: 'Link Facebook' },
]

export default function ManageSettings() {
  const { data, loading } = useRealtimeData('settings/general')
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (data) setForm(data)
  }, [data])

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const save = async () => {
    setSaving(true)
    try {
      await setItem('settings/general', form)
      toast.success('Pengaturan disimpan.')
    } catch (e) {
      toast.error('Gagal menyimpan.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-gray-400">Memuat...</p>

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Settings Umum</h1>
      <div className="card p-6 space-y-4">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="label">{f.label}</label>
            <input className="input" value={form[f.key] || ''} onChange={(e) => update(f.key, e.target.value)} />
          </div>
        ))}
        <button onClick={save} disabled={saving} className="btn-gold">
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  )
}
