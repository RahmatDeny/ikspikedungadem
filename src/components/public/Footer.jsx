import { FiInstagram, FiFacebook, FiMapPin, FiPhone, FiMail } from 'react-icons/fi'

export default function Footer({ settings }) {
  const s = settings || {}
  const year = new Date().getFullYear()
  return (
    <footer className="bg-biru-dark border-t-4 border-emas mt-16">
      <div className="container-page py-12 grid gap-8 md:grid-cols-3">
        <div>
          <h4 className="text-emas text-lg mb-3">{s.namaOrganisasi || 'IKS.PI Kera Sakti'}</h4>
          <p className="text-gray-300 text-sm leading-relaxed">
            Ranting Kedungadem, Cabang Bojonegoro. Mewujudkan generasi yang berbudi luhur, tahu benar dan salah, serta berjiwa kesatria.
          </p>
        </div>
        <div>
          <h4 className="text-emas text-lg mb-3">Kontak</h4>
          <ul className="space-y-2 text-gray-300 text-sm">
            {s.alamatSekretariat && (
              <li className="flex gap-2"><FiMapPin className="mt-1 shrink-0" /> <span>{s.alamatSekretariat}</span></li>
            )}
            {s.telepon && (
              <li className="flex gap-2"><FiPhone className="mt-1 shrink-0" /> <span>{s.telepon}</span></li>
            )}
            {s.email && (
              <li className="flex gap-2"><FiMail className="mt-1 shrink-0" /> <span>{s.email}</span></li>
            )}
          </ul>
        </div>
        <div>
          <h4 className="text-emas text-lg mb-3">Media Sosial</h4>
          <div className="flex gap-3">
            {s.instagram && (
              <a href={s.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-emas hover:text-hitam flex items-center justify-center transition">
                <FiInstagram />
              </a>
            )}
            {s.facebook && (
              <a href={s.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-emas hover:text-hitam flex items-center justify-center transition">
                <FiFacebook />
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-gray-400">
        &copy; {year} {s.namaOrganisasi || 'IKS.PI Kera Sakti Ranting Kedungadem'}. Hak cipta dilindungi.
      </div>
    </footer>
  )
}
