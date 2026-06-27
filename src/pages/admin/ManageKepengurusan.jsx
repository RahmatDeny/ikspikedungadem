import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import useRealtimeData from '../../hooks/useRealtimeData.js'
import { createItem, updateItem, deleteItem, toArray } from '../../services/db.js'
import ImageUploader from '../../components/admin/ImageUploader.jsx'
import ConfirmModal from '../../components/admin/ConfirmModal.jsx'

const EMPTY = { nama: '', jabatan: '', fotoUrl: '', parentId: '', urutan: 0 }

export default function ManageKepengurusan() {
  const { data, loading } = useRealtimeData('kepengurusan')
  const list = toArray(data).sort((a, b) => (a.urutan ?? 999) - (b.urutan ?? 999))
  const [editing, setEditing] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [saving, setSaving] = useState(false)

  const openNew = () => setEditing({ ...EMPTY, urutan: list.length })
  const openEdit = (item) => setEditing({ ...EMPTY, ...item })

  const save = async () => {
    if (!editing.nama || !editing.jabatan) return toast.error('Nama dan jabatan wajib diisi.')
    setSaving(true)
    try {
      const payload = {
        nama: editing.nama,
        jabatan: editing.jabatan,
        fotoUrl: editing.fotoUrl || '',
        parentId: editing.parentId || null,
        urutan: Number(editing.urutan) || 0,
      }
      if (editing.id) {
        await updateItem('kepengurusan/' + editing.id, payload)
        toast.success('Pengurus diperbarui.')
      } else {
        await createItem('kepengurusan', payload)
        toast.success('Pengurus ditambahkan.')
      }
      setEditing(null)
    } catch (e) {
      toast.error('Gagal menyimpan.')
    } finally {
      setSaving(false)
    }
  }

  const doDelete = async () => {
    try {
      await deleteItem('kepengurusan/' + confirmId)
      toast.success('Pengurus dihapus.')
    } catch {
      toast.error('Gagal menghapus.')
    } finally {
      setConfirmId(null)
    }
  }

  // Parent options exclude the record being edited (avoid self-reference)
  const parentOptions = list.filter((p) => p.id !== editing?.id)

  if (loading) return <p className="text-gray-400">Memuat...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Kelola Struktur Kepengurusan</h1>
        <button onClick={openNew} className="btn-gold"><FiPlus /> Tambah Pengurus</button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Atur hierarki dengan memilih "Atasan". Pengurus tanpa atasan (mis. Ketua) menjadi puncak struktur. Urutan menentukan posisi kiri-ke-kanan.
      </p>

      <div className="card divide-y divide-white/5">
        {list.length === 0 && <p className="p-6 text-gray-500">Belum ada data pengurus.</p>}
        {list.map((item) => {
          const parent = list.find((p) => p.id === item.parentId)
          return (
            <div key={item.id} className="flex items-center gap-4 p-4">
              <img src={item.fotoUrl || 'https://placehold.co/80'} alt="" className="w-12 h-12 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{item.nama}</p>
                <p className="text-xs text-emas">{item.jabatan}{parent ? '  •  bawahan dari ' + parent.jabatan : '  •  puncak struktur'}</p>
              </div>
              <span className="text-xs text-gray-500">#{item.urutan}</span>
              <button onClick={() => openEdit(item)} className="text-emas p-2"><FiEdit2 /></button>
              <button onClick={() => setConfirmId(item.id)} className="text-merah-light p-2"><FiTrash2 /></button>
            </div>
          )
        })}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[65] bg-black/60 flex items-start justify-center overflow-y-auto p-4">
          <div className="card w-full max-w-lg p-6 my-8 space-y-4">
            <h2 className="text-xl font-bold text-white">{editing.id ? 'Edit' : 'Tambah'} Pengurus</h2>
            <ImageUploader label="Foto Pengurus" folder="pengurus" value={editing.fotoUrl} onChange={(url) => setEditing({ ...editing, fotoUrl: url })} />
            <div>
              <label className="label">Nama</label>
              <input className="input" value={editing.nama} onChange={(e) => setEditing({ ...editing, nama: e.target.value })} />
            </div>
            <div>
              <label className="label">Jabatan</label>
              <input className="input" value={editing.jabatan} onChange={(e) => setEditing({ ...editing, jabatan: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Atasan (Parent)</label>
                <select className="input" value={editing.parentId || ''} onChange={(e) => setEditing({ ...editing, parentId: e.target.value })}>
                  <option value="">— Tidak ada (puncak) —</option>
                  {parentOptions.map((p) => (
                    <option key={p.id} value={p.id}>{p.jabatan} ({p.nama})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Urutan</label>
                <input type="number" className="input" value={editing.urutan} onChange={(e) => setEditing({ ...editing, urutan: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button className="btn bg-white/10 text-gray-200 hover:bg-white/20" onClick={() => setEditing(null)}>Batal</button>
              <button className="btn-gold" disabled={saving} onClick={save}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal open={!!confirmId} message="Hapus data pengurus ini?" onConfirm={doDelete} onCancel={() => setConfirmId(null)} />
    </div>
  )
}
