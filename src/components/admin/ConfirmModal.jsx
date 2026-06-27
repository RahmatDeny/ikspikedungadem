import { FiAlertTriangle } from 'react-icons/fi'

export default function ConfirmModal({ open, title = 'Konfirmasi', message, onConfirm, onCancel, confirmLabel = 'Hapus' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="card max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3 text-merah-light">
          <FiAlertTriangle className="text-2xl" />
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <p className="text-gray-300 text-sm">{message || 'Apakah Anda yakin?'}</p>
        <div className="flex justify-end gap-3 mt-6">
          <button className="btn bg-white/10 text-gray-200 hover:bg-white/20" onClick={onCancel}>Batal</button>
          <button className="btn-primary" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
