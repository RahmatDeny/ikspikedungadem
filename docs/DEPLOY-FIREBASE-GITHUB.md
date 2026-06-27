# Panduan Deploy Otomatis ke Firebase Hosting via GitHub

Panduan ini menjelaskan cara menghubungkan project ini ke GitHub dan Firebase Hosting, sehingga setiap update yang di-`push` ke GitHub akan otomatis membangun project dan memperbarui website.

Project ini memakai:

- React + Vite
- Firebase Hosting
- Firebase Realtime Database
- Output build: `dist`
- Firebase project ID: `ikspikedungadem-3a546`

---

## 1. Syarat Awal

Pastikan sudah tersedia:

- Akun GitHub
- Akun Firebase
- Project Firebase sudah dibuat
- Node.js sudah terinstall
- Git sudah terinstall
- Firebase CLI sudah terinstall

Cek versi:

```bash
node -v
npm -v
git --version
firebase --version
```

Jika Firebase CLI belum ada:

```bash
npm install -g firebase-tools
```

Login ke Firebase:

```bash
firebase login
```

---

## 2. Pastikan Project Bisa Build di Lokal

Dari folder root project:

```bash
npm install
npm run build
```

Jika berhasil, akan muncul folder:

```text
dist/
```

Folder `dist` inilah yang akan di-upload ke Firebase Hosting.

---

## 3. Pastikan Konfigurasi Firebase Sudah Benar

Project ini sudah memiliki file:

```text
firebase.json
.firebaserc
database.rules.json
```

Isi penting `firebase.json`:

```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

Artinya Firebase Hosting akan mengambil hasil build dari folder `dist`.

Isi `.firebaserc` sudah mengarah ke project:

```json
{
  "projects": {
    "default": "ikspikedungadem-3a546"
  }
}
```

Jika project Firebase berbeda, ubah `ikspikedungadem-3a546` sesuai Project ID di Firebase Console.

---

## 4. Siapkan Environment Variable

Project ini membutuhkan file `.env` untuk menjalankan Vite dan Firebase config.

Contoh variabel ada di:

```text
.env.example
```

Isi `.env` lokal biasanya seperti ini:

```env
VITE_FIREBASE_API_KEY=isi_api_key
VITE_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=project-id
VITE_FIREBASE_STORAGE_BUCKET=project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=sender_id
VITE_FIREBASE_APP_ID=app_id
VITE_R2_WORKER_URL=https://worker.workers.dev
VITE_R2_PUBLIC_BASE_URL=https://media.example.com
```

Penting:

- Jangan commit file `.env` ke GitHub.
- File `.env` sudah masuk `.gitignore`.
- Untuk GitHub Actions, semua isi `.env` harus dimasukkan ke GitHub Secrets.

---

## 5. Upload Project ke GitHub

Jika repo GitHub belum dibuat:

1. Buka GitHub.
2. Buat repository baru.
3. Jangan centang pilihan membuat README jika project ini sudah punya README.
4. Copy URL repository, misalnya:

```text
https://github.com/username/ikspi-kerasakti-kedungadem.git
```

Hubungkan project lokal ke repo GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/ikspi-kerasakti-kedungadem.git
git push -u origin main
```

Jika repository sudah terhubung, cukup:

```bash
git status
git add .
git commit -m "Update website"
git push
```

---

## 6. Buat Service Account Firebase

GitHub Actions membutuhkan izin untuk deploy ke Firebase.

Langkahnya:

1. Buka Firebase Console.
2. Pilih project `ikspikedungadem-3a546`.
3. Klik ikon gear di kiri atas.
4. Masuk ke **Project settings**.
5. Buka tab **Service accounts**.
6. Klik **Generate new private key**.
7. Download file JSON.

File JSON ini bersifat rahasia.

Jangan commit file JSON tersebut ke GitHub.

---

## 7. Tambahkan GitHub Secrets

Buka repository GitHub:

```text
Settings > Secrets and variables > Actions > New repository secret
```

Tambahkan secret berikut.

### Secret Firebase

Nama:

```text
FIREBASE_SERVICE_ACCOUNT
```

Value:

Isi seluruh file JSON service account yang tadi di-download.

### Secret Environment Vite

Tambahkan satu per satu:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_DATABASE_URL
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_R2_WORKER_URL
VITE_R2_PUBLIC_BASE_URL
```

Value masing-masing secret diambil dari file `.env` lokal.

---

## 8. Buat Workflow GitHub Actions

Buat folder dan file berikut:

```text
.github/workflows/firebase-hosting.yml
```

Isi file:

```yml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_DATABASE_URL: ${{ secrets.VITE_FIREBASE_DATABASE_URL }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_R2_WORKER_URL: ${{ secrets.VITE_R2_WORKER_URL }}
          VITE_R2_PUBLIC_BASE_URL: ${{ secrets.VITE_R2_PUBLIC_BASE_URL }}

      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: ikspikedungadem-3a546
```

Jika nama branch utama repository bukan `main`, ubah bagian ini:

```yml
branches:
  - main
```

Contoh jika branch utama adalah `master`:

```yml
branches:
  - master
```

---

## 9. Commit Workflow ke GitHub

Setelah file workflow dibuat:

```bash
git add .github/workflows/firebase-hosting.yml
git commit -m "Add Firebase Hosting auto deploy workflow"
git push
```

Setelah `push`, GitHub Actions akan berjalan otomatis.

Cek prosesnya di:

```text
Repository GitHub > Actions
```

Jika berhasil, website Firebase Hosting akan otomatis ter-update.

---

## 10. Cara Update Website Setelah Setup Selesai

Setiap kali ada perubahan kode:

```bash
git status
git add .
git commit -m "Update content and layout"
git push
```

Setelah `git push`, GitHub Actions akan:

1. Mengambil kode terbaru.
2. Install dependency dengan `npm ci`.
3. Build project dengan `npm run build`.
4. Deploy folder `dist` ke Firebase Hosting.

Tidak perlu menjalankan `firebase deploy` manual lagi.

---

## 11. Deploy Database Rules

Workflow di atas hanya deploy Firebase Hosting.

Jika ingin deploy Realtime Database Rules secara manual:

```bash
firebase deploy --only database
```

Jika ingin database rules ikut otomatis ter-deploy setiap push, ubah step deploy menjadi memakai Firebase CLI:

```yml
      - name: Deploy Hosting and Database Rules
        run: npx firebase-tools deploy --only hosting,database --project ikspikedungadem-3a546
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

Namun cara `FIREBASE_TOKEN` sudah lebih lama dan tidak direkomendasikan untuk setup baru. Untuk project ini, saran paling aman:

- Hosting otomatis lewat GitHub Actions.
- Database rules deploy manual hanya saat `database.rules.json` berubah.

---

## 12. Troubleshooting

### Error: Firebase service account tidak valid

Pastikan:

- Secret bernama tepat `FIREBASE_SERVICE_ACCOUNT`.
- Value berisi seluruh JSON service account.
- JSON tidak terpotong.
- Tidak ada tambahan teks sebelum atau sesudah JSON.

### Error: Missing environment variable

Pastikan semua secret `VITE_...` sudah dibuat di GitHub.

Nama secret harus sama persis dengan nama yang dipakai di workflow.

### Error: Build gagal di GitHub, tapi berhasil di lokal

Coba jalankan lokal:

```bash
npm ci
npm run build
```

Jika `npm ci` gagal, pastikan `package-lock.json` sudah sesuai dengan `package.json`.

### Website blank setelah deploy

Pastikan:

- `firebase.json` memakai `"public": "dist"`.
- Build berhasil.
- Environment variable Firebase benar.
- Rewrites SPA masih ada:

```json
{
  "source": "**",
  "destination": "/index.html"
}
```

### Route seperti `/admin` atau `/berita/...` error 404 saat refresh

Pastikan bagian `rewrites` di `firebase.json` tetap ada. Untuk React Router SPA, semua route perlu diarahkan ke `index.html`.

### Push berhasil tapi GitHub Actions tidak jalan

Pastikan:

- File workflow berada di `.github/workflows/firebase-hosting.yml`.
- Branch yang di-push sesuai dengan branch di workflow.
- Tab **Actions** di repo GitHub tidak dinonaktifkan.

---

## 13. Ringkasan Alur Kerja Harian

Setelah semua setup selesai, alurnya cukup:

```bash
git add .
git commit -m "Update website"
git push
```

Website akan otomatis diperbarui oleh GitHub Actions ke Firebase Hosting.

