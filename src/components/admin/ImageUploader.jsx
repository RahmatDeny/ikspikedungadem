import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { FiUploadCloud, FiX } from 'react-icons/fi'
import { uploadImage } from '../../services/r2Upload.js'

/**
 * Reusable single-image uploader.
 * Props:
 *  - value: current image URL string
 *  - onChange: (url|null) => void
 *  - folder: logical R2 folder
 *  - label
 */
export default function ImageUploader({ value, onChange, folder = 'umum', label = 'Gambar', fit = 'cover', hint }) {
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setProgress(0)
    try {
      const url = await uploadImage(file, setProgress, folder)
      onChange(url)
      toast.success('Gambar berhasil diunggah.')
    } catch (err) {
      toast.error(err.message || 'Upload gagal.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const barStyle = { width: progress + '%' }

  return (
    <div>
      <label className="label">{label}</label>
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="preview"
            className={
              fit === 'contain'
                ? 'max-h-72 w-auto max-w-full rounded-lg border border-white/10 object-contain bg-hitam'
                : 'h-32 rounded-lg border border-white/10 object-cover'
            }
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 bg-merah text-white rounded-full w-6 h-6 flex items-center justify-center"
          >
            <FiX />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-white/15 rounded-lg p-6 flex flex-col items-center text-gray-400 hover:border-emas hover:text-emas transition"
        >
          <FiUploadCloud className="text-2xl mb-2" />
          <span className="text-sm">{uploading ? 'Mengunggah...' : (hint || 'Klik untuk memilih gambar (JPG/PNG/WEBP)')}</span>
        </button>
      )}

      {uploading && (
        <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-emas transition-all" style={barStyle} />
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleFile} />
    </div>
  )
}
