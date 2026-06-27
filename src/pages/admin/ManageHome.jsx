import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import useRealtimeData from '../../hooks/useRealtimeData.js'
import { setItem, toArray } from '../../services/db.js'
import ImageUploader from '../../components/admin/ImageUploader.jsx'
import MultiImageUploader from '../../components/admin/MultiImageUploader.jsx'
import RichTextEditor from '../../components/admin/RichTextEditor.jsx'

export default function ManageHome() {
  const { data, loading } = useRealtimeData('settings/beranda')
  const [hero, setHero] = useState({})
  const [sambutan, setSambutan] = useState({})
  const [tokoh, setTokoh] = useState({ kiri: {}, kanan: {}, semboyan: '', motto: '', falsafah: '' })
  const [galeri, setGaleri] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (data) {
      setHero(data.hero || {})
      setSambutan(data.sambutan || {})
      setTokoh({
        kiri: data.tokoh?.kiri || {},
        kanan: data.tokoh?.kanan || {},
        semboyan: data.tokoh?.semboyan || '',
        motto: data.tokoh?.motto || '',
        falsafah: data.tokoh?.falsafah || '',
      })
      const g = toArray(data.galeri).sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0))
      setGaleri(g.map((it) => ({ gambarUrl: it.gambarUrl, caption: it.caption || '' })))
    }
  }, [data])

  const setKiri = (patch) => setTokoh((t) => ({ ...t, kiri: { ...t.kiri, ...patch } }))
  const setKanan = (patch) => setTokoh((t) => ({ ...t, kanan: { ...t.kanan, ...patch } }))

  const save = async () => {
    setSaving(true)
    try {
      const galeriObj = {}
      galeri.forEach((g, i) => {
        galeriObj['foto' + i] = { gambarUrl: g.gambarUrl, caption: g.caption || '', urutan: i }
      })
      await setItem('settings/beranda', {
        hero,
        sambutan,
        tokoh: {
          kiri: { fotoUrl: tokoh.kiri?.fotoUrl || '', nama: tokoh.kiri?.nama || '' },
          kanan: { fotoUrl: tokoh.kanan?.fotoUrl || '', nama: tokoh.kanan?.nama || '' },
          semboyan: tokoh.semboyan || '',
          motto: tokoh.motto || '',
          falsafah: tokoh.falsafah || '',
        },
        galeri: galeriObj,
      })
      toast.success('Beranda diperbarui.')
    } catch (e) {
      toast.error('Gagal menyimpan.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-gray-400">Memuat...</p>

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Kelola Beranda</h1>

      <section className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-emas">Hero / Banner</h2>
        <div>
          <label className="label">Judul</label>
          <input className="input" value={hero.judul || ''} onChange={(e) => setHero({ ...hero, judul: e.target.value })} />
        </div>
        <div>
          <label className="label">Sub Judul</label>
          <input className="input" value={hero.subjudul || ''} onChange={(e) => setHero({ ...hero, subjudul: e.target.value })} />
        </div>
        <ImageUploader
          label="Gambar Banner"
          folder="beranda"
          value={hero.gambarUrl}
          onChange={(url) => setHero({ ...hero, gambarUrl: url })}
        />
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-emas">Kata Sambutan</h2>
        <RichTextEditor value={sambutan.isiHtml} onChange={(html) => setSambutan({ isiHtml: html })} />
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-emas">Tokoh & Semboyan</h2>
        <p className="text-xs text-gray-500">
          Dua foto tokoh (mis. Guru Besar &amp; Ketua Umum) dengan teks semboyan di tengahnya.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <ImageUploader
              label="Foto Tokoh Kiri"
              folder="tokoh"
              value={tokoh.kiri?.fotoUrl}
              onChange={(url) => setKiri({ fotoUrl: url })}
            />
            <div>
              <label className="label">Nama Tokoh Kiri</label>
              <input
                className="input"
                placeholder="mis. Guru Besar"
                value={tokoh.kiri?.nama || ''}
                onChange={(e) => setKiri({ nama: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-3">
            <ImageUploader
              label="Foto Tokoh Kanan"
              folder="tokoh"
              value={tokoh.kanan?.fotoUrl}
              onChange={(url) => setKanan({ fotoUrl: url })}
            />
            <div>
              <label className="label">Nama Tokoh Kanan</label>
              <input
                className="input"
                placeholder="mis. Ketua Umum"
                value={tokoh.kanan?.nama || ''}
                onChange={(e) => setKanan({ nama: e.target.value })}
              />
            </div>
          </div>
        </div>
        <div>
          <label className="label">Semboyan (teks di antara kedua foto)</label>
          <textarea
            className="input"
            rows={2}
            placeholder="Tulis semboyan organisasi"
            value={tokoh.semboyan || ''}
            onChange={(e) => setTokoh({ ...tokoh, semboyan: e.target.value })}
          />
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-emas">Motto &amp; Falsafah</h2>
        <div>
          <label className="label">Motto</label>
          <textarea
            className="input"
            rows={3}
            value={tokoh.motto || ''}
            onChange={(e) => setTokoh({ ...tokoh, motto: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Falsafah</label>
          <textarea
            className="input"
            rows={3}
            value={tokoh.falsafah || ''}
            onChange={(e) => setTokoh({ ...tokoh, falsafah: e.target.value })}
          />
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-emas">Galeri Beranda</h2>
        <MultiImageUploader value={galeri} onChange={setGaleri} folder="beranda" label="Foto Galeri" />
      </section>

      <button onClick={save} disabled={saving} className="btn-gold">
        {saving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
      </button>
    </div>
  )
}
