# Gerbang SMKT – SMP Negeri 1 Wonosari

Aplikasi web presensi gerbang untuk guru piket: scan QR kartu pelajar, foto siswa tampil 2 detik untuk dicocokkan, lalu tersimpan otomatis ke Google Sheets SMKT. Gratis: di-hosting di GitHub Pages, servernya Google Apps Script.

## Isi folder

| File | Fungsi |
| --- | --- |
| `index.html`, `style.css`, `app.js` | Aplikasi |
| `privasi.html` | Kebijakan privasi (ditautkan di layar login Google) |
| `config.js` | **Satu-satunya file yang perlu diubah**: `API_URL` dan `GOOGLE_CLIENT_ID` |
| `sw.js`, `manifest.webmanifest`, `icons/` | Agar bisa dipasang di layar utama HP dan tetap terbuka saat sinyal hilang |
| `vendor/html5-qrcode.min.js` | Pemindai QR (Apache-2.0) |
| `fonts/` | Huruf Plus Jakarta Sans (SIL Open Font License) |

## Mode demo

Selama `API_URL` di `config.js` masih kosong, aplikasi berjalan dengan 13 siswa contoh dan tidak menyentuh spreadsheet sekolah. Cocok untuk mencoba alur scan, pop-up foto, dan antrean offline.

## Pemasangan

Panduan lengkap ada di dokumen **Blueprint SMKT**, tab *Versi Gratis – Modul Gerbang*. Ringkasnya:

1. Tambahkan `Api.gs` ke proyek Apps Script SMKT (bersama `SMKT_Code.gs` v1.1), isi konstantanya, lalu deploy sebagai Aplikasi web (Jalankan sebagai: Saya, Akses: Siapa saja).
2. Buat OAuth Client ID (Aplikasi web) di Google Cloud Console, dengan *Authorized JavaScript origin* `https://<nama-akun>.github.io`.
3. Isi `config.js`, unggah semua file ke repositori GitHub, lalu aktifkan GitHub Pages (branch `main`, folder root).

Repositori ini hanya berisi kode. Data siswa tetap di Google Sheets sekolah dan hanya bisa diambil guru yang login dengan akun Google yang terdaftar di tab Guru dengan peran Piket.
