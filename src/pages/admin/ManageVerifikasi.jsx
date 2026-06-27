import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  FiPlus, FiTrash2, FiFolder, FiShield, FiImage, FiHash, FiX, FiList,
} from 'react-icons/fi'
import useRealtimeData from '../../hooks/useRealtimeData.js'
import { createItem, updateItem, deleteItem, toArray, slugify } from '../../services/db.js'
import ConfirmModal from '../../components/admin/ConfirmModal.jsx'

// Field default yang umum (bisa diubah/dihapus admin saat membuat verifikasi)
const DEFAULT_FIELDS = [
  'Nomor Sertifikat', 'Nama', 'Jenis Sertifikat', 'Kategori', 'Penyelenggara',
  'Tanggal Kegiatan', 'Tanggal Terbit', 'Status Sertifikat', 'Keterangan',
]

function makeKey() {
  return 'f' + Math.random().toString(36).slice(2, 9)
}

const buildEmpty = () => ({
  judul: '',
  deskripsi: '',
  fields: DEFAULT_FIELDS.map((label) => ({ key: makeKey(), label })),
  usePreview: true,
  autoKode: true,
})

export default function ManageVerifikasi() {
  const { data, loading } = useRealtimeData('verifikasi')
  const { data: entriesData } = useRealtimeData('verifikasiData')
  const list = toArray(data).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  const entries = toArray(entriesData)

  const [editing, setEditing] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [saving, setSaving] = useState(false)

  const countFor = (verId) => entries.filter((e) => e.verId === verId).length

  const openNew = () => setEditing(buildEmpty())
  const openEdit = (item) =>
    setEditing({
      ...buildEmpty(),
      ...item,
      fields: Array.isArray(item.fields) && item.fields.length
        ? item.fields.map((f) => ({ key: f.key || makeKey(), label: f.label || '' }))
        : buildEmpty().fields,
    })

  const addField = () =>
    setEditing((s) => ({ ...s, fields: [...s.fields, { key: makeKey(), label: '' }] }))
  const updateField = (i, label) =>
    setEditing((s) => ({ ...s, fields: s.fields.map((f, idx) => (idx === i ? { ...f, label } : f)) }))
  const removeField = (i) =>
    setEditing((s) => ({ ...s, fields: s.fields.filter((_, idx) => idx !== i) }))

  const save = async () => {
    if (!editing.judul.trim()) return toast.error('Judul verifikasi wajib diisi.')
    const fields = editing.fields
      .map((f) => ({ key: f.key || makeKey(), label: (f.label || '').trim() }))
      .filter((f) => f.label)
    if (fields.length === 0) return toast.error('Tambahkan minimal satu kolom detail.')

    setSaving(true)
    try {
      const payload = {
        judul: editing.judul.trim(),
        slug: slugify(editing.judul),
        deskripsi: editing.deskripsi || '',
        fields,
        usePreview: !!editing.usePreview,
        autoKode: !!editing.autoKode,
      }
      if (editing.id) {
        await updateItem('verifikasi/' + editing.id, payload)
        toast.success('Verifikasi diperbarui.')
      } else {
        await createItem('verifikasi', payload)
        toast.success('Verifikasi ditambahkan.')
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
      // Hapus template beserta seluruh data sertifikat di bawahnya.
      const childEntries = entries.filter((e) => e.verId === confirmId)
      await Promise.all(childEntries.map((e) => deleteItem('verifikasiData/' + e.id)))
      await deleteItem('verifikasi/' + confirmId)
      toast.success('Verifikasi & seluruh datanya dihapus.')
    } catch {
      toast.error('Gagal menghapus.')
    } finally {
      setConfirmId(null)
    }
  }

  if (loading) return <p className="text-gray-400">Memuat...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FiShield className="text-emas" /> Verifikasi Keaslian
        </h1>
        <button onClick={openNew} className="btn-gold"><FiPlus /> Tambah Verifikasi</button>
      </div>
      <p className="text-gray-400 mb-6 text-sm">
        Kelola kategori verifikasi sertifikat fisik. Buka sebuah verifikasi untuk mengelola data &amp; menerbitkan link/QR.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.length === 0 && (
          <p className="text-gray-500 col-span-full card p-6">Belum ada verifikasi. Klik &ldquo;Tambah Verifikasi&rdquo;.</p>
        )}
        {list.map((item) => (
          <div key={item.id} className="card p-5 flex flex-col">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-lg bg-emas/15 text-emas flex items-center justify-center text-xl shrink-0">
                <FiShield />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-semibold leading-snug">{item.judul}</p>
                <p className="text-xs text-gray-500 mt-0.5">{countFor(item.id)} data &middot; {(item.fields || []).length} kolom</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 text-[11px] text-gray-400">
              {item.usePreview && <span className="inline-flex items-center gap-1 bg-white/5 rounded px-2 py-0.5"><FiImage /> Preview</span>}
              {item.autoKode && <span className="inline-flex items-center gap-1 bg-white/5 rounded px-2 py-0.5"><FiHash /> Kode Auto</span>}
            </div>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
              <Link to={`/admin/verifikasi/${item.id}`} className="btn-gold flex-1 py-2 text-sm"><FiFolder /> Open</Link>
              <button onClick={() => openEdit(item)} className="btn-outline py-2 text-sm" title="Edit kolom"><FiList /></button>
              <button onClick={() => setConfirmId(item.id)} className="btn py-2 text-sm bg-white/10 text-merah-light hover:bg-white/20" title="Hapus"><FiTrash2 /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[65] bg-black/60 flex items-start justify-center overflow-y-auto p-4">
          <div className="card w-full max-w-2xl p-6 my-8 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editing.id ? 'Edit' : 'Tambah'} Verifikasi</h2>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white"><FiX /></button>
            </div>

            <div>
              <label className="label">Judul Verifikasi</label>
              <input
                className="input"
                placeholder="mis. Keaslian Sertifikat Diklat"
                value={editing.judul}
                onChange={(e) => setEditing({ ...editing, judul: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Deskripsi Singkat (opsional)</label>
              <input
                className="input"
                placeholder="Ditampilkan di bagian atas halaman publik"
                value={editing.deskripsi}
                onChange={(e) => setEditing({ ...editing, deskripsi: e.target.value })}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Kolom Detail Sertifikat</label>
                <button type="button" className="text-emas text-sm" onClick={addField}>+ Tambah Kolom</button>
              </div>
              <p className="text-xs text-gray-500 mb-2">Tentukan field apa saja yang harus ada di detail (mis. Nomor Sertifikat, Nama, dll).</p>
              <div className="space-y-2">
                {editing.fields.map((f, i) => (
                  <div key={f.key} className="flex gap-2 items-center">
                    <span className="text-xs text-gray-600 w-6 text-right">{i + 1}.</span>
                    <input
                      className="input"
                      placeholder="Nama kolom"
                      value={f.label}
                      onChange={(e) => updateField(i, e.target.value)}
                    />
                    <button type="button" className="text-merah-light px-2" onClick={() => removeField(i)}><FiTrash2 /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t border-white/5 pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#D4AF37]"
                  checked={editing.usePreview}
                  onChange={(e) => setEditing({ ...editing, usePreview: e.target.checked })}
                />
                <span className="text-sm text-gray-200">Aktifkan <b>Preview</b> (admin wajib upload foto sertifikat saat input data)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#D4AF37]"
                  checked={editing.autoKode}
                  onChange={(e) => setEditing({ ...editing, autoKode: e.target.checked })}
                />
                <span className="text-sm text-gray-200">Kode Verifikasi <b>otomatis</b> (KDM + kode unik, tidak bisa duplikat)</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button className="btn bg-white/10 text-gray-200 hover:bg-white/20" onClick={() => setEditing(null)}>Batal</button>
              <button className="btn-gold" disabled={saving} onClick={save}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirmId}
        title="Hapus Verifikasi"
        message="Hapus verifikasi ini beserta SELURUH data sertifikat & link di dalamnya? Tindakan ini tidak bisa dibatalkan."
        onConfirm={doDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}
