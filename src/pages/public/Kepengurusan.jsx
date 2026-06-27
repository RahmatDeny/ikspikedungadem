import useRealtimeData from '../../hooks/useRealtimeData.js'
import SEO from '../../components/public/SEO.jsx'
import { Loader, EmptyState } from '../../components/public/Loader.jsx'
import OrgChart from '../../components/public/OrgChart.jsx'
import { toArray } from '../../services/db.js'

export default function Kepengurusan() {
  const { data: pengurusObj, loading } = useRealtimeData('kepengurusan')

  if (loading) return <Loader />
  const list = toArray(pengurusObj)

  return (
    <div className="container-page py-12">
      <SEO title="Struktur Kepengurusan" description="Struktur organisasi kepengurusan IKS.PI Kera Sakti Ranting Kedungadem." />
      <h1 className="section-title mb-3">Struktur Kepengurusan</h1>
      <p className="text-gray-400 mb-10 max-w-2xl">
        Susunan pengurus Ranting Kedungadem, Cabang Bojonegoro.
      </p>

      {list.length === 0 ? (
        <EmptyState message="Struktur kepengurusan belum diisi." />
      ) : (
        <OrgChart list={list} />
      )}
    </div>
  )
}
