import useRealtimeData from '../../hooks/useRealtimeData.js'
import SEO from '../../components/public/SEO.jsx'
import { Loader, EmptyState } from '../../components/public/Loader.jsx'
import SubRantingCard from '../../components/public/SubRantingCard.jsx'
import { toArray } from '../../services/db.js'

export default function SubRantingList() {
  const { data: subObj, loading } = useRealtimeData('subRanting')

  if (loading) return <Loader />
  const list = toArray(subObj).sort((a, b) => (a.nama || '').localeCompare(b.nama || ''))

  return (
    <div className="container-page py-12">
      <SEO title="Sub Ranting" description="Daftar sub ranting di bawah IKS.PI Kera Sakti Ranting Kedungadem." />
      <h1 className="section-title mb-3">Sub Ranting</h1>
      <p className="text-gray-400 mb-8 max-w-2xl">
        Daftar seluruh sub ranting di bawah naungan Ranting Kedungadem. Klik salah satu untuk melihat profil lengkapnya.
      </p>

      {list.length === 0 ? (
        <EmptyState message="Belum ada sub ranting yang terdaftar." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((item) => (
            <SubRantingCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
