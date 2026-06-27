import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import useRealtimeData from '../../hooks/useRealtimeData.js'
import { createItem, updateItem, deleteItem, toArray, slugify } from '../../services/db.js'
import ImageUploader from '../../components/admin/ImageUploader.jsx'
import MultiImageUploader from '../../components/admin/MultiImageUploader.jsx'
import RichTextEditor from '../../components/admin/RichTextEditor.jsx'
import ConfirmModal from '../../components/admin/ConfirmModal.jsx'
import { KATEGORI_BERITA as KATEGORI } from '../../constants/categories.js'
const EMPTY = {
  judul: '', slug: '', kategori: 'Kegiatan', ringkasan: '', isiHtml: '',
  gambarUtamaUrl: '', galeriTambahan: [], status: 'draft', tanggalPublish: Date.now(),
}

export default function ManageNews() {
  const { data, loading } = useRealtimeData('berita')
  const list = toArray(data).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  const [editing, setEditing] = useState(null) // {id?, ...fields}
  const [confirmId, setConfirmId] = useState(null)
  const [saving, setSaving] = useState(false)

  const openNew = () => setEditing({ ...EMPTY, tanggalPublish: Date.now() })
  const openEdit = (item) => setEditing({ ...item, galeriTambahan: normalizeGallery(item.galeriTambahan) })

  const save = async () => {
    if (!editing.judul) return toast.error('Judul wajib diisi.')
    setSaving(true)
    try {
      const payload = {
        judul: editing.judul,
        slug: editing.slug ? slugify(editing.slug) : slugify(editing.judul),
        kategori: editing.kategori,
        ringkasan: editing.ringkasan || '',
        isiHtml: editing.isiHtml || '',
        gambarUtamaUrl: editing.gambarUtamaUrl || '',
        galeriTambahan: (editing.galeriTambahan || []).map((g) => g.gambarUrl),
        status: editing.status,
        tanggalPublish: editing.tanggalPublish || Date.now(),
      }
      if (editing.id) {
        await updateItem('berita/' + editing.id, payload)
        toast.success('Berita diperbarui.')
      } else {
        await createItem('berita', payload)
        toast.success('Berita ditambahkan.')
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
      await deleteItem('berita/' + confirmId)
      toast.success('Berita dihapus.')
    } catch {
      toast.error('Gagal menghapus.')
    } finally {
      setConfirmId(null)
    }
  }

  if (loading) return <p className="text-gray-400">Memuat...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Kelola Berita</h1>
        <button onClick={openNew} className="btn-gold"><FiPlus /> Tambah Berita</button>
      </div>

      <div className="card divide-y divide-white/5">
        {list.length === 0 && <p className="p-6 text-gray-500">Belum ada berita.</p>}
        {list.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4">
            <img src={item.gambarUtamaUrl || 'https://placehold.co/80'} alt="" className="w-16 h-16 rounded object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{item.judul}</p>
              <p className="text-xs text-gray-500">{item.kategori} &middot; <span className={item.status === 'publish' ? 'text-green-400' : 'text-yellow-400'}>{item.status}</span></p>
            </div>
            <button onClick={() => openEdit(item)} className="text-emas p-2"><FiEdit2 /></button>
            <button onClick={() => setConfirmId(item.id)} className="text-merah-light p-2"><FiTrash2 /></button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[65] bg-black/60 flex items-start justify-center overflow-y-auto p-4">
          <div className="card w-full max-w-2xl p-6 my-8 space-y-4">
            <h2 className="text-xl font-bold text-white">{editing.id ? 'Edit' : 'Tambah'} Berita</h2>
            <div>
              <label className="label">Judul</label>
              <input className="input" value={editing.judul} onChange={(e) => setEditing({ ...editing, judul: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Slug (opsional)</label>
                <input className="input" placeholder="otomatis dari judul" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
              </div>
              <div>
                <label className="label">Kategori</label>
                <select className="input" value={editing.kategori} onChange={(e) => setEditing({ ...editing, kategori: e.target.value })}>
                  {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Ringkasan</label>
              <textarea className="input" rows={2} value={editing.ringkasan} onChange={(e) => setEditing({ ...editing, ringkasan: e.target.value })} />
            </div>
            <ImageUploader label="Gambar Utama" folder="berita" value={editing.gambarUtamaUrl} onChange={(url) => setEditing({ ...editing, gambarUtamaUrl: url })} />
            <div>
              <label className="label">Isi Berita</label>
              <RichTextEditor value={editing.isiHtml} onChange={(html) => setEditing({ ...editing, isiHtml: html })} />
            </div>
            <MultiImageUploader label="Galeri Tambahan" folder="berita" value={editing.galeriTambahan} onChange={(g) => setEditing({ ...editing, galeriTambahan: g })} />
            <div>
              <label className="label">Status</label>
              <select className="input" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="publish">Publish</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button className="btn bg-white/10 text-gray-200 hover:bg-white/20" onClick={() => setEditing(null)}>Batal</button>
              <button className="btn-gold" disabled={saving} onClick={save}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal open={!!confirmId} message="Hapus berita ini? Tindakan tidak dapat dibatalkan." onConfirm={doDelete} onCancel={() => setConfirmId(null)} />
    </div>
  )
}

function normalizeGallery(arr) {
  if (!Array.isArray(arr)) return []
  return arr.map((it) => (typeof it === 'string' ? { gambarUrl: it, caption: '' } : it))
}
