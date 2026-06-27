import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { FiUploadCloud, FiX } from 'react-icons/fi'
import { uploadImage } from '../../services/r2Upload.js'

/**
 * Gallery uploader. value is an array of { gambarUrl, caption }.
 */
export default function MultiImageUploader({ value = [], onChange, folder = 'galeri', label = 'Galeri Foto' }) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploading(true)
    try {
      const uploaded = []
      for (const file of files) {
        const url = await uploadImage(file, () => {}, folder)
        uploaded.push({ gambarUrl: url, caption: '' })
      }
      onChange([...(value || []), ...uploaded])
      toast.success(`${uploaded.length} gambar diunggah.`)
    } catch (err) {
      toast.error(err.message || 'Upload gagal.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const removeAt = (idx) => onChange(value.filter((_, i) => i !== idx))
  const setCaption = (idx, caption) =>
    onChange(value.map((it, i) => (i === idx ? { ...it, caption } : it)))

  return (
    <div>
      <label className="label">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
        {(value || []).map((img, idx) => (
          <div key={idx} className="relative">
            <img src={img.gambarUrl} alt="" className="h-24 w-full object-cover rounded-lg border border-white/10" />
            <button
              type="button"
              onClick={() => removeAt(idx)}
              className="absolute -top-2 -right-2 bg-merah text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              <FiX />
            </button>
            <input
              className="input mt-1 text-xs py-1"
              placeholder="Keterangan"
              value={img.caption || ''}
              onChange={(e) => setCaption(idx, e.target.value)}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="btn-outline"
      >
        <FiUploadCloud /> {uploading ? 'Mengunggah...' : 'Tambah Foto'}
      </button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={handleFiles} />
    </div>
  )
}
