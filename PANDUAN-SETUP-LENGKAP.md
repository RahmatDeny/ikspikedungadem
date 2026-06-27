# 📘 Panduan Setup Lengkap — Website IKS.PI Kera Sakti Ranting Kedungadem

> Panduan ini ditulis selangkah demi selangkah dari NOL hingga website live di internet.
> Ikuti **berurutan dari atas ke bawah**. Jangan loncat-loncat agar tidak ada konfigurasi yang terlewat.

**Estimasi waktu:** 60–90 menit (untuk pemula).

---

## 🗺️ Peta Alur Besar (Gambaran Umum)

Sebelum mulai, pahami dulu 6 tahap besar yang akan kita lalui:

```
TAHAP 1  →  Siapkan komputer (install Node.js, dll)
TAHAP 2  →  Setup Firebase (Database + Login admin)
TAHAP 3  →  Setup Cloudflare R2 + Worker (tempat simpan gambar)
TAHAP 4  →  Isi file .env (sambungkan semua kredensial)
TAHAP 5  →  Jalankan di lokal (uji coba di komputer sendiri)
TAHAP 6  →  Deploy ke internet (Firebase Hosting)
```

Diagram hubungan antar komponen:

```
[Pengunjung]  ──lihat──>  [Website React di Firebase Hosting]
                                  │  baca data
                                  ▼
                       [Firebase Realtime Database]
                                  ▲  tulis data (admin login)
                                  │
[Admin] ──login──> [Panel /admin] ──upload gambar──> [Cloudflare Worker] ──simpan──> [Cloudflare R2]
```

---

# 🧰 TAHAP 1 — Persiapan Komputer

### Langkah 1.1 — Install Node.js
1. Buka https://nodejs.org
2. Unduh versi **LTS** (disarankan v18 atau v20).
3. Install seperti aplikasi biasa (klik Next sampai selesai).
4. Verifikasi: buka **Terminal** (Mac/Linux) atau **Command Prompt / PowerShell** (Windows), ketik:
   ```bash
   node -v
   npm -v
   ```
   Jika muncul nomor versi (mis. `v20.11.0`), berarti berhasil.

### Langkah 1.2 — Install Firebase CLI
Firebase CLI adalah alat untuk deploy ke Firebase. Ketik di terminal:
```bash
npm install -g firebase-tools
```
Verifikasi:
```bash
firebase --version
```

### Langkah 1.3 — Ekstrak Proyek
1. Ekstrak file `ikspi-kerasakti-kedungadem.zip`.
2. Buka folder hasil ekstrak di terminal. Contoh:
   ```bash
   cd /path/ke/ikspi-kerasakti-kedungadem
   ```
3. Install semua dependensi proyek:
   ```bash
   npm install
   ```
   Tunggu sampai selesai (akan muncul folder `node_modules`).

✅ **Checkpoint Tahap 1:** Node.js & Firebase CLI terinstall, dan `npm install` berhasil tanpa error.

---

# 🔥 TAHAP 2 — Setup Firebase

### Langkah 2.1 — Buat Project Firebase
1. Buka https://console.firebase.google.com
2. Klik **Add project** / **Tambah proyek**.
3. Beri nama, mis. `ikspi-kerasakti-kedungadem`.
4. Google Analytics boleh dimatikan (opsional). Klik **Create project**.

### Langkah 2.2 — Aktifkan Authentication (Login Admin)
1. Di menu kiri: **Build → Authentication**.
2. Klik **Get started**.
3. Pilih tab **Sign-in method**.
4. Klik **Email/Password** → aktifkan toggle pertama → **Save**.

### Langkah 2.3 — Buat Akun Admin
1. Masih di Authentication, buka tab **Users**.
2. Klik **Add user**.
3. Masukkan **email** dan **password** untuk admin (catat baik-baik, ini untuk login ke `/admin`).
4. Setelah dibuat, akan muncul kolom **User UID** (deretan huruf-angka). **SALIN UID INI** — akan dipakai di Langkah 2.6 dan Tahap 3.

### Langkah 2.4 — Aktifkan Realtime Database
1. Di menu kiri: **Build → Realtime Database**.
2. Klik **Create Database**.
3. Pilih lokasi server (mis. Singapore `asia-southeast1`).
4. Pilih **Start in locked mode** → **Enable**.
5. Catat URL database yang muncul (mis. `https://ikspi-xxxx.asia-southeast1.firebasedatabase.app`).

### Langkah 2.5 — Ambil Konfigurasi Web App
1. Klik ikon ⚙️ (Settings) di kiri atas → **Project settings**.
2. Scroll ke bagian **Your apps** → klik ikon **Web** (`</>`).
3. Beri nama app (mis. `ikspi-web`) → **Register app**.
4. Akan muncul object `firebaseConfig` seperti ini:
   ```js
   const firebaseConfig = {
     apiKey: "AIza....",
     authDomain: "ikspi-xxxx.firebaseapp.com",
     databaseURL: "https://ikspi-xxxx.firebasedatabase.app",
     projectId: "ikspi-xxxx",
     storageBucket: "ikspi-xxxx.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:123:web:abc"
   };
   ```
   **Biarkan tab ini terbuka** — nilainya akan kita salin ke `.env` di Tahap 4.

### Langkah 2.6 — Daftarkan UID Admin ke Whitelist
Ini WAJIB agar admin boleh menyimpan data (sesuai aturan keamanan).
1. Buka **Build → Realtime Database → tab Data**.
2. Arahkan kursor ke root, klik tombol **+**.
3. Buat struktur berikut secara manual:
   - Name: `adminWhitelist` → lalu di dalamnya tambah child:
   - Name: `<UID_ADMIN_dari_Langkah_2.3>` , Value: `true`
4. Hasil akhirnya kira-kira begini:
   ```json
   {
     "adminWhitelist": {
       "AbCd1234EfGh5678": true
     }
   }
   ```

### Langkah 2.7 — Hubungkan Proyek Lokal ke Firebase
Di terminal, dalam folder proyek:
```bash
firebase login
```
(akan membuka browser untuk login Google). Lalu:
```bash
firebase use --add
```
Pilih project Firebase Anda, beri alias `default`.

### Langkah 2.8 — Deploy Security Rules Database
Aturan keamanan sudah ada di file `database.rules.json` (baca publik, tulis hanya admin). Deploy dengan:
```bash
firebase deploy --only database
```

✅ **Checkpoint Tahap 2:** Project Firebase dibuat, login Email/Password aktif, akun admin dibuat + UID terdaftar di `adminWhitelist`, Realtime Database aktif, rules ter-deploy.

---

# ☁️ TAHAP 3 — Setup Cloudflare R2 + Worker (Penyimpanan Gambar)

> Mengapa pakai Worker? Agar kunci rahasia R2 tidak pernah bocor ke browser. Browser admin hanya bicara ke Worker; Worker yang memverifikasi token admin lalu menyimpan ke R2.

### Langkah 3.1 — Buat Bucket R2
1. Buka https://dash.cloudflare.com → menu **R2**.
2. Klik **Create bucket**, beri nama mis. `ikspi-media`.
3. Setelah dibuat, buka tab **Settings** bucket → bagian **Public access**:
   - Aktifkan **Public Development URL**, ATAU
   - Hubungkan **Custom Domain** (mis. `media.domainanda.com`) — lebih rapi untuk produksi.
4. **Catat base URL publik** bucket (mis. `https://pub-xxxx.r2.dev` atau `https://media.domainanda.com`).

### Langkah 3.2 — Konfigurasi Worker
1. Di terminal, masuk folder worker:
   ```bash
   cd worker
   npm install
   ```
2. Buka file `worker/wrangler.toml`, sesuaikan:
   ```toml
   [[r2_buckets]]
   binding = "BUCKET"
   bucket_name = "ikspi-media"          # <- nama bucket Anda

   [vars]
   FIREBASE_PROJECT_ID = "ikspi-xxxx"   # <- projectId Firebase Anda
   PUBLIC_BASE_URL = "https://pub-xxxx.r2.dev"   # <- base URL publik bucket (TANPA / di akhir)
   ```

### Langkah 3.3 — Set Daftar UID Admin (Secret)
Worker hanya menerima upload dari UID admin yang terdaftar. Ketik:
```bash
npx wrangler secret put ADMIN_UIDS
```
Ketika diminta, masukkan UID admin (Langkah 2.3). Jika lebih dari satu admin, pisahkan dengan koma:
```
AbCd1234EfGh5678,XyZ9876UvW5432
```

### Langkah 3.4 — Deploy Worker
```bash
npx wrangler deploy
```
Setelah sukses, akan muncul URL Worker, mis:
```
https://ikspi-r2-uploader.namaakun.workers.dev
```
**Catat URL ini** — akan dipakai di `.env` (Tahap 4).

> 💡 Jika belum pernah pakai wrangler, jalankan `npx wrangler login` dulu untuk menghubungkan akun Cloudflare.

✅ **Checkpoint Tahap 3:** Bucket R2 dibuat + publik, Worker ter-deploy, dan Anda punya URL Worker.

---

# 🔑 TAHAP 4 — Isi File .env

File `.env` menyambungkan website ke Firebase dan Worker.

### Langkah 4.1 — Buat file .env
Di folder utama proyek:
```bash
cp .env.example .env
```

### Langkah 4.2 — Isi nilainya
Buka `.env` dengan editor teks, isi dari Langkah 2.5 dan 3.4:
```
VITE_FIREBASE_API_KEY=AIza....
VITE_FIREBASE_AUTH_DOMAIN=ikspi-xxxx.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://ikspi-xxxx.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=ikspi-xxxx
VITE_FIREBASE_STORAGE_BUCKET=ikspi-xxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:123:web:abc
VITE_R2_WORKER_URL=https://ikspi-r2-uploader.namaakun.workers.dev
VITE_R2_PUBLIC_BASE_URL=https://pub-xxxx.r2.dev
```

> ⚠️ **PENTING:** Jangan tambahkan tanda `/` di akhir URL. Jangan commit file `.env` ke Git (sudah otomatis di-ignore).

✅ **Checkpoint Tahap 4:** File `.env` terisi lengkap dengan kredensial yang benar.

---

# 💻 TAHAP 5 — Jalankan di Lokal (Uji Coba)

### Langkah 5.1 — Jalankan server pengembangan
Di folder utama proyek:
```bash
npm run dev
```
Buka browser ke alamat yang muncul (biasanya **http://localhost:5173**).

### Langkah 5.2 — Uji halaman publik
- Buka http://localhost:5173 → halaman Beranda tampil (masih kosong karena belum ada data — itu normal).

### Langkah 5.3 — Uji login admin
1. Buka http://localhost:5173/admin/login
2. Login dengan email & password admin (Langkah 2.3).
3. Berhasil masuk → muncul Dashboard.

### Langkah 5.4 — Isi konten pertama & uji upload
1. Masuk **Settings Umum** → isi nama organisasi, kontak → Simpan.
2. Masuk **Kelola Beranda** → isi hero + upload gambar banner.
   - Jika gambar berhasil tampil → koneksi R2 + Worker SUKSES. 🎉
3. Coba tambah 1 **Berita** dan 1 **Sub Ranting**, lalu cek muncul di halaman publik.

> 🔍 **Jika upload gambar gagal:** cek kembali Tahap 3 (URL Worker di `.env`, ADMIN_UIDS, public access bucket).

✅ **Checkpoint Tahap 5:** Bisa login, isi data, upload gambar, dan data tampil di halaman publik.

---

# 🚀 TAHAP 6 — Deploy ke Internet

### Langkah 6.1 — Build versi produksi
Di folder utama proyek:
```bash
npm run build
```
Ini menghasilkan folder `dist/` (versi siap pakai).

### Langkah 6.2 — Deploy ke Firebase Hosting
```bash
firebase deploy --only hosting,database
```
Setelah selesai, Firebase memberi URL live, mis:
```
https://ikspi-xxxx.web.app
```

### Langkah 6.3 — (Opsional) Pasang Domain Sendiri
1. Firebase Console → **Hosting → Add custom domain**.
2. Ikuti instruksi verifikasi & pengaturan DNS.

✅ **Checkpoint Tahap 6:** Website sudah live dan bisa diakses publik.

---

# 🗂️ Struktur Data Realtime Database (Referensi)

```
/settings
  /general    -> { namaOrganisasi, alamatSekretariat, telepon, email, instagram, facebook }
  /beranda
    /hero       -> { judul, subjudul, gambarUrl }
    /sambutan   -> { isiHtml }
    /statistik  -> { jumlahAnggota, tahunBerdiri, jumlahPelatih }   // jumlah sub ranting OTOMATIS
    /galeri     -> { fotoN: { gambarUrl, caption, urutan } }
/berita
  /{id} -> { judul, slug, kategori, ringkasan, isiHtml, gambarUtamaUrl,
            galeriTambahan:[url], status, tanggalPublish, createdAt }
/subRanting
  /{id} -> { nama, slug, fotoUtamaUrl, namaKetua, pengurusInti:[{nama,jabatan}],
            alamat, jadwalKegiatan, deskripsiHtml, galeri:[{gambarUrl,caption}],
            koordinatLat, koordinatLng, kontakPerson, createdAt }
/kepengurusan
  /{id} -> { nama, jabatan, fotoUrl, parentId, urutan }
/adminWhitelist
  /{uid} -> true
```

---

# 🆘 Troubleshooting (Masalah Umum)

| Masalah | Penyebab & Solusi |
| --- | --- |
| `npm install` error | Pastikan Node.js v18+; coba hapus `node_modules` lalu ulang. |
| Login admin gagal terus | Email/password salah, atau Email/Password belum diaktifkan di Authentication. |
| Bisa login tapi gagal menyimpan data | UID admin belum terdaftar di `/adminWhitelist`, atau rules belum di-deploy. |
| Upload gambar gagal (error 401/403) | `ADMIN_UIDS` di Worker belum diisi/salah, atau token admin tidak valid. |
| Gambar ter-upload tapi tidak tampil | `PUBLIC_BASE_URL` (Worker) atau `VITE_R2_PUBLIC_BASE_URL` (.env) salah, atau bucket belum public. |
| Halaman putih saat refresh setelah deploy | Pastikan deploy pakai `firebase deploy` (SPA rewrite sudah diatur di `firebase.json`). |
| Data tidak muncul di publik | Cek status berita = `publish` (bukan `draft`). |

---

# ✅ Checklist Akhir

- [ ] Node.js & Firebase CLI terinstall
- [ ] `npm install` sukses
- [ ] Project Firebase + Authentication Email/Password aktif
- [ ] Akun admin dibuat & UID disalin
- [ ] Realtime Database aktif + UID di `adminWhitelist`
- [ ] `firebase deploy --only database` sukses
- [ ] Bucket R2 dibuat & public
- [ ] Worker ter-deploy + `ADMIN_UIDS` di-set
- [ ] `.env` terisi lengkap
- [ ] `npm run dev` jalan, login & upload sukses
- [ ] `npm run build` + `firebase deploy` → website live

---

_Dokumen ini adalah bagian dari proyek Website IKS.PI Kera Sakti Ranting Kedungadem, Cabang Bojonegoro._
