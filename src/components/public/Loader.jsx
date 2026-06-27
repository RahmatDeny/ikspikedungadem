export function Loader({ label = 'Memuat...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <div className="w-12 h-12 border-4 border-emas/30 border-t-emas rounded-full animate-spin" />
      <p className="mt-4 text-sm">{label}</p>
    </div>
  )
}

export function ErrorState({ message = 'Terjadi kesalahan saat memuat data.' }) {
  return (
    <div className="text-center py-16">
      <p className="text-merah-light font-semibold">{message}</p>
      <p className="text-gray-500 text-sm mt-2">Silakan muat ulang halaman.</p>
    </div>
  )
}

export function EmptyState({ message = 'Belum ada data.' }) {
  return (
    <div className="text-center py-16 text-gray-500">
      <p>{message}</p>
    </div>
  )
}
