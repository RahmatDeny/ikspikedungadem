import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiEye, FiLink, FiDownload,
  FiCopy, FiCheck, FiX, FiRefreshCw, FiShield, FiUploadCloud, FiFileText,
  FiAlertTriangle,
} from 'react-icons/fi'
import useRealtimeData from '../../hooks/useRealtimeData.js'
import { createItem, updateItem, deleteItem, toArray } from '../../services/db.js'
import ImageUploader from '../../components/admin/ImageUploader.jsx'
import ConfirmModal from '../../components/admin/ConfirmModal.jsx'
import { makeQrDataUrl, downloadDataUrl, buildVerifikasiUrl, generateKode } from '../../utils/qr.js'
import { downloadTemplate, readRows, mapRows } from '../../utils/excel.js'

export default function VerifikasiDashboard() {
  const { verId } = useParams()
  const { data: ver, loading } = useRealtimeData(`verifikasi/${verId}`)
  const { data: allEntries } = useRealtimeData('verifikasiData')

  const entries = useMemo(
    () => toArray(allEntries).filter((e) => e.verId === verId).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
    [allEntries, verId]
  )
  const usedKodes = useMemo(() => toArray(allEntries).map((e) => e.kode).filter(Boolean), [allEntries])

  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [detailItem, setDetailItem] = useState(null)
  const [linkItem, setLinkItem] = useState(null)
  const [importPreview, setImportPreview] = useState(null) // { prepared, issues }
  const [importing, setImporting] = useState(false)
  const fileRef = useRef(null)

  const fields = (ver && Array.isArray(ver.fields)) ? ver.fields : []

  const openNew = () => {
    const values = {}
    fields.forEach((f) => { values[f.key] = '' })
    setEditing({
      values,
      previewUrl: '',
      kode: ver?.autoKode ? generateKode(usedKodes) : '',
    })
  }

  const openEdit = (item) => {
    const values = {}
    fields.forEach((f) => { values[f.key] = item.values?.[f.key] ?? '' })
    setEditing({ id: item.id, values, previewUrl: item.previewUrl || '', kode: item.kode || '' })
  }

  const setValue = (key, val) =>
    setEditing((s) => ({ ...s, values: { ...s.values, [key]: val } }))

  const regenKode = () =>
    setEditing((s) => ({ ...s, kode: generateKode(usedKodes) }))

  const save = async () => {
    if (!ver) return
    const kode = (editing.kode || '').trim()
    if (!kode) return toast.error('Kode verifikasi wajib diisi.')
    const dup = toArray(allEntries).find((e) => e.kode === kode && e.id !== editing.id)
    if (dup) return toast.error('Kode verifikasi sudah dipakai. Gunakan kode lain.')
    if (ver.usePreview && !editing.previewUrl) return toast.error('Preview wajib: silakan upload foto sertifikat.')

    setSaving(true)
    try {
      const payload = {
        verId,
        judul: ver.judul || '',
        deskripsi: ver.deskripsi || '',
        fields,
        usePreview: !!ver.usePreview,
        values: editing.values || {},
        previewUrl: ver.usePreview ? (editing.previewUrl || '') : '',
        kode,
      }
      if (editing.id) {
        await updateItem('verifikasiData/' + editing.id, payload)
        toast.success('Data diperbarui.')
      } else {
        await createItem('verifikasiData', payload)
        toast.success('Data ditambahkan.')
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
      await deleteItem('verifikasiData/' + confirmId)
      toast.success('Data dihapus.')
    } catch {
      toast.error('Gagal menghapus.')
    } finally {
      setConfirmId(null)
    }
  }

  // ---------- Import Excel ----------
  const handleTemplate = async () => {
    try {
      await downloadTemplate(ver)
      toast.success('Template diunduh.')
    } catch (e) {
      toast.error(e.message || 'Gagal membuat template.')
    }
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const rows = await readRows(file)
        const { prepared, issues } = mapRows(rows, ver, usedKodes)
        if (prepared.length === 0 && issues.length === 0) {
          toast.error('Tidak ada data terbaca pada file.')
        } else {
          setImportPreview({ prepared, issues })
        }
      } catch (err) {
        toast.error(err.message || 'Gagal membaca file.')
      }
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const confirmImport = async () => {
    if (!importPreview) return
    setImporting(true)
    try {
      for (const p of importPreview.prepared) {
        await createItem('verifikasiData', {
          verId,
          judul: ver.judul || '',
          deskripsi: ver.deskripsi || '',
          fields,
          usePreview: !!ver.usePreview,
          values: p.values,
          previewUrl: '',
          kode: p.kode,
        })
      }
      toast.success(`${importPreview.prepared.length} data berhasil diimport.`)
      setImportPreview(null)
    } catch (e) {
      toast.error('Gagal mengimport sebagian data.')
    } finally {
      setImporting(false)
    }
  }

  if (loading) return <p className="text-gray-400">Memuat...</p>
  if (!ver) {
    return (
      <div>
        <Link to="/admin/verifikasi" className="text-emas text-sm flex items-center gap-1 mb-4"><FiArrowLeft /> Kembali</Link>
        <p className="text-gray-400">Verifikasi tidak ditemukan.</p>
      </div>
    )
  }

  const primaryField = fields[0]
  const secondaryField = fields[1]
  const missingPreview = ver.usePreview ? entries.filter((e) => !e.previewUrl).length : 0

  return (
    <div>
      <Link to="/admin/verifikasi" className="text-emas text-sm flex items-center gap-1 mb-3"><FiArrowLeft /> Kembali ke daftar verifikasi</Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FiShield className="text-emas" /> {ver.judul}
        </h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleTemplate} className="btn-outline py-2 text-sm"><FiFileText /> Download Template</button>
          <button onClick={() => fileRef.current?.click()} className="btn bg-white/10 text-gray-100 hover:bg-white/20 py-2 text-sm"><FiUploadCloud /> Import Excel</button>
          <button onClick={openNew} className="btn-gold py-2 text-sm"><FiPlus /> Tambah Data</button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" hidden onChange={handleFile} />
        </div>
      </div>
      <p className="text-gray-400 mb-1 text-sm">{entries.length} data sertifikat diterbitkan.</p>
      {missingPreview > 0 && (
        <p className="text-amber-400/90 text-xs mb-5 flex items-center gap-1">
          <FiAlertTriangle /> {missingPreview} data belum memiliki foto preview — buka Edit untuk mengupload.
        </p>
      )}
      {missingPreview === 0 && <div className="mb-5" />}

      <div className="card divide-y divide-white/5">
        {entries.length === 0 && <p className="p-6 text-gray-500">Belum ada data. Klik &ldquo;Tambah Data&rdquo; atau &ldquo;Import Excel&rdquo;.</p>}
        {entries.map((item) => (
          <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">
                {primaryField ? (item.values?.[primaryField.key] || '-') : item.kode}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {secondaryField ? `${item.values?.[secondaryField.key] || '-'} · ` : ''}
                <span className="text-emas font-mono">{item.kode}</span>
                {ver.usePreview && !item.previewUrl && (
                  <span className="ml-2 text-amber-400 inline-flex items-center gap-1"><FiAlertTriangle /> tanpa preview</span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button onClick={() => setDetailItem(item)} className="btn bg-white/10 text-gray-200 hover:bg-white/20 py-1.5 px-3 text-xs"><FiEye /> Detail</button>
              <button onClick={() => setLinkItem(item)} className="btn bg-white/10 text-gray-200 hover:bg-white/20 py-1.5 px-3 text-xs"><FiLink /> Link & QR</button>
              <button onClick={() => openEdit(item)} className="text-emas p-2" title="Edit"><FiEdit2 /></button>
              <button onClick={() => setConfirmId(item.id)} className="text-merah-light p-2" title="Hapus"><FiTrash2 /></button>
            </div>
          </div>
        ))}
      </div>

      {/* ----- Form Tambah/Edit ----- */}
      {editing && (
        <div className="fixed inset-0 z-[65] bg-black/60 flex items-start justify-center overflow-y-auto p-4">
          <div className="card w-full max-w-2xl p-6 my-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editing.id ? 'Edit' : 'Tambah'} Data Sertifikat</h2>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white"><FiX /></button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="label">{f.label}</label>
                  <input
                    className="input"
                    value={editing.values[f.key] ?? ''}
                    onChange={(e) => setValue(f.key, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="label">Kode Verifikasi {ver.autoKode && <span className="text-emas">(otomatis)</span>}</label>
              <div className="flex gap-2">
                <input
                  className="input font-mono"
                  value={editing.kode}
                  readOnly={ver.autoKode}
                  placeholder="KDM-26-XXXX-XXXX"
                  onChange={(e) => setEditing({ ...editing, kode: e.target.value.toUpperCase() })}
                />
                {ver.autoKode && (
                  <button type="button" onClick={regenKode} className="btn-outline px-3" title="Buat ulang kode"><FiRefreshCw /></button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Kode ini unik untuk setiap orang dan tidak bisa diduplikasi.</p>
            </div>

            {ver.usePreview && (
              <ImageUploader
                label="Preview Foto Sertifikat (tampil penuh)"
                folder="verifikasi"
                fit="contain"
                hint="Klik untuk upload foto sertifikat (JPG/PNG/WEBP)"
                value={editing.previewUrl}
                onChange={(url) => setEditing({ ...editing, previewUrl: url || '' })}
              />
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button className="btn bg-white/10 text-gray-200 hover:bg-white/20" onClick={() => setEditing(null)}>Batal</button>
              <button className="btn-gold" disabled={saving} onClick={save}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ----- Detail ----- */}
      {detailItem && (
        <div className="fixed inset-0 z-[65] bg-black/60 flex items-start justify-center overflow-y-auto p-4" onClick={() => setDetailItem(null)}>
          <div className="card w-full max-w-xl p-6 my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Detail Sertifikat</h2>
              <button onClick={() => setDetailItem(null)} className="text-gray-400 hover:text-white"><FiX /></button>
            </div>
            <dl className="divide-y divide-white/5">
              {fields.map((f) => (
                <div key={f.key} className="py-2 grid grid-cols-3 gap-2">
                  <dt className="text-gray-400 text-sm">{f.label}</dt>
                  <dd className="col-span-2 text-gray-100 text-sm">{detailItem.values?.[f.key] || '-'}</dd>
                </div>
              ))}
              <div className="py-2 grid grid-cols-3 gap-2">
                <dt className="text-gray-400 text-sm">Kode Verifikasi</dt>
                <dd className="col-span-2 text-emas font-mono text-sm">{detailItem.kode}</dd>
              </div>
            </dl>
            {detailItem.usePreview && (
              <div className="mt-4">
                <p className="label">Preview</p>
                {detailItem.previewUrl ? (
                  <img src={detailItem.previewUrl} alt="preview" className="w-full rounded-lg border border-white/10 object-contain bg-hitam" />
                ) : (
                  <p className="text-amber-400/90 text-sm flex items-center gap-1"><FiAlertTriangle /> Belum ada foto preview.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----- Link & QR ----- */}
      {linkItem && <LinkQrModal item={linkItem} onClose={() => setLinkItem(null)} />}

      {/* ----- Import preview ----- */}
      {importPreview && (
        <div className="fixed inset-0 z-[65] bg-black/60 flex items-start justify-center overflow-y-auto p-4" onClick={() => !importing && setImportPreview(null)}>
          <div className="card w-full max-w-lg p-6 my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Konfirmasi Import</h2>
              <button onClick={() => !importing && setImportPreview(null)} className="text-gray-400 hover:text-white"><FiX /></button>
            </div>
            <p className="text-gray-200">
              <b className="text-emas">{importPreview.prepared.length}</b> data siap diimport.
              {importPreview.issues.length > 0 && (
                <> <b className="text-amber-400">{importPreview.issues.length}</b> baris dilewati.</>
              )}
            </p>
            {ver.usePreview && importPreview.prepared.length > 0 && (
              <p className="text-xs text-amber-400/90 mt-2 flex items-center gap-1">
                <FiAlertTriangle /> Foto preview belum termasuk. Upload manual per data setelah import lewat tombol Edit.
              </p>
            )}
            {importPreview.issues.length > 0 && (
              <div className="mt-3 max-h-40 overflow-y-auto text-xs text-gray-400 bg-hitam rounded-md p-3 space-y-1">
                {importPreview.issues.map((it, i) => (
                  <div key={i}>Baris {it.baris}: {it.reason}</div>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn bg-white/10 text-gray-200 hover:bg-white/20" disabled={importing} onClick={() => setImportPreview(null)}>Batal</button>
              <button className="btn-gold" disabled={importing || importPreview.prepared.length === 0} onClick={confirmImport}>
                {importing ? 'Mengimport...' : `Import ${importPreview.prepared.length} Data`}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal open={!!confirmId} message="Hapus data sertifikat ini?" onConfirm={doDelete} onCancel={() => setConfirmId(null)} />
    </div>
  )
}

function LinkQrModal({ item, onClose }) {
  const url = buildVerifikasiUrl(item.kode)
  const [qr, setQr] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    makeQrDataUrl(url).then((d) => { if (active) setQr(d) }).catch(() => {})
    return () => { active = false }
  }, [url])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link disalin.')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Gagal menyalin. Salin manual.')
    }
  }

  const download = () => {
    if (!qr) return
    downloadDataUrl(qr, `QR-${item.kode}.png`)
  }

  return (
    <div className="fixed inset-0 z-[65] bg-black/60 flex items-start justify-center overflow-y-auto p-4" onClick={onClose}>
      <div className="card w-full max-w-md p-6 my-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Link &amp; QR Verifikasi</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><FiX /></button>
        </div>

        <label className="label">Link Verifikasi</label>
        <div className="flex gap-2">
          <input className="input text-xs" readOnly value={url} onFocus={(e) => e.target.select()} />
          <button onClick={copy} className="btn-outline px-3">{copied ? <FiCheck /> : <FiCopy />}</button>
        </div>

        <div className="mt-5 flex flex-col items-center">
          {qr ? (
            <img src={qr} alt="QR" className="w-56 h-56 rounded-lg bg-white p-2" />
          ) : (
            <div className="w-56 h-56 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 text-sm">Membuat QR...</div>
          )}
          <p className="text-xs text-gray-500 mt-2 font-mono">{item.kode}</p>
          <button onClick={download} disabled={!qr} className="btn-gold mt-4"><FiDownload /> Download QR</button>
        </div>
      </div>
    </div>
  )
}
