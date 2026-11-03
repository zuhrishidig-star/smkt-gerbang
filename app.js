/*
 * Gerbang SMKT · aplikasi web guru piket · v1.1 (3 November 2026)
 * Scan QR kartu pelajar → foto tampil 2 detik → tersimpan otomatis
 * ke Google Sheets lewat API Apps Script. Scan yang gagal terkirim
 * disimpan di HP dan dikirim ulang otomatis saat sinyal kembali.
 */
(function () {
  'use strict';

  const CFG = window.SMKT_CONFIG || {};
  const DEMO = !CFG.API_URL;
  const DURASI = Number(CFG.DURASI_POPUP_MS) || 2000;
  const MODE = { MASUK: 'Masuk', MANUAL: 'Manual Lupa ID', PULANG: 'Pulang', DISPENSASI: 'Dispensasi' };
  const LABEL_MODE = { 'Masuk': 'Masuk', 'Manual Lupa ID': 'Lupa kartu', 'Pulang': 'Pulang', 'Dispensasi': 'Dispensasi' };
  const BATAS_SINKRON_MS = 12 * 3600 * 1000;

  const $ = (id) => document.getElementById(id);

  const S = {
    sesi: null, guru: null,
    mode: MODE.MASUK,
    siswa: new Map(),
    kamera: null, kameraJalan: false, janjiKamera: null,
    popup: null,
    abaikan: {},
    mengirim: false, timerKirim: null,
  };

  /* ---------------- Waktu ---------------- */
  const fmtTanggal = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' });
  const fmtJam = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false });
  const kunciHari = (t) => fmtTanggal.format(t ? new Date(t) : new Date()).replace(/-/g, '');
  const jam = (t) => fmtJam.format(new Date(t));
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() :
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
    }));

  /* ---------------- Penyimpanan ---------------- */
  const simpan = {
    get(k, bawaan) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : bawaan; } catch (e) { return bawaan; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* penyimpanan penuh atau diblokir */ } },
    hapus(k) { try { localStorage.removeItem(k); } catch (e) { /* abaikan */ } },
  };

  const DB = (() => {
    let janji = null;
    function buka() {
      if (!janji) {
        janji = new Promise((res, rej) => {
          const r = indexedDB.open('smkt-gerbang', 1);
          r.onupgradeneeded = () => { r.result.createObjectStore('kv'); r.result.createObjectStore('foto'); };
          r.onsuccess = () => res(r.result);
          r.onerror = () => rej(r.error);
        });
      }
      return janji;
    }
    async function op(store, mode, fn) {
      const db = await buka();
      return new Promise((res, rej) => {
        const tx = db.transaction(store, mode);
        const req = fn(tx.objectStore(store));
        tx.oncomplete = () => res(req ? req.result : undefined);
        tx.onerror = () => rej(tx.error);
      });
    }
    return {
      get: (s, k) => op(s, 'readonly', (st) => st.get(k)),
      set: (s, k, v) => op(s, 'readwrite', (st) => st.put(v, k)),
      clear: (s) => op(s, 'readwrite', (st) => st.clear()),
    };
  })();

  /* ---------------- API ---------------- */
  async function api(aksi, data) {
    const isi = Object.assign({ aksi: aksi, sesi: S.sesi }, data || {});
    if (DEMO) return Demo.api(isi);
    let res;
    try {
      res = await fetch(CFG.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(isi),
        redirect: 'follow',
      });
    } catch (e) {
      throw Object.assign(new Error('Tidak ada sinyal ke server.'), { jaringan: true });
    }
    if (!res.ok) throw Object.assign(new Error('Server menjawab ' + res.status + '.'), { jaringan: true });
    let j;
    try { j = await res.json(); } catch (e) {
      throw Object.assign(new Error('Jawaban server tidak terbaca. Pastikan Web App di-deploy dengan akses "Siapa saja".'), { jaringan: true });
    }
    if (!j.ok) {
      if (j.kode === 'TIDAK_TERDAFTAR') j.pesan = pesanBelumTerdaftar(j.pesan);
      throw Object.assign(new Error(j.pesan || 'Permintaan ditolak server.'), { kode: j.kode });
    }
    return j.data;
  }
  /** Pesan untuk akun Google yang emailnya belum ada di tab Guru. */
  function pesanBelumTerdaftar(pesan) {
    const m = /Email (\S+@\S+)/.exec(pesan || '');
    return 'Email ' + (m ? m[1] + ' ' : '') + 'belum didaftarkan oleh Tim Tata Tertib. Silakan hubungi Tim Tata Tertib. ' +
      'Bila baru saja didaftarkan, tunggu 5 menit lalu coba lagi.';
  }

  /* ---------------- Login ---------------- */
  function tampilLogin(pesan) {
    hentikanKamera();
    $('layar-utama').hidden = true;
    $('layar-login').hidden = false;
    $('nama-sekolah').textContent = CFG.NAMA_SEKOLAH || '';
    $('login-pesan').textContent = pesan || '';
    if (DEMO) {
      $('login-ket').textContent = 'API belum diatur di config.js, jadi aplikasi berjalan dengan data contoh.';
      $('tombol-demo').hidden = false;
      $('tombol-google').hidden = true;
      return;
    }
    if (!CFG.GOOGLE_CLIENT_ID) {
      $('login-pesan').textContent = 'GOOGLE_CLIENT_ID di config.js belum diisi.';
      return;
    }
    siapkanGoogle();
  }

  let googleSiap = false;
  function siapkanGoogle() {
    const pasang = () => {
      if (!googleSiap) {
        google.accounts.id.initialize({
          client_id: CFG.GOOGLE_CLIENT_ID,
          callback: (r) => masukDenganToken(r.credential),
        });
        googleSiap = true;
      }
      $('tombol-google').innerHTML = '';
      google.accounts.id.renderButton($('tombol-google'), {
        theme: 'filled_blue', size: 'large', shape: 'pill', text: 'signin_with', locale: 'id', width: 280,
      });
    };
    if (window.google && google.accounts && google.accounts.id) { pasang(); return; }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = pasang;
    s.onerror = () => { $('login-pesan').textContent = 'Login Google tidak bisa dimuat. Periksa sinyal, lalu muat ulang halaman.'; };
    document.head.appendChild(s);
  }

  async function masukDenganToken(idToken) {
    $('login-pesan').textContent = 'Memeriksa akun…';
    try {
      const d = await api('masuk', { idToken: idToken });
      if (!d.guru.bolehGerbang && !DEMO) {
        // Guru tanpa peran Piket langsung dibawa ke modul Tata Tertib dengan sesi yang sama.
        simpan.set('smkt_sesi', { sesi: d.sesi, kedaluwarsa: d.kedaluwarsa, guru: d.guru });
        $('login-pesan').textContent = 'Membuka Tata Tertib…';
        location.replace('tatib.html');
        return;
      }
      S.sesi = d.sesi; S.guru = d.guru;
      simpan.set('smkt_sesi', { sesi: d.sesi, kedaluwarsa: d.kedaluwarsa, guru: d.guru });
      $('login-pesan').textContent = '';
      await bukaUtama();
    } catch (e) {
      $('login-pesan').textContent = e.message;
    }
  }

  async function keluar() {
    tutupMenu();
    const antre = simpan.get('smkt_antrean', []).length;
    const tanya = 'Keluar akan menghapus data dan foto siswa dari HP ini.' +
      (antre ? ' ' + antre + ' scan yang belum terkirim tetap disimpan dan terkirim saat login berikutnya.' : '') + ' Lanjutkan?';
    if (!confirm(tanya)) return;
    try { await api('keluar'); } catch (e) { /* tetap keluar */ }
    S.sesi = null; S.guru = null;
    simpan.hapus('smkt_sesi');
    // Foto dan nama siswa tidak ditinggalkan di HP, terutama bila HP milik pribadi.
    try { await DB.clear('foto'); await DB.clear('kv'); } catch (e) { /* abaikan */ }
    simpan.hapus('smkt_waktu_sinkron');
    Object.keys(localStorage).forEach((k) => { if (k.indexOf('smkt_log_') === 0) simpan.hapus(k); });
    S.siswa = new Map();
    renderRiwayat();
    if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect();
    tampilLogin('Anda sudah keluar.');
  }

  /* ---------------- Layar utama ---------------- */
  async function bukaUtama() {
    $('layar-login').hidden = true;
    $('layar-utama').hidden = false;
    $('banner-demo').hidden = !DEMO;
    $('nama-piket').textContent = S.guru.nama;
    $('kartu-sekolah').textContent = CFG.NAMA_SEKOLAH || '';
    await muatSiswaLokal();
    renderRiwayat();
    perbaruiLencana();
    pilihMode(sessionStorage.getItem('smkt_mode') || MODE.MASUK);
    const terakhir = simpan.get('smkt_waktu_sinkron', 0);
    if (!S.siswa.size || Date.now() - terakhir > BATAS_SINKRON_MS) perbaruiData();
    kirimAntrean();
  }

  async function muatSiswaLokal() {
    let daftar = [];
    try { daftar = (await DB.get('kv', 'siswa')) || []; } catch (e) { daftar = []; }
    S.siswa = new Map(daftar.map((s) => [s.nis, s]));
  }

  async function perbaruiData() {
    tutupMenu();
    const pita = (teks, rasio) => {
      $('pita').hidden = false; $('pita-teks').textContent = teks;
      $('pita-isi').style.width = Math.round((rasio || 0) * 100) + '%';
    };
    try {
      pita('Mengunduh data siswa…', 0.05);
      const d = await api('siswa');
      await DB.set('kv', 'siswa', d.siswa);
      S.siswa = new Map(d.siswa.map((s) => [s.nis, s]));
      const versi = (await DB.get('kv', 'fotoVersi')) || {};
      const perlu = d.siswa.filter((s) => s.aktif && s.fotoV && versi[s.nis] !== s.fotoV).map((s) => s.nis);
      const besar = [];
      for (let i = 0; i < perlu.length; i += 25) {
        const kelompok = perlu.slice(i, i + 25);
        pita('Mengunduh foto ' + Math.min(i + 25, perlu.length) + ' dari ' + perlu.length + '…', (i + 25) / perlu.length);
        const r = await api('foto', { nis: kelompok });
        for (const nis of kelompok) {
          const f = r.foto[nis];
          if (f && f.data) { await DB.set('foto', nis, f.data); versi[nis] = f.v; }
          else if (f && f.error === 'TERLALU_BESAR') besar.push(nis);
        }
        await DB.set('kv', 'fotoVersi', versi);
      }
      simpan.set('smkt_waktu_sinkron', Date.now());
      const aktif = d.siswa.filter((s) => s.aktif).length;
      const tanpaFoto = d.siswa.filter((s) => s.aktif && !s.fotoV).length;
      let pesan = 'Data ' + aktif + ' siswa aktif siap dipakai.';
      if (tanpaFoto) pesan += ' ' + tanpaFoto + ' belum punya foto.';
      if (besar.length) pesan += ' ' + besar.length + ' foto terlalu besar, kecilkan di bawah 250 KB.';
      toast(pesan, tanpaFoto || besar.length ? 'telat' : 'hadir', 4500);
    } catch (e) {
      if (e.kode === 'SESI') { tampilLogin(e.message); return; }
      toast('Data siswa belum terunduh: ' + e.message, 'galat', 5000);
    } finally {
      $('pita').hidden = true;
    }
  }

  /* ---------------- Mode ---------------- */
  function pilihMode(mode) {
    if (!Object.values(MODE).includes(mode)) mode = MODE.MASUK;
    S.mode = mode;
    sessionStorage.setItem('smkt_mode', mode);
    document.querySelectorAll('.mode button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.mode === mode)));
    if (mode === MODE.MANUAL) {
      tampilCari();
    } else {
      $('tombol-ketik').textContent = mode === MODE.MASUK ? 'QR tidak terbaca? Ketik NIS di kartu' : 'Cari nama atau NIS';
      tampilKamera();
    }
  }

  function tampilKamera() {
    $('panel-cari').hidden = true;
    $('panel-kamera').hidden = false;
    mulaiKamera();
  }

  function tampilCari() {
    hentikanKamera();
    $('panel-kamera').hidden = true;
    $('panel-cari').hidden = false;
    const hanyaNis = S.mode === MODE.MASUK;
    $('label-cari').textContent = hanyaNis ? 'Ketik NIS yang tercetak di kartu pelajar'
      : S.mode === MODE.MANUAL ? 'Cari siswa yang lupa membawa kartu' : 'Cari nama atau NIS siswa';
    $('input-cari').placeholder = hanyaNis ? 'NIS' : 'Nama atau NIS';
    $('input-cari').inputMode = hanyaNis ? 'numeric' : 'text';
    $('tombol-kembali-kamera').hidden = S.mode === MODE.MANUAL;
    $('input-cari').value = '';
    renderHasilCari();
    $('input-cari').focus();
  }

  function renderHasilCari() {
    const q = $('input-cari').value.trim().toLowerCase();
    const ul = $('hasil-cari');
    ul.innerHTML = '';
    if (!q) return;
    const hanyaNis = S.mode === MODE.MASUK;
    const hasil = [];
    for (const s of S.siswa.values()) {
      if (!s.aktif) continue;
      const cocok = hanyaNis ? s.nis === q : (s.nama.toLowerCase().includes(q) || s.nis.startsWith(q));
      if (cocok) hasil.push(s);
      if (hasil.length >= 20) break;
    }
    if (!hasil.length) {
      const li = document.createElement('li');
      li.className = 'kosong';
      li.textContent = hanyaNis ? 'NIS ' + q + ' tidak ditemukan.' : 'Tidak ada siswa aktif yang cocok.';
      ul.appendChild(li);
      return;
    }
    hasil.forEach((s) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      const mini = document.createElement('span');
      mini.className = 'mini';
      mini.textContent = inisial(s.nama);
      const teks = document.createElement('span');
      const nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = s.nama;
      const kl = document.createElement('span'); kl.className = 'kl'; kl.textContent = 'Kelas ' + s.kelas + ', NIS ' + s.nis;
      teks.append(nm, kl);
      b.append(mini, teks);
      b.addEventListener('click', () => bukaSiswa(s.nis));
      li.appendChild(b);
      ul.appendChild(li);
      DB.get('foto', s.nis).then((data) => {
        if (data) { const img = document.createElement('img'); img.alt = ''; img.src = data; mini.textContent = ''; mini.appendChild(img); }
      }).catch(() => {});
    });
  }

  /* ---------------- Kamera ---------------- */
  function mulaiKamera() {
    // Satu proses nyala/mati kamera pada satu waktu, agar tidak saling memotong.
    S.janjiKamera = (S.janjiKamera || Promise.resolve()).then(nyalakanKamera_, nyalakanKamera_);
    return S.janjiKamera;
  }

  // Status pustaka html5-qrcode: 1 belum mulai, 2 memindai, 3 dijeda.
  const KAM = { BELUM: 1, PINDAI: 2, JEDA: 3 };
  function keadaanKamera() {
    try { return S.kamera ? S.kamera.getState() : KAM.BELUM; } catch (e) { return KAM.BELUM; }
  }

  async function nyalakanKamera_() {
    if ($('panel-kamera').hidden || $('layar-utama').hidden) return;
    const siap = 'Arahkan QR di kartu pelajar ke kamera.';
    // Selalu ikuti status asli pustaka, bukan tebakan aplikasi.
    const st = keadaanKamera();
    if (st === KAM.PINDAI) { S.kameraJalan = true; $('petunjuk').textContent = siap; return; }
    if (st === KAM.JEDA) {
      try { S.kamera.resume(); } catch (e) { /* lanjut */ }
      S.kameraJalan = true; $('petunjuk').textContent = siap; return;
    }
    $('petunjuk').textContent = 'Menyalakan kamera…';
    if (!window.Html5Qrcode) { $('petunjuk').textContent = 'Pemindai QR gagal dimuat. Muat ulang halaman.'; return; }
    if (!S.kamera) {
      S.kamera = new Html5Qrcode('reader', { formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE], verbose: false });
    }
    const mulaiPustaka = () => S.kamera.start(
      { facingMode: 'environment' },
      { fps: 12, aspectRatio: 1, qrbox: (w, h) => { const s = Math.max(160, Math.floor(Math.min(w, h) * 0.7)); return { width: s, height: s }; } },
      (teks) => saatTerbaca(teks),
      () => {}
    );
    try {
      try {
        await mulaiPustaka();
      } catch (e) {
        // Pustaka kadang masih menganggap pemindaian lama berjalan: hentikan, lalu coba sekali lagi.
        try { await S.kamera.stop(); } catch (e2) { /* tidak sedang berjalan */ }
        await mulaiPustaka();
      }
      S.kameraJalan = true;
      // Label bawaan pustaka ("Scanner paused") tidak dipakai: pop-up sudah menutupi layar.
      document.querySelectorAll('#reader div').forEach((d) => { if (d.textContent === 'Scanner paused') d.style.visibility = 'hidden'; });
      // Tunggu video benar-benar berputar sebelum boleh dimatikan lagi.
      await new Promise((r) => setTimeout(r, 400));
      if ($('panel-kamera').hidden || $('layar-utama').hidden) { await matikanKamera_(); return; }
      $('petunjuk').textContent = siap;
    } catch (e) {
      S.kameraJalan = false;
      console.warn('Kamera gagal dinyalakan:', e);
      $('petunjuk').textContent = 'Kamera belum bisa dibuka. Izinkan akses kamera di browser, atau pakai tombol di bawah.';
    }
  }

  function hentikanKamera() {
    S.janjiKamera = (S.janjiKamera || Promise.resolve()).then(matikanKamera_, matikanKamera_);
    return S.janjiKamera;
  }

  async function matikanKamera_() {
    S.kameraJalan = false;
    const st = keadaanKamera();
    if (st === KAM.PINDAI || st === KAM.JEDA) {
      try { await S.kamera.stop(); } catch (e) { /* sudah berhenti */ }
    }
  }

  function jedaKamera(jeda) {
    if (!S.kamera || $('layar-utama').hidden || $('panel-kamera').hidden) return;
    const st = keadaanKamera();
    try {
      if (jeda && st === KAM.PINDAI) S.kamera.pause(true);
      else if (!jeda && st === KAM.JEDA) S.kamera.resume();
    } catch (e) { /* status kamera sedang berubah */ }
  }

  function saatTerbaca(teks) {
    const nis = String(teks || '').trim();
    if (!nis || S.popup) return;
    const kini = Date.now();
    if ((S.abaikan[nis] || 0) > kini) return;
    S.abaikan[nis] = kini + 3000;
    bukaSiswa(nis);
  }

  /* ---------------- Pop-up kartu siswa ---------------- */
  async function bukaSiswa(nis) {
    if (S.popup) return;
    const s = S.siswa.get(nis);
    if (!s) {
      getar([90, 60, 90]);
      toast('QR tidak dikenal (' + nis + '). Jika siswa baru, buka menu lalu Perbarui data siswa.', 'galat', 4000);
      return;
    }
    if (!s.aktif) {
      getar([90, 60, 90]);
      toast(s.nama + ' tidak berstatus aktif.', 'galat', 3500);
      return;
    }
    let foto = null;
    try { foto = await DB.get('foto', nis); } catch (e) { foto = null; }
    tampilPopup(s, foto);
  }

  function tampilPopup(s, foto) {
    const mode = S.mode;
    const sudah = cariScanHariIni(s.nis, mode);
    S.popup = { siswa: s, mode: mode, timer: null };
    jedaKamera(true);
    getar(60);

    $('kartu').dataset.mode = mode;
    $('kartu-mode').textContent = LABEL_MODE[mode];
    $('kartu-nama').textContent = s.nama;
    $('kartu-kelas').textContent = 'Kelas ' + s.kelas + ', NIS ' + s.nis;
    $('kartu-inisial').textContent = inisial(s.nama);
    const img = $('kartu-img');
    if (foto) { img.src = foto; img.hidden = false; } else { img.removeAttribute('src'); img.hidden = true; }

    const catatan = $('kartu-catatan');
    catatan.className = 'kartu-catatan';
    catatan.hidden = true;
    $('kartu-dispensasi').hidden = true;
    $('hitung').hidden = true;
    $('tombol-simpan').hidden = true;
    $('tombol-batal').textContent = 'Batalkan, wajah tidak cocok';

    if (sudah) {
      catatan.hidden = false;
      catatan.classList.add('galat');
      catatan.textContent = 'Sudah tercatat ' + LABEL_MODE[sudah.mode].toLowerCase() + ' pukul ' + sudah.jamTeks + '.';
      $('kartu-ket').textContent = 'Tidak dicatat ulang.';
      $('tombol-batal').textContent = 'Tutup';
      S.popup.timer = setTimeout(tutupPopup, 2500);
      $('popup').hidden = false;
      return;
    }

    if (mode === MODE.MANUAL) {
      catatan.hidden = false;
      catatan.textContent = 'Lupa kartu: tercatat +2 poin.';
    }

    if (mode === MODE.DISPENSASI) {
      $('kartu-dispensasi').hidden = false;
      $('input-ket').value = '';
      $('tombol-simpan').hidden = false;
      $('tombol-simpan').disabled = true;
      $('tombol-batal').textContent = 'Batal';
      $('kartu-ket').textContent = 'Tulis alasannya, lalu tekan Simpan.';
      $('popup').hidden = false;
      setTimeout(() => $('input-ket').focus(), 50);
      return;
    }

    if (!foto) {
      $('tombol-simpan').hidden = false;
      $('tombol-simpan').disabled = false;
      $('kartu-ket').textContent = 'Foto belum tersedia. Cocokkan dengan kartu pelajar, lalu tekan Simpan.';
      $('popup').hidden = false;
      return;
    }

    // Jalur utama: foto tampil, tersimpan otomatis setelah DURASI.
    $('kartu-ket').textContent = 'Tersimpan otomatis dalam ' + Math.round(DURASI / 1000) + ' detik.';
    const isi = $('hitung-isi');
    isi.classList.remove('jalan');
    void isi.offsetWidth; // mulai ulang animasi
    isi.style.setProperty('--durasi', DURASI + 'ms');
    isi.classList.add('jalan');
    $('hitung').hidden = false;
    $('popup').hidden = false;
    S.popup.timer = setTimeout(() => konfirmasiPopup(), DURASI);
  }

  function konfirmasiPopup() {
    const p = S.popup;
    if (!p) return;
    let ket = '';
    if (p.mode === MODE.DISPENSASI) {
      ket = $('input-ket').value.trim();
      if (!ket) { $('input-ket').focus(); return; }
    }
    tutupPopup();
    catatScan(p.siswa, p.mode, ket);
  }

  function batalPopup() {
    const p = S.popup;
    if (!p) return;
    const tombolTutup = $('tombol-batal').textContent === 'Tutup';
    tutupPopup();
    if (!tombolTutup && p.mode !== MODE.DISPENSASI) {
      tambahLog({ idScan: uuid(), nis: p.siswa.nis, nama: p.siswa.nama, kelas: p.siswa.kelas, mode: p.mode,
        waktu: Date.now(), state: 'batal', label: 'Dibatalkan', detail: 'Wajah tidak cocok' });
      toast('Dibatalkan. ' + p.siswa.nama + ' tidak dicatat.', '', 2500);
    }
  }

  function tutupPopup() {
    if (S.popup && S.popup.timer) clearTimeout(S.popup.timer);
    S.popup = null;
    $('popup').hidden = true;
    $('hitung-isi').classList.remove('jalan');
    if (S.mode === MODE.MANUAL) { $('input-cari').value = ''; renderHasilCari(); $('input-cari').focus(); }
    else if (!$('panel-cari').hidden) { $('input-cari').select(); }
    else setTimeout(() => jedaKamera(false), 100);
  }

  /* ---------------- Antrean & pengiriman ---------------- */
  function catatScan(s, mode, ket) {
    const item = { idScan: uuid(), nis: s.nis, mode: mode, keterangan: ket || '', waktuKlien: Date.now() };
    const antre = simpan.get('smkt_antrean', []);
    antre.push(item);
    simpan.set('smkt_antrean', antre);
    tambahLog({ idScan: item.idScan, nis: s.nis, nama: s.nama, kelas: s.kelas, mode: mode, waktu: item.waktuKlien,
      state: 'kirim', label: 'Mengirim', detail: '' });
    perbaruiLencana();
    kirimAntrean();
  }

  async function kirimAntrean() {
    if (S.mengirim || !S.sesi) return;
    S.mengirim = true;
    clearTimeout(S.timerKirim);
    try {
      for (;;) {
        const antre = simpan.get('smkt_antrean', []);
        if (!antre.length) break;
        const item = antre[0];
        let hasil;
        try {
          hasil = await api('scan', item);
        } catch (e) {
          if (e.jaringan || e.kode === 'SIBUK') {
            ubahLog(item.idScan, { state: 'antre', label: 'Tertunda', detail: 'Tersimpan di HP, dikirim saat ada sinyal' });
            S.timerKirim = setTimeout(kirimAntrean, 15000);
            break;
          }
          if (e.kode === 'SESI' || e.kode === 'TIDAK_TERDAFTAR') {
            ubahLog(item.idScan, { state: 'antre', label: 'Tertunda', detail: 'Login ulang untuk mengirim' });
            perbaruiLencana();
            tampilLogin(e.message + ' Scan yang tertunda tetap tersimpan.');
            break;
          }
          buangDariAntrean(item.idScan);
          ubahLog(item.idScan, { state: 'galat', label: 'Gagal', detail: e.message });
          toast(e.message, 'galat', 4000);
          continue;
        }
        buangDariAntrean(item.idScan);
        const t = tafsirStatus(hasil.status);
        ubahLog(item.idScan, t);
        if (t.state === 'telat' || t.state === 'galat') {
          toast(namaDariLog(item.idScan) + ': ' + t.label + (t.state === 'galat' && t.detail ? '. ' + t.detail : ''), t.state, 3500);
        }
      }
    } finally {
      S.mengirim = false;
      perbaruiLencana();
    }
  }

  function buangDariAntrean(idScan) {
    simpan.set('smkt_antrean', simpan.get('smkt_antrean', []).filter((x) => x.idScan !== idScan));
  }

  /** Mengubah teks Status_Proses dari server menjadi label singkat + warna. */
  function tafsirStatus(st) {
    st = String(st || '');
    const poin = (st.match(/\+(\d+) poin/g) || []).reduce((a, x) => a + Number(x.replace(/\D/g, '')), 0);
    const tambah = poin ? ' +' + poin : '';
    // Rincian tanpa kata status dan jam, mis. "+2 poin lupa ID, +5 poin terlambat".
    const detail = st.replace(/^[A-Z]+:\s*/, '').replace(/^(Hadir|Terlambat|pulang|dispensasi) \d{2}:\d{2}:\d{2},?\s*/i, '');
    if (/^OK: Terlambat/.test(st)) return { state: 'telat', label: 'Terlambat' + tambah, detail: detail };
    if (/^OK: Hadir/.test(st)) return { state: poin ? 'telat' : 'hadir', label: 'Hadir' + tambah, detail: detail };
    if (/^OK: pulang/i.test(st)) return { state: 'hadir', label: 'Pulang', detail: detail };
    if (/^OK: dispensasi/i.test(st)) return { state: 'info', label: 'Dispensasi', detail: detail };
    if (/^DUPLIKAT/.test(st)) return { state: 'info', label: 'Sudah tercatat', detail: detail };
    if (/^PERINGATAN/.test(st)) return { state: 'telat', label: 'Perlu dicek', detail: detail };
    if (/^(ERROR|DITOLAK)/.test(st)) return { state: 'galat', label: 'Ditolak', detail: detail };
    if (/^TERSIMPAN/.test(st)) return { state: 'antre', label: 'Diproses', detail: detail };
    return { state: 'info', label: 'Tercatat', detail: st };
  }

  /* ---------------- Riwayat (per HP, per hari) ---------------- */
  const kunciLog = () => 'smkt_log_' + kunciHari();

  function tambahLog(e) {
    const log = simpan.get(kunciLog(), []);
    log.unshift(e);
    simpan.set(kunciLog(), log.slice(0, 1500));
    renderRiwayat();
  }

  function ubahLog(idScan, ubah) {
    for (const k of Object.keys(localStorage)) {
      if (k.indexOf('smkt_log_') !== 0) continue;
      const log = simpan.get(k, []);
      const e = log.find((x) => x.idScan === idScan);
      if (e) { Object.assign(e, ubah); simpan.set(k, log); break; }
    }
    renderRiwayat();
  }

  function namaDariLog(idScan) {
    const e = simpan.get(kunciLog(), []).find((x) => x.idScan === idScan);
    return e ? e.nama : 'Scan';
  }

  function cariScanHariIni(nis, mode) {
    const grupMasuk = [MODE.MASUK, MODE.MANUAL];
    const log = simpan.get(kunciLog(), []);
    const e = log.find((x) => x.nis === nis && x.state !== 'batal' && x.state !== 'galat' &&
      (grupMasuk.includes(mode) ? grupMasuk.includes(x.mode) : x.mode === mode));
    return e ? Object.assign({ jamTeks: jam(e.waktu) }, e) : null;
  }

  function renderRiwayat() {
    const log = simpan.get(kunciLog(), []);
    const ol = $('daftar-riwayat');
    ol.innerHTML = '';
    log.slice(0, 40).forEach((e) => {
      const li = document.createElement('li');
      li.className = 'log ' + e.state;
      const j = document.createElement('span'); j.className = 'log-jam'; j.textContent = jam(e.waktu);
      const isi = document.createElement('span');
      const nm = document.createElement('span'); nm.className = 'log-nama'; nm.textContent = e.nama;
      const dt = document.createElement('span'); dt.className = 'log-detail';
      // Rincian hanya ditampilkan bila menambah informasi di luar label status.
      const rinciPoin = e.state === 'telat' && (String(e.detail).match(/\+/g) || []).length > 1;
      const tampilRinci = e.detail && (rinciPoin || ['galat', 'antre', 'info', 'batal'].includes(e.state));
      dt.textContent = e.kelas + ', ' + LABEL_MODE[e.mode].toLowerCase() + (tampilRinci ? '. ' + e.detail : '');
      isi.append(nm, dt);
      const st = document.createElement('span'); st.className = 'log-status'; st.textContent = e.label;
      li.append(j, isi, st);
      ol.appendChild(li);
    });
    $('riwayat-kosong').hidden = log.length > 0;
    const masuk = log.filter((x) => (x.mode === MODE.MASUK || x.mode === MODE.MANUAL) && x.state !== 'batal' && x.state !== 'galat' && x.label !== 'Sudah tercatat');
    const telat = masuk.filter((x) => /^Terlambat/.test(x.label)).length;
    $('ringkasan').textContent = masuk.length ? masuk.length + ' masuk, ' + telat + ' terlambat' : '';
  }

  function bersihkanLogLama() {
    const simpanHari = new Set([0, 1, 2].map((d) => 'smkt_log_' + kunciHari(Date.now() - d * 86400000)));
    Object.keys(localStorage).forEach((k) => { if (k.indexOf('smkt_log_') === 0 && !simpanHari.has(k)) simpan.hapus(k); });
  }

  function perbaruiLencana() {
    const n = simpan.get('smkt_antrean', []).length;
    const b = $('tombol-antre');
    b.hidden = n === 0;
    b.textContent = n + ' belum terkirim';
    $('menu-kirim').hidden = n === 0;
  }

  /* ---------------- Menu, toast, bantu ---------------- */
  function bukaMenu() {
    const m = $('menu');
    const t = simpan.get('smkt_waktu_sinkron', 0);
    $('menu-info').textContent = (S.siswa.size ? S.siswa.size + ' siswa tersimpan di HP. ' : 'Data siswa belum diunduh. ') +
      (t ? 'Diperbarui ' + new Date(t).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + '.' : '');
    m.hidden = false;
    $('tombol-menu').setAttribute('aria-expanded', 'true');
  }
  function tutupMenu() { $('menu').hidden = true; $('tombol-menu').setAttribute('aria-expanded', 'false'); }

  let timerToast = null;
  function toast(teks, jenis, ms) {
    const t = $('toast');
    t.className = 'toast' + (jenis ? ' ' + jenis : '');
    t.textContent = teks;
    t.hidden = false;
    clearTimeout(timerToast);
    timerToast = setTimeout(() => { t.hidden = true; }, ms || 2500);
  }

  function getar(pola) { try { if (navigator.vibrate) navigator.vibrate(pola); } catch (e) { /* tidak didukung */ } }
  function inisial(nama) { return String(nama || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0].toUpperCase()).join(''); }

  /* ---------------- Mode demo (tanpa server) ---------------- */
  const Demo = (() => {
    const nama = [
      ['2601', 'Aisyah Putri Ramadhani', '7A'], ['2602', 'Bagas Adi Saputra', '7A'], ['2603', 'Citra Ayu Lestari', '7B'],
      ['2604', 'Dimas Arya Pratama', '7B'], ['2605', 'Eka Nur Fadilah', '8A'], ['2606', 'Fajar Maulana', '8A'],
      ['2607', 'Gita Ananda Sari', '8C'], ['2608', 'Hendra Wijaya', '8C'], ['2609', 'Intan Permatasari', '9A'],
      ['2610', 'Joko Susilo', '9A'], ['2611', 'Kirana Dewi', '9B'], ['2612', 'Lukman Hakim', '9C'],
    ];
    const warna = ['#17305C', '#1F7A4D', '#8F5300', '#46587A', '#6B2E83', '#0E6D7A'];
    const siswa = nama.map((x, i) => ({ nis: x[0], nama: x[1], kelas: x[2], aktif: true, fotoV: i === 11 ? 0 : 1 }));
    siswa.push({ nis: '2613', nama: 'Mira Mutasi', kelas: '9C', aktif: false, fotoV: 0 });
    const foto = (s, i) => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="' + warna[i % warna.length] +
        '"/><circle cx="150" cy="150" r="70" fill="#ffffff" fill-opacity=".9"/><rect x="55" y="245" width="190" height="170" rx="90" fill="#ffffff" fill-opacity=".9"/>' +
        '<text x="150" y="172" text-anchor="middle" font-family="sans-serif" font-size="62" font-weight="700" fill="' + warna[i % warna.length] + '">' + inisial(s.nama) + '</text></svg>';
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    };
    const tercatat = {};
    const tunda = (ms) => new Promise((r) => setTimeout(r, ms));
    async function api(isi) {
      await tunda(350);
      if (navigator.onLine === false) throw Object.assign(new Error('Tidak ada sinyal ke server.'), { jaringan: true });
      switch (isi.aksi) {
        case 'masuk': return { sesi: 'demo', kedaluwarsa: Date.now() + 16 * 3600000, guru: { nama: 'Guru Piket (demo)', nip: '-', peran: ['Piket'], bolehGerbang: true } };
        case 'keluar': return { keluar: true };
        case 'siswa': return { siswa: siswa, batasMasuk: '07:15:00', waktuServer: Date.now() };
        case 'foto': {
          const out = {};
          isi.nis.forEach((n) => { const i = siswa.findIndex((s) => s.nis === n); if (i > -1 && siswa[i].fotoV) out[n] = { v: 1, data: foto(siswa[i], i) }; });
          return { foto: out };
        }
        case 'scan': {
          const t = new Date(isi.waktuKlien || Date.now());
          const j = t.toLocaleTimeString('en-GB', { timeZone: 'Asia/Jakarta', hour12: false });
          const kunci = isi.nis + '|' + (isi.mode === MODE.PULANG || isi.mode === MODE.DISPENSASI ? 'keluar' : 'masuk');
          if (isi.mode !== MODE.DISPENSASI && tercatat[kunci] && tercatat[kunci] !== isi.idScan) return { idScan: isi.idScan, status: 'DUPLIKAT: sudah tercatat pukul ' + j, jam: j };
          tercatat[kunci] = isi.idScan;
          if (isi.mode === MODE.PULANG) return { idScan: isi.idScan, status: 'OK: pulang ' + j, jam: j };
          if (isi.mode === MODE.DISPENSASI) return { idScan: isi.idScan, status: 'OK: dispensasi ' + j, jam: j };
          const telat = j > '07:15:00';
          const bagian = [(telat ? 'Terlambat ' : 'Hadir ') + j];
          if (isi.mode === MODE.MANUAL) bagian.push('+2 poin lupa ID');
          if (telat) bagian.push('+5 poin terlambat');
          return { idScan: isi.idScan, status: 'OK: ' + bagian.join(', '), jam: j };
        }
        default: throw Object.assign(new Error('Aksi demo tidak dikenal'), { kode: 'AKSI' });
      }
    }
    return { api: api };
  })();

  /* ---------------- Mulai ---------------- */
  function pasangKejadian() {
    document.querySelectorAll('.mode button').forEach((b) => b.addEventListener('click', () => pilihMode(b.dataset.mode)));
    $('tombol-ketik').addEventListener('click', tampilCari);
    $('tombol-kembali-kamera').addEventListener('click', tampilKamera);
    $('input-cari').addEventListener('input', renderHasilCari);
    $('input-cari').addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const q = $('input-cari').value.trim();
      if (S.siswa.has(q)) bukaSiswa(q);
      else { const b = $('hasil-cari').querySelector('button'); if (b) b.click(); }
    });
    $('tombol-batal').addEventListener('click', batalPopup);
    $('tombol-simpan').addEventListener('click', konfirmasiPopup);
    $('input-ket').addEventListener('input', () => { $('tombol-simpan').disabled = !$('input-ket').value.trim(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && S.popup) batalPopup(); });
    $('tombol-menu').addEventListener('click', () => ($('menu').hidden ? bukaMenu() : tutupMenu()));
    $('menu-perbarui').addEventListener('click', perbaruiData);
    $('menu-tatib').hidden = DEMO;
    $('menu-wa').hidden = DEMO;
    $('menu-kirim').addEventListener('click', () => { tutupMenu(); kirimAntrean(); });
    $('menu-keluar').addEventListener('click', keluar);
    $('tombol-antre').addEventListener('click', kirimAntrean);
    $('tombol-demo').addEventListener('click', () => masukDenganToken('demo'));
    window.addEventListener('online', kirimAntrean);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) hentikanKamera();
      else if (!$('layar-utama').hidden && !$('panel-kamera').hidden) mulaiKamera();
    });
  }

  function mulai() {
    pasangKejadian();
    bersihkanLogLama();
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
    const sesi = simpan.get('smkt_sesi', null);
    if (sesi && sesi.kedaluwarsa > Date.now() && (!DEMO || sesi.sesi === 'demo')) {
      if (!DEMO && sesi.guru && !sesi.guru.bolehGerbang) { location.replace('tatib.html'); return; }
      S.sesi = sesi.sesi; S.guru = sesi.guru;
      bukaUtama();
    } else {
      tampilLogin();
    }
  }

  // Dipakai pengujian otomatis; tidak memengaruhi pemakaian biasa.
  window.SMKT_uji = { saatTerbaca: saatTerbaca, keadaan: S };

  mulai();
})();
