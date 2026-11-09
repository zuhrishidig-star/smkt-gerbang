# SMKT – SMP Negeri 1 Wonosari

Tiga bagian dengan satu login Google, gratis: di-hosting di GitHub Pages, servernya Google Apps Script, datanya Google Sheets SMKT.

- **Gerbang** (`index.html`) untuk guru piket: scan QR kartu pelajar, foto siswa tampil 2 detik untuk dicocokkan, lalu tersimpan otomatis.
- **Kios gerbang** (`kios.html`) untuk tablet di gerbang: siswa scan kartu sendiri sejak pagi. Kartu dipegang tegak di bawah dagu; QR baru diterima bila wajah tampak menghadap kamera, dan fotonya disimpan sebagai bukti. Pengenalan wajah berjalan di tablet (MediaPipe), tanpa membebani server. Tablet diaktifkan sekali oleh Piket, Tim Tatib, atau pimpinan.
- **Tata Tertib** (`tatib.html`) untuk semua guru: laporkan pelanggaran yang ditemukan dan aplikasi menentukan tangga penanganannya (guru yang menemukan, wali kelas, BK, Tim Tatib, pimpinan) beserta alasan dan tembusannya. Pelanggaran ringan selesai di tangan guru yang menemukan; yang naik tangga masuk ke *Kotak Masuk* penerimanya. Beranda menampilkan siswa yang terlambat hari ini dengan tombol WA (wa.me) ke orang tua dan wali kelas. Menu lain muncul sesuai peran: Verifikasi foto scan (wali kelas mencocokkan foto dan mencatat titip absen), Siswa, Waspada dan surat pernyataan, Pulih, Absen, serta Ekskul. Di laptop menu tampil di samping, di HP di bawah. Guru boleh melampirkan foto bukti saat melapor. Wali kelas dan Guru BK mencatat pernyataan pembinaan yang ditandatangani siswa di layar, dan berkas bukti SP (PDF berisi rekap pelanggaran, foto bukti, dan pernyataan) dibuat bersama Surat Pernyataan Lapis atau dari Riwayat siswa.
  - **Pembinaan**: Tim Tatib menetapkan masa pembinaan atau skorsing (tanggal mulai dan jumlah hari). Kalender hanya menghitung Senin sampai Jumat di luar hari libur. Bila siswa izin, sakit, atau pulang karena sakit, atau sekolah daring, harinya otomatis diganti dengan hari sekolah berikutnya. Bentuk pembinaan dipilih dari daftar yang bisa ditambah Wakasek, Koordinator Tatib, Tim Tatib, dan Guru BK. Surat persetujuan orang tua dicetak sebagai PDF, ditandatangani, lalu fotonya diunggah.
  - **Ekskul**: hanya pembina yang mengisi anggota. Tiap pertemuan pembina mencentang kehadiran pembina dan pelatih, dan bisa menambah foto kegiatan. Setiap tanggal 1 lampiran kehadiran bulan sebelumnya (pembina, pelatih, siswa, dan foto) dibuat otomatis sebagai PDF.

Setiap guru bekerja dalam **ruang kerja sesuai perannya**. Guru yang memegang beberapa peran (misalnya Wali Kelas 7F dan Guru Tata Tertib) memilih ruang di kepala aplikasi, dan hanya menu peran itu yang tampil; server juga membatasi hak sesuai ruang yang dipilih. Kepala Sekolah hanya memantau (tanpa Lapor dan tanpa menindak). **Administrator** mengelola akun guru dari menu Akun guru: menambah email, mengatur peran, kelas wali, jenjang BK, ekskul binaan, dan menonaktifkan akun; setiap perubahan tercatat di tab Log_Akses.

Peran guru diisi dari pilihan di tab Guru (boleh lebih dari satu): Guru Mapel, Guru Wali Kelas (kelas 7A sampai 9F, satu kelas satu wali), Guru Tata Tertib, Koordinator Tatib, Guru BK (jenjang 7/8/9), Wakil Kepala Sekolah, Kepala Sekolah, Pembina Ekstrakurikuler, Piket, Guru Olahraga, dan Staf Kependidikan.

Warna tampilan mengikuti logo sekolah: biru langit, hijau gunung, dan kuning lencana (`tema.css`).

Guru yang tidak berperan Piket otomatis dibawa ke Tata Tertib setelah login.

## Isi folder

| File | Fungsi |
| --- | --- |
| `index.html`, `style.css`, `app.js` | Modul Gerbang |
| `tatib.html`, `tatib.css`, `tatib.js` | Modul Tata Tertib |
| `kios.html`, `kios.css`, `kios.js` | Kios gerbang mandiri dengan foto wajah |
| `tema.css` | Warna dan elemen tampilan dari logo sekolah, dipakai semua halaman |
| `privasi.html` | Kebijakan privasi (ditautkan di layar login Google) |
| `config.js` | **Satu-satunya file yang perlu diubah**: `API_URL` dan `GOOGLE_CLIENT_ID` |
| `sw.js`, `manifest.webmanifest`, `icons/` | Agar bisa dipasang di layar utama HP dan tetap terbuka saat sinyal hilang |
| `vendor/html5-qrcode.min.js` | Pemindai QR (Apache-2.0) |
| `vendor/jsQR.js` | Pembaca QR cadangan di kios (Apache-2.0) |
| `vendor/mediapipe/` | Deteksi wajah di tablet: MediaPipe Tasks Vision + model BlazeFace (Apache-2.0) |
| `fonts/` | Huruf Plus Jakarta Sans (SIL Open Font License) |

## Mode demo

Selama `API_URL` di `config.js` masih kosong, aplikasi berjalan dengan 13 siswa contoh dan tidak menyentuh spreadsheet sekolah. Cocok untuk mencoba alur scan, pop-up foto, dan antrean offline.

## Pemasangan

Panduan lengkap ada di dokumen **Blueprint SMKT**, tab *Versi Gratis – Modul Gerbang*. Ringkasnya:

1. Tambahkan `Api.gs` dan `Tatib.gs` ke proyek Apps Script SMKT (bersama `SMKT_Code.gs`; versi server saat ini 1.5), isi konstantanya, lalu deploy sebagai Aplikasi web (Jalankan sebagai: Saya, Akses: Siapa saja).
2. Buat OAuth Client ID (Aplikasi web) di Google Cloud Console, dengan *Authorized JavaScript origin* `https://<nama-akun>.github.io`.
3. Isi `config.js`, unggah semua file ke repositori GitHub, lalu aktifkan GitHub Pages (branch `main`, folder root).

Repositori ini hanya berisi kode. Data siswa tetap di Google Sheets sekolah dan hanya bisa diambil guru yang login dengan akun Google yang terdaftar di tab Guru. Foto siswa hanya untuk peran Piket; riwayat lengkap hanya untuk wali kelas siswa itu, BK, Tim Tatib, Wakasek, dan Kepala Sekolah.
