# Panduan Setup & Deploy

Dokumen ini menjelaskan langkah lengkap menyiapkan dan men-deploy website IKS.PI Kera Sakti Ranting Kedungadem.

---

## 1. Prasyarat

- Node.js 18+
- Akun Google/Firebase
- Akun Cloudflare (untuk R2 + Worker)
- Firebase CLI: `npm i -g firebase-tools`
- Wrangler CLI (ikut di devDependencies worker)

---

## 2. Setup Firebase

1. Buka [Firebase Console](https://console.firebase.google.com) → **Add project**.
2. Aktifkan **Build → Authentication → Sign-in method → Email/Password**.
3. Buat akun admin di tab **Users → Add user** (catat email & password). Salin **UID**-nya.
4. Aktifkan **Build → Realtime Database** → Create database (pilih lokasi, mulai dengan locked mode).
5. Buka **Project Settings → General → Your apps → Web app** untuk mendapatkan konfigurasi (apiKey, authDomain, dst).
6. Salin nilai-nilai itu ke file `.env` (lihat `.env.example`).

### Daftarkan UID admin (whitelist)
Di Realtime Database, buat node berikut secara manual (tab Data) supaya rules mengizinkan tulis hanya untuk admin:

```json
{
  "adminWhitelist": {
    "<UID_ADMIN>": true
  }
}
```

### Deploy Security Rules
Rules sudah ada di `database.rules.json` (read publik, write hanya UID di `adminWhitelist`). Deploy dengan:

```bash
firebase deploy --only database
```

---

## 3. Setup Cloudflare R2 + Worker

1. Di dashboard Cloudflare → **R2** → Create bucket, mis. `ikspi-media`.
2. Aktifkan **Public access** untuk bucket (atau pasang custom domain, mis. `media.domainanda.com`). Catat base URL publiknya.
3. Masuk folder `worker/`:
   ```bash
   cd worker
   npm install
   ```
4. Edit `wrangler.toml`:
   - `bucket_name` = nama bucket R2 Anda
   - `FIREBASE_PROJECT_ID` = project id Firebase
   - `PUBLIC_BASE_URL` = base URL publik bucket (tanpa trailing slash)
5. Set daftar UID admin sebagai secret:
   ```bash
   npx wrangler secret put ADMIN_UIDS
   # masukkan: uid1,uid2
   ```
6. Deploy:
   ```bash
   npx wrangler deploy
   ```
   Catat URL Worker (mis. `https://ikspi-r2-uploader.akun.workers.dev`) → isi ke `VITE_R2_WORKER_URL` di `.env`.

> **Keamanan**: Access Key/Secret R2 tidak pernah ada di frontend. Worker memverifikasi Firebase ID Token milik admin sebelum mengunggah ke R2.

---

## 4. Environment Variables (`.env`)

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_R2_WORKER_URL=https://ikspi-r2-uploader.akun.workers.dev
VITE_R2_PUBLIC_BASE_URL=https://media.domainanda.com
```

---

## 5. Menjalankan Lokal

```bash
npm install
npm run dev
```
Buka http://localhost:5173. Login admin di http://localhost:5173/admin/login.

---

## 6. Deploy Frontend ke Firebase Hosting

```bash
npm run build          # menghasilkan folder dist/
firebase login
firebase use --add     # pilih project Anda
firebase deploy --only hosting,database
```

Karena ini SPA, `firebase.json` sudah mengatur rewrite semua route ke `index.html`.

---

## 7. Struktur Data Realtime Database

```
/settings
  /general   -> { namaOrganisasi, alamatSekretariat, telepon, email, instagram, facebook }
  /beranda
    /hero       -> { judul, subjudul, gambarUrl }
    /sambutan   -> { isiHtml }
    /statistik  -> { jumlahAnggota, tahunBerdiri, jumlahPelatih }   // jumlah sub ranting dihitung otomatis
    /galeri     -> { fotoN: { gambarUrl, caption, urutan } }
/berita
  /{id} -> { judul, slug, kategori, ringkasan, isiHtml, gambarUtamaUrl, galeriTambahan:[url], status, tanggalPublish, createdAt }
/subRanting
  /{id} -> { nama, slug, fotoUtamaUrl, namaKetua, pengurusInti:[{nama,jabatan}], alamat, jadwalKegiatan,
            deskripsiHtml, galeri:[{gambarUrl,caption}], koordinatLat, koordinatLng, kontakPerson, createdAt }
/kepengurusan
  /{id} -> { nama, jabatan, fotoUrl, parentId, urutan }
/adminWhitelist
  /{uid} -> true
```

---

## 8. Checklist Pasca-Deploy

- [ ] Login admin berhasil
- [ ] Upload gambar (cek muncul di bucket R2 & tampil di situs)
- [ ] Tambah berita → muncul di Beranda & halaman Berita
- [ ] Tambah sub ranting → muncul di list & punya halaman detail sendiri
- [ ] Susun struktur kepengurusan → diagram tampil benar
- [ ] Cek tampilan mobile (responsive)
