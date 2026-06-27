# Fitur Verifikasi Keaslian Sertifikat

Fitur ini menambah modul **Verifikasi Keaslian** di panel admin + halaman publik untuk
mengecek keaslian sertifikat fisik melalui link/QR.

## Cara pakai (Admin)
1. Buka **Panel Admin → Verifikasi Keaslian**.
2. Klik **Tambah Verifikasi**:
   - Isi **Judul** (mis. "Keaslian Sertifikat Diklat").
   - Atur **Kolom Detail Sertifikat** (mis. Nomor Sertifikat, Nama, Jenis, dst). Sudah ada
     kolom default yang bisa ditambah/diubah/dihapus.
   - Centang **Preview** jika setiap data wajib upload foto sertifikat.
   - Centang **Kode Verifikasi otomatis** agar kode dibuat otomatis (KDM + kode unik).
3. Kartu verifikasi punya tombol **Open** (masuk dashboard), ikon edit kolom, dan **Hapus**.
4. Di **Dashboard**:
   - **Tambah Data** → isi field detail, kode verifikasi (auto/manual), dan upload preview bila aktif.
   - Setiap baris punya: **Detail** (lihat isian), **Link & QR** (salin link + unduh QR), **Edit**, **Hapus**.
5. Link publik tiap data: `https://domain-anda/verifikasi/<KODE>` — desain seperti contoh,
   **tanpa menu** dan `noindex` (khusus verifikasi sertifikat fisik).

## Kode Verifikasi
- Format: `KDM-<YY>-<XXXX>-<XXXX>` (hex, huruf besar), mis. `KDM-26-A8F4-91CD`.
- Dijamin unik (dicek terhadap kode yang sudah ada); bila manual, duplikat ditolak saat simpan.

## Struktur data (Firebase Realtime DB)
```
verifikasi/{verId}      -> { judul, slug, deskripsi, fields:[{key,label}], usePreview, autoKode, createdAt }
verifikasiData/{id}     -> { verId, judul, fields, usePreview, values:{key:val}, previewUrl, kode, createdAt }
```
Index sudah ditambahkan: `verifikasiData` di-index pada `kode`, `verId`, `createdAt`.

## File baru
- `src/utils/qr.js` — pembuat QR, unduh, builder URL, & generator kode unik.
- `src/pages/admin/ManageVerifikasi.jsx` — daftar verifikasi (tambah/open/hapus + atur kolom).
- `src/pages/admin/VerifikasiDashboard.jsx` — CRUD data + Detail + Link & QR.
- `src/pages/public/VerifikasiPublic.jsx` — halaman publik (sesuai desain).

## File diubah
- `src/App.jsx` (routing), `src/components/admin/Sidebar.jsx` (menu),
  `src/components/admin/ImageUploader.jsx` (opsi `fit="contain"` agar preview tampil penuh),
  `src/pages/admin/Dashboard.jsx` (kartu ringkasan), `database.rules.json` (rules+index),
  `package.json` (tambah dependency `qrcode`).

## Import Excel (Admin)
Di dalam Dashboard sebuah verifikasi:
- **Download Template** → file `.xlsx` dengan judul kolom = kolom yang sudah Anda set + kolom "Kode Verifikasi" (boleh kosong bila kode otomatis). Ada sheet "Petunjuk".
- **Import Excel** → pilih file `.xlsx`/`.csv`, sistem menampilkan ringkasan (siap import / baris dilewati) lalu konfirmasi.
- Foto/preview **tidak** lewat Excel. Setelah import, baris yang belum punya foto ditandai “tanpa preview”; admin tinggal klik **Edit** untuk upload foto manual per data.

## Langkah setelah update
```bash
npm install            # memasang dependency baru: qrcode, xlsx
npm run dev            # uji lokal
firebase deploy --only database   # menerapkan rules baru (penting!)
npm run deploy         # build + deploy hosting & database
```
> Catatan: background halaman publik memakai `public/asset_verifikasi.svg` dan logo `public/IKSPI.png` (sudah ada).
