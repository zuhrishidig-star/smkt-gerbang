/*
 * Kios Gerbang SMKT · v1.0 (3 November 2026)
 * Tablet di gerbang yang dipakai siswa sendiri. Siswa memegang kartu di
 * bawah dagu dan menatap kamera. QR baru diterima bila, pada gambar yang
 * sama, tampak satu wajah yang menghadap kamera dan kartu berada di bawah
 * wajah. Foto saat itu dikirim sebagai bukti untuk diverifikasi wali kelas.
 * Pemeriksaan wajah berjalan di tablet (MediaPipe Face Detector), tanpa
 * mengirim gambar ke mana pun selain foto bukti ke server sekolah.
 */
(function () {
  'use strict';

  const CFG = window.SMKT_CONFIG || {};
  const $ = (id) => document.getElementById(id);

  /** Batas pemeriksaan wajah dan kartu (nilai relatif terhadap lebar gambar kamera). */
  const ATURAN = {
    skorMin: 0.6,        // keyakinan deteksi wajah
    lebarMin: 0.13,      // wajah terlalu kecil = terlalu jauh dari tablet
    hadapMaks: 0.3,      // geser hidung dari tengah kedua mata, dibagi jarak mata
    angguk: [0.18, 0.85],// posisi hidung di antara mata dan mulut (menunduk/mendongak)
    wajahKedua: 0.7,     // wajah kedua sebesar ini dianggap dua orang
    tutupMaks: 0.15,     // bagian wajah yang boleh tertutup kartu
    kartuTegak: true,    // kartu harus tegak (Config KIOS_KARTU_TEGAK)
    sudutMaks: 40,       // kemiringan QR yang masih dianggap tegak (derajat)
    stabil: 2,           // gambar berturut-turut yang harus lolos
    jedaNis: 60000,      // kartu yang sama diabaikan selama 1 menit
    tampil: 2600,        // lama kartu hasil tampil
    intervalMs: 120,     // ±8 pemeriksaan per detik
  };
  const PESAN = {
    awal: 'Pegang kartu tegak di bawah dagu, lalu tatap kamera.',
    wajah: 'Wajah belum terlihat. Tatap kamera.',
    jauh: 'Mendekat ke tablet.',
    banyak: 'Satu orang saja di depan kamera.',
    hadap: 'Hadapkan wajah lurus ke kamera.',
    angguk: 'Angkat dagu dan tatap kamera.',
    kartu: 'Turunkan kartu ke bawah dagu.',
    miring: 'Pegang kartu tegak, jangan mendatar.',
    tutup: 'Kartu menutupi wajah. Turunkan sedikit.',
    kartuDulu: 'Wajah sudah terlihat. Tunjukkan kartu tegak di bawah dagu.',
  };

  const S = {
    token: '', nama: '', data: null, siswa: new Map(),
    video: null, stream: null, detektor: null, barcode: null, jalan: false, tAkhir: 0, jeda: 0,
    stabil: { nis: '', n: 0 }, terakhir: {}, audio: null, wake: null, mengirim: false, timerKirim: null,
    keadaan: { wajah: null, qr: null, hasil: null }, galatModel: '',
  };
  window.__kios = { S: S, ATURAN: ATURAN, nilai: null, diterima: [], ditolak: {} };

  /* ---------------- Penyimpanan ---------------- */
  const simpan = {
    get(k, b) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : b; } catch (e) { return b; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* penuh atau diblokir */ } },
    hapus(k) { try { localStorage.removeItem(k); } catch (e) { /* abaikan */ } },
  };
  const DB = (() => {
    let janji = null;
    const buka = () => janji || (janji = new Promise((res, rej) => {
      const r = indexedDB.open('smkt-kios', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('antre', { keyPath: 'idScan' });
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    }));
    const op = async (mode, fn) => {
      const db = await buka();
      return new Promise((res, rej) => {
        const tx = db.transaction('antre', mode);
        const q = fn(tx.objectStore('antre'));
        tx.oncomplete = () => res(q ? q.result : undefined);
        tx.onerror = () => rej(tx.error);
      });
    };
    return {
      semua: () => op('readonly', (s) => s.getAll()),
      taruh: (v) => op('readwrite', (s) => s.put(v)),
      buang: (k) => op('readwrite', (s) => s.delete(k)),
    };
  })();

  /* ---------------- Waktu ---------------- */
  const zona = { timeZone: 'Asia/Jakarta' };
  const fJam = new Intl.DateTimeFormat('id-ID', Object.assign({ hour: '2-digit', minute: '2-digit', hour12: false }, zona));
  const fTgl = new Intl.DateTimeFormat('id-ID', Object.assign({ weekday: 'long', day: 'numeric', month: 'long' }, zona));
  const fKunci = new Intl.DateTimeFormat('en-CA', Object.assign({ year: 'numeric', month: '2-digit', day: '2-digit' }, zona));
  const jamTitik = (t) => fJam.format(new Date(t)).replace(':', '.');
  const hhmm = (t) => fJam.format(new Date(t)).replace('.', ':');
  const kunciHari = () => fKunci.format(new Date()).replace(/-/g, '');
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + '-' + Math.random().toString(16).slice(2, 10));

  /* ---------------- API ---------------- */
  async function api(aksi, data, sesi) {
    if (!CFG.API_URL) throw new Error('API_URL di config.js belum diisi.');
    const isi = Object.assign({ aksi: aksi }, sesi ? { sesi: sesi } : { kios: S.token }, data || {});
    let res;
    try {
      res = await fetch(CFG.API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(isi), redirect: 'follow' });
    } catch (e) {
      throw Object.assign(new Error('Tidak ada sinyal ke server.'), { jaringan: true });
    }
    if (!res.ok) throw Object.assign(new Error('Server menjawab ' + res.status + '.'), { jaringan: true });
    let j;
    try { j = await res.json(); } catch (e) { throw Object.assign(new Error('Jawaban server tidak terbaca.'), { jaringan: true }); }
    if (!j.ok) throw Object.assign(new Error(j.pesan || 'Permintaan ditolak server.'), { kode: j.kode });
    return j.data;
  }

  /* ---------------- Aktivasi ---------------- */
  function tampil(id) {
    ['layar-aktif', 'layar-mulai', 'layar-kios'].forEach((x) => { $(x).hidden = x !== id; });
  }

  function layarAktif(pesan) {
    tampil('layar-aktif');
    $('aktif-pesan').textContent = pesan || '';
    const sesi = simpan.get('smkt_sesi', null);
    if (sesi && sesi.sesi && sesi.kedaluwarsa > Date.now()) { formAktif(sesi); return; }
    $('aktif-login').hidden = false; $('aktif-form').hidden = true;
    siapkanGoogle();
  }

  function formAktif(sesi) {
    $('aktif-login').hidden = true; $('aktif-form').hidden = false;
    const g = sesi.guru || {};
    $('aktif-siapa').textContent = 'Masuk sebagai ' + (g.nama || 'guru') + '.';
    $('aktif-tombol').onclick = async () => {
      $('aktif-tombol').disabled = true; $('aktif-pesan').textContent = 'Mengaktifkan…';
      try {
        const d = await api('kios.aktifkan', { nama: $('aktif-nama').value.trim() }, sesi.sesi);
        simpan.set('smkt_kios', { token: d.token, nama: d.nama, sampai: d.berlakuSampai });
        $('aktif-pesan').textContent = '';
        mulaiDenganToken();
      } catch (e) {
        $('aktif-pesan').textContent = e.message;
        if (e.kode === 'SESI') { simpan.hapus('smkt_sesi'); layarAktif(e.message); }
      } finally { $('aktif-tombol').disabled = false; }
    };
  }

  let googleSiap = false;
  function siapkanGoogle() {
    if (!CFG.GOOGLE_CLIENT_ID) { $('aktif-pesan').textContent = 'GOOGLE_CLIENT_ID di config.js belum diisi.'; return; }
    const pasang = () => {
      if (!googleSiap) {
        google.accounts.id.initialize({ client_id: CFG.GOOGLE_CLIENT_ID, callback: async (r) => {
          $('aktif-pesan').textContent = 'Memeriksa akun…';
          try {
            const d = await api('masuk', { idToken: r.credential }, ' ');
            const sesi = { sesi: d.sesi, kedaluwarsa: d.kedaluwarsa, guru: d.guru };
            $('aktif-pesan').textContent = '';
            formAktif(sesi);
          } catch (e) {
            $('aktif-pesan').textContent = e.kode === 'TIDAK_TERDAFTAR'
              ? 'Email ini belum didaftarkan oleh Tim Tata Tertib. Silakan hubungi Tim Tata Tertib.' : e.message;
          }
        } });
        googleSiap = true;
      }
      google.accounts.id.renderButton($('tombol-google'), { theme: 'filled_blue', size: 'large', shape: 'pill', text: 'signin_with', locale: 'id', width: 280 });
    };
    if (window.google && google.accounts && google.accounts.id) { pasang(); return; }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.onload = pasang;
    s.onerror = () => { $('aktif-pesan').textContent = 'Login Google tidak bisa dimuat. Periksa sinyal.'; };
    document.head.appendChild(s);
  }

  /* ---------------- Data siswa ---------------- */
  function pakaiData(d) {
    S.data = d;
    ATURAN.kartuTegak = d.kartuTegak !== false;
    S.siswa = new Map(d.siswa.map((s) => [String(s.nis), s]));
    $('k-sekolah').textContent = d.sekolah || CFG.NAMA_SEKOLAH || '';
    $('k-nama-kios').textContent = 'Kios ' + (d.kios || S.nama);
    $('k-batas').textContent = d.batasMasuk ? 'Batas masuk pukul ' + d.batasMasuk.replace(':', '.') + '. Scan setelahnya tercatat terlambat.' : '';
  }
  async function muatData(paksa) {
    const lama = simpan.get('smkt_kios_data', null);
    if (lama && !paksa) pakaiData(lama);
    try {
      const d = await api('kios.data');
      d.dimuat = Date.now();
      simpan.set('smkt_kios_data', d);
      pakaiData(d);
      return true;
    } catch (e) {
      if (e.kode === 'KIOS') { cabut(e.message); return false; }
      if (!lama) throw e;
      return false;
    }
  }

  function cabut(pesan) {
    berhenti();
    simpan.hapus('smkt_kios'); simpan.hapus('smkt_kios_data');
    S.token = '';
    layarAktif(pesan);
  }

  /* ---------------- Model wajah ---------------- */
  let janjiModel = null;
  function muatModel() {
    if (janjiModel) return janjiModel;
    janjiModel = (async () => {
      const { FilesetResolver, FaceDetector } = await import('./vendor/mediapipe/vision_bundle.mjs');
      const fs = await FilesetResolver.forVisionTasks(new URL('vendor/mediapipe/wasm', location.href).href);
      const opsi = (delegate) => ({ baseOptions: { modelAssetPath: new URL('vendor/mediapipe/blaze_face_short_range.tflite', location.href).href, delegate: delegate },
        runningMode: 'VIDEO', minDetectionConfidence: 0.5 });
      try { S.detektor = await FaceDetector.createFromOptions(fs, opsi('GPU')); }
      catch (e) { S.detektor = await FaceDetector.createFromOptions(fs, opsi('CPU')); }
      if ('BarcodeDetector' in window) {
        try {
          const f = await window.BarcodeDetector.getSupportedFormats();
          if (f.indexOf('qr_code') > -1) S.barcode = new window.BarcodeDetector({ formats: ['qr_code'] });
        } catch (e) { S.barcode = null; }
      }
      return true;
    })();
    return janjiModel;
  }

  /* ---------------- Mulai ---------------- */
  async function mulaiDenganToken() {
    const k = simpan.get('smkt_kios', null);
    if (!k || !k.token) { layarAktif(''); return; }
    S.token = k.token; S.nama = k.nama;
    tampil('layar-mulai');
    $('mulai-judul').textContent = 'Kios ' + k.nama;
    $('mulai-tombol').disabled = true; $('mulai-tombol').textContent = 'Menyiapkan…';
    $('mulai-pesan').textContent = '';
    try {
      await muatData(false);
      if (!S.token) return;
      await muatModel();
      $('mulai-tombol').disabled = false; $('mulai-tombol').textContent = 'Mulai';
    } catch (e) {
      console.error(e);
      $('mulai-pesan').textContent = String(e && e.message || e).indexOf('sinyal') > -1 ? e.message + ' Coba lagi setelah tersambung.'
        : 'Pemeriksaan wajah tidak bisa dijalankan di perangkat ini. Pakai tablet Android dengan Chrome terbaru.';
      $('mulai-tombol').disabled = false; $('mulai-tombol').textContent = 'Coba lagi';
      $('mulai-tombol').onclick = () => mulaiDenganToken();
      return;
    }
    $('mulai-tombol').onclick = mulaiKios;
  }

  async function mulaiKios() {
    try { if (document.documentElement.requestFullscreen && !document.fullscreenElement) await document.documentElement.requestFullscreen(); } catch (e) { /* tidak wajib */ }
    try { S.audio = S.audio || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { S.audio = null; }
    await jagaLayar();
    tampil('layar-kios');
    perbaruiJam();
    perbaruiHitung();
    try {
      S.stream = await navigator.mediaDevices.getUserMedia({ audio: false,
        video: { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1080 } } });
    } catch (e) {
      tampil('layar-mulai');
      $('mulai-pesan').textContent = 'Kamera belum diizinkan. Izinkan akses kamera di Chrome, lalu ketuk Mulai lagi.';
      return;
    }
    S.video = $('k-video');
    S.video.srcObject = S.stream;
    try { await S.video.play(); } catch (e) { /* autoplay muted */ }
    S.jalan = true;
    $('k-perintah').textContent = PESAN.awal;
    requestAnimationFrame(putar);
    kirimAntrean();
  }

  function berhenti() {
    S.jalan = false;
    if (S.stream) { S.stream.getTracks().forEach((t) => t.stop()); S.stream = null; }
  }

  async function jagaLayar() {
    try { if ('wakeLock' in navigator) S.wake = await navigator.wakeLock.request('screen'); } catch (e) { S.wake = null; }
  }

  /* ---------------- Pemeriksaan per gambar ---------------- */
  function putar() {
    if (!S.jalan) return;
    const t = performance.now();
    if (t - S.tAkhir >= ATURAN.intervalMs && S.video.readyState >= 2 && !S.sibuk) {
      S.tAkhir = t;
      S.sibuk = true;
      periksa(t).catch((e) => console.warn(e)).finally(() => { S.sibuk = false; });
    }
    requestAnimationFrame(putar);
  }

  async function bacaQR(v) {
    const vw = v.videoWidth, vh = v.videoHeight;
    if (S.barcode) {
      try {
        const r = await S.barcode.detect(v);
        if (r && r.length) {
          const b = r[0].boundingBox, c = r[0].cornerPoints || [];
          return { teks: String(r[0].rawValue || '').trim(), x: b.x, y: b.y, w: b.width, h: b.height,
                   sudut: c.length >= 2 ? sudutQR(c[0], c[1]) : null };
        }
        return null;
      } catch (e) { S.barcode = null; }
    }
    if (!window.jsQR) return null;
    // Bagian bawah gambar saja (kartu selalu di bawah wajah), diperkecil agar cepat.
    const skala = Math.min(1, 960 / vw);
    const w = Math.round(vw * skala), h = Math.round(vh * skala);
    const atas = Math.round(h * 0.3);
    const c = S.kanvasQR || (S.kanvasQR = document.createElement('canvas'));
    c.width = w; c.height = h - atas;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(v, 0, atas / skala, vw, (h - atas) / skala, 0, 0, w, h - atas);
    const q = window.jsQR(x.getImageData(0, 0, w, h - atas).data, w, h - atas, { inversionAttempts: 'dontInvert' });
    if (!q) return null;
    const L = q.location;
    const xs = [L.topLeftCorner.x, L.topRightCorner.x, L.bottomLeftCorner.x, L.bottomRightCorner.x];
    const ys = [L.topLeftCorner.y, L.topRightCorner.y, L.bottomLeftCorner.y, L.bottomRightCorner.y];
    const x0 = Math.min(...xs), y0 = Math.min(...ys);
    return { teks: String(q.data || '').trim(), x: x0 / skala, y: (y0 + atas) / skala, w: (Math.max(...xs) - x0) / skala, h: (Math.max(...ys) - y0) / skala,
             sudut: sudutQR(L.topLeftCorner, L.topRightCorner) };
  }
  /** Arah tepi atas QR (derajat, 0 = tegak). Kartu tegak → QR tegak (atau terbalik); kartu mendatar → sekitar ±90°. */
  function sudutQR(kiriAtas, kananAtas) {
    return Math.atan2(kananAtas.y - kiriAtas.y, kananAtas.x - kiriAtas.x) * 180 / Math.PI;
  }
  function kartuMiring(sudut) {
    if (sudut == null || !isFinite(sudut)) return false;
    const a = Math.abs(((sudut % 180) + 180) % 180);   // 0..180, 0 dan 180 = tegak
    return Math.min(a, 180 - a) > ATURAN.sudutMaks;
  }

  /**
   * Menilai satu gambar. wajah: daftar {x,y,w,h,skor,kp:[[x,y]…]} dalam piksel;
   * kp = mata kanan, mata kiri, hidung, mulut (urutan MediaPipe). qr: kotak QR atau null.
   */
  function nilai(wajah, vw, qr) {
    const out = { wajah: false, hadap: false, kartu: false, ok: false, alasan: '' };
    const daftar = (wajah || []).filter((f) => f.skor >= ATURAN.skorMin).sort((a, b) => b.w * b.h - a.w * a.h);
    if (!daftar.length) { out.alasan = 'wajah'; return out; }
    const f = daftar[0];
    if (daftar[1] && daftar[1].w >= ATURAN.wajahKedua * f.w) { out.alasan = 'banyak'; return out; }
    if (f.w / vw < ATURAN.lebarMin) { out.alasan = 'jauh'; return out; }
    out.wajah = true;
    const [mk, mi, hd, mu] = f.kp;
    const jarakMata = Math.abs(mi[0] - mk[0]);
    const tengahMata = [(mk[0] + mi[0]) / 2, (mk[1] + mi[1]) / 2];
    const hadap = jarakMata > 0 ? Math.abs(hd[0] - tengahMata[0]) / jarakMata : 9;
    const angguk = mu[1] - tengahMata[1] > 0 ? (hd[1] - tengahMata[1]) / (mu[1] - tengahMata[1]) : 9;
    if (jarakMata < 0.25 * f.w || hadap > ATURAN.hadapMaks) { out.alasan = 'hadap'; return out; }
    if (angguk < ATURAN.angguk[0] || angguk > ATURAN.angguk[1]) { out.alasan = 'angguk'; return out; }
    out.hadap = true;
    if (!qr) { out.alasan = 'kartuDulu'; return out; }
    const ix = Math.max(0, Math.min(f.x + f.w, qr.x + qr.w) - Math.max(f.x, qr.x));
    const iy = Math.max(0, Math.min(f.y + f.h, qr.y + qr.h) - Math.max(f.y, qr.y));
    if (ix * iy > ATURAN.tutupMaks * f.w * f.h) { out.alasan = 'tutup'; return out; }
    if (qr.y + qr.h / 2 < f.y + f.h * 0.85) { out.alasan = 'kartu'; return out; }
    if (ATURAN.kartuTegak && kartuMiring(qr.sudut)) { out.alasan = 'miring'; return out; }
    out.kartu = true;
    out.ok = true;
    return out;
  }
  window.__kios.nilai = nilai;

  async function periksa(t) {
    const v = S.video;
    if (!v.videoWidth || Date.now() < S.jeda) return;
    const vw = v.videoWidth, vh = v.videoHeight;
    let deteksi = [];
    try { deteksi = S.detektor.detectForVideo(v, t).detections || []; } catch (e) { deteksi = []; }
    const wajah = deteksi.map((d) => ({
      x: d.boundingBox.originX, y: d.boundingBox.originY, w: d.boundingBox.width, h: d.boundingBox.height,
      skor: d.categories && d.categories[0] ? d.categories[0].score : 0,
      kp: (d.keypoints || []).slice(0, 4).map((k) => [k.x * vw, k.y * vh]),
    })).filter((f) => f.kp.length === 4);
    const qr = await bacaQR(v);
    const n = nilai(wajah, vw, qr);
    S.keadaan = { wajah: wajah[0] || null, qr: qr, hasil: n };
    gambarLapis(vw, vh);
    tandaiCek(n, qr);

    if (!qr || !qr.teks) { S.stabil = { nis: '', n: 0 }; return; }
    const nis = qr.teks;
    const s = S.siswa.get(nis);
    if (!s) { tampilHasil({ jenis: 'galat', status: 'Kartu tidak dikenal', nama: 'QR ' + nis.slice(0, 20), kelas: 'Minta Tim Tatib memperbarui data siswa.', ket: '' }); return; }
    if ((S.terakhir[nis] || 0) > Date.now()) return;   // baru saja tercatat
    if (!n.ok) {
      S.stabil = { nis: '', n: 0 };
      window.__kios.ditolak[n.alasan] = (window.__kios.ditolak[n.alasan] || 0) + 1;
      return;
    }
    S.stabil = S.stabil.nis === nis ? { nis: nis, n: S.stabil.n + 1 } : { nis: nis, n: 1 };
    if (S.stabil.n < ATURAN.stabil) return;
    S.stabil = { nis: '', n: 0 };
    terima(s, tangkapFoto(v));
  }

  function gambarLapis(vw, vh) {
    const c = $('k-lapis');
    const r = c.getBoundingClientRect();
    if (c.width !== Math.round(r.width) || c.height !== Math.round(r.height)) { c.width = Math.round(r.width); c.height = Math.round(r.height); }
    const x = c.getContext('2d');
    x.clearRect(0, 0, c.width, c.height);
    // object-fit: cover → skala dan geser yang sama dengan video
    const sk = Math.max(c.width / vw, c.height / vh);
    const dx = (c.width - vw * sk) / 2, dy = (c.height - vh * sk) / 2;
    const kotak = (b, warna) => {
      if (!b) return;
      x.strokeStyle = warna; x.lineWidth = 4; x.lineJoin = 'round';
      x.strokeRect(dx + b.x * sk, dy + b.y * sk, b.w * sk, b.h * sk);
    };
    const n = S.keadaan.hasil || {};
    kotak(S.keadaan.wajah, n.hadap ? '#2FA86A' : '#F2B544');
    kotak(S.keadaan.qr, n.ok ? '#2FA86A' : '#F2B544');
  }

  function tandaiCek(n, qr) {
    const atur = (id, ya, ada) => { const el = $(id); el.classList.toggle('ya', !!ya); el.classList.toggle('tidak', !ya && !!ada); };
    atur('cek-wajah', n.wajah, true);
    atur('cek-hadap', n.hadap, n.wajah);
    atur('cek-kartu', n.kartu, !!qr);
    $('k-kamera').classList.toggle('siap', n.ok);
    $('k-kamera').classList.toggle('kurang', !n.ok && (n.wajah || !!qr));
    let teks;
    if (n.ok) teks = 'Tahan sebentar…';
    else if (!qr && n.alasan === 'wajah') teks = PESAN.awal;   // belum ada siapa pun di depan tablet
    else teks = PESAN[n.alasan] || PESAN.awal;
    if ($('k-perintah').textContent !== teks) {
      $('k-perintah').textContent = teks;
      const r = window.__kios.riwayatPesan || (window.__kios.riwayatPesan = []);
      r.push(teks); if (r.length > 50) r.shift();
    }
  }

  function tangkapFoto(v) {
    const c = $('k-tangkap');
    const lebar = Math.min(720, v.videoWidth);
    c.width = lebar; c.height = Math.round(v.videoHeight * lebar / v.videoWidth);
    c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
    let mutu = 0.72, data = c.toDataURL('image/jpeg', mutu);
    while (data.length > 180000 && mutu > 0.4) { mutu -= 0.12; data = c.toDataURL('image/jpeg', mutu); }
    return data;
  }

  /* ---------------- Terima scan ---------------- */
  function logHari() { return simpan.get('smkt_kios_log_' + kunciHari(), {}); }

  function terima(s, foto) {
    const kini = Date.now();
    S.terakhir[s.nis] = kini + ATURAN.jedaNis;
    const log = logHari();
    const sudah = log[s.nis];
    const batas = S.data && S.data.batasMasuk ? S.data.batasMasuk : '';
    const telat = !!batas && hhmm(kini) > batas;
    if (!sudah) {
      log[s.nis] = { jam: hhmm(kini), telat: telat };
      simpan.set('smkt_kios_log_' + kunciHari(), log);
    }
    const item = { idScan: uuid(), nis: s.nis, waktuKlien: kini, foto: foto };
    S.tampilNis = { idScan: item.idScan, nis: s.nis, nama: s.nama, kelas: s.kelas, foto: foto };
    window.__kios.diterima.push({ nis: s.nis, jam: hhmm(kini), panjangFoto: foto.length, waktu: Date.now() });
    DB.taruh(item).then(() => { perbaruiAntre(); kirimAntrean(); }).catch(() => { /* IndexedDB penuh: tetap dicoba kirim langsung */ api('kios.scan', item).catch(() => {}); });
    if (sudah) {
      tampilHasil({ jenis: 'info', status: 'Sudah tercatat', nama: s.nama, kelas: 'Kelas ' + s.kelas, ket: 'Masuk pukul ' + sudah.jam.replace(':', '.') + '.', foto: foto });
      bunyi('info');
    } else {
      tampilHasil({ jenis: telat ? 'telat' : 'hadir', status: (telat ? 'Terlambat ' : 'Hadir ') + jamTitik(kini), nama: s.nama, kelas: 'Kelas ' + s.kelas,
        ket: telat ? 'Segera masuk kelas.' : 'Terima kasih, selamat belajar.', foto: foto });
      bunyi(telat ? 'telat' : 'hadir');
      perbaruiHitung();
    }
  }

  function tampilHasil(h) {
    const el = $('k-hasil');
    el.className = 'k-hasil ' + h.jenis;
    $('h-status').textContent = h.status;
    $('h-nama').textContent = h.nama;
    $('h-kelas').textContent = h.kelas;
    $('h-ket').textContent = h.ket || '';
    const img = $('h-foto');
    if (h.foto) { img.src = h.foto; img.hidden = false; } else { img.removeAttribute('src'); img.hidden = true; }
    el.hidden = false;
    S.jeda = Date.now() + ATURAN.tampil;
    clearTimeout(S.timerHasil);
    S.timerHasil = setTimeout(() => { el.hidden = true; }, ATURAN.tampil);
  }

  /** Server tahu lebih banyak (mis. sudah dicatat piket lewat HP): kartu hasil yang masih tampil ikut dikoreksi. */
  function koreksiHasil(item, r) {
    const t = S.tampilNis;
    if (!r || r.label !== 'Duplikat') return;
    const log = logHari();
    const m = String(r.status || '').match(/pukul (\d{2}:\d{2})/);
    if (log[item.nis] && log[item.nis].jam === hhmm(item.waktuKlien)) {
      log[item.nis] = { jam: m ? m[1] : log[item.nis].jam, telat: log[item.nis].telat, dariServer: true };
      simpan.set('smkt_kios_log_' + kunciHari(), log);
      perbaruiHitung();
    }
    if (t && t.idScan === item.idScan && !$('k-hasil').hidden) {
      $('k-hasil').className = 'k-hasil info';
      $('h-status').textContent = 'Sudah tercatat';
      $('h-ket').textContent = m ? 'Masuk pukul ' + m[1].replace(':', '.') + '.' : 'Kehadiran hari ini sudah ada.';
    }
  }

  function bunyi(jenis) {
    const a = S.audio;
    if (!a) return;
    try {
      const nada = jenis === 'hadir' ? [880, 1320] : jenis === 'telat' ? [520, 390] : [660];
      nada.forEach((f, i) => {
        const o = a.createOscillator(), g = a.createGain();
        o.frequency.value = f; o.type = 'sine';
        g.gain.setValueAtTime(0.0001, a.currentTime + i * 0.16);
        g.gain.exponentialRampToValueAtTime(0.25, a.currentTime + i * 0.16 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + i * 0.16 + 0.15);
        o.connect(g).connect(a.destination);
        o.start(a.currentTime + i * 0.16); o.stop(a.currentTime + i * 0.16 + 0.16);
      });
    } catch (e) { /* tanpa suara */ }
  }

  function perbaruiHitung() {
    const log = logHari();
    const v = Object.values(log);
    $('k-n-hadir').textContent = v.filter((x) => !x.telat).length;
    $('k-n-telat').textContent = v.filter((x) => x.telat).length;
  }

  /* ---------------- Antrean kirim ---------------- */
  async function perbaruiAntre() {
    let n = 0;
    try { n = (await DB.semua()).length; } catch (e) { n = 0; }
    $('k-antre').hidden = !n;
    $('k-antre').textContent = n + ' scan menunggu dikirim. Data aman di tablet ini.' + (n && S.galatKirim ? ' (' + S.galatKirim + ')' : '');
    return n;
  }

  function catatDitolak(item, pesan) {
    const l = simpan.get('smkt_kios_ditolak', []) || [];
    l.push({ nis: item.nis, jam: hhmm(item.waktuKlien), pesan: String(pesan || '').slice(0, 120) });
    simpan.set('smkt_kios_ditolak', l.slice(-20));
  }

  async function kirimAntrean() {
    if (S.mengirim || !S.token) return;
    S.mengirim = true;
    clearTimeout(S.timerKirim);
    try {
      const semua = (await DB.semua()).sort((a, b) => a.waktuKlien - b.waktuKlien);
      for (const item of semua) {
        try {
          const r = await api('kios.scan', item);
          S.galatKirim = '';
          await DB.buang(item.idScan);
          koreksiHasil(item, r);
        } catch (e) {
          if (e.kode === 'KIOS') { cabut(e.message); return; }
          // Hanya data yang memang salah (mis. NIS tidak dikenal) yang dibuang. Gangguan server,
          // izin Google, atau sinyal: scan tetap disimpan di tablet dan dicoba lagi.
          if (e.kode !== 'DATA') { S.timerKirim = setTimeout(kirimAntrean, e.jaringan || e.kode === 'SIBUK' ? 10000 : 60000); S.galatKirim = e.message; break; }
          catatDitolak(item, e.message);
          await DB.buang(item.idScan);
          console.warn('Scan ditolak server:', e.message);
        }
      }
    } catch (e) {
      S.timerKirim = setTimeout(kirimAntrean, 10000);
    } finally {
      S.mengirim = false;
      perbaruiAntre();
    }
  }

  /* ---------------- Jam & pengaturan ---------------- */
  function perbaruiJam() {
    $('k-jam').textContent = jamTitik(Date.now());
    const t = fTgl.format(new Date());
    $('k-tanggal').textContent = t.charAt(0).toUpperCase() + t.slice(1);
  }

  function pasangGir() {
    const b = $('k-gir');
    let timer = null;
    const lepas = () => { clearTimeout(timer); b.classList.remove('tahan'); };
    b.addEventListener('pointerdown', () => { b.classList.add('tahan'); timer = setTimeout(() => { lepas(); bukaAtur(); }, 1500); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((e) => b.addEventListener(e, lepas));
    b.addEventListener('keydown', (e) => { if (e.key === 'Enter') bukaAtur(); });
    $('atur-tutup').addEventListener('click', () => { $('k-atur').hidden = true; });
    $('atur-muat').addEventListener('click', async () => {
      $('atur-pesan').textContent = 'Memuat…';
      $('atur-pesan').textContent = (await muatData(true)) ? 'Daftar siswa diperbarui.' : 'Belum bisa memuat. Periksa sinyal.';
      isiAtur();
    });
    $('atur-kirim').addEventListener('click', () => { kirimAntrean(); $('atur-pesan').textContent = 'Mengirim ulang…'; setTimeout(isiAtur, 1500); });
    $('atur-keluar').addEventListener('click', async () => {
      const b2 = $('atur-keluar');
      if (b2.dataset.yakin !== '1') { b2.dataset.yakin = '1'; b2.textContent = 'Ketuk lagi untuk keluar'; return; }
      const n = await perbaruiAntre();
      if (n) { $('atur-pesan').textContent = n + ' scan belum terkirim. Sambungkan internet dan kirim dulu.'; b2.dataset.yakin = ''; b2.textContent = 'Keluar dari mode kios'; return; }
      $('k-atur').hidden = true;
      cabut('Mode kios dimatikan di tablet ini.');
    });
  }
  async function bukaAtur() {
    $('atur-keluar').dataset.yakin = ''; $('atur-keluar').textContent = 'Keluar dari mode kios';
    $('atur-pesan').textContent = '';
    await isiAtur();
    $('k-atur').hidden = false;
  }
  async function isiAtur() {
    const k = simpan.get('smkt_kios', {}) || {};
    const n = await perbaruiAntre();
    const d = S.data || {};
    const baris = [['Nama kios', k.nama || '-'], ['Berlaku sampai', k.sampai || '-'], ['Siswa aktif', String(S.siswa.size)],
      ['Daftar dimuat', d.dimuat ? new Intl.DateTimeFormat('id-ID', Object.assign({ dateStyle: 'short', timeStyle: 'short' }, zona)).format(new Date(d.dimuat)) : '-'],
      ['Belum terkirim', String(n) + (n && S.galatKirim ? ': ' + S.galatKirim : '')],
      ['Ditolak server', ((simpan.get('smkt_kios_ditolak', []) || []).slice(-3).map((x) => x.nis + ' ' + x.jam + ' (' + x.pesan + ')').join('; ')) || '-'], ['Pemeriksaan QR', S.barcode ? 'Pembaca bawaan Chrome' : 'jsQR']];
    const dl = $('atur-info');
    dl.textContent = '';
    baris.forEach(([a, b]) => { const dt = document.createElement('dt'); dt.textContent = a; const dd = document.createElement('dd'); dd.textContent = b; dl.append(dt, dd); });
  }

  /* ---------------- Mulai ---------------- */
  function mulai() {
    pasangGir();
    setInterval(perbaruiJam, 1000);
    // Daftar siswa diperbarui tiap 3 jam; antrean dicoba tiap menit.
    setInterval(() => { if (S.token) muatData(true); }, 3 * 3600 * 1000);
    setInterval(() => { if (S.token) kirimAntrean(); }, 60000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.jalan) jagaLayar(); });
    window.addEventListener('online', kirimAntrean);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
    mulaiDenganToken();
  }
  mulai();
})();
