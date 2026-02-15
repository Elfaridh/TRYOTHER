# Rekap Sarpras Pesantren (Offline-First PWA)

Aplikasi web **100% gratis** untuk pencatatan sarana prasarana pesantren, tanpa backend/server, menggunakan **IndexedDB** dan dapat di-install di Android via **PWA**.

## Arsitektur Singkat
- **UI**: Multi halaman HTML (Dashboard, Lokasi, Aset, Pemeliharaan, Mutasi, Laporan, Login).
- **State/Data Lokal**: IndexedDB (`rekap-sarpras-db`) untuk menyimpan seluruh data secara offline.
- **Auth Lokal**: `localStorage` session + store `users` di IndexedDB.
- **PWA**: `manifest.json` + `service-worker.js` untuk installable dan offline caching.
- **Ekspor/Impor**: CSV/JSON/XLSX (XLSX via SheetJS browser library).

## Struktur Proyek
```txt
/
├─ index.html
├─ login.html
├─ lokasi.html
├─ aset.html
├─ pemeliharaan.html
├─ mutasi.html
├─ laporan.html
├─ css/style.css
├─ js/
│  ├─ db.js
│  ├─ auth.js
│  ├─ common.js
│  ├─ dashboard.js
│  ├─ lokasi.js
│  ├─ aset.js
│  ├─ pemeliharaan.js
│  ├─ mutasi.js
│  ├─ laporan.js
│  └─ export.js
├─ assets/logo-daarul-amiin.svg
├─ data/template-aset.csv
├─ data/template-aset.xls
├─ manifest.json
└─ service-worker.js
```

## Step-by-Step Build dari Nol
1. Buat halaman per modul (`index`, `login`, `lokasi`, `aset`, `pemeliharaan`, `mutasi`, `laporan`).
2. Buat modul database IndexedDB (`js/db.js`) + seeding akun default.
3. Implement auth lokal (`js/auth.js`) dengan role `admin`/`petugas`.
4. Implement CRUD lokasi (`js/lokasi.js`).
5. Implement CRUD aset + upload foto offline Base64 + filter cepat (`js/aset.js`).
6. Implement pemeliharaan per aset (`js/pemeliharaan.js`).
7. Implement mutasi aset antar lokasi (`js/mutasi.js`).
8. Implement dashboard KPI ringkas (`js/dashboard.js`).
9. Implement ekspor data CSV/XLSX dan laporan (`js/export.js`, `js/laporan.js`).
10. Tambahkan `manifest.json` dan `service-worker.js`.
11. Deploy ke GitHub Pages (branch `main`/`work`, folder root).

## Logo & Identitas Lembaga
- Nama lembaga: **Daarul Amiin IBS**.
- Logo default berada di: `assets/logo-daarul-amiin.svg`.
- Jika Anda punya file logo resmi upload, ganti file tersebut dengan nama yang sama agar otomatis tampil di seluruh tab.

## Catatan Impor Excel
- `aset.html` mendukung import `.csv`, `.json`, `.xlsx`, `.xls`.
- Aplikasi melakukan **deteksi kolom otomatis** (nama aset, lokasi, kategori, kondisi, jumlah, tahun).
- Template siap pakai ada di folder `data/`.

## Akun Default
- Admin: `admin` / `admin123`
- Petugas: `petugas` / `petugas123`
