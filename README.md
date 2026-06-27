# Website Resmi IKS.PI Kera Sakti Ranting Kedungadem

Website fullstack ber-CMS untuk **IKS.PI Kera Sakti Ranting Kedungadem, Cabang Bojonegoro**. Seluruh konten halaman publik diatur penuh oleh admin melalui panel `/admin` — tidak ada konten yang di-hardcode.

## Stack Teknologi

| Lapisan | Teknologi |
| --- | --- |
| Frontend | React 18 + Vite + Tailwind CSS |
| Routing | React Router v6 (SPA) |
| Hosting | Firebase Hosting |
| Database | Firebase Realtime Database |
| Autentikasi | Firebase Authentication (Email/Password) |
| Penyimpanan gambar | Cloudflare R2 (via Cloudflare Worker presigned/proxy upload) |
| Editor konten | React-Quill (rich text) |
| SEO | react-helmet-async |
| Kompresi gambar | browser-image-compression (client-side) |

## Struktur Folder

```
ikspi-kerasakti-kedungadem/
├── public/                 # aset statis (logo)
├── src/
│   ├── components/
│   │   ├── public/         # Navbar, Footer, Layout, Card, Gallery, OrgChart, SEO, RichHtml
│   │   └── admin/          # Sidebar, AdminLayout, ImageUploader, RichTextEditor, ConfirmModal, ProtectedRoute
│   ├── context/            # AuthContext (Firebase Auth + whitelist admin)
│   ├── hooks/              # useRealtimeData (subscribe Realtime DB)
│   ├── pages/
│   │   ├── public/         # Home, NewsList, NewsDetail, SubRantingList, SubRantingDetail, Kepengurusan
│   │   └── admin/          # Login, Dashboard, ManageHome, ManageNews, ManageSubRanting, ManageKepengurusan, ManageSettings
│   ├── services/           # firebase.js, db.js, r2Upload.js
│   ├── App.jsx             # definisi route
│   ├── main.jsx            # entry
│   └── index.css           # Tailwind + tema
├── worker/                 # Cloudflare Worker untuk upload ke R2
│   ├── src/index.js
│   └── wrangler.toml
├── database.rules.json     # Security Rules Realtime Database
├── firebase.json / .firebaserc
├── .env.example
└── docs/SETUP.md           # panduan setup & deploy lengkap
```

## Halaman Publik

- **Beranda** — hero, sambitan, statistik (jumlah sub ranting dihitung otomatis), berita terbaru, galeri.
- **Berita** — daftar + filter kategori + load more, halaman detail rich text + galeri.
- **Sub Ranting** — daftar (list) → detail per sub ranting (routing `/sub-ranting/{slug}`).
- **Struktur Kepengurusan** — diagram organisasi (desktop) + accordion bertingkat (mobile).

## Panel Admin (`/admin`)

Modul: Kelola Beranda, Kelola Berita, Kelola Sub Ranting, Kelola Kepengurusan, Settings Umum. CRUD penuh, upload gambar dengan preview + progress, konfirmasi hapus, dan notifikasi toast.

## Mulai Cepat

```bash
npm install
cp .env.example .env     # isi kredensial Firebase + URL Worker
npm run dev
```

Untuk panduan lengkap (Firebase, R2, Worker, deploy), lihat **`docs/SETUP.md`**.
