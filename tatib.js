/*
 * Tata Tertib SMKT · aplikasi web guru · v1.1 (3 November 2026)
 * Menu: Beranda · Lapor · Kotak Masuk · Siswa · Waspada · Pulih · Absen.
 * Tangga pembinaan: guru yang menemukan → wali kelas → BK → Tim Tatib →
 * Wakasek/Kepala Sekolah. WhatsApp gratis lewat tautan wa.me.
 * Memakai login dan sesi yang sama dengan Gerbang (localStorage smkt_sesi).
 * Ikon: Lucide (ISC), lihat vendor/LICENSE-lucide.txt.
 */
(function () {
  'use strict';

  const CFG = window.SMKT_CONFIG || {};
  const PENERIMA = ['Wali Kelas', 'BK', 'Tim Tatib', 'Wakasek', 'Kepala Sekolah'];
  const NAMA_TANGGA = ['', 'Guru yang menemukan', 'Wali Kelas', 'BK', 'Tim Tatib', 'Wakasek'];
  const LABEL_TANGGA = ['', 'Guru', 'Wali Kelas', 'BK', 'Tim Tatib', 'Pimpinan'];
  const SEBUT_TANGGA = ['', 'guru', 'wali kelas', 'BK', 'Tim Tatib', 'pimpinan'];
  const KE_LEVEL_BAWAAN = { 1: 'Wali Kelas', 2: 'BK', 3: 'Tim Tatib', 4: 'Wakasek', 5: 'Wakasek' };
  const URUT_KATEGORI = ['Ringan I', 'Ringan II', 'Sedang I', 'Sedang II', 'Berat I', 'Berat II', 'Berat Sekali'];
  const BATAS_ULANG = 3;
  const HARI_IZIN_MUNDUR = 7;
  const IKON = {"beranda":"<path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\" /> <path d=\"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\" />","lapor":"<path d=\"m3 11 18-5v12L3 14v-3z\" /> <path d=\"M11.6 16.8a3 3 0 1 1-5.8-1.6\" />","kotak":"<polyline points=\"22 12 16 12 14 15 10 15 8 12 2 12\" /> <path d=\"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z\" />","siswa":"<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\" /> <circle cx=\"9\" cy=\"7\" r=\"4\" /> <path d=\"M22 21v-2a4 4 0 0 0-3-3.87\" /> <path d=\"M16 3.13a4 4 0 0 1 0 7.75\" />","waspada":"<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\" /> <path d=\"M12 8v4\" /> <path d=\"M12 16h.01\" />","pulih":"<path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\" /> <path d=\"M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66\" /> <path d=\"m18 15-2-2\" /> <path d=\"m15 18-2-2\" />","absen":"<path d=\"M8 2v4\" /> <path d=\"M16 2v4\" /> <rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\" /> <path d=\"M3 10h18\" /> <path d=\"m9 16 2 2 4-4\" />","wa":"<path d=\"M7.9 20A9 9 0 1 0 4 16.1L2 22Z\" />","qr":"<rect width=\"5\" height=\"5\" x=\"3\" y=\"3\" rx=\"1\" /> <rect width=\"5\" height=\"5\" x=\"16\" y=\"3\" rx=\"1\" /> <rect width=\"5\" height=\"5\" x=\"3\" y=\"16\" rx=\"1\" /> <path d=\"M21 16h-3a2 2 0 0 0-2 2v3\" /> <path d=\"M21 21v.01\" /> <path d=\"M12 7v3a2 2 0 0 1-2 2H7\" /> <path d=\"M3 12h.01\" /> <path d=\"M12 3h.01\" /> <path d=\"M12 16v.01\" /> <path d=\"M16 12h1\" /> <path d=\"M21 12v.01\" /> <path d=\"M12 21v-1\" />","kanan":"<path d=\"m9 18 6-6-6-6\" />","menu":"<circle cx=\"12\" cy=\"12\" r=\"1\" /> <circle cx=\"12\" cy=\"5\" r=\"1\" /> <circle cx=\"12\" cy=\"19\" r=\"1\" />","keluar":"<path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\" /> <polyline points=\"16 17 21 12 16 7\" /> <line x1=\"21\" x2=\"9\" y1=\"12\" y2=\"12\" />","muat":"<path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\" /> <path d=\"M21 3v5h-5\" /> <path d=\"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\" /> <path d=\"M8 16H3v5\" />","cek":"<path d=\"M20 6 9 17l-5-5\" />","gerbang":"<path d=\"M13 4h3a2 2 0 0 1 2 2v14\" /> <path d=\"M2 20h3\" /> <path d=\"M13 20h9\" /> <path d=\"M10 12v.01\" /> <path d=\"M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z\" />","cari":"<circle cx=\"11\" cy=\"11\" r=\"8\" /> <path d=\"m21 21-4.3-4.3\" />","surat":"<path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\" /> <path d=\"M14 2v4a2 2 0 0 0 2 2h4\" /> <path d=\"M10 9H8\" /> <path d=\"M16 13H8\" /> <path d=\"M16 17H8\" />","jam":"<circle cx=\"12\" cy=\"12\" r=\"10\" /> <polyline points=\"12 6 12 12 16 14\" />","awas":"<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\" /> <path d=\"M12 9v4\" /> <path d=\"M12 17h.01\" />","orang":"<circle cx=\"12\" cy=\"8\" r=\"5\" /> <path d=\"M20 21a8 8 0 0 0-16 0\" />","lainnya":"<rect width=\"7\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\" /> <rect width=\"7\" height=\"7\" x=\"14\" y=\"3\" rx=\"1\" /> <rect width=\"7\" height=\"7\" x=\"14\" y=\"14\" rx=\"1\" /> <rect width=\"7\" height=\"7\" x=\"3\" y=\"14\" rx=\"1\" />","ekskul":"<path d=\"M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15\" /> <path d=\"M11 12 5.12 2.2\" /> <path d=\"m13 12 5.88-9.8\" /> <path d=\"M8 7h8\" /> <circle cx=\"12\" cy=\"17\" r=\"5\" /> <path d=\"M12 18v-2h-.5\" />","kirim":"<path d=\"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z\" /> <path d=\"m21.854 2.147-10.94 10.939\" />"};

  const MENU = [
    { id: 'beranda', label: 'Beranda', ikon: 'beranda', judul: 'Beranda', boleh: () => true },
    { id: 'lapor', label: 'Lapor', ikon: 'lapor', judul: 'Lapor pelanggaran', boleh: () => true },
    { id: 'kotak', label: 'Kotak Masuk', ikon: 'kotak', judul: 'Kotak Masuk', boleh: (a) => a.tindakLanjut, ket: 'Kasus yang diteruskan kepada Anda' },
    { id: 'siswa', label: 'Siswa', ikon: 'siswa', judul: 'Riwayat siswa', boleh: (a) => a.riwayat, ket: 'Poin, kehadiran, dan pembinaan per siswa' },
    { id: 'waspada', label: 'Waspada', ikon: 'waspada', judul: 'Waspada', boleh: (a) => a.zona, ket: 'Siswa yang poinnya mencapai level tindakan' },
    { id: 'pulih', label: 'Pulih', ikon: 'pulih', judul: 'Pulih', boleh: (a) => a.pemulihan, ket: 'Program fisik dan pembinaan lain' },
    { id: 'absen', label: 'Absen', ikon: 'absen', judul: 'Absen', boleh: (a) => a.izin, ket: 'Catat izin atau sakit siswa' },
    { id: 'ekskul', label: 'Ekskul', ikon: 'ekskul', judul: 'Absensi ekskul', boleh: (a) => a.ekskul, ket: 'Kehadiran anggota ekstrakurikuler yang Anda bina' },
  ];

  const $ = (id) => document.getElementById(id);
  const S = {
    sesi: null, guru: null, akses: {},
    siswa: new Map(), master: new Map(), panduan: {}, eskalasi: [], tangga: [], templat: {}, sekolah: '', batasMasuk: '',
    tab: 'beranda', siap: {}, menu: [], menunggu: 0, wa: { aktif: false },
    kamera: null, scanCb: null, scanTerus: false, scanTerakhir: { teks: '', waktu: 0 }, foto: new Map(),
  };

  /* ---------------- Bantu ---------------- */
  const esc = (v) => String(v === null || v === undefined ? '' : v).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ikon = (n) => '<span class="ik" aria-hidden="true"><svg viewBox="0 0 24 24">' + (IKON[n] || '') + '</svg></span>';
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() :
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
    }));
  const fmtTanggal = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' });
  const hariIni = (geser) => fmtTanggal.format(new Date(Date.now() + (geser || 0) * 86400000));
  const inisial = (nama) => String(nama || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0].toUpperCase()).join('');
  const punya = (daftar) => (S.guru && S.guru.peran || []).some((p) => daftar.indexOf(p) > -1);
  const luas = () => punya(['BK', 'Tim Tatib', 'Wakasek', 'Kepala Sekolah']);
  const rapat = (t) => String(t || '').toLowerCase().replace(/\s+/g, '');
  const namaPendek = (n) => String(n || '').split(',')[0].trim();
  const kelasKat = (k) => /^Berat/.test(k || '') ? 'k-berat' : /^Sedang/.test(k || '') ? 'k-sedang' : 'k-ringan';

  const simpan = {
    get(k, b) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : b; } catch (e) { return b; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* penuh/diblokir */ } },
    hapus(k) { try { localStorage.removeItem(k); } catch (e) { /* abaikan */ } },
  };
  const sesiTab = {
    get(k) { try { const v = sessionStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* abaikan */ } },
    hapus(k) { try { sessionStorage.removeItem(k); } catch (e) { /* abaikan */ } },
  };

  let timerToast = null;
  function toast(teks, jenis, ms) {
    const t = $('toast');
    t.className = 'toast' + (jenis ? ' ' + jenis : '');
    t.textContent = teks;
    t.hidden = false;
    clearTimeout(timerToast);
    timerToast = setTimeout(() => { t.hidden = true; }, ms || 3200);
  }

  function labelLevel(l) { return l > 0 ? 'Level ' + l : 'Aman'; }
  function lencanaLevel(l) { return '<span class="level l' + (l || 0) + '">' + labelLevel(l) + '</span>'; }
  function levelDari(total) { let lv = 0; S.eskalasi.forEach((e) => { if (total >= e.ambang) lv = Math.max(lv, e.level); }); return lv; }
  function infoLevel(l) { return S.eskalasi.filter((e) => e.level === l)[0] || null; }
  function tanggaPeran(p) { return p === 'Wali Kelas' ? 2 : p === 'BK' ? 3 : p === 'Tim Tatib' ? 4 : (p === 'Wakasek' || p === 'Kepala Sekolah') ? 5 : 0; }
  function tembusanUntuk(t) { const o = []; for (let i = 2; i < t && i <= 4; i++) o.push(NAMA_TANGGA[i]); return o; }
  function pegangPeran(ke, s) {
    if (ke === 'Wali Kelas') return punya(['Wali Kelas']) && !!S.guru.kelasWali && !!s && s.kelas === S.guru.kelasWali;
    if (ke === 'Wakasek' || ke === 'Kepala Sekolah') return punya(['Wakasek', 'Kepala Sekolah']);
    return punya([ke]);
  }
  function tugasTangga(t) { const x = S.tangga.filter((y) => y.tangga === t)[0]; return x ? x.tugas : ''; }
  const sebutDaftar = (arr) => {
    const n = arr.map((x) => SEBUT_TANGGA[tanggaPeran(x)] || x);
    return n.length > 1 ? n.slice(0, -1).join(', ') + ' dan ' + n[n.length - 1] : n.join('');
  };
  const kapital = (t) => t ? t.charAt(0).toUpperCase() + t.slice(1) : t;

  /** Lima anak tangga; `aktif` diwarnai emas, tangga tembusan diberi garis. */
  function tanggaHtml(aktif, tembusan) {
    const tb = (tembusan || []).map(tanggaPeran);
    let h = '<ol class="tangga" aria-label="Tangga pembinaan' + (aktif ? ', posisi tangga ' + aktif : '') + '">';
    for (let t = 1; t <= 5; t++) {
      const kls = t === aktif ? 'ini' : tb.indexOf(t) > -1 ? 'tembus' : t < aktif ? 'lewat' : '';
      h += '<li class="' + kls + '"><span class="anak">' + t + '</span><span class="peran">' + LABEL_TANGGA[t] + '</span></li>';
    }
    return h + '</ol>';
  }

  /** Meter poin 0–batas akhir dengan garis di setiap ambang level. */
  function meterHtml(poin, level) {
    const maks = S.eskalasi.length ? S.eskalasi[S.eskalasi.length - 1].ambang : 100;
    const pos = (v) => Math.max(0, Math.min(100, v / maks * 100)).toFixed(1) + '%';
    const berikut = S.eskalasi.filter((e) => e.ambang > poin)[0];
    let h = '<div class="meter lv' + (level || 0) + '"><div class="meter-kepala"><span><b>' + poin + '</b> poin ' + lencanaLevel(level) + '</span>' +
      '<span>' + (berikut ? 'Level ' + berikut.level + ' pada ' + berikut.ambang : 'Batas akhir') + '</span></div>' +
      '<div class="meter-batang" role="img" aria-label="' + poin + ' dari ' + maks + ' poin"><div class="meter-isi" style="width:' + pos(poin) + '"></div>';
    S.eskalasi.forEach((e) => { h += '<span class="meter-tanda" style="left:' + pos(e.ambang) + '"></span>'; });
    h += '</div><div class="meter-skala" aria-hidden="true">';
    S.eskalasi.forEach((e) => { h += '<span style="left:' + pos(e.ambang) + '">' + e.ambang + '</span>'; });
    return h + '</div></div>';
  }

  function isiTemplat(t, d) { return String(t || '').replace(/\{(\w+)\}/g, (m, k) => (k in d ? d[k] : m)); }
  function waLink(no, teks) { return 'https://wa.me/' + no + '?text=' + encodeURIComponent(teks); }
  /** Tombol WA: membuka WhatsApp dengan pesan siap kirim, lalu mencatat ke Log_WA. */
  function tombolWa(no, teks, label, data, sudah) {
    if (!no) return '<span class="wa-kosong">No. WA belum diisi</span>';
    return '<a class="tombol-wa' + (sudah ? ' sudah' : '') + '" href="' + esc(waLink(no, teks)) + '" target="_blank" rel="noopener" data-wa="' +
      esc(JSON.stringify(data)) + '">' + ikon(sudah ? 'cek' : 'wa') + esc(label) + '</a>';
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-wa]');
    if (!a) return;
    let d = {};
    try { d = JSON.parse(a.dataset.wa); } catch (er) { return; }
    a.classList.add('sudah');
    api('tatib.tandaiWA', d).then((r) => {
      document.dispatchEvent(new CustomEvent('wa-dibuka', { detail: Object.assign({}, d, r) }));
    }).catch(() => { /* tautan tetap terbuka; status menyusul */ });
  });

  /* ---------------- API ---------------- */
  async function api(aksi, data) {
    if (!CFG.API_URL) throw new Error('API_URL di config.js belum diisi.');
    const isi = Object.assign({ aksi: aksi, sesi: S.sesi }, data || {});
    let res;
    try {
      res = await fetch(CFG.API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(isi), redirect: 'follow' });
    } catch (e) {
      throw Object.assign(new Error('Tidak ada sinyal ke server. Coba lagi.'), { jaringan: true });
    }
    if (!res.ok) throw Object.assign(new Error('Server menjawab ' + res.status + '. Coba lagi.'), { jaringan: true });
    let j;
    try { j = await res.json(); } catch (e) {
      throw Object.assign(new Error('Jawaban server tidak terbaca. Coba lagi sebentar lagi.'), { jaringan: true });
    }
    if (!j.ok) {
      if (j.kode === 'TIDAK_TERDAFTAR') j.pesan = pesanBelumTerdaftar(j.pesan);
      if (j.kode === 'SESI' || j.kode === 'TIDAK_TERDAFTAR') { hapusSesi(); tampilLogin(j.pesan); }
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
    tutupScan();
    $('layar-utama').hidden = true;
    $('layar-login').hidden = false;
    $('nama-sekolah').textContent = CFG.NAMA_SEKOLAH || '';
    $('login-pesan').textContent = pesan || '';
    if (!CFG.API_URL) { $('login-pesan').textContent = 'API_URL di config.js belum diisi.'; return; }
    if (!CFG.GOOGLE_CLIENT_ID) { $('login-pesan').textContent = 'GOOGLE_CLIENT_ID di config.js belum diisi.'; return; }
    siapkanGoogle();
  }
  let googleSiap = false;
  function siapkanGoogle() {
    const pasang = () => {
      if (!googleSiap) { google.accounts.id.initialize({ client_id: CFG.GOOGLE_CLIENT_ID, callback: (r) => masukDenganToken(r.credential) }); googleSiap = true; }
      $('tombol-google').innerHTML = '';
      google.accounts.id.renderButton($('tombol-google'), { theme: 'filled_blue', size: 'large', shape: 'pill', text: 'signin_with', locale: 'id', width: 280 });
    };
    if (window.google && google.accounts && google.accounts.id) { pasang(); return; }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.onload = pasang;
    s.onerror = () => { $('login-pesan').textContent = 'Login Google tidak bisa dimuat. Periksa sinyal, lalu muat ulang halaman.'; };
    document.head.appendChild(s);
  }
  async function masukDenganToken(idToken) {
    $('login-pesan').textContent = 'Memeriksa akun…';
    try {
      const d = await api('masuk', { idToken: idToken });
      S.sesi = d.sesi; S.guru = d.guru;
      simpan.set('smkt_sesi', { sesi: d.sesi, kedaluwarsa: d.kedaluwarsa, guru: d.guru });
      $('login-pesan').textContent = '';
      bukaUtama();
    } catch (e) { $('login-pesan').textContent = e.message; }
  }
  function hapusSesi() { S.sesi = null; S.guru = null; simpan.hapus('smkt_sesi'); sesiTab.hapus('smkt_tatib_awal'); }
  async function keluar() {
    tutupMenu();
    if (!confirm('Keluar dari aplikasi? Data siswa di HP ini akan dihapus.')) return;
    try { await api('keluar'); } catch (e) { /* tetap keluar */ }
    hapusSesi();
    try { indexedDB.deleteDatabase('smkt-gerbang'); } catch (e) { /* abaikan */ }
    simpan.hapus('smkt_waktu_sinkron');
    try { Object.keys(localStorage).forEach((k) => { if (k.indexOf('smkt_log_') === 0) simpan.hapus(k); }); } catch (e) { /* abaikan */ }
    if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect();
    history.replaceState(null, '', location.pathname);
    location.reload();
  }

  /* ---------------- Kerangka: data awal, navigasi ---------------- */
  async function bukaUtama() {
    $('layar-login').hidden = true;
    $('layar-utama').hidden = false;
    const cache = sesiTab.get('smkt_tatib_awal');
    if (cache && cache.sesi === S.sesi && cache.data) {
      terapkanAwal(cache.data);
      buka(halamanDariHash());
      muatAwal(true);
    } else {
      await muatAwal(false);
    }
  }
  async function muatAwal(diam) {
    if (!diam) { $('memuat').hidden = false; $('memuat').textContent = 'Memuat data…'; }
    try {
      const d = await api('tatib.awal');
      sesiTab.set('smkt_tatib_awal', { sesi: S.sesi, data: d });
      terapkanAwal(d);
      const st = simpan.get('smkt_sesi', null);
      if (st) { st.guru = Object.assign({}, st.guru, d.guru); simpan.set('smkt_sesi', st); }
      if (!diam) buka(halamanDariHash());
    } catch (e) {
      if (diam || e.kode === 'SESI' || e.kode === 'TIDAK_TERDAFTAR') return;
      $('memuat').hidden = false;
      $('memuat').innerHTML = esc(e.message) + '<br><button type="button" class="tautan" id="coba-lagi">Coba lagi</button>';
      $('coba-lagi').addEventListener('click', () => muatAwal(false));
    }
  }
  function terapkanAwal(d) {
    S.guru = d.guru; S.akses = d.akses || {};
    S.siswa = new Map((d.siswa || []).map((s) => [s.nis, s]));
    S.master = new Map((d.master || []).map((m) => [m.id, m]));
    S.panduan = d.panduan || {}; S.eskalasi = d.eskalasi || []; S.tangga = d.tangga || [];
    S.templat = d.templatWA || {}; S.sekolah = d.sekolah || CFG.NAMA_SEKOLAH || ''; S.batasMasuk = d.batasMasuk || '';
    S.wa = d.waOtomatis || { aktif: false };
    S.menu = MENU.filter((m) => m.boleh(S.akses));
    $('menu-gerbang').hidden = !S.guru.bolehGerbang;
    $('menu-ujiwa').hidden = !(S.wa.aktif && punya(['Tim Tatib', 'Wakasek', 'Kepala Sekolah']));
    bangunNav();
    aturLencana(d.menunggu || 0);
    $('memuat').hidden = true;
  }
  function bangunNav() {
    const nav = $('nav-bawah');
    const utama = S.menu.length <= 5 ? S.menu : S.menu.slice(0, 4);
    const sisa = S.menu.length <= 5 ? [] : S.menu.slice(4);
    nav.innerHTML = utama.map((m) => '<a href="#' + m.id + '" data-tab="' + m.id + '">' + ikon(m.ikon) + '<span class="lbl">' + m.label + '</span>' +
      (m.id === 'kotak' ? '<span class="badge" data-lencana hidden></span>' : '') + '</a>').join('') +
      (sisa.length ? '<button type="button" id="nav-lainnya" data-tab="lainnya" aria-haspopup="dialog">' + ikon('lainnya') + '<span class="lbl">Lainnya</span></button>' : '');
    nav.hidden = S.menu.length < 2;
    $('lembar-daftar').innerHTML = sisa.map((m) => '<a href="#' + m.id + '">' + ikon(m.ikon) + '<span>' + m.label + '<small>' + esc(m.ket || '') + '</small></span></a>').join('');
  }
  function aturLencana(n) {
    S.menunggu = n;
    document.querySelectorAll('[data-lencana]').forEach((b) => { b.hidden = !n; b.textContent = n > 99 ? '99+' : String(n); });
    const sg = $('seg-menunggu'); sg.hidden = !n; sg.textContent = String(n);
  }
  function halamanDariHash() {
    const h = (location.hash || '').replace('#', '');
    return MENU.some((m) => m.id === h) ? h : (sesiTab.get('smkt_tatib_tab') || 'beranda');
  }
  function buka(nama) {
    const m = S.menu.filter((x) => x.id === nama)[0] || S.menu[0];
    if (!m) return;
    nama = m.id;
    S.tab = nama;
    sesiTab.set('smkt_tatib_tab', nama);
    if (location.hash !== '#' + nama) history.replaceState(null, '', '#' + nama);
    $('judul-halaman').textContent = m.judul;
    $('lembar-lainnya').hidden = true;
    const diNav = !!document.querySelector('#nav-bawah a[data-tab="' + nama + '"]');
    document.querySelectorAll('#nav-bawah [data-tab]').forEach((x) => {
      const aktif = x.dataset.tab === nama || (x.dataset.tab === 'lainnya' && !diNav);
      if (aktif) x.setAttribute('aria-current', 'page'); else x.removeAttribute('aria-current');
    });
    document.querySelectorAll('.panel').forEach((p) => { p.hidden = p.id !== 'p-' + nama; });
    ({ beranda: muatBeranda, lapor: initLapor, kotak: muatTL, siswa: initRiwayat, waspada: muatZona, pulih: muatPulih, absen: initIzin, ekskul: muatEkskul })[nama]();
    window.scrollTo(0, 0);
  }

  function bukaMenu() {
    const g = S.guru || {};
    $('menu-info').textContent = g.nama + ': ' + (g.peran || []).join(', ') + (g.kelasWali ? ', wali kelas ' + g.kelasWali : '');
    $('menu').hidden = false; $('tombol-menu').setAttribute('aria-expanded', 'true');
  }
  function tutupMenu() { $('menu').hidden = true; $('tombol-menu').setAttribute('aria-expanded', 'false'); }

  /* ---------------- Foto siswa (satu per satu, hanya di memori) ---------------- */
  function fotoHtml(s) { return '<span class="foto-siswa" data-foto="' + esc(s.nis) + '">' + esc(inisial(s.nama)) + '</span>'; }
  async function muatFoto(nis) {
    if (!S.foto.has(nis)) S.foto.set(nis, api('tatib.foto', { nis: nis }).then((d) => d.data || '').catch(() => ''));
    const data = await S.foto.get(nis);
    if (!data) return;
    document.querySelectorAll('[data-foto="' + CSS.escape(nis) + '"]').forEach((el) => {
      if (!el.querySelector('img')) { el.textContent = ''; const img = new Image(); img.alt = ''; img.src = data; el.appendChild(img); }
    });
  }

  /* =================================================================
   *  BERANDA
   * ================================================================= */
  const B = { data: null };
  function sapaan() {
    const j = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', hour12: false }).format(new Date()));
    return j < 11 ? 'Selamat pagi,' : j < 15 ? 'Selamat siang,' : j < 18 ? 'Selamat sore,' : 'Selamat malam,';
  }
  async function muatBeranda() {
    if (!S.siap.beranda) {
      S.siap.beranda = true;
      document.addEventListener('wa-dibuka', (e) => {
        const d = e.detail;
        if (!B.data || !B.data.terlambat) return;
        const info = { jam: d.jam, oleh: d.oleh, otomatis: false, status: 'Dibuka' };
        if (d.jenis === 'terlambat-ortu') B.data.terlambat.siswa.forEach((s) => { if (s.nis === d.nis) s.terkirimOrtu = info; });
        if (d.jenis === 'terlambat-wali') B.data.terlambat.kelas.forEach((k) => { if (k.kelas === d.kelas) k.terkirimWali = info; });
        if (S.tab === 'beranda') renderBeranda();
      });
    }
    $('sambut-salam').textContent = sapaan();
    $('sambut-nama').textContent = namaPendek(S.guru.nama);
    $('sambut-tanggal').textContent = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
    $('sambut-peran').innerHTML = (S.guru.peran || []).map((p) => '<li>' + esc(p === 'Wali Kelas' && S.guru.kelasWali ? 'Wali ' + S.guru.kelasWali : p) + '</li>').join('');
    if (!B.data) $('b-isi').innerHTML = '<p class="memuat">Memuat ringkasan hari ini…</p>';
    else renderBeranda();
    try {
      B.data = await api('tatib.beranda');
      aturLencana(B.data.menunggu);
      if (S.tab === 'beranda') renderBeranda();
    } catch (e) {
      if (!B.data) $('b-isi').innerHTML = '<p class="memuat">' + esc(e.message) + '</p>';
    }
  }
  function barisAksi(href, kelasLingkar, ik, judul, ket, angka) {
    return '<li><a href="' + href + '"><span class="lingkar ' + kelasLingkar + '">' + ikon(ik) + '</span>' +
      '<span class="teks"><strong>' + esc(judul) + '</strong><small>' + esc(ket) + '</small></span>' +
      '<span class="angka' + (angka ? '' : ' nol') + '">' + angka + '</span>' + ikon('kanan') + '</a></li>';
  }
  function renderBeranda() {
    const d = B.data;
    let h = '<ul class="baris-aksi">';
    if (S.akses.tindakLanjut) {
      h += barisAksi('#kotak', 'emas', 'kotak', 'Kotak Masuk', d.menunggu ? 'Kasus menunggu tindakan Anda' :
        'Tidak ada kasus yang menunggu' + (d.tembusan ? ', ' + d.tembusan + ' tembusan minggu ini' : ''), d.menunggu);
    }
    if (d.waspada) {
      h += barisAksi('#waspada', 'merah', 'waspada', 'Waspada', d.waspada.perluSurat ? d.waspada.perluSurat + ' siswa perlu surat pernyataan' : 'Siswa yang mencapai level tindakan', d.waspada.jumlah);
    }
    h += barisAksi('#lapor', '', 'lapor', 'Laporan saya, 7 hari', d.laporanSaya ? d.sendiriSaya + ' selesai Anda tangani sendiri' : 'Belum ada laporan minggu ini', d.laporanSaya);
    h += '</ul>';

    if (d.terlambat) {
      const t = d.terlambat, wa = t.wa || S.wa || {};
      h += '<h2 class="judul-bagian">Terlambat hari ini<small>batas masuk ' + esc(t.batas || S.batasMasuk) + '</small></h2>';
      if (wa.aktif) {
        h += '<p class="info-wa">' + ikon('wa') + '<span>Orang tua dikabari otomatis lewat WA begitu anaknya di-scan terlambat. Rekap ke wali kelas dan pimpinan dikirim pukul ' + esc(wa.jamRekap) + '.</span></p>';
        if (wa.galat) h += '<p class="info-wa galat">' + ikon('awas') + '<span>WA otomatis tertunda sejak ' + esc(wa.galatJam) + ': ' + esc(wa.galat) +
          '. Pesan dicoba lagi tiap 15 menit. Bila berlanjut, periksa perangkat di Fonnte atau pakai tombol WA.</span></p>';
      }
      if (!t.siswa.length) h += '<p class="keterangan">Belum ada siswa terlambat hari ini.</p>';
      t.kelas.forEach((k) => {
        const anggota = t.siswa.filter((s) => s.kelas === k.kelas);
        const daftar = anggota.map((s, i) => (i + 1) + '. ' + s.nama + ' (' + s.jam + ')').join('\n');
        const teksWali = isiTemplat(S.templat.WA_TERLAMBAT_WALI, { wali: k.wali ? namaPendek(k.wali) : 'Bapak/Ibu wali kelas', kelas: k.kelas, tanggal: d.tanggal, daftar: daftar, sekolah: S.sekolah });
        const saya = punya(['Wali Kelas']) && S.guru.kelasWali === k.kelas;
        const w = k.terkirimWali, wOto = w && w.otomatis && w.status === 'Terkirim';
        let statusWali = '';
        if (!saya && w && w.otomatis) statusWali = w.status === 'Terkirim' ? 'Rekap otomatis ke wali terkirim ' + w.jam : 'Rekap ke wali dalam antrean kirim otomatis';
        else if (!saya && w) statusWali = 'WA ke wali dibuka ' + w.jam + ' oleh ' + namaPendek(w.oleh);
        else if (!saya && k.gagalWali) statusWali = 'Rekap otomatis gagal: ' + k.gagalWali.status.replace(/^Gagal:\s*/, '');
        else if (!saya && wa.aktif && k.waWali) statusWali = 'Rekap otomatis ke wali pukul ' + wa.jamRekap;
        h += '<div class="kelas-terlambat"><div class="kt-kepala"><div><strong>' + esc(k.kelas) + '</strong><span>' + anggota.length + ' siswa' +
          (k.wali ? ', wali ' + esc(namaPendek(k.wali)) : '') + '</span></div>' +
          (saya ? '' : wOto ? '<span class="wa-terkirim">' + ikon('cek') + 'Wali dikabari</span>' :
            tombolWa(k.waWali, teksWali, w ? 'Wali dikabari' : 'WA wali', { jenis: 'terlambat-wali', kelas: k.kelas }, !!w && !w.otomatis)) + '</div>' +
          (statusWali ? '<p class="status-wa' + (k.gagalWali && !w ? ' gagal' : '') + '">' + esc(statusWali) + '</p>' : '') +
          '<ul class="kt-siswa">' + anggota.map((s) => {
            const teks = isiTemplat(S.templat.WA_TERLAMBAT_ORTU, { nama: s.nama, kelas: s.kelas, tanggal: d.tanggal, jam: s.jam, batas: t.batas || S.batasMasuk, sekolah: S.sekolah });
            const o = s.terkirimOrtu, oOto = o && o.otomatis && o.status === 'Terkirim';
            let statusOrtu = '', gagal = false;
            if (o && o.otomatis) statusOrtu = o.status === 'Terkirim' ? 'Terkirim otomatis ' + o.jam : 'Dalam antrean kirim otomatis';
            else if (o) statusOrtu = 'WA dibuka ' + o.jam + ' oleh ' + namaPendek(o.oleh);
            else if (s.gagalOrtu) { statusOrtu = 'Kirim otomatis gagal: ' + s.gagalOrtu.status.replace(/^Gagal:\s*/, ''); gagal = true; }
            else if (wa.aktif && s.waOrtu) statusOrtu = 'Terkirim otomatis dalam ±1 menit';
            return '<li><div><span class="nm">' + esc(s.nama) + '</span><br><span class="mt">tiba ' + esc(s.jam) +
              (s.kali30 >= 3 ? ', <span class="ulang">' + s.kali30 + '× dalam 30 hari</span>' : s.kali30 > 1 ? ', ' + s.kali30 + '× dalam 30 hari' : '') + '</span></div>' +
              (oOto ? '<span class="wa-terkirim">' + ikon('cek') + 'Ortu dikabari</span>' :
                tombolWa(s.waOrtu, teks, o && !o.otomatis ? 'Ortu dikabari' : 'WA ortu', { jenis: 'terlambat-ortu', nis: s.nis }, !!o && !o.otomatis)) +
              (statusOrtu ? '<span class="status-wa' + (gagal ? ' gagal' : '') + '">' + esc(statusOrtu) + '</span>' : '') + '</li>';
          }).join('') + '</ul></div>';
      });
    }

    h += '<h2 class="judul-bagian">Tangga pembinaan</h2><div class="kartu-tangga">' + tanggaHtml(0).replace('class="tangga"', 'class="tangga ringkas"') +
      '<p>Pelanggaran ringan cukup ditangani guru yang menemukan. Laporan naik ke tangga berikutnya bila berulang, siswa membangkang, kategorinya berat, atau poinnya naik level.</p>' +
      '<details><summary>Siapa melakukan apa</summary><dl>' + S.tangga.map((x) => '<div><dt>' + x.tangga + '. ' + esc(x.peran) + '</dt><dd>' + esc(x.tugas) +
        (x.kapan ? ' Masuk bila ' + esc(x.kapan.charAt(0).toLowerCase() + x.kapan.slice(1)) + '.' : '') + '</dd></div>').join('') + '</dl></details></div>';
    $('b-isi').innerHTML = h;
  }

  /* =================================================================
   *  PEMILIH SISWA + PEMINDAI
   * ================================================================= */
  function cariSiswa(daftar, q) {
    const kata = q.toLowerCase().split(/\s+/).filter(Boolean);
    const hasil = daftar.filter((s) => {
      const tumpuk = (s.nama + ' ' + s.kelas + ' ' + rapat(s.kelas) + ' ' + s.nis).toLowerCase();
      return kata.every((k) => tumpuk.indexOf(k) > -1);
    });
    const awal = q.toLowerCase();
    hasil.sort((a, b) => (b.nis === q) - (a.nis === q) || (b.nama.toLowerCase().indexOf(awal) === 0) - (a.nama.toLowerCase().indexOf(awal) === 0) || a.nama.localeCompare(b.nama));
    return hasil;
  }
  function pemilihSiswa(wadah, opsi) {
    const id = opsi.id;
    wadah.innerHTML = '<label class="label" for="' + id + '-q">' + esc(opsi.label || 'Cari siswa') + '</label>' +
      '<div class="cari-baris"><input id="' + id + '-q" class="isian" type="search" autocomplete="off" enterkeyhint="search" placeholder="Nama, NIS, atau kelas">' +
      '<button type="button" class="tombol-scan" aria-label="Scan kartu pelajar">' + ikon('qr') + '<span>Scan</span></button></div>' +
      (opsi.catatan ? '<p class="keterangan">' + esc(opsi.catatan) + '</p>' : '') + '<ul class="hasil-cari" id="' + id + '-hasil"></ul>';
    const q = wadah.querySelector('input'), ul = wadah.querySelector('ul');
    const boleh = () => Array.from(S.siswa.values()).filter(opsi.saring || (() => true));
    const pilih = (s) => { q.value = ''; render(); opsi.pilih(s); };
    function render() {
      const teks = q.value.trim(), daftar = boleh();
      const hasil = !teks ? (opsi.tampilSemua && daftar.length <= 40 ? daftar.sort((a, b) => a.nama.localeCompare(b.nama)) : []) : cariSiswa(daftar, teks).slice(0, 8);
      if (teks && !hasil.length) { ul.innerHTML = '<li class="kosong">Tidak ada siswa yang cocok.</li>'; return; }
      ul.innerHTML = hasil.map((s) => '<li><button type="button" data-nis="' + esc(s.nis) + '"><span class="mini">' + esc(inisial(s.nama)) + '</span>' +
        '<span><span class="nm">' + esc(s.nama) + '</span><span class="kl">' + esc(s.kelas) + ', NIS ' + esc(s.nis) + '</span></span></button></li>').join('');
    }
    q.addEventListener('input', render);
    q.addEventListener('keydown', (e) => { if (e.key !== 'Enter') return; e.preventDefault(); const b = ul.querySelector('button'); if (b) b.click(); });
    ul.addEventListener('click', (e) => { const b = e.target.closest('button[data-nis]'); if (b) pilih(S.siswa.get(b.dataset.nis)); });
    wadah.querySelector('.tombol-scan').addEventListener('click', () => bukaScan((nis) => {
      const s = S.siswa.get(nis);
      if (!s) { toast('Kartu dengan NIS ' + nis + ' tidak ada di daftar siswa aktif.', 'galat'); return; }
      if (opsi.saring && !opsi.saring(s)) { toast(s.nama + ' (' + s.kelas + ') di luar daftar yang bisa Anda pilih di sini.', 'galat'); return; }
      pilih(s);
    }));
    render();
    return { render: render, fokus: () => q.focus() };
  }
  function kartuSiswaHtml(s, aksiGanti, tambahan) {
    return '<div class="kartu-siswa">' + fotoHtml(s) + '<div><span class="nm">' + esc(s.nama) + '</span><span class="kl">' + esc(s.kelas) + ', NIS ' + esc(s.nis) + '</span>' +
      (tambahan || '') + '</div>' + (aksiGanti ? '<button type="button" class="tautan" data-aksi="' + aksiGanti + '">Ganti</button>' : '') + '</div>';
  }
  function pilihanTerpilih(wadah, s, aksi) {
    let k = wadah.querySelector('.kartu-terpilih');
    if (!k) { k = document.createElement('div'); k.className = 'kartu-terpilih'; wadah.appendChild(k); }
    k.innerHTML = s ? kartuSiswaHtml(s, aksi) : '';
    ['.cari-baris', 'label', '.hasil-cari'].forEach((sel) => { const el = wadah.querySelector(sel); if (el) el.hidden = !!s; });
    if (s) muatFoto(s.nis);
  }

  /**
   * Pemindai kartu. Biasanya menutup setelah satu kartu. Dengan opsi.terus, kamera tetap
   * menyala untuk kartu berikutnya; cb mengembalikan {pesan, galat} untuk ditampilkan.
   */
  async function bukaScan(cb, opsi) {
    opsi = opsi || {};
    if (!window.Html5Qrcode) { toast('Pemindai QR gagal dimuat. Ketik nama siswa.', 'galat'); return; }
    S.scanCb = cb; S.scanTerus = !!opsi.terus; S.scanTerakhir = { teks: '', waktu: 0 };
    const ket = $('scan-ket');
    $('modal-scan').hidden = false; ket.className = 'popup-ket'; ket.textContent = 'Menyalakan kamera…';
    $('scan-tutup').textContent = S.scanTerus ? 'Selesai' : 'Tutup';
    if (!S.kamera) S.kamera = new Html5Qrcode('scan-reader', { formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE], verbose: false });
    try {
      await S.kamera.start({ facingMode: 'environment' },
        { fps: 12, aspectRatio: 1, qrbox: (w, h) => { const s = Math.max(160, Math.floor(Math.min(w, h) * 0.7)); return { width: s, height: s }; } },
        (teks) => {
          const f = S.scanCb; if (!f) return;
          teks = String(teks || '').trim();
          if (!S.scanTerus) { tutupScan(); f(teks); return; }
          const kini = Date.now();
          if (teks === S.scanTerakhir.teks && kini - S.scanTerakhir.waktu < 3000) return;   // kartu yang sama masih di depan kamera
          S.scanTerakhir = { teks: teks, waktu: kini };
          const r = f(teks) || {};
          ket.className = 'popup-ket ' + (r.galat ? 'galat' : 'ok');
          ket.textContent = r.pesan || '';
          try { if (navigator.vibrate) navigator.vibrate(r.galat ? [60, 60, 60] : 70); } catch (e) { /* tidak didukung */ }
        }, () => {});
      if ($('modal-scan').hidden) { tutupScan(); return; }
      ket.textContent = opsi.ket || 'Arahkan kamera ke QR kartu pelajar.';
    } catch (e) {
      ket.textContent = 'Kamera belum bisa dibuka. Izinkan akses kamera di browser, atau tutup lalu ketik nama siswa.';
    }
  }
  async function tutupScan() {
    S.scanCb = null; S.scanTerus = false; $('modal-scan').hidden = true;
    try { const st = S.kamera ? S.kamera.getState() : 1; if (st === 2 || st === 3) await S.kamera.stop(); } catch (e) { /* sudah berhenti */ }
  }

  /* =================================================================
   *  LAPOR
   * ================================================================= */
  const C = { siswa: null, ringkas: null, plg: null, kategori: '', idCatat: null, penanganan: 'sendiri', ke: '', menyimpan: false, pemilih: null, hasil: null };

  function langkahLapor(n) { [1, 2, 3].forEach((i) => { $('ll-' + i).className = i < n ? 'selesai' : i === n ? 'aktif' : ''; }); }
  function initLapor() {
    if (S.siap.lapor) return;
    S.siap.lapor = true;
    C.pemilih = pemilihSiswa($('c-siswa-pilih'), { id: 'cs', label: 'Siswa yang melanggar', pilih: pilihSiswaLapor });
    $('c-cari-plg').addEventListener('input', renderDaftarPlg);
    $('c-kategori').addEventListener('click', (e) => { const b = e.target.closest('button[data-kat]'); if (!b) return; C.kategori = b.dataset.kat; renderDaftarPlg(); });
    $('c-daftar-plg').addEventListener('click', (e) => { const b = e.target.closest('button[data-id]'); if (b) pilihPlg(S.master.get(b.dataset.id)); });
    $('c-melawan').addEventListener('change', renderPenanganan);
    $('c-penanganan').addEventListener('change', (e) => {
      if (e.target.name === 'c-tangani') C.penanganan = e.target.value;
      if (e.target.id === 'c-ke') C.ke = e.target.value;
      renderPenanganan();
    });
    $('c-tindakan').addEventListener('input', aturTombolSimpan);
    $('c-simpan').addEventListener('click', simpanLapor);
    $('p-lapor').addEventListener('click', (e) => {
      const a = e.target.closest('[data-aksi]');
      if (!a) return;
      if (a.dataset.aksi === 'ganti-siswa' || a.dataset.aksi === 'siswa-lain') resetLapor(true);
      if (a.dataset.aksi === 'ganti-plg') bukaDaftarPlg();
      if (a.dataset.aksi === 'lagi-siswa-ini') { const s = C.siswa; resetLapor(false); pilihSiswaLapor(s); }
    });
    resetLapor(false);
  }
  function resetLapor(fokus) {
    Object.assign(C, { siswa: null, ringkas: null, plg: null, kategori: '', idCatat: null, penanganan: 'sendiri', ke: '', hasil: null });
    $('c-siswa-pilih').hidden = false; $('c-siswa-kartu').hidden = true;
    $('c-plg').hidden = true; $('c-tindak').hidden = true; $('c-hasil').hidden = true;
    $('c-melawan').checked = false; $('c-ket').value = ''; $('c-tindakan').value = ''; $('c-cari-plg').value = '';
    langkahLapor(1);
    if (C.pemilih) C.pemilih.render();
    if (fokus && C.pemilih) C.pemilih.fokus();
  }
  async function pilihSiswaLapor(s) {
    if (!s) return;
    Object.assign(C, { siswa: s, ringkas: null, plg: null, idCatat: uuid(), penanganan: 'sendiri', ke: '' });
    $('c-melawan').checked = false; $('c-ket').value = ''; $('c-tindakan').value = '';
    $('c-siswa-pilih').hidden = true; $('c-hasil').hidden = true; $('c-tindak').hidden = true;
    renderKartuLapor('Memuat poin siswa…');
    bukaDaftarPlg();
    try {
      const d = await api('tatib.ringkas', { nis: s.nis });
      if (C.siswa !== s) return;
      C.ringkas = d; renderKartuLapor(); renderDaftarPlg(); if (C.plg) renderPenanganan();
    } catch (e) {
      if (C.siswa === s) renderKartuLapor('Poin siswa belum bisa dimuat (' + e.message + '). Laporan tetap bisa disimpan.');
    }
  }
  function renderKartuLapor(pesan) {
    const s = C.siswa, r = C.ringkas;
    const tambah = r && r.siswa.wali ? '<span class="wl">Wali kelas: ' + esc(namaPendek(r.siswa.wali)) + '</span>' : '';
    let h = kartuSiswaHtml(s, 'ganti-siswa', tambah);
    if (r) {
      h += meterHtml(r.poin, r.level);
      if (r.terakhir && r.terakhir.length) h += '<ul class="terakhir">' + r.terakhir.map((t) => '<li>' + esc(t.tanggal) + ': ' + esc(t.nama) + ' (+' + t.poin + ')</li>').join('') + '</ul>';
    } else if (pesan) h += '<p class="keterangan">' + esc(pesan) + '</p>';
    $('c-siswa-kartu').innerHTML = h; $('c-siswa-kartu').hidden = false;
    muatFoto(s.nis);
  }
  function bukaDaftarPlg() {
    C.plg = null;
    $('c-plg').hidden = false; $('c-plg-cari').hidden = false; $('c-plg-terpilih').hidden = true; $('c-tindak').hidden = true;
    langkahLapor(2); renderKategori(); renderDaftarPlg();
  }
  function urutKategori(a, b) { const ia = URUT_KATEGORI.indexOf(a), ib = URUT_KATEGORI.indexOf(b); return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b); }
  function renderKategori() {
    const kat = Array.from(new Set(Array.from(S.master.values()).map((m) => m.kategori).filter(Boolean))).sort(urutKategori);
    $('c-kategori').innerHTML = ['', ...kat].map((k) => '<button type="button" data-kat="' + esc(k) + '" aria-pressed="' + (C.kategori === k) + '">' + esc(k || 'Semua') + '</button>').join('');
  }
  function renderDaftarPlg() {
    if (!C.siswa) return;
    document.querySelectorAll('#c-kategori button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.kat === C.kategori)));
    const kata = $('c-cari-plg').value.toLowerCase().split(/\s+/).filter(Boolean);
    const hitung = (C.ringkas && C.ringkas.hitung30) || {};
    const daftar = Array.from(S.master.values()).filter((m) => {
      if (C.kategori && m.kategori !== C.kategori) return false;
      const t = (m.nama + ' ' + m.id + ' ' + m.kategori).toLowerCase();
      return kata.every((k) => t.indexOf(k) > -1);
    }).sort((a, b) => urutKategori(a.kategori, b.kategori) || a.id.localeCompare(b.id, 'id', { numeric: true }));
    if (!daftar.length) { $('c-daftar-plg').innerHTML = '<li class="kosong">Tidak ada jenis pelanggaran yang cocok.</li>'; return; }
    $('c-daftar-plg').innerHTML = daftar.map((m) => {
      const n = hitung[m.id] || 0;
      return '<li class="' + kelasKat(m.kategori) + '"><button type="button" data-id="' + esc(m.id) + '"><span class="pita"></span><span class="nm">' + esc(m.nama) + '</span>' +
        '<span class="pn">+' + m.bobot + '</span><span class="kt">' + esc(m.kategori) + ', ' + esc(m.id) +
        (n ? ', <span class="ulang">sudah ' + n + '× dalam 30 hari</span>' : '') + '</span></button></li>';
    }).join('');
  }
  function panduanUntuk(m) {
    return S.panduan[m.kategori] || { ditangani: 'Guru yang menemukan', langkah: 'Tegur siswa, jalankan sanksi di daftar tata tertib, lalu catat.', teruskanKe: 'Wali Kelas', wajib: false, syarat: '' };
  }
  function pilihPlg(m) {
    if (!m) return;
    C.plg = m; C.penanganan = 'sendiri'; C.ke = '';
    $('c-plg-cari').hidden = true;
    $('c-plg-terpilih').innerHTML = '<div class="plg-pilih"><span><span class="nm">' + esc(m.nama) + '</span><br>' +
      '<span class="kt"><span class="kat ' + kelasKat(m.kategori) + '">' + esc(m.kategori) + '</span> ' + esc(m.id) + ', ' + m.bobot + ' poin</span></span>' +
      '<button type="button" class="tautan" data-aksi="ganti-plg">Ganti</button></div>';
    $('c-plg-terpilih').hidden = false; $('c-tindak').hidden = false;
    langkahLapor(3); renderPenanganan();
    $('c-tindak').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** Meniru aturan server: tangga, alasan, penerima, dan apakah tanggung jawab sendiri. */
  function keputusanLapor() {
    const m = C.plg, p = panduanUntuk(m), r = C.ringkas;
    const melawan = $('c-melawan').checked;
    const ulang = ((r && r.hitung30 && r.hitung30[m.id]) || 0) + 1;
    const alasan = [];
    let tangga = 1, dipilih = false;
    const naik = (t, why) => { if (t > tangga) tangga = t; alasan.push(why); };
    if (p.wajib) naik(tanggaPeran(p.teruskanKe) || 2, 'kategori ' + m.kategori + ' wajib ke ' + (p.teruskanKe || 'Wali Kelas'));
    if (melawan) naik(2, 'siswa membangkang');
    if (ulang >= BATAS_ULANG) naik(2, 'pelanggaran yang sama ke-' + ulang + ' dalam 30 hari');
    const paksa = alasan.length > 0;
    if (!paksa && C.penanganan === 'teruskan') { dipilih = true; naik(tanggaPeran(C.ke) || tanggaPeran(p.teruskanKe) || 2, 'dipilih Anda'); }
    else if (paksa && !p.wajib && tanggaPeran(C.ke) > tangga) tangga = tanggaPeran(C.ke);
    if (r && r.dibina30 && tangga >= 2 && tangga <= 4 && r.dibina30.tangga >= tangga) {
      const baru = Math.min(r.dibina30.tangga + 1, 4);
      if (baru > tangga) { tangga = baru; alasan.push('mengulang setelah dibina ' + SEBUT_TANGGA[r.dibina30.tangga] + ' pada ' + r.dibina30.tanggal); }
    }
    const poin = m.bobot * (melawan ? 2 : 1);
    let lvNanti = 0;
    if (r) {
      lvNanti = levelDari(r.poin + poin);
      if (lvNanti > r.level) {
        const e = infoLevel(lvNanti);
        const tL = tanggaPeran(e && e.ke ? e.ke : KE_LEVEL_BAWAAN[lvNanti]);
        if (tL >= 2 && tL >= tangga) naik(tL, 'poin mencapai ' + (r.poin + poin) + ' (Level ' + lvNanti + ')');
      }
    }
    const ke = tangga >= 2 ? NAMA_TANGGA[tangga] : '';
    const sendiri = !!ke && pegangPeran(ke, C.siswa);
    return { p: p, melawan: melawan, ulang: ulang, alasan: alasan, paksa: paksa || (alasan.length > 0 && !dipilih),
      tangga: tangga, ke: ke, sendiri: sendiri, terus: !!ke && !sendiri, tembusan: tembusanUntuk(tangga), poin: poin, lvNanti: lvNanti };
  }
  function pilihanPenerima(minT, terpilih) {
    return '<select id="c-ke" class="isian" aria-label="Teruskan ke">' + PENERIMA.filter((x) => tanggaPeran(x) >= minT && x !== 'Kepala Sekolah').map((x) =>
      '<option' + (x === terpilih ? ' selected' : '') + '>' + esc(x) + '</option>').join('') + '</select>';
  }
  function renderPenanganan() {
    if (!C.plg) return;
    const k = keputusanLapor(), m = C.plg, p = k.p;
    let judul, sub;
    if (k.tangga <= 1) { judul = 'Anda tangani sendiri'; sub = 'Pelanggaran ini cukup diselesaikan oleh guru yang menemukan.'; }
    else if (k.sendiri) { judul = 'Tanggung jawab Anda sebagai ' + SEBUT_TANGGA[k.tangga]; sub = tugasTangga(k.tangga); }
    else {
      const tg = tugasTangga(k.tangga);
      judul = 'Diteruskan ke ' + k.ke;
      sub = 'Jalankan langkah di bawah, lalu ' + SEBUT_TANGGA[k.tangga] + ' yang menindaklanjuti' + (tg ? ': ' + tg.charAt(0).toLowerCase() + tg.slice(1) : '.');
    }
    let h = tanggaHtml(k.tangga, k.terus ? k.tembusan : []) + '<p class="panduan-judul">' + esc(judul) + '</p><p class="panduan-sub">' + esc(sub) + '</p><dl>';
    if (p.langkah) h += '<div><dt>Langkah Anda sekarang</dt><dd>' + esc(p.langkah) + '</dd></div>';
    if (m.sanksi) h += '<div><dt>Sanksi di daftar tata tertib</dt><dd>' + esc(m.sanksi) + '</dd></div>';
    if (k.tembusan.length && k.terus) h += '<div><dt>Tembusan</dt><dd>' + esc(kapital(sebutDaftar(k.tembusan))) + ' ikut diberi tahu lewat Kotak Masuk.</dd></div>';
    h += '</dl>';
    if (k.alasan.length && !(k.alasan.length === 1 && k.alasan[0] === 'dipilih Anda')) h += '<p class="alasan">Naik ke tangga ' + k.tangga + ' karena ' + esc(k.alasan.join('; ')) + '.</p>';
    $('c-panduan').className = 'panduan ' + (k.terus ? 'terus' : 'sendiri');
    $('c-panduan').innerHTML = h;

    let o = '';
    if (!k.paksa) {
      o = '<p class="judul-kecil">Penanganan</p><div class="opsi" role="radiogroup" aria-label="Penanganan">' +
        '<label><input type="radio" name="c-tangani" value="sendiri"' + (C.penanganan === 'sendiri' ? ' checked' : '') + '>' +
        '<span><strong>Saya tangani sendiri</strong><small>Laporan langsung selesai dan tidak masuk Kotak Masuk siapa pun.</small></span></label>' +
        '<label><input type="radio" name="c-tangani" value="teruskan"' + (C.penanganan === 'teruskan' ? ' checked' : '') + '>' +
        '<span><strong>Perlu bantuan</strong><small>Teruskan bila Anda tidak bisa menanganinya sendiri.</small>' +
        (C.penanganan === 'teruskan' ? pilihanPenerima(2, C.ke || p.teruskanKe) : '') + '</span></label></div>';
    } else if (!p.wajib && k.terus) {
      o = '<p class="judul-kecil">Penerima</p>' + pilihanPenerima(k.tangga, k.ke);
    }
    $('c-penanganan').innerHTML = o;
    $('c-penanganan').className = 'penanganan';
    const wajibTulis = !k.terus;
    $('c-tindakan').placeholder = wajibTulis ? 'Contoh: ditegur, seragam dirapikan saat itu juga' : 'Contoh: siswa diamankan dan dibawa ke ruang BK';
    document.querySelector('label[for="c-tindakan"]').innerHTML = wajibTulis ? 'Tindakan yang sudah Anda lakukan' : 'Tindakan awal yang sudah Anda lakukan <span class="redup">(opsional)</span>';

    let pr = 'Poin <strong>+' + k.poin + '</strong>' + (k.melawan ? ' (×2 karena membangkang)' : '') + '.';
    if (C.ringkas) {
      pr += ' Total ' + C.ringkas.poin + ' menjadi <strong>' + (C.ringkas.poin + k.poin) + '</strong> ' + lencanaLevel(k.lvNanti) + '.';
      if (k.lvNanti > C.ringkas.level) { const info = infoLevel(k.lvNanti); pr += '<span class="naik">Siswa naik ke Level ' + k.lvNanti + '. ' + esc(info ? info.tindakan : '') + '</span>'; }
    }
    $('c-pratinjau').innerHTML = pr;
    aturTombolSimpan();
  }
  function aturTombolSimpan() {
    if (!C.plg) return;
    const k = keputusanLapor(), b = $('c-simpan');
    b.textContent = C.menyimpan ? 'Menyimpan…' : k.terus ? 'Simpan dan teruskan ke ' + k.ke : 'Simpan, selesai ditangani';
    b.disabled = C.menyimpan || (!k.terus && !$('c-tindakan').value.trim());
  }
  async function simpanLapor() {
    if (C.menyimpan || !C.siswa || !C.plg) return;
    const k = keputusanLapor(), tindakan = $('c-tindakan').value.trim();
    if (!k.terus && !tindakan) { $('c-tindakan').focus(); return; }
    C.menyimpan = true; aturTombolSimpan();
    try {
      const d = await api('tatib.catat', { nis: C.siswa.nis, idPlg: C.plg.id, melawan: k.melawan, keterangan: $('c-ket').value.trim(), tindakan: tindakan,
        penanganan: C.penanganan, teruskanKe: C.ke || k.ke, idCatat: C.idCatat });
      C.menyimpan = false;
      tampilHasilLapor(d);
    } catch (e) {
      C.menyimpan = false; aturTombolSimpan();
      toast(e.jaringan ? 'Belum tersimpan: ' + e.message + ' Tekan Simpan lagi; laporan tidak akan tercatat dua kali.' : e.message, 'galat', 6000);
    }
  }
  function tampilHasilLapor(d) {
    C.hasil = d;
    $('c-plg').hidden = true; $('c-tindak').hidden = true;
    [1, 2, 3].forEach((i) => { $('ll-' + i).className = 'selesai'; });
    const plg = d.pelanggaran || C.plg;
    let h = tanggaHtml(d.tangga || 1, d.diteruskan ? d.tembusan : []) +
      '<h2 style="margin-top:12px">' + (d.sudahTercatat ? 'Sudah tercatat sebelumnya' : d.diteruskan ? 'Tersimpan, diteruskan ke ' + esc(d.diteruskan.ke) : 'Tersimpan, selesai ditangani') + '</h2>' +
      '<p>' + esc(d.siswa.nama) + ' (' + esc(d.siswa.kelas) + '): ' + esc(plg.nama) + ', <strong>+' + d.poin + ' poin</strong>' + (d.melawan ? ' (×2 membangkang)' : '') + '.</p>' +
      '<p>Total poin sekarang <strong>' + d.total + '</strong> ' + lencanaLevel(d.level) + '</p>';
    const alasan = (d.alasan || []).filter((x) => x !== 'dipilih guru pelapor');
    if (d.diteruskan) {
      h += '<p>' + (alasan.length ? 'Alasan: ' + esc(alasan.join('; ')) + '. ' : '') + 'Kasus masuk Kotak Masuk ' + esc(SEBUT_TANGGA[d.tangga]) +
        (d.tembusan && d.tembusan.length ? ', dengan tembusan ke ' + esc(sebutDaftar(d.tembusan)) : '') + '. Anda tidak perlu melapor lagi.</p>';
      const kontak = d.kontak || [];
      if (d.waOtomatis) {
        const ada = kontak.filter((x) => x.wa).map((x) => namaPendek(x.nama)), tanpa = kontak.filter((x) => !x.wa).map((x) => namaPendek(x.nama));
        const sebut = (a) => a.length > 1 ? a.slice(0, -1).join(', ') + ' dan ' + a[a.length - 1] : a.join('');
        h += '<p class="info-wa">' + ikon('wa') + '<span>' + esc(sebut(ada)) + ' dikabari otomatis lewat WhatsApp.' +
          (tanpa.length ? ' ' + esc(sebut(tanpa)) + ' belum punya nomor WA di tab Guru.' : '') + '</span></p>';
      } else if (kontak.length) {
        const tautan = location.origin + location.pathname + '#kotak';
        h += '<p class="redup">Kabari penerima lewat WhatsApp bila perlu:</p><div class="kontak">' + kontak.map((x) => tombolWa(x.wa,
          isiTemplat(S.templat.WA_KASUS_PENERIMA, { penerima: namaPendek(x.nama), nama: d.siswa.nama, kelas: d.siswa.kelas, pelanggaran: plg.nama, alasan: alasan.join('; ') || 'perlu bantuan', tautan: tautan }),
          'WA ' + namaPendek(x.nama), { jenis: 'kasus-penerima', ref: d.idLog, nis: d.siswa.nis })).join('') + '</div>';
      }
    } else if (d.tanggungJawabSaya) {
      h += '<p>Ini tanggung jawab Anda sebagai ' + esc(SEBUT_TANGGA[d.tangga]) + '. ' + esc(d.rekomendasi || '') + '</p>';
      if (d.waOrtu === '') h += '<p class="redup">No. WA orang tua belum diisi di tab Siswa, jadi orang tua belum bisa dikabari lewat aplikasi.</p>';
      else if (d.waOrtu) h += '<div class="kontak">' + tombolWa(d.waOrtu, isiTemplat(S.templat.WA_KASUS_ORTU, { nama: d.siswa.nama, kelas: d.siswa.kelas,
        tanggal: new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta' }).format(new Date()), pelanggaran: plg.nama, pengirim: namaPendek(S.guru.nama), sekolah: S.sekolah }),
        'WA orang tua', { jenis: 'kasus-ortu', ref: d.idLog, nis: d.siswa.nis }) + '</div>';
    } else {
      h += '<p>Selesai di tangan Anda. Tidak perlu dilaporkan ke tim tata tertib.</p>';
    }
    if (d.naikLevel && d.langkahLevel) h += '<p class="naik">Naik ke Level ' + d.level + ': ' + esc(d.langkahLevel.tindakan) + '</p>';
    h += '<div class="aksi"><button type="button" class="tombol tombol-utama" data-aksi="siswa-lain">Lapor siswa lain</button>' +
      '<button type="button" class="tombol tombol-garis" data-aksi="lagi-siswa-ini">Pelanggaran lain untuk ' + esc(d.siswa.nama.split(' ')[0]) + '</button></div>';
    const el = $('c-hasil'); el.className = 'blok hasil'; el.innerHTML = h; el.hidden = false;
    if (C.ringkas) { C.ringkas.poin = d.total; C.ringkas.level = d.level; renderKartuLapor(); }
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    toast(d.diteruskan ? 'Tersimpan, diteruskan ke ' + d.diteruskan.ke : 'Laporan tersimpan', 'hadir');
  }

  /* =================================================================
   *  KOTAK MASUK
   * ================================================================= */
  const T = { status: 'Menunggu', item: [] };
  function initTL() {
    if (S.siap.kotak) return;
    S.siap.kotak = true;
    document.querySelectorAll('#p-kotak .segmen button').forEach((b) => b.addEventListener('click', () => {
      T.status = b.dataset.status;
      document.querySelectorAll('#p-kotak .segmen button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      muatTL();
    }));
    $('tl-daftar').addEventListener('click', klikTL);
    $('tl-daftar').addEventListener('change', (e) => {
      if (e.target.name && e.target.name.indexOf('tl-akhir-') === 0) e.target.closest('.form-tl').querySelector('select').hidden = e.target.value !== 'teruskan';
    });
  }
  async function muatTL() {
    initTL();
    const status = T.status;
    $('tl-ket').textContent = 'Memuat…';
    try {
      const d = await api('tatib.tindakLanjut', { status: status });
      if (status !== T.status) return;
      T.item = d.item || []; renderTL();
    } catch (e) { $('tl-ket').textContent = e.message; }
  }
  function renderTL() {
    const n = T.item.length;
    if (T.status === 'Menunggu') {
      aturLencana(n);
      $('tl-ket').textContent = n ? n + ' kasus menunggu tindakan Anda. Rekomendasinya ada di setiap kartu.' : 'Tidak ada kasus yang menunggu. Kasus baru muncul di sini saat siswa naik ke tangga Anda.';
    } else if (T.status === 'Tembusan') {
      $('tl-ket').textContent = n ? 'Kasus 30 hari terakhir yang ditangani tangga di atas Anda. Cukup diketahui, tidak perlu tindakan.' : 'Belum ada tembusan dalam 30 hari terakhir.';
    } else {
      $('tl-ket').textContent = n ? 'Kasus yang sudah ditindaklanjuti dalam 60 hari terakhir.' : 'Belum ada kasus selesai dalam 60 hari terakhir.';
    }
    $('tl-daftar').innerHTML = T.item.map(kartuTL).join('');
  }
  function kartuTL(it) {
    const lain = PENERIMA.filter((x) => x !== it.ke && x !== 'Kepala Sekolah');
    const tunggu = it.status === 'Menunggu' && T.status === 'Menunggu';
    let h = '<li class="kasus ' + kelasKat(it.kategori) + '" data-id="' + esc(it.idLog) + '">' +
      '<div class="kasus-kepala">' + fotoHtml({ nis: it.nis, nama: it.nama }) + '<span><span class="nm">' + esc(it.nama) + '</span><span class="kl">' + esc(it.kelas) + '</span></span>' +
      '<span class="wkt">' + esc(it.tanggal) + (it.waktu ? '<br>' + esc(it.waktu) : '') + '</span></div>' +
      '<p class="plg">' + esc(it.pelanggaran) + ' <span class="kat ' + kelasKat(it.kategori) + '">' + esc(it.kategori || '-') + '</span> <span class="tag">+' + it.poin + '</span>' +
      (it.melawan ? ' <span class="tag merah">membangkang</span>' : '') + '</p>' +
      '<p class="meta"><span class="chip-tangga"><b>' + (it.tangga || 1) + '</b>' + esc(LABEL_TANGGA[it.tangga || 1]) + '</span> dilaporkan ' + esc(namaPendek(it.pelapor) || '-') +
      (it.status === 'Selesai' && it.ditindakOleh ? ', ditangani ' + esc(namaPendek(it.ditindakOleh)) : '') + '</p>';
    if (it.alasan) h += '<p class="meta">Alasan: ' + esc(it.alasan) + '</p>';
    if (tunggu && it.rekomendasi) h += '<div class="tugas"><strong>Yang perlu Anda lakukan</strong>' + esc(it.rekomendasi) + '</div>';
    if (T.status === 'Tembusan') h += '<p class="meta">Ditangani ' + esc(it.ke || '-') + (it.status === 'Menunggu' ? ', belum selesai' : ', sudah selesai') + '.</p>';
    if (it.catatan) h += '<div class="catatan">Kejadian: ' + esc(it.catatan) + '</div>';
    if (it.tindakan) h += '<div class="catatan">' + esc(it.tindakan) + '</div>';
    h += '<div class="aksi">';
    if (tunggu) h += '<button type="button" class="tombol tombol-utama" data-aksi="buka-tl">Tindak lanjuti</button>';
    if (T.status !== 'Tembusan' && it.waOrtu !== undefined) {
      h += tombolWa(it.waOrtu, isiTemplat(S.templat.WA_KASUS_ORTU, { nama: it.nama, kelas: it.kelas, tanggal: it.tanggal, pelanggaran: it.pelanggaran, pengirim: namaPendek(S.guru.nama), sekolah: S.sekolah }),
        it.waOrtuDibuka ? 'Ortu dikabari' : 'WA orang tua', { jenis: 'kasus-ortu', ref: it.idLog, nis: it.nis }, !!it.waOrtuDibuka);
    }
    if (S.akses.riwayat) h += '<button type="button" class="tautan" data-aksi="riwayat" data-nis="' + esc(it.nis) + '">Riwayat siswa</button>';
    h += '</div>';
    if (tunggu) {
      const nama = 'tl-akhir-' + esc(it.idLog);
      h += '<div class="form-tl" hidden><label class="label" for="tl-t-' + esc(it.idLog) + '">Tindakan yang sudah dilakukan</label>' +
        '<textarea id="tl-t-' + esc(it.idLog) + '" class="isian" rows="3" maxlength="500" placeholder="Contoh: siswa dipanggil, orang tua dihubungi lewat WA"></textarea>' +
        '<div class="opsi" style="margin-top:10px"><label><input type="radio" name="' + nama + '" value="selesai" checked><span><strong>Selesai</strong><small>Kasus ditutup di tangga ini.</small></span></label>' +
        '<label><input type="radio" name="' + nama + '" value="teruskan"><span><strong>Naikkan ke tangga lain</strong><small>Bila siswa perlu ditangani peran lain.</small>' +
        '<select class="isian" hidden aria-label="Teruskan ke">' + lain.map((x) => '<option>' + esc(x) + '</option>').join('') + '</select></span></label></div>' +
        '<button type="button" class="tombol tombol-utama" data-aksi="simpan-tl">Simpan tindak lanjut</button></div>';
    }
    return h + '</li>';
  }
  async function klikTL(e) {
    const a = e.target.closest('[data-aksi]');
    if (!a) return;
    const li = a.closest('.kasus');
    if (a.dataset.aksi === 'riwayat') { bukaRiwayatDari(a.dataset.nis); return; }
    if (a.dataset.aksi === 'buka-tl') { const f = li.querySelector('.form-tl'); f.hidden = !f.hidden; if (!f.hidden) f.querySelector('textarea').focus(); return; }
    if (a.dataset.aksi === 'simpan-tl') {
      const f = li.querySelector('.form-tl'), tindakan = f.querySelector('textarea').value.trim();
      if (!tindakan) { f.querySelector('textarea').focus(); toast('Tulis dulu tindakan yang sudah dilakukan.', 'galat'); return; }
      const terus = f.querySelector('input[value="teruskan"]').checked, ke = terus ? f.querySelector('select').value : '';
      a.disabled = true; a.textContent = 'Menyimpan…';
      try {
        const d = await api('tatib.selesaikan', { idLog: li.dataset.id, tindakan: tindakan, teruskanKe: ke });
        T.item = T.item.filter((x) => x.idLog !== li.dataset.id); renderTL();
        toast(d.status === 'Selesai' ? 'Tindak lanjut tersimpan. Kasus selesai.' : 'Tersimpan dan diteruskan ke ' + ke + (d.waOtomatis ? '. Penerima dikabari lewat WA.' : '.'), 'hadir', 4000);
      } catch (err) { a.disabled = false; a.textContent = 'Simpan tindak lanjut'; toast(err.message, 'galat', 5000); }
    }
  }

  /* =================================================================
   *  SISWA (riwayat)
   * ================================================================= */
  const bolehLihat = (s) => luas() || (punya(['Wali Kelas']) && !!S.guru.kelasWali && s.kelas === S.guru.kelasWali);
  function initRiwayat() {
    if (S.siap.siswa) return;
    S.siap.siswa = true;
    pemilihSiswa($('r-siswa-pilih'), { id: 'r', label: 'Pilih siswa', saring: bolehLihat, tampilSemua: true,
      catatan: luas() ? '' : 'Siswa kelas ' + S.guru.kelasWali + '.', pilih: (s) => bukaRiwayat(s.nis) });
    $('r-detail').addEventListener('click', (e) => {
      const a = e.target.closest('[data-aksi="lapor-siswa"]');
      if (!a) return;
      const s = S.siswa.get(a.dataset.nis);
      buka('lapor'); resetLapor(false); pilihSiswaLapor(s);
    });
  }
  function bukaRiwayatDari(nis) { buka('siswa'); bukaRiwayat(nis); }
  async function bukaRiwayat(nis) {
    const el = $('r-detail');
    el.hidden = false; el.innerHTML = '<div class="blok"><p class="memuat">Memuat riwayat…</p></div>';
    try {
      const d = await api('tatib.riwayat', { nis: nis });
      el.innerHTML = renderRiwayat(d); muatFoto(nis);
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) { el.innerHTML = '<div class="blok"><p class="kosong">' + esc(e.message) + '</p></div>'; }
  }
  function renderRiwayat(d) {
    const s = d.siswa, L = d.langkahLevel || {};
    let h = '<div class="blok"><div class="kepala-riwayat">' + fotoHtml(s) + '<div><h2>' + esc(s.nama) + '</h2>' +
      '<p>' + esc(s.kelas) + ', NIS ' + esc(s.nis) + (s.nisn ? ', NISN ' + esc(s.nisn) : '') + '</p>' + (s.wali ? '<p>Wali kelas: ' + esc(namaPendek(s.wali)) + '</p>' : '') + '</div></div>' +
      meterHtml(d.poin, d.level) + '<p class="keterangan" style="margin:2px 0 0">Poin dihitung sejak ' + esc(d.periodeMulai) + '.</p>' +
      '<div class="langkah-level">' + (d.level > 0 ? '<strong>' + esc(L.pj) + ':</strong> ' : '') + esc(L.tindakan) + '</div>';
    const k = d.kehadiran || {};
    h += '<div class="statistik">' + ['Hadir', 'Terlambat', 'Sakit', 'Izin', 'Alfa'].map((x) => '<div><b>' + (k[x] || 0) + '</b><span>' + x + '</span></div>').join('') + '</div>';
    h += '<h3 class="sub-judul">Pelanggaran (' + d.pelanggaran.length + ')</h3>';
    h += d.pelanggaran.length ? '<ol class="linimasa">' + d.pelanggaran.map((p) =>
      '<li class="' + kelasKat(p.kategori) + '"><strong>+' + p.poin + '</strong> ' + esc(p.pelanggaran) + (p.melawan ? ' <span class="tag merah">membangkang</span>' : '') +
      '<span class="meta">' + esc(p.tanggal) + ', ' + esc(p.kategori || '-') + ', dilaporkan ' + esc(namaPendek(p.pelapor) || '-') + '. ' +
      (p.tangga >= 2 ? 'Tangga ' + p.tangga + ' (' + esc(LABEL_TANGGA[p.tangga]) + '), ' + (p.status === 'Menunggu' ? 'menunggu' : 'selesai') : 'Ditangani guru yang menemukan') + '.</span>' +
      (p.tindakan ? '<span class="meta" style="white-space:pre-wrap">' + esc(p.tindakan) + '</span>' : '') + '</li>').join('') + '</ol>'
      : '<p class="kosong">Belum ada pelanggaran pada periode ini.</p>';
    if (d.pemulihan.length) h += '<h3 class="sub-judul">Pemulihan dan pembinaan</h3><ul class="baris-ringkas">' + d.pemulihan.map((r) =>
      '<li>' + esc(r.kategori) + ': <strong>' + esc(r.status) + '</strong>' + (r.potongan ? ' <span class="tag hijau">−' + r.potongan + ' poin</span>' : '') +
      '<span class="meta">' + esc(r.tanggal) + (r.catatan ? ', ' + esc(r.catatan) : '') + '</span></li>').join('') + '</ul>';
    if (d.surat.length) h += '<h3 class="sub-judul">Surat pernyataan</h3><ul class="baris-ringkas">' + d.surat.map((x) =>
      '<li>Lapis ' + x.lapis + ', ' + esc(x.tanggal) + '<span class="meta">' + esc(x.id) + ', ' + x.poin + ' poin saat dicetak, tanda tangan: ' + esc(x.ttd || '-') + '</span></li>').join('') + '</ul>';
    if (d.catatanHadir.length) h += '<h3 class="sub-judul">Catatan kehadiran</h3><ul class="baris-ringkas">' + d.catatanHadir.map((x) =>
      '<li><strong>' + esc(x.status) + '</strong>, ' + esc(x.tanggal) + (x.jam ? ', ' + esc(String(x.jam).slice(0, 5)) : '') + (x.ket ? '<span class="meta">' + esc(x.ket) + '</span>' : '') + '</li>').join('') + '</ul>';
    return h + '<button type="button" class="tombol tombol-garis" style="margin-top:16px" data-aksi="lapor-siswa" data-nis="' + esc(s.nis) + '">Lapor pelanggaran siswa ini</button></div>';
  }

  /* =================================================================
   *  WASPADA & SURAT
   * ================================================================= */
  const Z = { siswa: [], bolehSurat: false, pdf: {} };
  async function muatZona() {
    if (!S.siap.waspada) { S.siap.waspada = true; $('z-daftar').addEventListener('click', klikZona); }
    $('z-ket').textContent = 'Memuat…';
    try { const d = await api('tatib.zona'); Z.siswa = d.siswa || []; Z.bolehSurat = !!d.bolehSurat; renderZona(); }
    catch (e) { $('z-ket').textContent = e.message; }
  }
  function renderZona() {
    const n = Z.siswa.length;
    $('z-ket').textContent = (n ? n + ' siswa' + (luas() ? '' : ' kelas ' + S.guru.kelasWali) + ' sudah mencapai level tindakan, poin tertinggi di atas.' : 'Belum ada siswa yang mencapai Level 1.') +
      (n && !Z.bolehSurat ? ' Surat pernyataan dibuat oleh BK atau Tim Tatib.' : '');
    $('z-daftar').innerHTML = Z.siswa.map((s) => {
      const L = s.langkah || {}, berikut = s.lapisTerakhir < s.lapisPerlu ? s.lapisTerakhir + 1 : 0;
      let h = '<li class="kasus lv' + s.level + '" data-nis="' + esc(s.nis) + '"><div class="kasus-kepala">' + fotoHtml(s) +
        '<span><span class="nm">' + esc(s.nama) + '</span><span class="kl">' + esc(s.kelas) + '</span></span><span></span></div>' + meterHtml(s.poin, s.level) +
        '<div class="tugas"><strong>' + esc(L.pj || 'Tindakan') + '</strong>' + esc(L.tindakan) + '</div>' +
        '<p class="meta">Surat terakhir: ' + (s.lapisTerakhir ? 'Lapis ' + s.lapisTerakhir : 'belum ada') + (berikut ? ' <span class="tag merah">perlu Surat Lapis ' + berikut + '</span>' : '') + '</p>';
      const pdf = Z.pdf[s.nis];
      if (pdf) h += '<div class="surat-siap">Surat Lapis ' + pdf.lapis + ' siap: <a href="' + pdf.url + '" target="_blank" rel="noopener">Buka PDF</a><a href="' + pdf.url + '" download="' + esc(pdf.nama) + '">Unduh</a>' +
        (pdf.drive ? '<a href="' + esc(pdf.drive) + '" target="_blank" rel="noopener">Lihat di Drive</a>' : '') + '</div>';
      h += '<div class="aksi">';
      if (Z.bolehSurat && berikut) h += '<button type="button" class="tombol tombol-utama" data-aksi="surat" data-lapis="' + berikut + '">Buat Surat Lapis ' + berikut + '</button>';
      else if (Z.bolehSurat && s.lapisPerlu) h += '<button type="button" class="tombol tombol-garis" data-aksi="surat" data-lapis="' + s.lapisPerlu + '">Cetak ulang Lapis ' + s.lapisPerlu + '</button>';
      return h + '<button type="button" class="tautan" data-aksi="riwayat">Riwayat siswa</button></div></li>';
    }).join('');
  }
  async function klikZona(e) {
    const a = e.target.closest('[data-aksi]');
    if (!a) return;
    const nis = a.closest('.kasus').dataset.nis;
    if (a.dataset.aksi === 'riwayat') { bukaRiwayatDari(nis); return; }
    if (a.dataset.aksi === 'surat') {
      const lapis = Number(a.dataset.lapis);
      a.disabled = true; a.textContent = 'Membuat surat…';
      try {
        const d = await api('tatib.surat', { nis: nis, lapis: lapis });
        const bin = atob(d.pdf), isi = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) isi[i] = bin.charCodeAt(i);
        if (Z.pdf[nis]) URL.revokeObjectURL(Z.pdf[nis].url);
        Z.pdf[nis] = { lapis: lapis, url: URL.createObjectURL(new Blob([isi], { type: 'application/pdf' })), nama: d.namaFile, drive: d.url };
        const s = Z.siswa.filter((x) => x.nis === nis)[0]; if (s) s.lapisTerakhir = Math.max(s.lapisTerakhir, lapis);
        renderZona(); toast('Surat Lapis ' + lapis + ' dibuat dan disimpan di folder Surat_SMKT.', 'hadir');
      } catch (err) { renderZona(); toast(err.message, 'galat', 6000); }
    }
  }

  /* =================================================================
   *  PULIH
   * ================================================================= */
  const P = { item: [], potongan: 15, siswaLain: null };
  async function muatPulih() {
    if (!S.siap.pulih) {
      S.siap.pulih = true;
      $('pm-daftar').addEventListener('click', klikPulih);
      if (S.akses.pembinaanLain) {
        $('pm-lain').hidden = false;
        pemilihSiswa($('pm-siswa-pilih'), { id: 'pm', label: 'Siswa', pilih: (s) => { P.siswaLain = s; pilihanTerpilih($('pm-siswa-pilih'), s, 'ganti-pm'); } });
        $('pm-simpan').addEventListener('click', simpanPembinaan);
        $('pm-lain').addEventListener('click', (e) => { if (e.target.closest('[data-aksi="ganti-pm"]')) { P.siswaLain = null; pilihanTerpilih($('pm-siswa-pilih'), null); } });
      }
    }
    $('pm-ket').textContent = 'Memuat…';
    try { const d = await api('tatib.pemulihan'); P.item = d.item || []; P.potongan = d.potongan || 15; renderPulih(); }
    catch (e) { $('pm-ket').textContent = e.message; }
  }
  function renderPulih() {
    $('pm-ket').textContent = P.item.length ? 'Kasus yang bisa ditebus dengan program pembinaan fisik. Status Lulus mengurangi ' + P.potongan + ' poin, sekali untuk setiap kasus.'
      : 'Belum ada kasus yang bisa ditebus dengan program fisik pada periode ini.';
    const urut = P.item.slice().sort((a, b) => (a.sudahDipotong - b.sudahDipotong));
    $('pm-daftar').innerHTML = urut.map((it) => '<li class="kasus ' + (it.sudahDipotong ? 'k-ringan' : 'k-sedang') + '" data-id="' + esc(it.idLog) + '">' +
      '<div class="kasus-kepala">' + fotoHtml(it) + '<span><span class="nm">' + esc(it.nama) + '</span><span class="kl">' + esc(it.kelas) + '</span></span><span class="wkt">' + esc(it.tanggal) + '</span></div>' +
      '<p class="plg">' + esc(it.pelanggaran) + ' <span class="tag">+' + it.poin + '</span></p>' +
      '<p class="meta">Program fisik: ' + (it.sudahDipotong ? '<span class="tag hijau">Lulus, −' + P.potongan + ' poin</span>' : esc(it.statusTerakhir || 'belum dijadwalkan')) + '</p>' +
      (it.sudahDipotong ? '' : '<div class="aksi">' + ['Dijadwalkan', 'Berjalan'].filter((x) => x !== it.statusTerakhir).map((x) => '<button type="button" class="tombol tombol-garis" data-status="' + x + '">' + x + '</button>').join('') +
        '<button type="button" class="tombol tombol-utama" data-status="Lulus">Lulus (−' + P.potongan + ')</button><button type="button" class="tombol tombol-garis" data-status="Tidak Lulus">Tidak lulus</button></div>') + '</li>').join('');
  }
  async function klikPulih(e) {
    const a = e.target.closest('button[data-status]');
    if (!a) return;
    const it = P.item.filter((x) => x.idLog === a.closest('.kasus').dataset.id)[0];
    if (!it) return;
    const status = a.dataset.status;
    if (status === 'Lulus' && !confirm(it.nama + ' lulus program fisik? Poinnya berkurang ' + P.potongan + '.')) return;
    a.disabled = true;
    try {
      await api('tatib.catatPemulihan', { nis: it.nis, kategori: 'Program Fisik', status: status, ref: it.idLog });
      it.statusTerakhir = status; if (status === 'Lulus') it.sudahDipotong = true;
      renderPulih(); toast(status === 'Lulus' ? 'Lulus. Poin ' + it.nama + ' berkurang ' + P.potongan + '.' : 'Status ' + status + ' tersimpan.', 'hadir');
    } catch (err) { a.disabled = false; toast(err.message, 'galat', 5000); }
  }
  async function simpanPembinaan() {
    const s = P.siswaLain;
    if (!s) { toast('Pilih siswa dulu.', 'galat'); return; }
    const b = $('pm-simpan'); b.disabled = true; b.textContent = 'Menyimpan…';
    try {
      const d = await api('tatib.catatPemulihan', { nis: s.nis, kategori: $('pm-kategori').value, status: $('pm-status').value, catatan: $('pm-catatan').value.trim() });
      toast(d.kategori + ' untuk ' + d.nama + ' tersimpan.', 'hadir');
      $('pm-catatan').value = ''; P.siswaLain = null; pilihanTerpilih($('pm-siswa-pilih'), null);
    } catch (e) { toast(e.message, 'galat', 5000); } finally { b.disabled = false; b.textContent = 'Simpan pembinaan'; }
  }

  /* =================================================================
   *  ABSEN (izin / sakit)
   * ================================================================= */
  const I = { siswa: null };
  function initIzin() {
    if (S.siap.absen) return;
    S.siap.absen = true;
    const semua = !!S.akses.izinSemuaKelas;
    $('iz-ket').textContent = (semua ? 'Untuk siswa semua kelas. ' : 'Untuk siswa kelas ' + S.guru.kelasWali + '. ') + 'Bisa dicatat sampai ' + HARI_IZIN_MUNDUR + ' hari ke belakang dan menggantikan status Alfa.';
    pemilihSiswa($('iz-siswa-pilih'), { id: 'iz', label: 'Siswa', tampilSemua: !semua, saring: semua ? null : (s) => s.kelas === S.guru.kelasWali,
      pilih: (s) => { I.siswa = s; pilihanTerpilih($('iz-siswa-pilih'), s, 'ganti-iz'); } });
    $('iz-siswa-pilih').addEventListener('click', (e) => { if (e.target.closest('[data-aksi="ganti-iz"]')) { I.siswa = null; pilihanTerpilih($('iz-siswa-pilih'), null); } });
    const t = $('iz-tanggal'); t.value = hariIni(); t.max = hariIni(); t.min = hariIni(-HARI_IZIN_MUNDUR);
    $('iz-simpan').addEventListener('click', simpanIzin);
  }
  async function simpanIzin() {
    const s = I.siswa;
    if (!s) { toast('Pilih siswa dulu.', 'galat'); return; }
    const status = document.querySelector('input[name="iz-status"]:checked').value, b = $('iz-simpan');
    b.disabled = true; b.textContent = 'Menyimpan…';
    try {
      const d = await api('tatib.izin', { nis: s.nis, tanggal: $('iz-tanggal').value, status: status, keterangan: $('iz-ket-isi').value.trim() });
      toast(d.status + ' tercatat untuk ' + d.nama + ' (' + d.tanggal + ')' + (d.menimpa ? ', menggantikan ' + d.menimpa : '') + '.', 'hadir', 4500);
      $('iz-ket-isi').value = ''; I.siswa = null; pilihanTerpilih($('iz-siswa-pilih'), null);
    } catch (e) { toast(e.message, 'galat', 5000); } finally { b.disabled = false; b.textContent = 'Simpan'; }
  }

  /* =================================================================
   *  EKSKUL (absensi oleh pembina)
   * ================================================================= */
  const STATUS_E = [['Hadir', 'H'], ['Izin', 'I'], ['Sakit', 'S'], ['Alpa', 'A']];
  const E = { data: null, aktif: '', tanggal: '', mode: 'absen', status: {}, antre: new Map(), timer: null, menyimpan: false, pasang: false, pemilih: null };
  const eAktif = () => (E.data ? E.data.ekskul.filter((x) => x.nama === E.aktif)[0] : null);
  const jamKini = () => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
  const tglPendek = (t) => { const p = String(t).split('-'); return Number(p[2]) + '/' + Number(p[1]); };
  /** Status yang tampil: perubahan yang belum tersimpan lebih dulu, lalu data server. */
  function statusE(nis) {
    if (E.antre.has(nis)) { const x = E.antre.get(nis); return x.status ? x : null; }
    return E.status[nis] || null;
  }

  function pasangEkskul() {
    if (E.pasang) return;
    E.pasang = true;
    $('e-scan').innerHTML = ikon('qr') + 'Scan kartu anggota';
    $('e-mode').addEventListener('click', (e) => { const b = e.target.closest('button[data-mode]'); if (b) gantiModeE(b.dataset.mode); });
    $('e-pilih').addEventListener('change', (e) => { if (e.target.id === 'e-ekskul') gantiEkskul(e.target.value); });
    $('e-tanggal').addEventListener('change', () => gantiTanggalE($('e-tanggal').value));
    $('e-daftar').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-status]'); if (!b) return;
      const nis = b.closest('li').dataset.nis, x = statusE(nis);
      aturStatusE(nis, x && x.status === b.dataset.status ? '' : b.dataset.status, 'Centang');
    });
    $('e-scan').addEventListener('click', scanEkskul);
    $('e-sisa').addEventListener('click', () => {
      const e = eAktif(); if (!e) return;
      e.anggota.forEach((a) => { if (!statusE(a.nis)) E.antre.set(a.nis, { nis: a.nis, status: 'Alpa', cara: 'Centang', waktu: jamKini() }); });
      renderAbsenE(); jadwalSimpanE(300);
    });
    $('e-simpan').addEventListener('click', (e) => { if (e.target.closest('[data-aksi="simpan-lagi"]')) simpanE(); });
    $('e-bulan').addEventListener('change', muatRekapE);
    $('e-anggota-daftar').addEventListener('click', klikAnggotaE);
    window.addEventListener('beforeunload', (e) => { if (E.antre.size) { e.preventDefault(); e.returnValue = ''; } });
  }

  async function muatEkskul() {
    pasangEkskul();
    if (E.antre.size) { renderEkskul(); return; }   // jangan menimpa absensi yang belum tersimpan
    if (!E.data) { $('e-isi').hidden = true; $('e-ket').hidden = false; $('e-ket').textContent = 'Memuat ekskul…'; }
    try {
      E.data = await api('ekskul.awal');
      if (!E.data.ekskul.length) { $('e-isi').hidden = true; $('e-ket').hidden = false; $('e-ket').textContent = 'Anda belum terdaftar sebagai pembina ekskul. Tim Tata Tertib mengisi email pembina di tab Ekskul.'; return; }
      if (!eAktif()) E.aktif = (simpan.get('smkt_ekskul', '') && E.data.ekskul.some((x) => x.nama === simpan.get('smkt_ekskul', ''))) ? simpan.get('smkt_ekskul', '') : E.data.ekskul[0].nama;
      E.tanggal = E.data.hariIni; E.status = eAktif().status || {};
      const t = $('e-tanggal'); t.value = E.tanggal; t.max = E.data.hariIni; t.min = hariIni(-E.data.mundur);
      if (!$('e-bulan').value) $('e-bulan').value = E.data.hariIni.slice(0, 7);
      $('e-ket').hidden = true; $('e-isi').hidden = false;
      renderEkskul();
    } catch (e) {
      if (!E.data) { $('e-ket').hidden = false; $('e-ket').textContent = e.message; }
    }
  }

  function renderEkskul() {
    const e = eAktif(); if (!e) return;
    const banyak = E.data.ekskul.length > 1;
    $('e-pilih').innerHTML = (banyak ? '<label class="label" for="e-ekskul">Ekskul</label><select id="e-ekskul" class="isian">' +
      E.data.ekskul.map((x) => '<option' + (x.nama === E.aktif ? ' selected' : '') + '>' + esc(x.nama) + '</option>').join('') + '</select>' :
      '<h2 class="eks-nama">' + esc(e.nama) + '</h2>') +
      '<p class="eks-jadwal">' + ((e.hari || e.jam) ? 'Latihan ' + esc([e.hari, e.jam].filter(Boolean).join(', pukul ')) + '. ' : '') + e.anggota.length + ' anggota.</p>';
    document.querySelectorAll('#e-mode button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === E.mode)));
    $('e-absen').hidden = E.mode !== 'absen'; $('e-rekap').hidden = E.mode !== 'rekap'; $('e-anggota').hidden = E.mode !== 'anggota';
    if (E.mode === 'absen') renderAbsenE();
    else if (E.mode === 'rekap') muatRekapE();
    else renderAnggotaE();
  }
  function gantiModeE(mode) { E.mode = mode; renderEkskul(); }

  /** Simpan dulu perubahan yang tertunda sebelum pindah ekskul atau tanggal. */
  async function tuntaskanE() {
    if (!E.antre.size) return true;
    clearTimeout(E.timer); E.timer = null;
    await simpanE();
    if (E.antre.size) { toast('Absensi belum tersimpan. Periksa sinyal, lalu tekan Coba simpan lagi.', 'galat', 5000); return false; }
    return true;
  }
  async function gantiEkskul(nama) {
    if (!(await tuntaskanE())) { $('e-ekskul').value = E.aktif; return; }
    E.aktif = nama; simpan.set('smkt_ekskul', nama);
    const e = eAktif();
    E.tanggal = E.data.hariIni; $('e-tanggal').value = E.tanggal; E.status = e.status || {};
    if (E.pemilih) { E.pemilih.render(); }
    renderEkskul();
  }
  async function gantiTanggalE(tgl) {
    if (!tgl) { $('e-tanggal').value = E.tanggal; return; }
    if (!(await tuntaskanE())) { $('e-tanggal').value = E.tanggal; return; }
    E.tanggal = tgl; E.status = {};
    $('e-daftar').innerHTML = '<li class="memuat">Memuat absensi ' + esc(tglPendek(tgl)) + '…</li>';
    try {
      const d = await api('ekskul.hari', { ekskul: E.aktif, tanggal: tgl });
      if (d.tanggal === E.tanggal && d.ekskul === E.aktif) { E.status = d.status; if (tgl === E.data.hariIni) eAktif().status = d.status; }
    } catch (e) { toast(e.message, 'galat', 5000); }
    renderAbsenE();
  }

  function renderAbsenE() {
    const e = eAktif(); if (!e) return;
    const hit = { Hadir: 0, Izin: 0, Sakit: 0, Alpa: 0 }; let belum = 0;
    e.anggota.forEach((a) => { const x = statusE(a.nis); if (x) hit[x.status]++; else belum++; });
    $('e-ringkas').innerHTML = STATUS_E.map((s) => '<span class="er-' + s[1] + '"><b>' + hit[s[0]] + '</b>' + s[0] + '</span>').join('') + '<span class="er-belum"><b>' + belum + '</b>Belum</span>';
    $('e-sisa').hidden = !belum || !e.anggota.length;
    $('e-sisa').textContent = 'Tandai sisanya Alpa (' + belum + ' siswa)';
    $('e-scan').disabled = !e.anggota.length;
    $('e-kosong').hidden = !!e.anggota.length;
    $('e-daftar').innerHTML = e.anggota.map((a) => {
      const x = statusE(a.nis), tunda = E.antre.has(a.nis);
      return '<li data-nis="' + esc(a.nis) + '" class="' + (x ? 'st-' + x.status.toLowerCase() : '') + '"><div><span class="nm">' + esc(a.nama) + '</span>' +
        '<span class="kl">' + esc(a.kelas) + (x && x.cara === 'Scan' && x.waktu ? ', scan ' + esc(x.waktu) : '') + (tunda ? ', <span class="belum-simpan">belum tersimpan</span>' : '') + '</span></div>' +
        '<div class="hisa" role="group" aria-label="Kehadiran ' + esc(a.nama) + '">' + STATUS_E.map((s) =>
          '<button type="button" data-status="' + s[0] + '" aria-pressed="' + String(!!x && x.status === s[0]) + '" aria-label="' + s[0] + '" title="' + s[0] + '">' + s[1] + '</button>').join('') + '</div></li>';
    }).join('');
  }

  function aturStatusE(nis, status, cara) {
    E.antre.set(nis, { nis: nis, status: status, cara: cara, waktu: jamKini() });
    renderAbsenE();
    jadwalSimpanE(cara === 'Scan' ? 600 : 1200);
  }
  function tampilSimpanE(teks, jenis, ulang) {
    const el = $('e-simpan');
    el.className = 'status-simpan' + (jenis ? ' ' + jenis : '');
    el.innerHTML = esc(teks) + (ulang ? ' <button type="button" class="tautan" data-aksi="simpan-lagi">Coba simpan lagi</button>' : '');
  }
  function jadwalSimpanE(ms) {
    clearTimeout(E.timer);
    E.timer = setTimeout(() => { E.timer = null; simpanE(); }, ms);
    tampilSimpanE('Menyimpan…');
  }
  async function simpanE() {
    if (E.menyimpan) { jadwalSimpanE(800); return; }
    if (!E.antre.size) return;
    const kirim = Array.from(E.antre.values()), ekskul = E.aktif, tanggal = E.tanggal;
    E.menyimpan = true; tampilSimpanE('Menyimpan…');
    try {
      const d = await api('ekskul.simpan', { ekskul: ekskul, tanggal: tanggal, data: kirim.map((k) => ({ nis: k.nis, status: k.status, cara: k.cara })) });
      kirim.forEach((k) => { if (E.antre.get(k.nis) === k) E.antre.delete(k.nis); });
      if (ekskul === E.aktif && tanggal === E.tanggal) { E.status = d.status; if (tanggal === E.data.hariIni) eAktif().status = d.status; }
      tampilSimpanE('Tersimpan pukul ' + d.jam + '.' + (d.ditolak.length ? ' ' + d.ditolak.length + ' siswa bukan anggota, tidak disimpan.' : ''), 'ok');
    } catch (e) {
      tampilSimpanE('Belum tersimpan: ' + e.message, 'galat', true);
      if ((e.jaringan || e.kode === 'SIBUK') && !E.timer) E.timer = setTimeout(() => { E.timer = null; simpanE(); }, 15000);
    } finally {
      E.menyimpan = false;
      if (S.tab === 'ekskul' && E.mode === 'absen') renderAbsenE();
    }
  }

  function scanEkskul() {
    const e = eAktif(); if (!e || !e.anggota.length) return;
    bukaScan((nis) => {
      const a = e.anggota.filter((x) => x.nis === nis)[0];
      if (!a) {
        const s = S.siswa.get(nis);
        return { pesan: s ? s.nama + ' (' + s.kelas + ') bukan anggota ' + e.nama + '. Tambahkan di tab Anggota.' : 'Kartu ' + nis + ' tidak ada di daftar siswa aktif.', galat: true };
      }
      const x = statusE(nis);
      if (!(x && x.status === 'Hadir')) aturStatusE(nis, 'Hadir', 'Scan');
      const hadir = e.anggota.filter((y) => { const z = statusE(y.nis); return z && z.status === 'Hadir'; }).length;
      return { pesan: (x && x.status === 'Hadir' ? a.nama + ' sudah tercatat hadir. ' : 'Hadir: ' + a.nama + '. ') + hadir + ' dari ' + e.anggota.length + ' anggota hadir.' };
    }, { terus: true, ket: 'Scan kartu anggota satu per satu. Tekan Selesai bila sudah.' });
  }

  async function muatRekapE() {
    const e = eAktif(); if (!e) return;
    const bulan = $('e-bulan').value || E.data.hariIni.slice(0, 7);
    $('e-rekap-isi').innerHTML = '<p class="memuat">Memuat rekap…</p>';
    try {
      const d = await api('ekskul.rekap', { ekskul: E.aktif, bulan: bulan });
      if (d.ekskul !== E.aktif || $('e-bulan').value && d.bulan !== $('e-bulan').value) return;
      const n = d.pertemuan.length;
      let h = '<p class="keterangan">' + (n ? n + ' pertemuan: ' + esc(d.pertemuan.map(tglPendek).join(', ')) + '.' : 'Belum ada absensi pada bulan ini.') + '</p>';
      if (n && d.anggota.length) {
        h += '<div class="tabel-gulir"><table class="tabel-rekap"><thead><tr><th scope="col">Anggota</th><th scope="col"><abbr title="Hadir">H</abbr></th><th scope="col"><abbr title="Izin">I</abbr></th>' +
          '<th scope="col"><abbr title="Sakit">S</abbr></th><th scope="col"><abbr title="Alpa">A</abbr></th><th scope="col">Hadir</th></tr></thead><tbody>' +
          d.anggota.map((a) => '<tr' + (a.keluar ? ' class="keluar"' : '') + '><th scope="row"><span class="nm">' + esc(a.nama) + '</span><span class="kl">' + esc(a.kelas) + (a.keluar ? ', sudah keluar' : '') + '</span></th>' +
            '<td>' + a.hadir + '</td><td>' + a.izin + '</td><td>' + a.sakit + '</td><td' + (a.alpa ? ' class="alpa"' : '') + '>' + a.alpa + '</td>' +
            '<td class="persen">' + (a.persen === null ? '–' : a.persen + '%') + '</td></tr>').join('') + '</tbody></table></div>';
      }
      $('e-rekap-isi').innerHTML = h;
    } catch (er) { $('e-rekap-isi').innerHTML = '<p class="memuat">' + esc(er.message) + '</p>'; }
  }

  function renderAnggotaE() {
    const e = eAktif(); if (!e) return;
    if (!E.pemilih) {
      E.pemilih = pemilihSiswa($('e-tambah'), { id: 'ea', label: 'Tambah anggota', catatan: 'Cari nama siswa atau scan kartunya.',
        saring: (s) => { const x = eAktif(); return !!x && !x.anggota.some((a) => a.nis === s.nis); }, pilih: tambahAnggotaE });
    } else E.pemilih.render();
    $('e-anggota-ket').textContent = e.anggota.length ? e.anggota.length + ' anggota ' + e.nama + '.' : 'Belum ada anggota ' + e.nama + '.';
    $('e-anggota-daftar').innerHTML = e.anggota.map((a) => '<li data-nis="' + esc(a.nis) + '"><span><span class="nm">' + esc(a.nama) + '</span><span class="kl">' + esc(a.kelas) + ', NIS ' + esc(a.nis) + '</span></span>' +
      '<button type="button" class="tautan" data-aksi="keluar">Keluarkan</button></li>').join('');
  }
  async function tambahAnggotaE(s) {
    const nama = E.aktif;
    try {
      const d = await api('ekskul.anggota', { ekskul: nama, tambah: [s.nis] });
      const e = E.data.ekskul.filter((x) => x.nama === nama)[0]; if (e) e.anggota = d.anggota;
      if (E.aktif === nama) renderEkskul();
      toast(d.tambah ? s.nama + ' masuk anggota ' + nama + '.' : s.nama + ' sudah anggota ' + nama + '.', 'hadir');
    } catch (er) { toast(er.message, 'galat', 5000); }
  }
  async function klikAnggotaE(ev) {
    const b = ev.target.closest('button[data-aksi]'); if (!b) return;
    const li = b.closest('li'), nis = li.dataset.nis, nama = E.aktif;
    if (b.dataset.aksi === 'keluar') { b.dataset.aksi = 'keluar-ya'; b.textContent = 'Yakin keluarkan?'; b.classList.add('merah'); return; }
    b.disabled = true; b.textContent = 'Mengeluarkan…';
    try {
      const d = await api('ekskul.anggota', { ekskul: nama, hapus: [nis] });
      const e = E.data.ekskul.filter((x) => x.nama === nama)[0]; if (e) e.anggota = d.anggota;
      if (E.aktif === nama) renderEkskul();
      toast('Anggota dikeluarkan. Absensinya yang lalu tetap ada di rekap.', 'hadir', 4000);
    } catch (er) { b.disabled = false; b.textContent = 'Keluarkan'; b.dataset.aksi = 'keluar'; toast(er.message, 'galat', 5000); }
  }

  /* ---------------- Mulai ---------------- */
  function pasangKejadian() {
    $('tombol-menu').innerHTML = ikon('menu');
    $('tombol-lapor-besar').innerHTML = ikon('lapor') + 'Lapor pelanggaran';
    $('tombol-menu').addEventListener('click', (e) => { e.stopPropagation(); ($('menu').hidden ? bukaMenu() : tutupMenu()); });
    $('menu-perbarui').addEventListener('click', async () => {
      tutupMenu();
      const sb = S.siap.beranda;
      S.siap = { beranda: sb }; B.data = null; S.foto.clear(); sesiTab.hapus('smkt_tatib_awal');
      if (!E.antre.size) E.data = null;
      await muatAwal(false); toast('Data diperbarui.', 'hadir');
    });
    $('menu-ujiwa').addEventListener('click', async () => {
      tutupMenu(); toast('Mengirim WA uji…', '', 8000);
      try { const d = await api('tatib.ujiWA'); toast('WA uji terkirim ke ' + d.nomor + ' pukul ' + d.jam + '. Cek WhatsApp Anda.', 'hadir', 6000); }
      catch (e) { toast(e.message, 'galat', 7000); }
    });
    $('menu-keluar').addEventListener('click', keluar);
    $('scan-tutup').addEventListener('click', tutupScan);
    $('nav-bawah').addEventListener('click', (e) => { if (e.target.closest('#nav-lainnya')) $('lembar-lainnya').hidden = false; });
    $('lembar-lainnya').addEventListener('click', (e) => { if (e.target === $('lembar-lainnya')) $('lembar-lainnya').hidden = true; });
    window.addEventListener('hashchange', () => { if (!$('layar-utama').hidden && S.menu.length) buka(halamanDariHash()); });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (!$('modal-scan').hidden) tutupScan(); else if (!$('lembar-lainnya').hidden) $('lembar-lainnya').hidden = true; else if (!$('menu').hidden) tutupMenu();
    });
    document.addEventListener('click', (e) => { if (!$('menu').hidden && !e.target.closest('#menu') && !e.target.closest('#tombol-menu')) tutupMenu(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) tutupScan(); });
  }
  function mulai() {
    pasangKejadian();
    if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
    const sesi = simpan.get('smkt_sesi', null);
    if (sesi && sesi.kedaluwarsa > Date.now() && sesi.sesi && sesi.sesi !== 'demo') { S.sesi = sesi.sesi; S.guru = sesi.guru; bukaUtama(); }
    else tampilLogin();
  }

  window.SMKT_tatib = { keadaan: S, C: C };
  mulai();
})();
