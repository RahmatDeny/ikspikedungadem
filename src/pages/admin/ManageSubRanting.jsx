import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import useRealtimeData from '../../hooks/useRealtimeData.js'
import { createItem, updateItem, deleteItem, toArray, slugify } from '../../services/db.js'
import ImageUploader from '../../components/admin/ImageUploader.jsx'
import MultiImageUploader from '../../components/admin/MultiImageUploader.jsx'
import RichTextEditor from '../../components/admin/RichTextEditor.jsx'
import ConfirmModal from '../../components/admin/ConfirmModal.jsx'

const EMPTY = {
  nama: '', slug: '', fotoUtamaUrl: '', namaKetua: '', pengurusInti: [],
  alamat: '', jadwalKegiatan: '', deskripsiHtml: '', galeri: [],
  koordinatLat: '', koordinatLng: '', kontakPerson: '',
}

export default function ManageSubRanting() {
  const { data, loading } = useRealtimeData('subRanting')
  const list = toArray(data).sort((a, b) => (a.nama || '').localeCompare(b.nama || ''))
  const [editing, setEditing] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [saving, setSaving] = useState(false)

  const openNew = () => setEditing({ ...EMPTY })
  const openEdit = (item) =>
    setEditing({
      ...EMPTY,
      ...item,
      pengurusInti: Array.isArray(item.pengurusInti) ? item.pengurusInti : [],
      galeri: normalizeGallery(item.galeri),
    })

  const addPengurus = () => setEditing((s) => ({ ...s, pengurusInti: [...s.pengurusInti, { nama: '', jabatan: '' }] }))
  const updatePengurus = (i, field, val) =>
    setEditing((s) => ({
      ...s,
      pengurusInti: s.pengurusInti.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)),
    }))
  const removePengurus = (i) =>
    setEditing((s) => ({ ...s, pengurusInti: s.pengurusInti.filter((_, idx) => idx !== i) }))

  const save = async () => {
    if (!editing.nama) return toast.error('Nama sub ranting wajib diisi.')
    setSaving(true)
    try {
      const payload = {
        nama: editing.nama,
        slug: editing.slug ? slugify(editing.slug) : slugify(editing.nama),
        fotoUtamaUrl: editing.fotoUtamaUrl || '',
        namaKetua: editing.namaKetua || '',
        pengurusInti: (editing.pengurusInti || []).filter((p) => p.nama),
        alamat: editing.alamat || '',
        jadwalKegiatan: editing.jadwalKegiatan || '',
        deskripsiHtml: editing.deskripsiHtml || '',
        galeri: (editing.galeri || []).map((g) => ({ gambarUrl: g.gambarUrl, caption: g.caption || '' })),
        koordinatLat: editing.koordinatLat || '',
        koordinatLng: editing.koordinatLng || '',
        kontakPerson: editing.kontakPerson || '',
      }
      if (editing.id) {
        await updateItem('subRanting/' + editing.id, payload)
        toast.success('Sub ranting diperbarui.')
      } else {
        await createItem('subRanting', payload)
        toast.success('Sub ranting ditambahkan.')
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
      await deleteItem('subRanting/' + confirmId)
      toast.success('Sub ranting dihapus.')
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
        <h1 className="text-2xl font-bold text-white">Kelola Sub Ranting</h1>
        <button onClick={openNew} className="btn-gold"><FiPlus /> Tambah Sub Ranting</button>
      </div>

      <div className="card divide-y divide-white/5">
        {list.length === 0 && <p className="p-6 text-gray-500">Belum ada sub ranting.</p>}
        {list.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4">
            <img src={item.fotoUtamaUrl || 'https://placehold.co/80'} alt="" className="w-16 h-16 rounded object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{item.nama}</p>
              <p className="text-xs text-gray-500">{item.alamat || '-'} &middot; Ketua: {item.namaKetua || '-'}</p>
            </div>
            <button onClick={() => openEdit(item)} className="text-emas p-2"><FiEdit2 /></button>
            <button onClick={() => setConfirmId(item.id)} className="text-merah-light p-2"><FiTrash2 /></button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[65] bg-black/60 flex items-start justify-center overflow-y-auto p-4">
          <div className="card w-full max-w-2xl p-6 my-8 space-y-4">
            <h2 className="text-xl font-bold text-white">{editing.id ? 'Edit' : 'Tambah'} Sub Ranting</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Nama Sub Ranting</label>
                <input className="input" value={editing.nama} onChange={(e) => setEditing({ ...editing, nama: e.target.value })} />
              </div>
              <div>
                <label className="label">Slug (opsional)</label>
                <input className="input" placeholder="otomatis dari nama" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
              </div>
            </div>
            <ImageUploader label="Foto Utama" folder="sub-ranting" value={editing.fotoUtamaUrl} onChange={(url) => setEditing({ ...editing, fotoUtamaUrl: url })} />
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Nama Ketua</label>
                <input className="input" value={editing.namaKetua} onChange={(e) => setEditing({ ...editing, namaKetua: e.target.value })} />
              </div>
              <div>
                <label className="label">Kontak (HP/WA)</label>
                <input className="input" value={editing.kontakPerson} onChange={(e) => setEditing({ ...editing, kontakPerson: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Alamat / Lokasi</label>
              <input className="input" value={editing.alamat} onChange={(e) => setEditing({ ...editing, alamat: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Jadwal Latihan</label>
                <input className="input" placeholder="mis. Minggu, 08.00" value={editing.jadwalKegiatan} onChange={(e) => setEditing({ ...editing, jadwalKegiatan: e.target.value })} />
              </div>
              <div>
                <label className="label">Koordinat Lat</label>
                <input className="input" value={editing.koordinatLat} onChange={(e) => setEditing({ ...editing, koordinatLat: e.target.value })} />
              </div>
              <div>
                <label className="label">Koordinat Lng</label>
                <input className="input" value={editing.koordinatLng} onChange={(e) => setEditing({ ...editing, koordinatLng: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Profil / Deskripsi</label>
              <RichTextEditor value={editing.deskripsiHtml} onChange={(html) => setEditing({ ...editing, deskripsiHtml: html })} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Susunan Pengurus Inti</label>
                <button type="button" className="text-emas text-sm" onClick={addPengurus}>+ Tambah</button>
              </div>
              <div className="space-y-2">
                {editing.pengurusInti.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <input className="input" placeholder="Nama" value={p.nama} onChange={(e) => updatePengurus(i, 'nama', e.target.value)} />
                    <input className="input" placeholder="Jabatan" value={p.jabatan} onChange={(e) => updatePengurus(i, 'jabatan', e.target.value)} />
                    <button type="button" className="text-merah-light px-2" onClick={() => removePengurus(i)}><FiTrash2 /></button>
                  </div>
                ))}
              </div>
            </div>

            <MultiImageUploader label="Galeri Kegiatan" folder="sub-ranting" value={editing.galeri} onChange={(g) => setEditing({ ...editing, galeri: g })} />

            <div className="flex justify-end gap-3 pt-2">
              <button className="btn bg-white/10 text-gray-200 hover:bg-white/20" onClick={() => setEditing(null)}>Batal</button>
              <button className="btn-gold" disabled={saving} onClick={save}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal open={!!confirmId} message="Hapus sub ranting ini beserta seluruh datanya?" onConfirm={doDelete} onCancel={() => setConfirmId(null)} />
    </div>
  )
}

function normalizeGallery(arr) {
  if (!Array.isArray(arr)) return []
  return arr.map((it) => (typeof it === 'string' ? { gambarUrl: it, caption: '' } : it))
}
