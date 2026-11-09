/*
 * Tata Tertib SMKT · aplikasi web guru · v1.3 (3 November 2026)
 * Menu: Beranda (dasbor) · Lapor · Kotak Masuk · Verifikasi · Siswa · Waspada · Pulih · Absen · Ekskul.
 * Laptop (≥1024 px): menu di samping. HP: menu di bawah.
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

  IKON.foto = '<path d="M3 7V5a2 2 0 0 1 2-2h2" /> <path d="M17 3h2a2 2 0 0 1 2 2v2" /> <path d="M21 17v2a2 2 0 0 1-2 2h-2" /> <path d="M7 21H5a2 2 0 0 1-2-2v-2" /> <path d="M8 14s1.5 2 4 2 4-2 4-2" /> <path d="M9 9h.01" /> <path d="M15 9h.01" />';
  IKON.kamera = '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /> <circle cx="12" cy="13" r="3" />';
  IKON.tablet = '<rect width="16" height="20" x="4" y="2" rx="2" ry="2" /> <line x1="12" x2="12.01" y1="18" y2="18" />';
  IKON.kartu = '<rect width="20" height="14" x="2" y="5" rx="2" /> <circle cx="8" cy="11" r="2" /> <path d="M5 16c.6-1.6 1.7-2.4 3-2.4s2.4.8 3 2.4" /> <path d="M14 10h5" /> <path d="M14 14h3" />';
  IKON.tambah = '<path d="M5 12h14" /> <path d="M12 5v14" />';
  IKON.pembinaan = '<path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" /> <path d="M16 2v4" /> <path d="M8 2v4" /> <path d="M3 10h5" /> <path d="M17.5 17.5 16 16.3V14" /> <circle cx="16" cy="16" r="6" />';

  const MENU = [
    { id: 'beranda', label: 'Beranda', ikon: 'beranda', judul: 'Beranda', boleh: () => true },
    { id: 'lapor', label: 'Lapor', ikon: 'lapor', judul: 'Lapor pelanggaran', boleh: (a) => a.catat !== false },
    { id: 'kotak', label: 'Kotak Masuk', ikon: 'kotak', judul: 'Kotak Masuk', boleh: (a) => a.tindakLanjut, ket: 'Kasus yang diteruskan kepada Anda' },
    { id: 'verifikasi', label: 'Verifikasi', ikon: 'foto', judul: 'Verifikasi foto scan', boleh: (a) => a.verifikasi, ket: 'Cocokkan foto scan gerbang dengan foto siswa' },
    { id: 'siswa', label: 'Siswa', ikon: 'siswa', judul: 'Riwayat siswa', boleh: (a) => a.riwayat, ket: 'Poin, kehadiran, dan pembinaan per siswa' },
    { id: 'waspada', label: 'Waspada', ikon: 'waspada', judul: 'Waspada', boleh: (a) => a.zona, ket: 'Siswa yang poinnya mencapai level tindakan' },
    { id: 'pembinaan', label: 'Pembinaan', ikon: 'pembinaan', judul: 'Masa pembinaan', boleh: (a) => a.program, ket: 'Jadwal pembinaan dan skorsing per hari sekolah' },
    { id: 'pulih', label: 'Pulih', ikon: 'pulih', judul: 'Pulih', boleh: (a) => a.pemulihan, ket: 'Program fisik dan pembinaan lain' },
    { id: 'absen', label: 'Absen', ikon: 'absen', judul: 'Absen', boleh: (a) => a.izin, ket: 'Catat izin atau sakit siswa' },
    { id: 'ekskul', label: 'Ekskul', ikon: 'ekskul', judul: 'Absensi ekskul', boleh: (a) => a.ekskul, ket: 'Kehadiran anggota ekstrakurikuler yang Anda bina' },
    { id: 'akun', label: 'Akun guru', ikon: 'siswa', judul: 'Kelola akun guru', boleh: (a) => a.akun, ket: 'Email, peran, dan kelas wali setiap guru' },
    { id: 'kartu', label: 'Kartu pelajar', ikon: 'kartu', judul: 'Kartu pelajar', boleh: (a) => a.akun, ket: 'Cetak kartu ber-QR depan dan belakang, template Canva' },
  ];
  // Menu per ruang kerja. Hak sebenarnya tetap diperiksa server untuk ruang yang dipilih.
  const RUANG_MENU = {
    wali: ['beranda', 'lapor', 'kotak', 'verifikasi', 'siswa', 'waspada', 'pembinaan', 'absen'],
    bk: ['beranda', 'lapor', 'kotak', 'siswa', 'waspada', 'pembinaan', 'pulih', 'absen'],
    tatib: ['beranda', 'lapor', 'kotak', 'verifikasi', 'siswa', 'waspada', 'pembinaan', 'pulih', 'absen'],
    wakasek: ['beranda', 'lapor', 'kotak', 'verifikasi', 'siswa', 'waspada', 'pembinaan'],
    kepsek: ['beranda', 'siswa', 'waspada', 'pembinaan'],
    piket: ['beranda', 'lapor', 'absen'],
    olahraga: ['beranda', 'lapor', 'pulih'],
    ekskul: ['ekskul', 'lapor'],
    admin: ['akun', 'kartu'],
    mapel: ['beranda', 'lapor'],
  };
  const KET_RUANG = {
    wali: 'Siswa kelas Anda: keterlambatan, kasus, verifikasi foto, dan pembinaan.',
    bk: 'Kasus yang diteruskan ke BK dan bimbingan konseling siswa jenjang Anda.',
    tatib: 'Kasus berat, Waspada, Surat Peringatan (SP), masa pembinaan, dan kios gerbang.',
    wakasek: 'Kasus tangga pimpinan dan pemantauan kedisiplinan sekolah.',
    kepsek: 'Ringkasan dan pemantauan sekolah. Ruang ini tidak untuk melapor atau menindak.',
    piket: 'Gerbang, siswa terlambat hari ini, serta izin dan dispensasi.',
    olahraga: 'Program fisik yang ditugaskan kepada Anda.',
    ekskul: 'Absensi dan dokumentasi ekskul yang Anda bina.',
    admin: 'Menambah email guru dan mengatur aksesnya.',
    mapel: 'Melapor pelanggaran yang Anda temukan.',
  };

  const $ = (id) => document.getElementById(id);
  const S = {
    sesi: null, guru: null, akses: {}, ruang: '', daftarRuang: [],
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
    const isi = Object.assign({ aksi: aksi, sesi: S.sesi }, S.ruang ? { ruang: S.ruang } : {}, data || {});
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
  function hapusSesi() { S.sesi = null; S.guru = null; S.ruang = ''; simpan.hapus('smkt_sesi'); simpan.hapus('smkt_ruang'); simpan.hapus('smkt_tatib_awal'); simpan.hapus('smkt_tatib_beranda'); sesiTab.hapus('smkt_tatib_awal'); }
  // Data terakhir disimpan di perangkat agar aplikasi langsung tampil, lalu diperbarui diam-diam dari server.
  const UMUR_SIMPANAN = 12 * 3600 * 1000;
  function simpananCocok(o) { return o && o.sesi === S.sesi && (o.ruang || '') === S.ruang && o.data && Date.now() - (o.waktu || 0) < UMUR_SIMPANAN; }
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
    const cache = simpan.get('smkt_tatib_awal', null);
    if (simpananCocok(cache)) {
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
      try { simpan.set('smkt_tatib_awal', { sesi: S.sesi, ruang: d.ruangAktif || '', waktu: Date.now(), data: d }); } catch (e) { /* penyimpanan penuh */ }
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
    S.daftarRuang = d.ruang || [];
    if ((d.ruangAktif || '') !== S.ruang) { S.ruang = d.ruangAktif || ''; simpan.set('smkt_ruang', S.ruang); }
    S.siswa = new Map((d.siswa || []).map((s) => [s.nis, s]));
    S.master = new Map((d.master || []).map((m) => [m.id, m]));
    S.panduan = d.panduan || {}; S.eskalasi = d.eskalasi || []; S.tangga = d.tangga || [];
    S.templat = d.templatWA || {}; S.sekolah = d.sekolah || CFG.NAMA_SEKOLAH || ''; S.batasMasuk = d.batasMasuk || '';
    S.wa = d.waOtomatis || { aktif: false };
    const izinRuang = RUANG_MENU[S.ruang];
    S.menu = MENU.filter((m) => m.boleh(S.akses) && (!izinRuang || izinRuang.indexOf(m.id) > -1));
    if (izinRuang) S.menu.sort((a, b) => izinRuang.indexOf(a.id) - izinRuang.indexOf(b.id));
    renderRuang();
    $('tombol-lapor-besar').hidden = S.akses.catat === false;
    $('menu-gerbang').hidden = !S.guru.bolehGerbang;
    $('menu-ujiwa').hidden = !(S.wa.aktif && punya(['Tim Tatib', 'Wakasek', 'Kepala Sekolah']));
    $('menu-kios').hidden = !S.akses.kios;
    $('sisi-sekolah').textContent = S.sekolah;
    bangunNav();
    aturLencana(d.menunggu || 0);
    $('memuat').hidden = true;
    if (S.guru.kelasGanda && !sesiTab.get('smkt_ganda')) {
      sesiTab.set('smkt_ganda', 1);
      toast('Kelas wali Anda belum aktif: ' + S.guru.kelasGanda + ' di tab Guru. Satu kelas hanya satu wali; hubungi Tim Tata Tertib.', 'galat', 9000);
    }
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
    // Laptop: semua menu di samping, beserta tombol akun.
    $('sisi-nav').innerHTML = S.menu.map((m) => '<a href="#' + m.id + '" data-tab="' + m.id + '">' + ikon(m.ikon) + '<span>' + m.label + '</span>' +
      (m.id === 'kotak' ? '<span class="badge" data-lencana hidden></span>' : '') + '</a>').join('');
    const g = S.guru || {};
    const rk = S.daftarRuang.filter((r) => r.kode === S.ruang)[0];
    $('sisi-akun').innerHTML = '<div class="nama">' + esc(namaPendek(g.nama)) + '</div><div class="peran">' +
      esc(rk ? rk.nama : (g.peran || []).map((p) => (p === 'Wali Kelas' && g.kelasWali ? 'Wali ' + g.kelasWali : p)).join(', ')) + '</div>' +
      (g.bolehGerbang ? '<a href="./">' + ikon('gerbang') + 'Buka Gerbang</a>' : '') +
      (S.akses.kios ? '<button type="button" data-aksi="kios">' + ikon('tablet') + 'Kios gerbang</button>' : '') +
      (S.wa.aktif && punya(['Tim Tatib', 'Wakasek', 'Kepala Sekolah']) ? '<button type="button" data-aksi="ujiwa">' + ikon('wa') + 'Kirim WA uji</button>' : '') +
      '<button type="button" data-aksi="perbarui">' + ikon('muat') + 'Perbarui data</button>' +
      '<button type="button" data-aksi="keluar">' + ikon('keluar') + 'Keluar</button>';
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
    document.body.dataset.tab = nama;
    sesiTab.set('smkt_tatib_tab', nama);
    if (location.hash !== '#' + nama) history.replaceState(null, '', '#' + nama);
    $('judul-halaman').textContent = m.judul;
    $('lembar-lainnya').hidden = true;
    const diNav = !!document.querySelector('#nav-bawah a[data-tab="' + nama + '"]');
    document.querySelectorAll('#nav-bawah [data-tab], #sisi-nav [data-tab]').forEach((x) => {
      const aktif = x.dataset.tab === nama || (x.dataset.tab === 'lainnya' && !diNav && !x.closest('#sisi-nav'));
      if (aktif) x.setAttribute('aria-current', 'page'); else x.removeAttribute('aria-current');
    });
    document.querySelectorAll('.panel').forEach((p) => { p.hidden = p.id !== 'p-' + nama; });
    ({ kartu: muatKartu, akun: muatAkun, beranda: muatBeranda, lapor: initLapor, kotak: muatTL, verifikasi: muatVerifikasi, siswa: initRiwayat, waspada: muatZona, pembinaan: muatProgram, pulih: muatPulih, absen: initIzin, ekskul: muatEkskul })[nama]();
    window.scrollTo(0, 0);
  }

  function bukaMenu() {
    const g = S.guru || {};
    $('menu-info').textContent = g.nama + ': ' + (g.peran || []).join(', ') + (g.kelasWali ? ', wali kelas ' + g.kelasWali : '');
    $('menu').hidden = false; $('tombol-menu').setAttribute('aria-expanded', 'true');
  }
  function tutupMenu() { $('menu').hidden = true; $('tombol-menu').setAttribute('aria-expanded', 'false'); }


  /* ---------------- Ruang kerja per peran ---------------- */
  function renderRuang() {
    const daftar = S.daftarRuang, kini = daftar.filter((r) => r.kode === S.ruang)[0];
    const ganda = daftar.length > 1;
    const tb = $('ruang-tombol');
    tb.hidden = !kini || !ganda;
    tb.disabled = !ganda;
    tb.innerHTML = kini ? '<span class="ruang-label">Sebagai</span><strong>' + esc(kini.nama) + '</strong>' + (ganda ? '<span class="ruang-panah" aria-hidden="true">▾</span>' : '') : '';
    tb.setAttribute('aria-label', kini ? 'Ruang kerja: ' + kini.nama + (ganda ? '. Ganti ruang kerja' : '') : 'Ruang kerja');
    const isi = daftar.map((r) => '<button type="button" role="menuitemradio" aria-checked="' + (r.kode === S.ruang) + '" data-ruang="' + esc(r.kode) + '">' +
      '<strong>' + esc(r.nama) + '</strong><small>' + esc(KET_RUANG[r.kode] || '') + '</small></button>').join('');
    $('ruang-daftar').innerHTML = isi;
    $('sisi-ruang').hidden = !ganda;
    $('sisi-ruang').innerHTML = ganda ? '<span class="sisi-ruang-judul">Bekerja sebagai</span>' + daftar.map((r) =>
      '<button type="button" data-ruang="' + esc(r.kode) + '" aria-pressed="' + (r.kode === S.ruang) + '">' + esc(r.nama) + '</button>').join('') : '';
  }
  function gantiRuang(kode) {
    $('ruang-menu').hidden = true;
    if (!kode || kode === S.ruang) return;
    S.ruang = kode;
    simpan.set('smkt_ruang', kode);
    sesiTab.hapus('smkt_tatib_awal'); sesiTab.hapus('smkt_tatib_tab'); simpan.hapus('smkt_tatib_beranda');
    history.replaceState(null, '', location.pathname + location.search);
    location.reload();
  }
  function pasangRuang() {
    $('ruang-tombol').addEventListener('click', (e) => {
      e.stopPropagation();
      if (S.daftarRuang.length < 2) return;
      const m = $('ruang-menu'); m.hidden = !m.hidden;
      $('ruang-tombol').setAttribute('aria-expanded', String(!m.hidden));
      if (!m.hidden) { tutupMenu(); const b = m.querySelector('[aria-checked="true"]') || m.querySelector('button'); if (b) b.focus(); }
    });
    [$('ruang-daftar'), $('sisi-ruang')].forEach((el) => el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ruang]'); if (b) gantiRuang(b.dataset.ruang);
    }));
    document.addEventListener('click', (e) => { if (!$('ruang-menu').hidden && !e.target.closest('#ruang-menu')) $('ruang-menu').hidden = true; });
  }

  /* =================================================================
   *  KELOLA AKUN GURU (Administrator)
   * ================================================================= */
  const AK = { data: null, saring: 'semua', cari: '', edit: null, menyimpan: false };
  const PERAN_KET = {
    'Guru Mapel': 'Melapor pelanggaran', 'Guru Wali Kelas': 'Pilih kelasnya', 'Guru Tata Tertib': 'Kasus berat, surat, masa pembinaan',
    'Koordinator Tatib': 'Semua menu Tatib', 'Guru BK': 'Pilih jenjang binaan', 'Wakil Kepala Sekolah': 'Kasus tangga pimpinan',
    'Kepala Sekolah': 'Memantau saja', 'Pembina Ekstrakurikuler': 'Pilih ekskulnya', 'Piket': 'Gerbang, izin, kios',
    'Guru Olahraga': 'Program fisik', 'Staf Kependidikan': 'Melapor pelanggaran', 'Administrator': 'Mengelola akun guru'
  };
  async function muatKartu() {
    window.SMKT_TATIB = { api: api, toast: toast, esc: esc };
    if (!window.SMKTKartu) {
      await new Promise((ok, gagal) => { const sc = document.createElement('script'); sc.src = 'kartu.js?v=20261109b'; sc.onload = ok; sc.onerror = () => gagal(new Error('Gagal memuat menu kartu')); document.head.appendChild(sc); })
        .catch((e) => toast(e.message, 'alfa'));
    }
    if (window.SMKTKartu) window.SMKTKartu.buka();
  }
  async function muatAkun() {
    if (!S.siap.akun) {
      S.siap.akun = true;
      $('ak-cari').addEventListener('input', (e) => { AK.cari = e.target.value.trim().toLowerCase(); renderAkun(); });
      $('ak-saring').addEventListener('click', (e) => {
        const b = e.target.closest('button[data-saring]'); if (!b) return;
        AK.saring = b.dataset.saring;
        $('ak-saring').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        renderAkun();
      });
      $('ak-daftar').addEventListener('click', (e) => { const b = e.target.closest('[data-baris]'); if (b) bukaFormAkun(Number(b.dataset.baris)); });
      $('ak-tambah').addEventListener('click', () => bukaFormAkun(0));
      $('ak-batal').addEventListener('click', tutupFormAkun);
      $('ak-simpan').addEventListener('click', simpanAkun);
      $('ak-peran').addEventListener('change', renderSyaratAkun);
      $('ak-riwayat-wadah').addEventListener('toggle', () => { if ($('ak-riwayat-wadah').open) muatRiwayatAkun(); });
    }
    $('ak-ket').textContent = 'Memuat daftar guru…';
    try { AK.data = await api('akun.daftar'); renderAkun(); }
    catch (e) { $('ak-ket').textContent = e.message; }
  }
  function renderAkun() {
    const d = AK.data; if (!d) return;
    const semua = d.guru;
    const tanpaEmail = semua.filter((g) => !g.email).length, nonaktif = semua.filter((g) => !g.aktif).length;
    $('ak-ket').textContent = semua.length + ' guru terdaftar' + (tanpaEmail ? ', ' + tanpaEmail + ' belum punya email sehingga belum bisa login' : '') +
      (nonaktif ? ', ' + nonaktif + ' nonaktif' : '') + '.';
    $('ak-n-email').textContent = tanpaEmail; $('ak-n-nonaktif').textContent = nonaktif;
    const daftar = semua.filter((g) => (AK.saring === 'semua' && g.aktif) || (AK.saring === 'email' && !g.email) || (AK.saring === 'nonaktif' && !g.aktif))
      .filter((g) => !AK.cari || (g.nama + ' ' + g.email + ' ' + g.kelasWali + ' ' + g.peran.join(' ')).toLowerCase().indexOf(AK.cari) > -1);
    $('ak-daftar').innerHTML = daftar.length ? daftar.map((g) => '<li><button type="button" class="ak-baris' + (g.aktif ? '' : ' nonaktif') + '" data-baris="' + g.baris + '">' +
      '<span class="ak-nama">' + esc(g.nama) + (g.email === d.saya ? ' <span class="tag">Anda</span>' : '') + '</span>' +
      '<span class="ak-email' + (g.email ? '' : ' kosong') + '">' + esc(g.email || 'Belum ada email, belum bisa login') + '</span>' +
      '<span class="ak-peran">' + g.peran.map((p) => '<span class="chip-peran' + (p === 'Administrator' ? ' admin' : '') + '">' +
        esc(p === 'Guru Wali Kelas' && g.kelasWali ? 'Wali ' + g.kelasWali : p === 'Guru BK' && g.bkJenjang.length ? 'BK kelas ' + g.bkJenjang.join(', ') : p) + '</span>').join('') +
      (g.aktif ? '' : '<span class="chip-peran mati">Nonaktif</span>') + '</span></button></li>').join('')
      : '<li class="kosong">' + (AK.cari ? 'Tidak ada guru yang cocok dengan pencarian.' : 'Tidak ada guru di daftar ini.') + '</li>';
  }
  function bukaFormAkun(baris) {
    const d = AK.data; if (!d) return;
    const g = baris ? d.guru.filter((x) => x.baris === baris)[0] : null;
    if (baris && !g) return;
    AK.edit = g ? Object.assign({}, g) : { baris: 0, email: '', nama: '', nip: '', wa: '', peran: ['Guru Mapel'], kelasWali: '', bkJenjang: [], ekskul: [], aktif: true };
    const e = AK.edit;
    $('ak-judul').textContent = g ? 'Atur akses ' + namaPendek(g.nama) : 'Tambah guru';
    $('ak-email').value = e.email; $('ak-nama').value = e.nama; $('ak-nip').value = e.nip; $('ak-wa').value = e.wa;
    $('ak-aktif').checked = e.aktif;
    $('ak-aktif-wadah').hidden = !g;
    const pemilik = {};
    d.guru.forEach((x) => { if (x.aktif && x.kelasWali && x.peran.indexOf('Guru Wali Kelas') > -1 && x.baris !== e.baris) pemilik[x.kelasWali] = namaPendek(x.nama); });
    $('ak-peran').innerHTML = d.pilihan.peran.map((p) => '<label class="opsi-peran"><input type="checkbox" value="' + esc(p) + '"' + (e.peran.indexOf(p) > -1 ? ' checked' : '') + '>' +
      '<span><strong>' + esc(p) + '</strong><small>' + esc(PERAN_KET[p] || '') + '</small></span></label>').join('');
    $('ak-kelas').innerHTML = '<option value="">Pilih kelas</option>' + d.pilihan.kelas.map((k) => '<option value="' + k + '"' + (k === e.kelasWali ? ' selected' : '') +
      (pemilik[k] ? ' disabled' : '') + '>' + k + (pemilik[k] ? ' (wali: ' + esc(pemilik[k]) + ')' : '') + '</option>').join('');
    $('ak-jenjang').innerHTML = d.pilihan.jenjang.map((j) => '<label class="centang-kecil"><input type="checkbox" value="' + j + '"' + (e.bkJenjang.indexOf(j) > -1 ? ' checked' : '') + '> Kelas ' + j + '</label>').join('');
    $('ak-ekskul').innerHTML = d.pilihan.ekskul.length ? d.pilihan.ekskul.map((x) => '<label class="centang-kecil"><input type="checkbox" value="' + esc(x) + '"' + (e.ekskul.indexOf(x) > -1 ? ' checked' : '') + '> ' + esc(x) + '</label>').join('')
      : '<p class="keterangan">Belum ada ekskul di tab Ekskul.</p>';
    $('ak-pesan').textContent = '';
    $('ak-simpan').disabled = false; $('ak-simpan').textContent = g ? 'Simpan perubahan' : 'Tambah guru';
    renderSyaratAkun();
    $('modal-akun').hidden = false;
    $('ak-' + (g ? 'email' : 'nama')).focus();
  }
  function peranTerpilih() { return Array.from($('ak-peran').querySelectorAll('input:checked')).map((x) => x.value); }
  function renderSyaratAkun() {
    const p = peranTerpilih();
    $('ak-kelas-wadah').hidden = p.indexOf('Guru Wali Kelas') === -1;
    $('ak-jenjang-wadah').hidden = p.indexOf('Guru BK') === -1;
    $('ak-ekskul-wadah').hidden = p.indexOf('Pembina Ekstrakurikuler') === -1;
    const saya = AK.edit && AK.edit.email && AK.edit.email === AK.data.saya;
    $('ak-diri').hidden = !saya;
  }
  function tutupFormAkun() { $('modal-akun').hidden = true; AK.edit = null; }
  async function simpanAkun() {
    if (AK.menyimpan || !AK.edit) return;
    const galat = (x) => { $('ak-pesan').textContent = x; };
    const e = AK.edit, peran = peranTerpilih();
    const isi = {
      baris: e.baris, emailLama: e.email, namaLama: e.nama,
      email: $('ak-email').value.trim(), nama: $('ak-nama').value.trim(), nip: $('ak-nip').value.trim(), wa: $('ak-wa').value.trim(),
      peran: peran, kelasWali: $('ak-kelas').value,
      bkJenjang: Array.from($('ak-jenjang').querySelectorAll('input:checked')).map((x) => Number(x.value)),
      ekskul: Array.from($('ak-ekskul').querySelectorAll('input:checked')).map((x) => x.value),
      aktif: $('ak-aktif').checked
    };
    if (isi.nama.length < 3) { $('ak-nama').focus(); return galat('Tulis nama lengkap guru.'); }
    if (isi.email && !/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(isi.email)) { $('ak-email').focus(); return galat('Periksa penulisan email.'); }
    if (!peran.length) return galat('Pilih minimal satu peran.');
    if (peran.indexOf('Guru Wali Kelas') > -1 && !isi.kelasWali) { $('ak-kelas').focus(); return galat('Pilih kelas untuk Guru Wali Kelas.'); }
    if (peran.indexOf('Pembina Ekstrakurikuler') > -1 && !isi.ekskul.length) return galat('Pilih ekskul yang dibina.');
    AK.menyimpan = true;
    const b = $('ak-simpan'); b.disabled = true; b.textContent = 'Menyimpan…';
    try {
      const d = await api('akun.simpan', isi);
      tutupFormAkun();
      toast(d.aksi + ': ' + namaPendek(d.guru.nama) + '. Berlaku saat guru itu membuka atau memperbarui aplikasi.', 'hadir', 6000);
      await muatAkun();
      if ($('ak-riwayat-wadah').open) muatRiwayatAkun();
    } catch (er) { galat(er.message); b.disabled = false; b.textContent = e.baris ? 'Simpan perubahan' : 'Tambah guru'; }
    AK.menyimpan = false;
  }
  async function muatRiwayatAkun() {
    $('ak-riwayat').innerHTML = '<li class="memuat">Memuat…</li>';
    try {
      const d = await api('akun.riwayat');
      $('ak-riwayat').innerHTML = d.riwayat.length ? d.riwayat.map((r) => '<li><strong>' + esc(r.aksi) + '</strong>: ' + esc(r.target) +
        '<span class="meta">' + esc(r.waktu) + ' oleh ' + esc(namaPendek(r.admin)) + '</span>' +
        (r.sebelum ? '<span class="meta">Sebelum: ' + esc(r.sebelum) + '</span>' : '') + '<span class="meta">Sesudah: ' + esc(r.sesudah) + '</span></li>').join('')
        : '<li class="kosong">Belum ada perubahan akses yang tercatat.</li>';
    } catch (e) { $('ak-riwayat').innerHTML = '<li class="kosong">' + esc(e.message) + '</li>'; }
  }

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
    const ruangKini = S.daftarRuang.filter((r) => r.kode === S.ruang)[0];
    $('sambut-peran').innerHTML = ruangKini ? '<li>Bekerja sebagai ' + esc(ruangKini.nama) + '</li>' :
      (S.guru.peran || []).map((p) => '<li>' + esc(p === 'Wali Kelas' && S.guru.kelasWali ? 'Wali ' + S.guru.kelasWali : p) + '</li>').join('');
    wadahBeranda();
    if (!B.data) {
      const lama = simpan.get('smkt_tatib_beranda', null);
      const hari = (w) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date(w));
      if (simpananCocok(lama) && hari(lama.waktu) === hari(Date.now())) B.data = lama.data;   // hanya data hari ini
    }
    if (!B.data) $('b-lain').innerHTML = '<p class="memuat">Memuat ringkasan hari ini…</p>';
    else renderBeranda();
    if (DS.data) renderDasbor();
    muatDasbor();
    jadwalDasbor();
    try {
      B.data = await api('tatib.beranda');
      try { simpan.set('smkt_tatib_beranda', { sesi: S.sesi, ruang: S.ruang, waktu: Date.now(), data: B.data }); } catch (e) { /* penyimpanan penuh */ }
      aturLencana(B.data.menunggu);
      if (S.tab === 'beranda') renderBeranda();
    } catch (e) {
      if (!B.data) $('b-lain').innerHTML = '<p class="memuat">' + esc(e.message) + '</p>';
    }
  }
  function wadahBeranda() {
    if (!$('b-dasbor')) $('b-isi').innerHTML = '<div id="b-dasbor"></div><div id="b-lain" class="b-lain"></div>';
    return $('b-lain');
  }
  function barisAksi(href, kelasLingkar, ik, judul, ket, angka) {
    return '<li><a href="' + href + '"><span class="lingkar ' + kelasLingkar + '">' + ikon(ik) + '</span>' +
      '<span class="teks"><strong>' + esc(judul) + '</strong><small>' + esc(ket) + '</small></span>' +
      '<span class="angka' + (angka ? '' : ' nol') + '">' + angka + '</span>' + ikon('kanan') + '</a></li>';
  }
  function renderBeranda() {
    const d = B.data;
    let h = '<section class="b-aksi"><h2 class="judul-bagian">Perlu perhatian</h2><ul class="baris-aksi">';
    if (S.akses.tindakLanjut) {
      h += barisAksi('#kotak', 'emas', 'kotak', 'Kotak Masuk', d.menunggu ? 'Kasus menunggu tindakan Anda' :
        'Tidak ada kasus yang menunggu' + (d.tembusan ? ', ' + d.tembusan + ' tembusan minggu ini' : ''), d.menunggu);
    }
    if (d.waspada) {
      h += barisAksi('#waspada', 'merah', 'waspada', 'Waspada', d.waspada.perluSurat ? d.waspada.perluSurat + ' siswa perlu surat pernyataan' : 'Siswa yang mencapai level tindakan', d.waspada.jumlah);
    }
    h += barisAksi('#lapor', '', 'lapor', 'Laporan saya, 7 hari', d.laporanSaya ? d.sendiriSaya + ' selesai Anda tangani sendiri' : 'Belum ada laporan minggu ini', d.laporanSaya);
    h += '</ul></section>';

    if (d.terlambat) {
      h += '<section class="b-telat">';
      const t = d.terlambat, wa = t.wa || S.wa || {};
      h += '<h2 class="judul-bagian">Terlambat hari ini<small>batas masuk ' + esc(t.batas || S.batasMasuk) + '</small></h2>';
      if (wa.aktif) {
        h += '<p class="info-wa">' + ikon('wa') + '<span>Orang tua dikabari otomatis lewat WA begitu anaknya di-scan terlambat. Rekap ke wali kelas dan pimpinan dikirim pukul ' + esc(wa.jamRekap) + '.</span></p>';
        if (wa.galat) h += '<p class="info-wa galat">' + ikon('awas') + '<span>WA otomatis tertunda sejak ' + esc(wa.galatJam) + ': ' + esc(wa.galat) +
          '. Pesan dicoba lagi tiap 15 menit. Bila berlanjut, periksa perangkat di Fonnte atau pakai tombol WA.</span></p>';
      }
      if (!t.siswa.length) h += '<p class="keterangan">Belum ada siswa terlambat hari ini.</p>';
      h += '<div class="b-terlambat">';
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
      h += '</div></section>';
    }

    h += '<section class="b-tangga"><h2 class="judul-bagian">Tangga pembinaan</h2><div class="kartu-tangga">' + tanggaHtml(0).replace('class="tangga"', 'class="tangga ringkas"') +
      '<p>Pelanggaran ringan cukup ditangani guru yang menemukan. Laporan naik ke tangga berikutnya bila berulang, siswa membangkang, kategorinya berat, atau poinnya naik level.</p>' +
      '<details><summary>Siapa melakukan apa</summary><dl>' + S.tangga.map((x) => '<div><dt>' + x.tangga + '. ' + esc(x.peran) + '</dt><dd>' + esc(x.tugas) +
        (x.kapan ? ' Masuk bila ' + esc(x.kapan.charAt(0).toLowerCase() + x.kapan.slice(1)) + '.' : '') + '</dd></div>').join('') + '</dl></details></div></section>';
    wadahBeranda().innerHTML = h;
  }

  /* =================================================================
   *  DASBOR (bagian atas Beranda): kehadiran hari ini, tren, scan terbaru
   * ================================================================= */
  const DS = { data: null, timer: null, memuat: false };
  const persen = (a, b) => (b ? Math.round(a / b * 100) : 0);
  const angka = (n) => new Intl.NumberFormat('id-ID').format(n || 0);
  const titikJam = (j) => String(j || '').replace(':', '.');
  async function muatDasbor() {
    if (!S.akses.terlambat || DS.memuat) return;
    DS.memuat = true;
    try { DS.data = await api('tatib.dasbor'); if (S.tab === 'beranda') renderDasbor(); }
    catch (e) { /* data sebelumnya tetap tampil */ }
    finally { DS.memuat = false; }
  }
  function jadwalDasbor() {
    clearInterval(DS.timer);
    DS.timer = setInterval(() => { if (S.tab === 'beranda' && document.visibilityState === 'visible') muatDasbor(); }, 30000);
  }
  function statTile(kelas, label, nilai, ket, href) {
    const tag = href ? 'a' : 'div';
    return '<' + tag + ' class="stat"' + (href ? ' href="' + href + '"' : '') + '><span class="stat-label">' + (kelas ? '<i class="tanda s-' + kelas + '"></i>' : '') + esc(label) + '</span>' +
      '<span class="stat-nilai">' + angka(nilai) + '</span><span class="stat-ket">' + esc(ket) + '</span></' + tag + '>';
  }
  function segHtml(bagian, label) {
    return '<span class="seg" role="img" aria-label="' + esc(label + ': ' + bagian.map((b) => b[1] + ' ' + b[2].toLowerCase()).join(', ')) + '">' +
      bagian.filter((b) => b[1] > 0).map((b) => '<i class="s-' + b[0] + '" style="flex-grow:' + b[1] + '" title="' + esc(b[2] + ': ' + b[1]) + '"></i>').join('') + '</span>';
  }
  function pathKolom(x, y, w, h, r) {
    r = Math.min(r, h, w / 2);
    return 'M' + x + ',' + (y + h) + 'V' + (y + r) + 'Q' + x + ',' + y + ' ' + (x + r) + ',' + y + 'H' + (x + w - r) + 'Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) + 'V' + (y + h) + 'Z';
  }
  function trenSvg(tren, lebarWadah) {
    const W = Math.max(280, Math.round(lebarWadah || 340)), H = 168, tepi = 8, bawah = 30, atas = 24;
    const maks = Math.max(1, ...tren.map((t) => t.terlambat));
    const slot = (W - tepi * 2) / tren.length, lebar = Math.min(24, slot * 0.45);
    let g = '<svg class="tren" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc('Siswa terlambat per hari: ' + tren.map((t) => t.label + ' ' + t.terlambat).join(', ')) + '">' +
      '<line class="garis" x1="' + tepi + '" x2="' + (W - tepi) + '" y1="' + (H - bawah) + '" y2="' + (H - bawah) + '"/>';
    tren.forEach((t, i) => {
      const tinggi = Math.round((H - bawah - atas) * t.terlambat / maks);
      const x = tepi + slot * i + (slot - lebar) / 2, y = H - bawah - tinggi, cx = x + lebar / 2;
      g += '<g tabindex="0"><title>' + esc(t.label + ': ' + t.terlambat + ' terlambat dari ' + t.masuk + ' siswa yang masuk') + '</title>' +
        (tinggi > 0 ? '<path class="batang" d="' + pathKolom(x, y, lebar, tinggi, 4) + '"/>' : '') +
        '<rect x="' + (tepi + slot * i) + '" y="' + atas + '" width="' + slot + '" height="' + (H - atas - bawah) + '" fill="transparent"/>' +
        '<text class="nilai" x="' + cx + '" y="' + (y - 7) + '" text-anchor="middle">' + t.terlambat + '</text>' +
        '<text class="label' + (t.hariIni ? ' ini' : '') + '" x="' + cx + '" y="' + (H - 9) + '" text-anchor="middle">' + esc(t.hariIni ? 'Hari ini' : t.label) + '</text></g>';
    });
    return g + '</svg>';
  }
  function renderDasbor() {
    const d = DS.data, w = $('b-dasbor');
    if (!w) return;
    if (!d || d.cakupan === 'pribadi') { w.innerHTML = ''; return; }
    const r = d.ringkas, masuk = r.hadir + r.terlambat;
    const cakup = d.cakupan === 'kelas' ? 'kelas ' + d.kelas : 'semua kelas';
    const bagian = [['hadir', r.hadir, 'Hadir tepat waktu'], ['telat', r.terlambat, 'Terlambat'], ['izin', r.izinSakit, 'Izin atau sakit'], ['alfa', r.alfa, 'Alfa'], ['belum', r.belum, 'Belum tercatat']];
    let h = '<div class="dasbor-stat">' +
      '<div class="stat utama"><span class="stat-label">Sudah masuk, ' + esc(cakup) + '</span><span class="stat-nilai">' + angka(masuk) + '</span>' +
      '<span class="stat-ket">dari ' + angka(r.aktif) + ' siswa aktif (' + persen(masuk, r.aktif) + '%), data pukul ' + esc(titikJam(d.jam)) + '</span>' +
      '<span class="stat-batang">' + bagian.slice(0, 4).filter((b) => b[1] > 0).map((b) => '<i class="s-' + b[0] + '" style="width:' + (b[1] / Math.max(1, r.aktif) * 100).toFixed(2) + '%"></i>').join('') + '</span></div>' +
      statTile('telat', 'Terlambat', r.terlambat, 'masuk setelah pukul ' + titikJam(d.batas)) +
      statTile('belum', 'Belum tercatat', r.belum, 'belum scan dan tanpa keterangan') +
      statTile('izin', 'Izin atau sakit', r.izinSakit, r.alfa ? r.alfa + ' siswa alfa' : 'dicatat wali kelas') +
      (S.akses.tindakLanjut ? statTile('', 'Kasus menunggu', d.menunggu, d.pelanggaran.hariIni + ' pelanggaran dilaporkan hari ini', '#kotak')
        : statTile('', 'Pelanggaran hari ini', d.pelanggaran.hariIni, d.pelanggaran.minggu + ' dalam 7 hari terakhir')) +
      '</div><div class="dasbor-grid">';

    h += '<article class="kartu-d d-kelas"><header><h2>Kehadiran per kelas</h2><p>pukul ' + esc(titikJam(d.jam)) + '</p></header>' +
      '<ul class="legenda">' + bagian.map((b) => '<li><i class="s-' + b[0] + '"></i>' + esc(b[2]) + '</li>').join('') + '</ul>' +
      '<ul class="per-kelas">' + d.perKelas.map((k) => '<li><span class="kls">' + esc(k.kelas) + '</span>' +
        segHtml([['hadir', k.hadir, 'Hadir'], ['telat', k.terlambat, 'Terlambat'], ['izin', k.izinSakit, 'Izin atau sakit'], ['alfa', k.alfa, 'Alfa'], ['belum', k.belum, 'Belum']], k.kelas) +
        '<span class="jml">' + (k.hadir + k.terlambat) + '/' + k.aktif + '</span></li>').join('') + '</ul>' +
      '<details class="tabel-rincian"><summary>Lihat sebagai tabel</summary><table><thead><tr><th scope="col">Kelas</th><th scope="col">Hadir</th><th scope="col">Terlambat</th>' +
      '<th scope="col">Izin/sakit</th><th scope="col">Alfa</th><th scope="col">Belum</th></tr></thead><tbody>' +
      d.perKelas.map((k) => '<tr><td>' + esc(k.kelas) + '</td><td>' + k.hadir + '</td><td>' + k.terlambat + '</td><td>' + k.izinSakit + '</td><td>' + k.alfa + '</td><td>' + k.belum + '</td></tr>').join('') +
      '</tbody></table></details></article>';

    h += '<article class="kartu-d d-log"><header><h2>Scan terbaru</h2>' + (S.akses.verifikasi ? '<a href="#verifikasi">Verifikasi foto</a>' : '') + '</header>' +
      (d.log.length ? '<ul class="log-scan">' + d.log.slice(0, 8).map((x) => '<li><span class="thumb"' + (x.adaFoto ? ' data-fs="' + esc(x.idScan) + '"' : '') + '>' + esc(inisial(x.nama)) + '</span>' +
        '<span><span class="nm">' + esc(x.nama) + '</span><span class="kl">' + esc(x.kelas) + (x.kios ? ', kios ' + esc(x.kios) : '') + '</span></span>' +
        '<span><span class="chip ' + (x.status === 'Terlambat' ? 'telat' : 'hadir') + '">' + esc(x.status) + '</span><span class="log-jam">' + esc(titikJam(x.jam)) + '</span></span></li>').join('') + '</ul>'
        : '<p class="kosong-d">Belum ada scan hari ini.</p>') + '</article>';

    h += '<article class="kartu-d d-tren"><header><h2>Terlambat per hari</h2><p>' + d.tren.length + ' hari sekolah terakhir</p></header>' +
      '<div class="tren-wadah">' + (d.tren.length ? '' : '<p class="kosong-d">Belum ada data kehadiran.</p>') + '</div></article></div>';
    w.innerHTML = h;
    gambarTren();
    muatFotoScan(w);
  }
  /** Grafik tren digambar selebar kartunya, agar teks dan batang tidak ikut membesar. */
  function gambarTren() {
    const el = document.querySelector('#b-dasbor .tren-wadah');
    if (!el || !DS.data || !DS.data.tren.length) return;
    el.innerHTML = trenSvg(DS.data.tren, el.clientWidth);
  }
  let timerUkuran = null;
  window.addEventListener('resize', () => { clearTimeout(timerUkuran); timerUkuran = setTimeout(gambarTren, 150); });

  /* ---------------- Foto scan (dimuat per 10, disimpan di memori) ---------------- */
  const FS = new Map();
  function muatFotoScan(akar) {
    const el = Array.from((akar || document).querySelectorAll('[data-fs]'));
    const perlu = Array.from(new Set(el.map((e) => e.dataset.fs))).filter((id) => id && !FS.has(id));
    for (let i = 0; i < perlu.length; i += 10) {
      const batch = perlu.slice(i, i + 10);
      const janji = api('tatib.fotoScan', { ids: batch }).then((d) => d.foto || {}).catch(() => ({}));
      batch.forEach((id) => FS.set(id, janji.then((f) => (f[id] && f[id].data) || '')));
    }
    el.forEach((e) => {
      const j = FS.get(e.dataset.fs);
      if (j) j.then((data) => {
        if (!data || e.querySelector('img')) return;
        Array.from(e.childNodes).forEach((n) => { if (n.nodeType === 3) n.remove(); });
        const im = new Image(); im.alt = ''; im.src = data; e.prepend(im);
      });
    });
  }

  /* =================================================================
   *  VERIFIKASI FOTO SCAN (wali kelas, BK, Tim Tatib, pimpinan)
   * ================================================================= */
  const V = { data: null, kelas: '', pasang: false, titip: null };
  async function muatVerifikasi() {
    if (!V.pasang) {
      V.pasang = true;
      const t = $('v-tanggal'); t.max = hariIni(0); t.min = hariIni(-7); t.value = hariIni(0);
      t.addEventListener('change', () => { if (t.value) muatVerifikasi(); });
      $('v-kelas').addEventListener('change', () => { V.kelas = $('v-kelas').value; muatVerifikasi(); });
      $('v-semua').addEventListener('click', tandaiSemuaSesuai);
      $('v-daftar').addEventListener('click', klikVerifikasi);
    }
    $('v-ket').textContent = 'Memuat foto scan…';
    try {
      const d = await api('tatib.verifikasi', { tanggal: $('v-tanggal').value, kelas: V.kelas });
      V.data = d; V.kelas = d.kelas;
      $('v-kelas-wadah').hidden = d.daftarKelas.length < 2;
      $('v-kelas').innerHTML = d.daftarKelas.map((k) => '<option' + (k === d.kelas ? ' selected' : '') + '>' + esc(k) + '</option>').join('');
      if (S.tab === 'verifikasi') renderVerifikasi();
    } catch (e) {
      $('v-ket').textContent = e.message; $('v-daftar').innerHTML = ''; $('v-tanpa').innerHTML = ''; $('v-tanpa-judul').hidden = true;
    }
  }
  function kartuScan() {
    const out = [];
    V.data.siswa.forEach((s) => s.scan.filter((x) => x.status !== 'Ditolak').forEach((x) => out.push({ s: s, x: x })));
    return out.sort((a, b) => a.x.jam.localeCompare(b.x.jam));
  }
  function renderVerifikasi() {
    const d = V.data, kartu = kartuScan();
    const belum = kartu.filter((k) => !k.x.verifikasi);
    const tgl = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(d.tanggal + 'T00:00:00'));
    $('v-ket').textContent = kartu.length
      ? 'Kelas ' + d.kelas + ', ' + tgl + ': ' + kartu.length + ' foto scan, ' + d.ringkas.sesuai + ' sesuai' + (d.ringkas.titip ? ', ' + d.ringkas.titip + ' titip absen' : '') +
        '. Bandingkan wajah di foto scan dengan foto siswa.'
      : 'Kelas ' + d.kelas + ', ' + tgl + ': belum ada scan dari kios gerbang.';
    $('v-semua').hidden = !belum.length;
    $('v-semua').textContent = 'Tandai ' + belum.length + ' foto sesuai';
    $('v-daftar').innerHTML = kartu.map((k) => {
      const s = k.s, x = k.x, titip = x.verifikasi === 'Titip absen';
      return '<li class="v-kartu' + (x.verifikasi === 'Sesuai' ? ' sesuai' : titip ? ' titip' : '') + '" data-id="' + esc(x.idScan) + '" data-nis="' + esc(s.nis) + '">' +
        '<div class="v-foto"><button type="button" data-aksi="lihat" aria-label="Perbesar foto scan ' + esc(s.nama) + '"><span class="fs"' + (x.adaFoto ? ' data-fs="' + esc(x.idScan) + '"' : '') + '>' + (x.adaFoto ? 'Memuat' : 'Tanpa foto') + '</span><span class="tag">Scan ' + esc(titikJam(x.jam)) + '</span></button>' +
        '<button type="button" data-aksi="lihat" aria-label="Perbesar foto ' + esc(s.nama) + '"><span class="foto-siswa" data-foto="' + esc(s.nis) + '">' + esc(inisial(s.nama)) + '</span><span class="tag">Foto siswa</span></button></div>' +
        '<div class="v-info"><strong>' + esc(s.nama) + '</strong><span>' + esc((x.status === 'Duplikat' ? 'Scan ulang' : x.status) + ' pukul ' + titikJam(x.jam) + (x.kios ? ', kios ' + x.kios : '')) + '</span></div>' +
        (titip ? '<p class="v-catatan">Titip absen. ' + esc(x.catatan) + '</p>' :
          '<div class="v-tombol"><button type="button" data-aksi="sesuai" aria-pressed="' + (x.verifikasi === 'Sesuai') + '">' + ikon('cek') + ' Sesuai</button>' +
          '<button type="button" data-aksi="titip" class="merah">Titip absen</button></div>') + '</li>';
    }).join('');
    const tanpa = d.siswa.filter((s) => !s.scan.some((x) => x.status !== 'Ditolak'));
    $('v-tanpa-judul').hidden = !tanpa.length;
    $('v-tanpa').innerHTML = tanpa.map((s) => '<li><span>' + esc(s.nama) + '</span><span class="kl">' +
      esc(s.status === 'Hadir' || s.status === 'Terlambat' ? s.status + ' ' + titikJam(s.jam) + ', dicatat tanpa foto' : s.status || 'Belum tercatat') + '</span></li>').join('');
    muatFotoScan($('v-daftar'));
    kartu.forEach((k) => muatFoto(k.s.nis));
  }
  function cariKartu(id) { return kartuScan().filter((k) => k.x.idScan === id)[0]; }
  async function klikVerifikasi(e) {
    const b = e.target.closest('button[data-aksi]'); if (!b) return;
    const li = b.closest('li'), k = cariKartu(li.dataset.id); if (!k) return;
    if (b.dataset.aksi === 'lihat') { lihatFoto(k); return; }
    if (b.dataset.aksi === 'titip') { bukaTitip(k); return; }
    const jadi = k.x.verifikasi === 'Sesuai' ? '' : 'Sesuai';
    b.disabled = true;
    try {
      await api('tatib.tandaiVerifikasi', { ids: [k.x.idScan], status: jadi });
      k.x.verifikasi = jadi;
      V.data.ringkas.sesuai += jadi ? 1 : -1;
      renderVerifikasi();
    } catch (er) { toast(er.message, 'galat', 5000); b.disabled = false; }
  }
  async function tandaiSemuaSesuai() {
    const belum = kartuScan().filter((k) => !k.x.verifikasi);
    if (!belum.length) return;
    $('v-semua').disabled = true;
    try {
      await api('tatib.tandaiVerifikasi', { ids: belum.map((k) => k.x.idScan), status: 'Sesuai' });
      belum.forEach((k) => { k.x.verifikasi = 'Sesuai'; });
      V.data.ringkas.sesuai += belum.length;
      renderVerifikasi();
      toast(belum.length + ' foto ditandai sesuai.', 'hadir');
    } catch (er) { toast(er.message, 'galat', 5000); }
    finally { $('v-semua').disabled = false; }
  }
  function figur(isi, keterangan) { return '<figure>' + isi + '<figcaption>' + esc(keterangan) + '</figcaption></figure>'; }
  function lihatFoto(k) {
    const fs = FS.get(k.x.idScan);
    $('foto-besar').innerHTML = figur('<div class="ganti" data-besar="scan">Tanpa foto</div>', 'Scan pukul ' + titikJam(k.x.jam)) +
      figur('<div class="ganti" data-besar="resmi">' + esc(inisial(k.s.nama)) + '</div>', k.s.nama);
    $('modal-foto').hidden = false;
    const ganti = (sel, data) => { const el = $('foto-besar').querySelector(sel); if (data && el) { const im = new Image(); im.alt = ''; im.src = data; el.replaceWith(im); } };
    if (fs) fs.then((d) => ganti('[data-besar="scan"]', d));
    if (S.foto.has(k.s.nis)) S.foto.get(k.s.nis).then((d) => ganti('[data-besar="resmi"]', d));
  }

  /* ---------------- Titip absen ---------------- */
  function bukaTitip(k) {
    V.titip = { k: k, pelaku: null };
    $('titip-pesan').textContent = '';
    $('titip-tindakan').value = '';
    $('titip-banding').innerHTML = figur('<div class="ganti fs" data-fs="' + esc(k.x.idScan) + '">Tanpa foto</div>', 'Foto scan ' + titikJam(k.x.jam)) +
      figur('<div class="ganti"><span class="foto-siswa" data-foto="' + esc(k.s.nis) + '">' + esc(inisial(k.s.nama)) + '</span></div>', 'Pemilik kartu: ' + k.s.nama);
    $('titip-ket').textContent = 'Kartu milik ' + k.s.nama + ' dipindai pukul ' + titikJam(k.x.jam) + '. Pilih siswa yang tampak di foto scan. Keduanya dicatat melanggar, dan ' +
      k.s.nama + ' dicatat Alfa hari itu.';
    $('titip-terpilih').hidden = true; $('titip-pilih').hidden = false;
    pemilihSiswa($('titip-pilih'), { id: 'tp', label: 'Siswa yang tampak di foto', saring: (y) => y.nis !== k.s.nis, pilih: (y) => {
      V.titip.pelaku = y;
      $('titip-pilih').hidden = true; $('titip-terpilih').hidden = false;
      $('titip-terpilih').innerHTML = '<span><strong>' + esc(y.nama) + '</strong><br><span class="redup">' + esc(y.kelas) + ', NIS ' + esc(y.nis) + '</span></span><button type="button" class="tautan" id="titip-ganti">Ganti</button>';
      $('titip-ganti').onclick = () => { V.titip.pelaku = null; $('titip-terpilih').hidden = true; $('titip-pilih').hidden = false; };
    } });
    const daftar = Array.from(S.master.values()).sort((a, b) => URUT_KATEGORI.indexOf(a.kategori) - URUT_KATEGORI.indexOf(b.kategori) || a.nama.localeCompare(b.nama));
    let pilih = V.data.idPlgTitip && S.master.has(V.data.idPlgTitip) ? V.data.idPlgTitip : '';
    if (!pilih) { const m = daftar.filter((x) => /titip|absen|kehadiran|palsu|memalsu/i.test(x.nama))[0]; if (m) pilih = m.id; }
    $('titip-plg').innerHTML = '<option value="">Pilih jenis pelanggaran</option>' + daftar.map((m) => '<option value="' + esc(m.id) + '"' + (m.id === pilih ? ' selected' : '') + '>' +
      esc(m.nama + ' (' + m.kategori + ', ' + m.bobot + ' poin)') + '</option>').join('');
    infoNaikTitip();
    $('modal-titip').hidden = false;
    muatFotoScan($('titip-banding'));
    muatFoto(k.s.nis);
  }
  /** Keterangan aturan temuan berulang di bawah pilihan jenis pelanggaran. */
  function infoNaikTitip() {
    const el = $('titip-naik'), b = V.data && S.master.get(V.data.idPlgTitipBerulang);
    const aktif = !!b && $('titip-plg').value === V.data.idPlgTitip;
    el.hidden = !aktif;
    el.textContent = aktif ? 'Siswa yang sudah pernah tercatat titip absen dalam periode ini otomatis dicatat sebagai "' + b.nama + '" (' + b.kategori + ', ' + b.bobot + ' poin).' : '';
  }
  function tutupTitip() { $('modal-titip').hidden = true; V.titip = null; }
  async function simpanTitip() {
    const t = V.titip; if (!t) return;
    if (!t.pelaku) { $('titip-pesan').textContent = 'Pilih siswa yang tampak di foto scan.'; return; }
    if (!$('titip-plg').value) { $('titip-pesan').textContent = 'Pilih jenis pelanggaran untuk titip absen.'; return; }
    const b = $('titip-simpan'); b.disabled = true; $('titip-pesan').textContent = '';
    try {
      const d = await api('tatib.titipAbsen', { idScan: t.k.x.idScan, nisPelaku: t.pelaku.nis, idPlg: $('titip-plg').value, tindakan: $('titip-tindakan').value.trim() });
      tutupTitip();
      const naik = [d.pemilik, d.pelaku].filter((x) => x.berulang).map((x) => x.nama);
      toast('Titip absen dicatat: ' + d.pemilik.nama + ' dan ' + d.pelaku.nama + ' (' + d.pelanggaran + ').' +
        (naik.length ? ' Temuan berulang: ' + naik.join(' dan ') + '.' : ''), 'hadir', 8000);
      muatVerifikasi();
    } catch (er) { $('titip-pesan').textContent = er.message; }
    finally { b.disabled = false; }
  }

  /* ---------------- Kios gerbang (daftar & cabut) ---------------- */
  async function bukaKios() {
    tutupMenu();
    $('lembar-kios').hidden = false;
    const ul = $('kios-daftar');
    ul.innerHTML = '<li class="kosong">Memuat…</li>';
    try {
      const d = await api('kios.daftar');
      ul.innerHTML = d.kios.length ? d.kios.map((k) => '<li><span>' + esc(k.nama) + '<small>' + esc('Diaktifkan ' + namaPendek(k.oleh) + ' pada ' + k.dibuat +
        (k.terakhir ? ', terakhir dipakai ' + k.terakhir : '') + (k.kedaluwarsa ? '. Sudah kedaluwarsa.' : '. Berlaku sampai ' + k.berlakuSampai + '.')) + '</small></span>' +
        '<button type="button" class="tautan merah" data-cabut="' + esc(k.id) + '">Cabut</button></li>').join('') : '<li class="kosong">Belum ada kios aktif.</li>';
    } catch (e) { ul.innerHTML = '<li class="kosong">' + esc(e.message) + '</li>'; }
  }
  async function klikKios(e) {
    if (e.target === $('lembar-kios')) { $('lembar-kios').hidden = true; return; }
    const b = e.target.closest('[data-cabut]'); if (!b) return;
    if (b.dataset.yakin !== '1') { b.dataset.yakin = '1'; b.textContent = 'Yakin cabut?'; return; }
    b.disabled = true;
    try { await api('kios.cabut', { id: b.dataset.cabut }); toast('Kios dicabut. Tablet itu perlu diaktifkan ulang.', 'hadir', 4000); bukaKios(); }
    catch (er) { toast(er.message, 'galat', 5000); b.disabled = false; }
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
    C.foto = pasangInputFoto('c-foto-input', 'c-foto-pratinjau', 'c-foto-hapus', 'c-foto-label');
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
    if (C.foto) C.foto.atur('');
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
        penanganan: C.penanganan, teruskanKe: C.ke || k.ke, idCatat: C.idCatat, foto: C.foto ? C.foto.data : '' });
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
      '<p>Total poin sekarang <strong>' + d.total + '</strong> ' + lencanaLevel(d.level) + '</p>' +
      (d.foto ? '<p class="redup">Foto bukti tersimpan dan masuk ke berkas bukti SP.</p>' : '');
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
    if (tunggu && jenisPbnKasus(it)) h += '<button type="button" class="tombol tombol-garis" data-aksi="pbn">' + ikon('surat') + 'Pernyataan siswa</button>';
    if (tunggu && S.akses.aturProgram) h += '<button type="button" class="tombol tombol-garis" data-aksi="program">' + ikon('pembinaan') + 'Masa pembinaan</button>';
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
  /** Kasus di tangga wali kelas/BK yang bisa dibuatkan pernyataan pembinaan oleh guru ini. */
  function jenisPbnKasus(it) {
    if ((it.tangga === 2 || it.ke === 'Wali Kelas') && punya(['Wali Kelas']) && S.guru.kelasWali && S.guru.kelasWali === it.kelas) return 'wali';
    if ((it.tangga === 3 || it.ke === 'BK') && punya(['BK'])) return 'bk';
    return '';
  }
  async function klikTL(e) {
    const a = e.target.closest('[data-aksi]');
    if (!a) return;
    const li = a.closest('.kasus');
    if (a.dataset.aksi === 'riwayat') { bukaRiwayatDari(a.dataset.nis); return; }
    if (a.dataset.aksi === 'program') {
      const it = T.item.filter((x) => x.idLog === li.dataset.id)[0];
      if (it) bukaFormProgram({ nis: it.nis, refKasus: it.idLog, pelanggaran: it.pelanggaran + ' (' + it.tanggal + ')' });
      return;
    }
    if (a.dataset.aksi === 'pbn') {
      const it = T.item.filter((x) => x.idLog === li.dataset.id)[0];
      if (!it) return;
      const kode = jenisPbnKasus(it);
      bukaPernyataan(it.nis, { jenis: kode, pilih: [it.idLog], refKasus: it.idLog, sesudah: (d) => {
        const f = li.querySelector('.form-tl'); if (!f) return;
        f.hidden = false;
        const ta = f.querySelector('textarea');
        if (!ta.value.trim()) ta.value = (kode === 'bk' ? 'Bimbingan konseling diberikan' : 'Nasihat dan bimbingan khusus diberikan') + '; siswa menandatangani pernyataan (' + d.id + ').';
      } });
      return;
    }
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
    $('r-detail').addEventListener('click', async (e) => {
      const a = e.target.closest('[data-aksi]');
      if (!a) return;
      const aksi = a.dataset.aksi;
      if (aksi === 'lapor-siswa') { const s = S.siswa.get(a.dataset.nis); buka('lapor'); resetLapor(false); pilihSiswaLapor(s); return; }
      if (aksi === 'foto-bukti') { lihatFotoBukti(a.dataset.id, a.dataset.judul); return; }
      if (aksi === 'pdf-pbn') { pdfPernyataan(a, a.dataset.id); return; }
      if (aksi === 'pernyataan') { const nis = a.dataset.nis; bukaPernyataan(nis, { sesudah: () => bukaRiwayat(nis, true) }); return; }
      if (aksi === 'program') { bukaFormProgram({ nis: a.dataset.nis }); return; }
      if (aksi === 'lihat-prg') { PR.buka = a.dataset.id; PR.filter = 'aktif'; return; }
      if (aksi === 'berkas') {
        a.disabled = true; a.textContent = 'Menyusun berkas…';
        $('r-berkas').innerHTML = '<p class="keterangan">Menyusun PDF berisi rekap pelanggaran, foto bukti, dan pernyataan. Bisa sampai setengah menit.</p>';
        try {
          const p = await buatBerkas(a.dataset.nis, 0, '');
          $('r-berkas').innerHTML = tautanPdf('Berkas bukti siap (' + p.jumlah.pelanggaran + ' pelanggaran, ' + p.jumlah.foto + ' foto, ' + p.jumlah.pembinaan + ' pernyataan)', p);
        } catch (er) { $('r-berkas').innerHTML = '<p class="pesan-galat">' + esc(er.message) + '</p>'; }
        a.disabled = false; a.textContent = 'Buat berkas bukti (PDF)';
      }
    });
  }
  function bukaRiwayatDari(nis) { buka('siswa'); bukaRiwayat(nis); }
  async function bukaRiwayat(nis, diam) {
    const el = $('r-detail');
    el.hidden = false;
    if (!diam) el.innerHTML = '<div class="blok"><p class="memuat">Memuat riwayat…</p></div>';
    try {
      const d = await api('tatib.riwayat', { nis: nis });
      el.innerHTML = renderRiwayat(d); muatFoto(nis);
      if (!diam) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      (p.bukti ? ' <button type="button" class="chip-bukti" data-aksi="foto-bukti" data-id="' + esc(p.idLog) + '" data-judul="' + esc(p.pelanggaran + ', ' + p.tanggal) + '">' + ikon('kamera') + 'Foto bukti</button>' : '') +
      '<span class="meta">' + esc(p.tanggal) + ', ' + esc(p.kategori || '-') + ', dilaporkan ' + esc(namaPendek(p.pelapor) || '-') + '. ' +
      (p.tangga >= 2 ? 'Tangga ' + p.tangga + ' (' + esc(LABEL_TANGGA[p.tangga]) + '), ' + (p.status === 'Menunggu' ? 'menunggu' : 'selesai') : 'Ditangani guru yang menemukan') + '.</span>' +
      (p.tindakan ? '<span class="meta" style="white-space:pre-wrap">' + esc(p.tindakan) + '</span>' : '') + '</li>').join('') + '</ol>'
      : '<p class="kosong">Belum ada pelanggaran pada periode ini.</p>';
    const pb = d.pembinaan || [];
    h += '<h3 class="sub-judul">Pembinaan dan pernyataan siswa (' + pb.length + ')</h3>';
    h += pb.length ? '<ul class="baris-ringkas">' + pb.map((b) => '<li><strong>' + esc(b.jenis) + '</strong>, ' + esc(b.tanggal) +
      '<span class="meta">Oleh ' + esc(namaPendek(b.pembina)) + '. ' + esc(b.pelanggaran) + '</span>' + (b.komitmen ? '<span class="meta">Janji siswa: ' + esc(b.komitmen) + '</span>' : '') +
      '<span class="meta"><button type="button" class="tautan" data-aksi="pdf-pbn" data-id="' + esc(b.id) + '">Buat PDF untuk dicetak</button></span></li>').join('') + '</ul>'
      : '<p class="kosong">Belum ada pernyataan pembinaan yang ditandatangani siswa.</p>';
    h += programRiwayatHtml(d);
    if (d.pemulihan.length) h += '<h3 class="sub-judul">Pemulihan dan pembinaan</h3><ul class="baris-ringkas">' + d.pemulihan.map((r) =>
      '<li>' + esc(r.kategori) + ': <strong>' + esc(r.status) + '</strong>' + (r.potongan ? ' <span class="tag hijau">−' + r.potongan + ' poin</span>' : '') +
      '<span class="meta">' + esc(r.tanggal) + (r.catatan ? ', ' + esc(r.catatan) : '') + '</span></li>').join('') + '</ul>';
    if (d.surat.length) h += '<h3 class="sub-judul">Surat pernyataan</h3><ul class="baris-ringkas">' + d.surat.map((x) =>
      '<li>SP-' + x.lapis + ', ' + esc(x.tanggal) + '<span class="meta">' + (x.nomor ? 'Nomor ' + esc(x.nomor) + ', ' : '') + esc(x.id) + ', ' + x.poin + ' poin saat dicetak, tanda tangan: ' + esc(x.ttd || '-') + '</span></li>').join('') + '</ul>';
    if (d.catatanHadir.length) h += '<h3 class="sub-judul">Catatan kehadiran</h3><ul class="baris-ringkas">' + d.catatanHadir.map((x) =>
      '<li><strong>' + esc(x.status) + '</strong>, ' + esc(x.tanggal) + (x.jam ? ', ' + esc(String(x.jam).slice(0, 5)) : '') + (x.ket ? '<span class="meta">' + esc(x.ket) + '</span>' : '') + '</li>').join('') + '</ul>';
    h += '<div class="aksi-riwayat">';
    if ((d.bolehPembinaan || []).length) h += '<button type="button" class="tombol tombol-utama" data-aksi="pernyataan" data-nis="' + esc(s.nis) + '">' + ikon('surat') + 'Catat pernyataan pembinaan</button>';
    if (d.bolehAturProgram) h += '<button type="button" class="tombol tombol-garis" data-aksi="program" data-nis="' + esc(s.nis) + '">' + ikon('pembinaan') + 'Tetapkan masa pembinaan</button>';
    if (d.bolehBerkas) h += '<button type="button" class="tombol tombol-garis" data-aksi="berkas" data-nis="' + esc(s.nis) + '">Buat berkas bukti (PDF)</button>';
    h += '<button type="button" class="tombol tombol-garis" data-aksi="lapor-siswa" data-nis="' + esc(s.nis) + '">Lapor pelanggaran siswa ini</button></div><div id="r-berkas"></div>';
    return h + '</div>';
  }

  /* =================================================================
   *  WASPADA & SURAT
   * ================================================================= */
  const Z = { siswa: [], bolehSurat: false, pdf: {}, berkas: {} };
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
        '<p class="meta">Surat terakhir: ' + (s.lapisTerakhir ? 'SP-' + s.lapisTerakhir : 'belum ada') + (berikut ? ' <span class="tag merah">perlu SP-' + berikut + '</span>' : '') + '</p>';
      const pdf = Z.pdf[s.nis];
      if (pdf) h += '<div class="surat-siap">SP-' + pdf.lapis + (pdf.nomor ? ' (Nomor ' + esc(pdf.nomor) + ')' : '') + ' siap: <a href="' + pdf.url + '" target="_blank" rel="noopener">Buka PDF</a><a href="' + pdf.url + '" download="' + esc(pdf.nama) + '">Unduh</a>' +
        (pdf.drive ? '<a href="' + esc(pdf.drive) + '" target="_blank" rel="noopener">Lihat di Drive</a>' : '') + '</div>';
      const bk = Z.berkas[s.nis];
      if (bk) h += bk.memuat ? '<p class="meta">Menyusun berkas bukti (rekap, foto, pernyataan)…</p>' : bk.galat ? '<p class="pesan-galat">Berkas bukti gagal: ' + esc(bk.galat) + '</p>'
        : tautanPdf('Berkas bukti' + (bk.lapis ? ' SP-' + bk.lapis : '') + ' siap', bk);
      h += '<div class="aksi">';
      if (Z.bolehSurat && berikut) h += '<button type="button" class="tombol tombol-utama" data-aksi="surat" data-lapis="' + berikut + '">Buat SP-' + berikut + '</button>';
      else if (Z.bolehSurat && s.lapisPerlu) h += '<button type="button" class="tombol tombol-garis" data-aksi="surat" data-lapis="' + s.lapisPerlu + '">Cetak ulang SP-' + s.lapisPerlu + '</button>';
      if (S.akses.berkas) h += '<button type="button" class="tombol tombol-garis" data-aksi="berkas">Berkas bukti</button>';
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
        Z.pdf[nis] = { lapis: lapis, nomor: d.nomor || '', url: URL.createObjectURL(new Blob([isi], { type: 'application/pdf' })), nama: d.namaFile, drive: d.url };
        const s = Z.siswa.filter((x) => x.nis === nis)[0]; if (s) s.lapisTerakhir = Math.max(s.lapisTerakhir, lapis);
        toast('SP-' + lapis + ' dibuat' + (d.nomor ? ', nomor ' + d.nomor : '') + '. Berkas buktinya sedang disusun.', 'hadir', 5000);
        Z.berkas[nis] = { memuat: true }; renderZona();
        try { Z.berkas[nis] = await buatBerkas(nis, lapis, d.idSurat); } catch (er) { Z.berkas[nis] = { galat: er.message }; }
        renderZona();
      } catch (err) { renderZona(); toast(err.message, 'galat', 6000); }
    }
    if (a.dataset.aksi === 'berkas') {
      const s = Z.siswa.filter((x) => x.nis === nis)[0] || {};
      Z.berkas[nis] = { memuat: true }; renderZona();
      try { Z.berkas[nis] = await buatBerkas(nis, s.lapisTerakhir || 0, ''); } catch (er) { Z.berkas[nis] = { galat: er.message }; }
      renderZona();
    }
  }

  /* =================================================================
   *  FOTO BUKTI, PERNYATAAN PEMBINAAN, BERKAS BUKTI SP
   * ================================================================= */
  /** Foto dari kamera/galeri → JPEG kecil (data URL) agar ringan dikirim lewat sinyal sekolah. */
  async function kompresFoto(file, maks, batas) {
    maks = maks || 1280; batas = batas || 380000;
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('Foto tidak bisa dibuka.')); i.src = url; });
      const sk = Math.min(1, maks / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * sk); c.height = Math.round(img.naturalHeight * sk);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      let q = 0.78, d = c.toDataURL('image/jpeg', q);
      while (d.length * 0.75 > batas && q > 0.4) { q -= 0.1; d = c.toDataURL('image/jpeg', q); }
      return d;
    } finally { URL.revokeObjectURL(url); }
  }
  /** Input foto + pratinjau + tombol hapus. Mengembalikan pengambil data URL. */
  function pasangInputFoto(idInput, idPratinjau, idHapus, idLabel) {
    const o = { data: '' };
    const atur = (d) => {
      o.data = d || '';
      $(idPratinjau).hidden = !o.data;
      if (o.data) $(idPratinjau).querySelector('img').src = o.data;
      $(idLabel).textContent = o.data ? 'Ganti foto' : 'Ambil foto';
    };
    $(idInput).addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!f) return;
      try { atur(await kompresFoto(f)); } catch (er) { toast(er.message, 'galat'); }
    });
    $(idHapus).addEventListener('click', () => atur(''));
    o.atur = atur;
    return o;
  }
  function pdfDariBase64(d) {
    const bin = atob(d.pdf), isi = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) isi[i] = bin.charCodeAt(i);
    return { url: URL.createObjectURL(new Blob([isi], { type: 'application/pdf' })), nama: d.namaFile, drive: d.url };
  }
  function tautanPdf(judul, p) {
    return '<div class="surat-siap">' + esc(judul) + ': <a href="' + p.url + '" target="_blank" rel="noopener">Buka PDF</a><a href="' + p.url + '" download="' + esc(p.nama) + '">Unduh</a>' +
      (p.drive ? '<a href="' + esc(p.drive) + '" target="_blank" rel="noopener">Lihat di Drive</a>' : '') + '</div>';
  }
  async function buatBerkas(nis, lapis, idSurat) {
    const d = await api('tatib.berkasBukti', { nis: nis, lapis: lapis || '', idSurat: idSurat || '' });
    return Object.assign(pdfDariBase64(d), { jumlah: d.jumlah, lapis: lapis || 0 });
  }
  async function lihatFotoBukti(idLog, judul) {
    $('foto-besar').innerHTML = figur('<div class="ganti">Memuat foto…</div>', judul);
    $('modal-foto').hidden = false;
    try {
      const d = await api('tatib.fotoBukti', { ids: [idLog] });
      const f = d.foto[idLog] || {};
      if (!f.data) { $('foto-besar').querySelector('.ganti').textContent = f.error === 'TERHAPUS' ? 'Foto sudah dihapus dari Drive.' : 'Foto tidak tersedia.'; return; }
      $('foto-besar').innerHTML = figur('<img alt="" src="' + f.data + '">', judul + '. ' + f.sumber + (f.ket ? ', ' + f.ket : ''));
    } catch (e) { $('foto-besar').querySelector('.ganti').textContent = e.message; }
  }

  /** Bantalan tanda tangan di kanvas (jari di HP/tablet, mouse di laptop). */
  function padTtd(cv) {
    const ctx = cv.getContext('2d');
    let goresan = 0, aktif = false, akhir = null;
    const bersih = () => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.restore(); goresan = 0; };
    const ukur = () => {
      const r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.max(1, Math.round(r.width * dpr)); cv.height = Math.max(1, Math.round(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0E1F3D';
      bersih();
    };
    const titik = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.addEventListener('pointerdown', (e) => {
      aktif = true; try { cv.setPointerCapture(e.pointerId); } catch (er) { /* abaikan */ }
      akhir = titik(e); ctx.beginPath(); ctx.moveTo(akhir[0], akhir[1]); ctx.lineTo(akhir[0] + 0.1, akhir[1] + 0.1); ctx.stroke(); goresan++;
      cv.classList.add('terisi'); e.preventDefault();
    });
    cv.addEventListener('pointermove', (e) => {
      if (!aktif) return;
      const p = titik(e); ctx.beginPath(); ctx.moveTo(akhir[0], akhir[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); akhir = p; goresan++;
    });
    ['pointerup', 'pointercancel'].forEach((n) => cv.addEventListener(n, () => { aktif = false; }));
    return {
      ukur: ukur, bersih: () => { bersih(); cv.classList.remove('terisi'); }, kosong: () => goresan < 6,
      png: () => { const o = document.createElement('canvas'); o.width = 600; o.height = 220; const x = o.getContext('2d');
        x.fillStyle = '#fff'; x.fillRect(0, 0, 600, 220); x.drawImage(cv, 0, 0, 600, 220); return o.toDataURL('image/png'); }
    };
  }

  const PB = { data: null, jenis: '', pilih: new Set(), refKasus: '', idCatat: '', waktu: null, ttd: {}, foto: null, sesudah: null, menyimpan: false };
  const NAMA_HARI_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  function waktuJakarta(d) {
    const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false, weekday: 'short' }).formatToParts(d);
    const g = (t) => (p.find((x) => x.type === t) || {}).value;
    const hari = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[g('weekday')];
    return { hari: NAMA_HARI_ID[hari], tanggal: g('day') + '/' + g('month') + '/' + g('year'), jam: g('hour').replace('24', '00') + '.' + g('minute') };
  }
  /**
   * Buka formulir pernyataan. opsi: { jenis, pilih: [idLog], refKasus, sesudah(hasil) }.
   */
  async function bukaPernyataan(nis, opsi) {
    opsi = opsi || {};
    Object.assign(PB, { data: null, jenis: '', pilih: new Set(opsi.pilih || []), refKasus: opsi.refKasus || '', idCatat: uuid(), waktu: new Date(), sesudah: opsi.sesudah || null, menyimpan: false });
    $('pbn-form').hidden = false; $('pbn-hasil').hidden = true; $('pbn-aksi').hidden = false;
    $('pbn-simpan').disabled = true; $('pbn-simpan').textContent = 'Simpan pernyataan';
    $('pbn-pesan').textContent = ''; $('pbn-ringkasan').value = ''; $('pbn-komitmen').value = '';
    $('pbn-siswa').innerHTML = '<p class="memuat">Memuat data siswa…</p>'; $('pbn-plg').innerHTML = ''; $('pbn-teks').textContent = '';
    if (PB.foto) PB.foto.atur('');
    $('modal-pbn').hidden = false;
    requestAnimationFrame(() => { PB.ttd.siswa.ukur(); PB.ttd.pembina.ukur(); });
    try {
      const d = await api('tatib.pembinaanAwal', { nis: nis });
      PB.data = d;
      PB.jenis = d.jenis.some((j) => j.kode === opsi.jenis) ? opsi.jenis : d.jenis[0].kode;
      if (!PB.pilih.size) d.pelanggaran.filter((p) => !p.dibina).slice(0, 3).forEach((p) => PB.pilih.add(p.idLog));
      const s = d.siswa;
      $('pbn-siswa').innerHTML = fotoHtml(s) + '<span><strong>' + esc(s.nama) + '</strong><span class="redup">' + esc(s.kelas) + ', NIS ' + esc(s.nis) + '</span>' +
        (d.riwayat.length ? '<span class="redup">Pembinaan sebelumnya: ' + esc(d.riwayat.slice(0, 3).map((r) => r.jenis.replace(/ (khusus )?wali kelas| Guru BK/, '') + ' ' + r.tanggal).join('; ')) + '</span>' : '') + '</span>';
      muatFoto(s.nis);
      $('ttd-siswa-label').textContent = 'Tanda tangan ' + s.nama;
      $('ttd-pembina-label').textContent = 'Tanda tangan ' + namaPendek(S.guru.nama) + ' (pembina)';
      $('pbn-jenis-wadah').hidden = d.jenis.length < 2;
      $('pbn-jenis').innerHTML = d.jenis.map((j) => '<button type="button" data-jenis="' + j.kode + '" aria-pressed="' + (j.kode === PB.jenis) + '">' + esc(j.nama) + '</button>').join('');
      renderPlgPbn();
      $('pbn-simpan').disabled = false;
    } catch (e) {
      $('pbn-siswa').innerHTML = '<p class="kosong">' + esc(e.message) + '</p>';
    }
  }
  function renderPlgPbn() {
    const d = PB.data;
    $('pbn-plg').innerHTML = d.pelanggaran.length ? d.pelanggaran.map((p) => '<li><label class="centang"><input type="checkbox" value="' + esc(p.idLog) + '"' + (PB.pilih.has(p.idLog) ? ' checked' : '') + '>' +
      '<span>' + esc(p.pelanggaran) + ' <span class="redup">' + esc(p.hari + ' ' + p.tanggal) + ', +' + p.poin + '</span>' + (p.dibina ? ' <span class="tag hijau">sudah dibina</span>' : '') + '</span></label></li>').join('')
      : '<li class="kosong">Belum ada pelanggaran pada periode ini.</li>';
    renderTeksPbn();
  }
  function teksPernyataan() {
    const d = PB.data, s = d.siswa, w = waktuJakarta(PB.waktu);
    const daftar = d.pelanggaran.filter((p) => PB.pilih.has(p.idLog)).map((p, i) => (i + 1) + '. ' + p.pelanggaran + ', ' + p.hari + ' ' + p.tanggal).join('\n');
    const binaWali = PB.jenis === 'bk' ? d.riwayat.filter((r) => /wali kelas/i.test(r.jenis)).map((r) => r.tanggal) : [];
    return isiTemplat(d.templat[PB.jenis], {
      nama: s.nama, nis: s.nis, kelas: s.kelas, hari: w.hari, tanggal: w.tanggal, jam: w.jam, pembina: S.guru.nama, sekolah: d.sekolah,
      pelanggaran: daftar || '(pilih pelanggaran yang dibina)', komitmen: $('pbn-komitmen').value.trim() || '(tulis janji siswa)',
      binaWali: binaWali.length ? ' yang sebelumnya telah dibina wali kelas pada ' + binaWali.slice(0, 3).join(', ') : ''
    });
  }
  function renderTeksPbn() { if (PB.data) $('pbn-teks').textContent = teksPernyataan(); }
  function tutupPernyataan() { $('modal-pbn').hidden = true; }
  async function simpanPernyataan() {
    if (PB.menyimpan || !PB.data) return;
    const galat = (t) => { $('pbn-pesan').textContent = t; };
    if (!PB.pilih.size) return galat('Pilih pelanggaran yang dibina.');
    if (!$('pbn-komitmen').value.trim()) { $('pbn-komitmen').focus(); return galat('Tulis janji siswa.'); }
    if (PB.ttd.siswa.kosong()) return galat('Siswa belum menandatangani pernyataan.');
    if (PB.ttd.pembina.kosong()) return galat('Pembina belum menandatangani.');
    galat('');
    PB.menyimpan = true;
    const b = $('pbn-simpan'); b.disabled = true; b.textContent = 'Menyimpan…';
    try {
      const d = await api('tatib.simpanPembinaan', {
        nis: PB.data.siswa.nis, jenis: PB.jenis, refPlg: Array.from(PB.pilih), ringkasan: $('pbn-ringkasan').value.trim(),
        komitmen: $('pbn-komitmen').value.trim(), pernyataan: teksPernyataan(), ttdSiswa: PB.ttd.siswa.png(), ttdPembina: PB.ttd.pembina.png(),
        foto: PB.foto.data, refKasus: PB.refKasus, idCatat: PB.idCatat
      });
      PB.hasil = d;
      $('pbn-form').hidden = true;
      $('pbn-hasil').hidden = false;
      $('pbn-hasil').innerHTML = '<p class="pbn-ok">' + ikon('cek') + '<span><strong>Pernyataan tersimpan.</strong> ' + esc(PB.data.siswa.nama) + ', ' + esc(d.jenis.toLowerCase()) + ', ' + esc(d.tanggal) + '. Nomor ' + esc(d.id) + '.</span></p>' +
        '<p class="keterangan">Pernyataan ini otomatis masuk ke berkas bukti SP. Cetak PDF-nya bila orang tua perlu ikut menandatangani.</p>' +
        '<div id="pbn-pdf"><button type="button" class="tombol tombol-garis" data-aksi="pdf-pbn" data-id="' + esc(d.id) + '">Buat PDF untuk dicetak</button></div>';
      $('pbn-aksi').hidden = false; $('pbn-batal').textContent = 'Selesai'; b.hidden = true;
      if (PB.sesudah) PB.sesudah(d);
      toast('Pernyataan pembinaan tersimpan.', 'hadir');
    } catch (e) {
      galat(e.message);
      b.disabled = false; b.textContent = 'Simpan pernyataan';
    } finally { PB.menyimpan = false; }
  }
  async function pdfPernyataan(tombol, id) {
    tombol.disabled = true; tombol.textContent = 'Membuat PDF…';
    try {
      const p = pdfDariBase64(await api('tatib.pembinaanPdf', { id: id }));
      tombol.outerHTML = tautanPdf('Pernyataan siap', p);
    } catch (e) { tombol.disabled = false; tombol.textContent = 'Buat PDF untuk dicetak'; toast(e.message, 'galat', 5000); }
  }
  function pasangPernyataan() {
    PB.ttd.siswa = padTtd($('ttd-siswa'));
    PB.ttd.pembina = padTtd($('ttd-pembina'));
    PB.foto = pasangInputFoto('pbn-foto-input', 'pbn-foto-pratinjau', 'pbn-foto-hapus', 'pbn-foto-label');
    $('modal-pbn').addEventListener('click', (e) => {
      const u = e.target.closest('[data-ulang]');
      if (u) { PB.ttd[u.dataset.ulang === 'ttd-siswa' ? 'siswa' : 'pembina'].bersih(); return; }
      const j = e.target.closest('[data-jenis]');
      if (j) { PB.jenis = j.dataset.jenis; $('pbn-jenis').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === j))); renderTeksPbn(); return; }
      const p = e.target.closest('[data-aksi="pdf-pbn"]');
      if (p) pdfPernyataan(p, p.dataset.id);
    });
    $('pbn-plg').addEventListener('change', (e) => {
      if (e.target.type !== 'checkbox') return;
      if (e.target.checked) PB.pilih.add(e.target.value); else PB.pilih.delete(e.target.value);
      renderTeksPbn();
    });
    $('pbn-komitmen').addEventListener('input', renderTeksPbn);
    ['ttd-siswa', 'ttd-pembina'].forEach((id) => $(id).addEventListener('pointerdown', () => { $('pbn-pesan').textContent = ''; }));
    $('pbn-batal').addEventListener('click', () => { tutupPernyataan(); $('pbn-simpan').hidden = false; $('pbn-batal').textContent = 'Batal'; });
    $('pbn-simpan').addEventListener('click', simpanPernyataan);
    let t = null;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(() => { if (!$('modal-pbn').hidden && PB.ttd.siswa.kosong() && PB.ttd.pembina.kosong()) { PB.ttd.siswa.ukur(); PB.ttd.pembina.ukur(); } }, 200);
    });
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
    pasangSesiE();
    ['es-pembina', 'es-pelatih'].forEach((id) => $(id).addEventListener('change', () => { clearTimeout(ES.timer); ES.timer = setTimeout(() => simpanSesiE(), 700); }));
    window.addEventListener('beforeunload', (e) => { if (E.antre.size) { e.preventDefault(); e.returnValue = ''; } });
  }

  async function muatEkskul() {
    pasangEkskul();
    if (E.antre.size) { renderEkskul(); return; }   // jangan menimpa absensi yang belum tersimpan
    if (!E.data) { $('e-isi').hidden = true; $('e-ket').hidden = false; $('e-ket').textContent = 'Memuat ekskul…'; }
    try {
      E.data = await api('ekskul.awal');
      if (!E.data.ekskul.length) { $('e-isi').hidden = true; $('e-ket').hidden = false; $('e-ket').textContent = 'Anda belum terdaftar sebagai pembina ekskul. Tim Tata Tertib memilih ekskul binaan Anda di kolom Ekskul_Binaan tab Guru.'; return; }
      if (!eAktif()) E.aktif = (simpan.get('smkt_ekskul', '') && E.data.ekskul.some((x) => x.nama === simpan.get('smkt_ekskul', ''))) ? simpan.get('smkt_ekskul', '') : E.data.ekskul[0].nama;
      E.tanggal = E.data.hariIni; E.status = eAktif().status || {}; ES.sesi = eAktif().sesi || null;
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
    if (E.mode === 'absen') { renderAbsenE(); renderSesiE(); }
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
    E.tanggal = E.data.hariIni; $('e-tanggal').value = E.tanggal; E.status = e.status || {}; ES.sesi = e.sesi || null;
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
      if (d.tanggal === E.tanggal && d.ekskul === E.aktif) { E.status = d.status; ES.sesi = d.sesi || null; if (tgl === E.data.hariIni) { eAktif().status = d.status; eAktif().sesi = d.sesi || null; } }
    } catch (e) { toast(e.message, 'galat', 5000); }
    renderAbsenE(); renderSesiE();
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
      h += rekapSesiHtml(d);
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

  /* =================================================================
   *  MASA PEMBINAAN & SKORSING (v1.5)
   *  Tim Tatib menetapkan mulai dan jumlah hari; jadwal mengikuti hari
   *  sekolah dan otomatis mundur bila siswa izin/sakit/pulang sakit atau
   *  ada hari daring. Orang tua menyetujui di kertas, fotonya diunggah.
   * ================================================================= */
  const PR = { data: null, filter: 'aktif', buka: '', bentuk: null, kal: null, pasang: false, form: null, rinci: {}, timerPratinjau: null };
  const NAMA_BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const NAMA_HARI_PENDEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const keDate = (ymd) => { const p = String(ymd || '').split('-').map(Number); return p.length === 3 ? new Date(p[0], p[1] - 1, p[2]) : null; };
  function tglManis(ymd, panjang) {
    const d = keDate(ymd); if (!d) return '-';
    return (panjang ? NAMA_HARI_PENDEK[d.getDay()] + ', ' : '') + d.getDate() + ' ' + NAMA_BULAN_PENDEK[d.getMonth()] + (panjang && d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : '');
  }
  const LABEL_HARI = { terlaksana: 'Terlaksana', 'hari ini': 'Hari ini', rencana: 'Rencana', tertunda: 'Tidak dihitung', libur: 'Libur', daring: 'Daring' };
  const kelasTahap = (t) => ({ 'Berjalan': 'berjalan', 'Belum mulai': 'belum', 'Tuntas': 'tuntas', 'Selesai': 'selesai', 'Dibatalkan': 'batal' }[t] || 'berjalan');

  function pasangProgram() {
    if (PR.pasang) return;
    PR.pasang = true;
    $('prg-baru').innerHTML = ikon('tambah') + 'Tetapkan masa pembinaan';
    $('prg-baru').addEventListener('click', () => bukaFormProgram({}));
    $('prg-segmen').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-filter]'); if (!b) return;
      PR.filter = b.dataset.filter; renderProgram();
    });
    $('prg-daftar').addEventListener('click', klikProgram);
    $('prg-daftar').addEventListener('change', unggahPersetujuan);
    $('prg-kal-form').addEventListener('submit', simpanKalender);
    $('prg-kal-daftar').addEventListener('click', hapusKalender);
    $('prg-bentuk-form').addEventListener('submit', tambahBentuk);
    // Form penetapan
    $('pf-batal').addEventListener('click', tutupFormProgram);
    $('pf-simpan').addEventListener('click', simpanProgram);
    $('pf-jenis').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-jenis]'); if (!b) return;
      PR.form.jenis = b.dataset.jenis; renderJenisForm();
    });
    $('pf-cepat').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-hari]'); if (!b) return;
      $('pf-hari').value = b.dataset.hari; jadwalPratinjau();
    });
    ['pf-mulai', 'pf-hari'].forEach((id) => $(id).addEventListener('input', jadwalPratinjau));
    $('pf-bentuk').addEventListener('change', () => { PR.form.galat = ''; $('pf-pesan').textContent = ''; });
  }

  async function muatProgram(diam) {
    pasangProgram();
    if (!PR.data && !diam) $('prg-daftar').innerHTML = '<li class="memuat">Memuat masa pembinaan…</li>';
    try {
      const [d, k, b] = await Promise.all([api('program.daftar'), api('program.kalender'), PR.bentuk ? Promise.resolve(PR.bentuk) : api('program.bentuk')]);
      PR.data = d; PR.kal = k; PR.bentuk = b;
      renderProgram(); renderKalender(); renderBentuk();
    } catch (e) {
      if (!PR.data) $('prg-daftar').innerHTML = '<li class="kosong">' + esc(e.message) + '</li>';
    }
  }

  function renderProgram() {
    const d = PR.data; if (!d) return;
    $('prg-baru').hidden = !d.bolehAtur;
    const aktif = (p) => ['Berjalan', 'Belum mulai', 'Tuntas'].indexOf(p.tahap) > -1;
    const daftar = d.program.filter((p) => (PR.filter === 'aktif' ? aktif(p) : !aktif(p)));
    const nAktif = d.program.filter(aktif).length;
    document.querySelectorAll('#prg-segmen button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === PR.filter)));
    $('prg-n-aktif').textContent = nAktif ? String(nAktif) : '';
    $('prg-n-aktif').hidden = !nAktif;
    $('prg-ket').textContent = PR.filter === 'aktif'
      ? (nAktif ? 'Hari yang tidak dihitung (izin, sakit, pulang sakit, libur, daring) otomatis menggeser tanggal selesai.' : '')
      : 'Masa pembinaan yang sudah selesai atau dibatalkan dalam 45 hari terakhir.';
    if (!daftar.length) {
      $('prg-daftar').innerHTML = '<li class="kosong">' + (PR.filter === 'aktif'
        ? (d.bolehAtur ? 'Belum ada masa pembinaan berjalan. Tetapkan dari tombol di atas, dari Kotak Masuk, atau dari riwayat siswa.' : 'Belum ada masa pembinaan berjalan untuk siswa Anda.')
        : 'Belum ada masa pembinaan yang selesai.') + '</li>';
      return;
    }
    $('prg-daftar').innerHTML = daftar.map(kartuProgram).join('');
    daftar.forEach((p) => { muatFoto(p.nis); });
    if (PR.buka) { const el = $('prg-daftar').querySelector('[data-id="' + PR.buka + '"]'); if (el) muatRinciProgram(PR.buka, el); }
  }

  function kartuProgram(p) {
    const persen = Math.min(100, Math.round(p.terlaksana / p.jumlah * 100));
    const terbuka = PR.buka === p.id;
    let h = '<li class="prg ' + kelasTahap(p.tahap) + '" data-id="' + esc(p.id) + '">' +
      '<button type="button" class="prg-kepala" data-aksi="buka" aria-expanded="' + terbuka + '">' + fotoHtml(p) +
      '<span class="prg-identitas"><span class="nm">' + esc(p.nama) + '</span><span class="kl">' + esc(p.kelas) + ' · ' + esc(p.jenis) + '</span></span>' +
      '<span class="prg-tahap">' + esc(p.tahap) + '</span></button>' +
      '<div class="prg-badan"><p class="prg-bentuk">' + p.bentuk.map(esc).join('<br>') + '</p>' +
      '<div class="prg-meter" role="img" aria-label="' + p.terlaksana + ' dari ' + p.jumlah + ' hari terlaksana"><span style="width:' + persen + '%"></span></div>' +
      '<dl class="prg-fakta"><div><dt>Terlaksana</dt><dd><b>' + p.terlaksana + '</b> / ' + p.jumlah + ' hari</dd></div>' +
      '<div><dt>' + (p.tahap === 'Selesai' || p.tahap === 'Dibatalkan' ? 'Rencana selesai' : 'Perkiraan selesai') + '</dt><dd>' + esc(tglManis(p.selesai, true)) + '</dd></div>' +
      (p.tertunda ? '<div class="tunda"><dt>Diperpanjang</dt><dd>+' + p.tertunda + ' hari</dd></div>' : '') +
      '<div class="' + (p.setuju ? 'setuju' : 'belum-setuju') + '"><dt>Orang tua</dt><dd>' + (p.setuju ? 'Sudah tanda tangan' : 'Belum tanda tangan') + '</dd></div></dl>' +
      (p.hariIni && p.tahap === 'Berjalan' ? '<p class="prg-hariini">Hari ini: ' + esc(LABEL_HARI[p.hariIni] || p.hariIni) + '</p>' : '') +
      '</div><div class="prg-rinci" ' + (terbuka ? '' : 'hidden') + '></div></li>';
    return h;
  }

  async function muatRinciProgram(id, li) {
    const el = li.querySelector('.prg-rinci');
    el.hidden = false;
    li.querySelector('.prg-kepala').setAttribute('aria-expanded', 'true');
    const p = PR.data.program.filter((x) => x.id === id)[0];
    if (!PR.rinci[id]) el.innerHTML = '<p class="memuat">Memuat jadwal…</p>';
    else el.innerHTML = rinciProgramHtml(PR.rinci[id]);
    try {
      const d = await api('program.siswa', { nis: p.nis });
      d.program.forEach((x) => { PR.rinci[x.id] = Object.assign(x, { bolehAtur: d.bolehAtur, bolehUnggah: d.bolehUnggah }); });
      if (PR.buka === id && PR.rinci[id]) el.innerHTML = rinciProgramHtml(PR.rinci[id]);
    } catch (e) { el.innerHTML = '<p class="pesan-galat">' + esc(e.message) + '</p>'; }
  }

  function kalenderHariHtml(hari) {
    return '<ol class="kal-hari">' + hari.map((x) => '<li class="kh-' + x.status.replace(' ', '-') + '" title="' + esc(LABEL_HARI[x.status] + (x.ket ? ': ' + x.ket : '')) + '">' +
      '<span class="kh-tgl"><small>' + esc(String(x.hari).slice(0, 3)) + '</small>' + esc(keDate(x.tgl).getDate()) + '</span>' +
      '<span class="kh-ket">' + (x.ke ? 'Hari ke-' + x.ke : esc(LABEL_HARI[x.status])) + (x.ket && x.status !== 'rencana' ? '<small>' + esc(x.ket) + '</small>' : '') + '</span></li>').join('') + '</ol>';
  }

  function rinciProgramHtml(p) {
    let h = '';
    if (p.pelanggaran) h += '<p class="meta">Karena: ' + esc(p.pelanggaran) + '</p>';
    if (p.catatan) h += '<p class="meta">Catatan: ' + esc(p.catatan) + '</p>';
    h += '<p class="meta">Mulai ' + esc(tglManis(p.mulai, true)) + ', ' + p.jumlah + ' hari sekolah. Ditetapkan ' + esc(namaPendek(p.penetap)) + '.</p>';
    h += kalenderHariHtml(p.hari || []);
    h += '<div class="prg-legenda"><span class="kh-terlaksana">Terlaksana</span><span class="kh-hari-ini">Hari ini</span><span class="kh-rencana">Rencana</span><span class="kh-tertunda">Tidak dihitung</span><span class="kh-libur">Libur/daring</span></div>';
    h += '<div class="aksi-riwayat">';
    h += '<button type="button" class="tombol tombol-garis" data-aksi="pdf">' + ikon('surat') + 'Surat persetujuan ortu (PDF)</button>';
    if (p.bolehUnggah && p.status !== 'Dibatalkan') {
      h += '<label class="tombol ' + (p.setuju ? 'tombol-garis' : 'tombol-utama') + ' tombol-foto">' + ikon('kamera') + (p.setuju ? 'Ganti foto lembar bertanda tangan' : 'Unggah foto lembar bertanda tangan') +
        '<input type="file" class="input-foto" accept="image/*" capture="environment" data-unggah="' + esc(p.id) + '"></label>';
    }
    h += '</div><div class="prg-pdf"></div>';
    if (p.bolehAtur && p.status !== 'Dibatalkan') {
      h += '<details class="prg-ubah"><summary>Ubah jadwal atau status</summary>' +
        '<div class="dua-kolom"><div><label class="label">Mulai</label><input type="date" class="isian" data-ubah="mulai" value="' + esc(p.mulai) + '"></div>' +
        '<div><label class="label">Jumlah hari sekolah</label><input type="number" class="isian" min="1" max="60" data-ubah="hari" value="' + p.jumlah + '"></div></div>' +
        '<label class="label">Alasan perubahan</label><input type="text" class="isian" maxlength="200" data-ubah="alasan" placeholder="Contoh: kesepakatan dengan orang tua">' +
        '<div class="aksi-riwayat"><button type="button" class="tombol tombol-utama" data-aksi="simpan-ubah">Simpan perubahan</button>' +
        (p.status === 'Berjalan' ? '<button type="button" class="tombol tombol-garis" data-aksi="selesai">Tandai selesai</button>' : '<button type="button" class="tombol tombol-garis" data-aksi="lanjut">Buka lagi</button>') +
        '<button type="button" class="tautan merah" data-aksi="batal">Batalkan masa pembinaan</button></div></details>';
    }
    if ((p.riwayatUbah || []).length) h += '<details class="prg-log"><summary>Riwayat perubahan</summary><ul>' + p.riwayatUbah.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></details>';
    return h;
  }

  async function klikProgram(e) {
    const a = e.target.closest('[data-aksi]'); if (!a) return;
    const li = a.closest('.prg'); if (!li) return;
    const id = li.dataset.id;
    const aksi = a.dataset.aksi;
    if (aksi === 'buka') {
      if (PR.buka === id) { PR.buka = ''; li.querySelector('.prg-rinci').hidden = true; a.setAttribute('aria-expanded', 'false'); return; }
      const lama = PR.buka && $('prg-daftar').querySelector('[data-id="' + PR.buka + '"]');
      if (lama) { lama.querySelector('.prg-rinci').hidden = true; lama.querySelector('.prg-kepala').setAttribute('aria-expanded', 'false'); }
      PR.buka = id; muatRinciProgram(id, li); return;
    }
    if (aksi === 'pdf') {
      a.disabled = true; const teks = a.innerHTML; a.textContent = 'Menyusun PDF…';
      try { const d = await api('program.pdf', { id: id }); li.querySelector('.prg-pdf').innerHTML = tautanPdf('Surat persetujuan siap dicetak', pdfDariBase64(d)); }
      catch (er) { toast(er.message, 'galat', 5000); }
      a.disabled = false; a.innerHTML = teks; return;
    }
    const rinci = li.querySelector('.prg-rinci');
    const nilai = (k) => { const x = rinci.querySelector('[data-ubah="' + k + '"]'); return x ? x.value.trim() : ''; };
    let kirim = null;
    if (aksi === 'simpan-ubah') kirim = { id: id, mulai: nilai('mulai'), jumlahHari: nilai('hari'), alasan: nilai('alasan') };
    if (aksi === 'selesai') kirim = { id: id, ubah: 'selesai', alasan: nilai('alasan') };
    if (aksi === 'lanjut') kirim = { id: id, ubah: 'lanjut', alasan: nilai('alasan') };
    if (aksi === 'batal') {
      if (a.dataset.yakin !== '1') { a.dataset.yakin = '1'; a.textContent = 'Ketuk lagi untuk membatalkan'; if (!nilai('alasan')) { rinci.querySelector('[data-ubah="alasan"]').focus(); toast('Tulis alasan pembatalan dulu.', 'galat'); } return; }
      kirim = { id: id, ubah: 'batal', alasan: nilai('alasan') };
    }
    if (!kirim) return;
    a.disabled = true;
    try {
      const d = await api('program.ubah', kirim);
      gantiProgram(d.program);
      toast(aksi === 'simpan-ubah' ? 'Jadwal diperbarui. Selesai ' + tglManis(d.program.selesai, true) + '.' : 'Status: ' + d.program.tahap + '.', 'hadir', 4000);
    } catch (er) { a.disabled = false; toast(er.message, 'galat', 5000); }
  }

  function gantiProgram(p) {
    if (!PR.data) return;
    const lama = PR.rinci[p.id] || {};
    PR.rinci[p.id] = Object.assign(p, { bolehAtur: lama.bolehAtur !== undefined ? lama.bolehAtur : PR.data.bolehAtur, bolehUnggah: lama.bolehUnggah !== undefined ? lama.bolehUnggah : true });
    const i = PR.data.program.findIndex((x) => x.id === p.id);
    if (i > -1) PR.data.program[i] = p; else PR.data.program.unshift(p);
    renderProgram();
  }

  async function unggahPersetujuan(e) {
    const inp = e.target.closest('input[data-unggah]'); if (!inp) return;
    const f = inp.files && inp.files[0]; inp.value = '';
    if (!f) return;
    toast('Mengunggah foto lembar persetujuan…', '', 10000);
    try {
      const data = await kompresFoto(f, 1800, 850000);
      const d = await api('program.unggahTtd', { id: inp.dataset.unggah, foto: data });
      gantiProgram(d.program);
      toast('Foto persetujuan tersimpan. Status orang tua: sudah tanda tangan.', 'hadir', 4500);
    } catch (er) { toast(er.message, 'galat', 6000); }
  }

  /* ---------- Form penetapan ---------- */
  /** Hari ini, atau Senin bila hari ini Sabtu/Minggu. */
  function hariSekolahBerikut() {
    const k = new Date(hariIni() + 'T00:00:00');
    if (k.getDay() === 6) k.setDate(k.getDate() + 2); else if (k.getDay() === 0) k.setDate(k.getDate() + 1);
    return k.getFullYear() + '-' + String(k.getMonth() + 1).padStart(2, '0') + '-' + String(k.getDate()).padStart(2, '0');
  }

  async function bukaFormProgram(opsi) {
    pasangProgram();
    PR.form = { nis: opsi.nis || '', refKasus: opsi.refKasus || '', pelanggaran: opsi.pelanggaran || '', jenis: 'Pembinaan', kunci: uuid(), menyimpan: false };
    $('pf-pesan').textContent = '';
    $('pf-catatan').value = '';
    $('pf-lain').value = '';
    $('pf-mulai').value = hariSekolahBerikut();
    $('pf-mulai').min = hariIni(-30);
    $('pf-hari').value = 3;
    $('pf-kasus').hidden = !PR.form.pelanggaran;
    $('pf-kasus').textContent = PR.form.pelanggaran ? 'Rujukan kasus: ' + PR.form.pelanggaran : '';
    $('pf-simpan').disabled = false; $('pf-simpan').textContent = 'Tetapkan';
    renderJenisForm();
    renderSiswaForm();
    $('pf-bentuk').innerHTML = '<p class="memuat">Memuat pilihan…</p>';
    $('modal-prg').hidden = false;
    try {
      if (!PR.bentuk) PR.bentuk = await api('program.bentuk');
      $('pf-bentuk').innerHTML = PR.bentuk.bentuk.map((b, i) => '<label class="opsi-bentuk"><input type="checkbox" value="' + esc(b.bentuk) + '"' + '>' +
        '<span><strong>' + esc(b.bentuk) + '</strong>' + (b.ket || b.cocok ? '<small>' + esc([b.cocok, b.ket].filter(Boolean).join(' · ')) + '</small>' : '') +
        (b.oleh && b.oleh !== 'Contoh awal aplikasi' ? '<small class="oleh">Rekomendasi ' + esc(namaPendek(b.oleh)) + (b.peran ? ' (' + esc(b.peran) + ')' : '') + '</small>' : '') + '</span></label>').join('');
    } catch (e) { $('pf-bentuk').innerHTML = '<p class="pesan-galat">' + esc(e.message) + '</p>'; }
    jadwalPratinjau();
  }
  function renderJenisForm() {
    document.querySelectorAll('#pf-jenis button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.jenis === PR.form.jenis)));
    $('pf-judul').textContent = 'Tetapkan masa ' + PR.form.jenis.toLowerCase();
  }
  function renderSiswaForm() {
    const s = PR.form.nis ? S.siswa.get(PR.form.nis) : null;
    const wadah = $('pf-siswa');
    if (s) {
      wadah.innerHTML = kartuSiswaHtml(s, PR.form.refKasus ? '' : 'ganti-siswa-prg');
      muatFoto(s.nis);
      const g = wadah.querySelector('[data-aksi="ganti-siswa-prg"]');
      if (g) g.addEventListener('click', () => { PR.form.nis = ''; renderSiswaForm(); });
    } else {
      pemilihSiswa(wadah, { id: 'pf', label: 'Siswa', pilih: (x) => { PR.form.nis = x.nis; renderSiswaForm(); jadwalPratinjau(); } });
    }
  }
  function jadwalPratinjau() {
    clearTimeout(PR.timerPratinjau);
    $('pf-pratinjau').innerHTML = '<p class="memuat">Menghitung jadwal…</p>';
    PR.timerPratinjau = setTimeout(pratinjauProgram, 450);
  }
  async function pratinjauProgram() {
    const mulai = $('pf-mulai').value, n = Number($('pf-hari').value);
    if (!mulai || !n || n < 1 || n > 60) { $('pf-pratinjau').innerHTML = '<p class="keterangan">Isi tanggal mulai dan jumlah hari (1–60).</p>'; return; }
    try {
      const d = await api('program.kalender', { mulai: mulai, jumlahHari: n, nis: PR.form.nis });
      const p = d.pratinjau;
      $('pf-pratinjau').innerHTML = '<p class="pf-selesai">Selesai <strong>' + esc(tglManis(p.selesai, true)) + '</strong>' +
        (p.libur ? '<span>' + p.libur + ' hari libur/daring dilewati</span>' : '') + (p.tertunda ? '<span>' + p.tertunda + ' hari izin/sakit tidak dihitung</span>' : '') + '</p>' + kalenderHariHtml(p.hari);
    } catch (e) { $('pf-pratinjau').innerHTML = '<p class="pesan-galat">' + esc(e.message) + '</p>'; }
  }
  function tutupFormProgram() { $('modal-prg').hidden = true; clearTimeout(PR.timerPratinjau); }
  async function simpanProgram() {
    const f = PR.form; if (!f || f.menyimpan) return;
    const bentuk = Array.from($('pf-bentuk').querySelectorAll('input:checked')).map((x) => x.value);
    const lain = $('pf-lain').value.trim();
    if (lain) bentuk.push(lain);
    const pesan = !f.nis ? 'Pilih siswanya dulu.' : !bentuk.length ? 'Pilih minimal satu bentuk pembinaan.' : !$('pf-mulai').value ? 'Isi tanggal mulai.' : '';
    if (pesan) { $('pf-pesan').textContent = pesan; return; }
    f.menyimpan = true; $('pf-simpan').disabled = true; $('pf-simpan').textContent = 'Menyimpan…';
    try {
      const d = await api('program.simpan', { nis: f.nis, jenis: f.jenis, bentuk: bentuk, mulai: $('pf-mulai').value, jumlahHari: Number($('pf-hari').value),
        refKasus: f.refKasus, pelanggaran: f.pelanggaran, catatan: $('pf-catatan').value.trim(), kunci: f.kunci });
      tutupFormProgram();
      PR.buka = d.program.id;
      if (S.tab !== 'pembinaan') buka('pembinaan'); else { PR.filter = 'aktif'; gantiProgram(d.program); }
      toast('Masa ' + f.jenis.toLowerCase() + ' ditetapkan, selesai ' + tglManis(d.program.selesai, true) + '. Cetak surat persetujuan untuk orang tua.', 'hadir', 6000);
    } catch (e) {
      $('pf-pesan').textContent = e.message;
      $('pf-simpan').disabled = false; $('pf-simpan').textContent = 'Tetapkan';
    } finally { f.menyimpan = false; }
  }

  /* ---------- Kalender sekolah & pilihan bentuk ---------- */
  function renderKalender() {
    const k = PR.kal; if (!k) return;
    $('prg-kal-form').hidden = !k.bolehUbah;
    const kini = hariIni();
    const daftar = k.daftar.filter((x) => x.tgl >= hariIni(-14));
    $('prg-kal-daftar').innerHTML = daftar.length ? daftar.map((x) => '<li class="' + (x.jenis === 'Daring' ? 'daring' : 'libur') + (x.tgl < kini ? ' lewat' : '') + '">' +
      '<span class="kal-tgl">' + esc(tglManis(x.tgl, true)) + '</span><span class="kal-jenis">' + esc(x.jenis) + '</span><span class="kal-ket">' + esc(x.ket) + '</span>' +
      (k.bolehUbah ? '<button type="button" class="tautan merah" data-hapus="' + esc(x.tgl) + '">Hapus</button>' : '') + '</li>').join('')
      : '<li class="kosong">Belum ada hari libur atau daring yang dicatat.</li>';
  }
  async function simpanKalender(e) {
    e.preventDefault();
    const tanggal = $('kal-tgl').value, jenis = $('kal-jenis').value, ket = $('kal-ket').value.trim();
    if (!tanggal) { $('kal-tgl').focus(); return; }
    const b = e.target.querySelector('button[type="submit"]'); b.disabled = true;
    try {
      PR.kal = await api('program.kalender', { tambah: { tanggal: tanggal, jenis: jenis, ket: ket } });
      $('kal-ket').value = '';
      renderKalender();
      toast(jenis + ' ' + tglManis(tanggal, true) + ' dicatat. Jadwal pembinaan yang terkena ikut bergeser.', 'hadir', 4500);
      PR.rinci = {}; muatProgram(true);
    } catch (er) { toast(er.message, 'galat', 5000); }
    b.disabled = false;
  }
  async function hapusKalender(e) {
    const b = e.target.closest('button[data-hapus]'); if (!b) return;
    if (b.dataset.yakin !== '1') { b.dataset.yakin = '1'; b.textContent = 'Yakin hapus?'; return; }
    b.disabled = true;
    try { PR.kal = await api('program.kalender', { hapus: b.dataset.hapus }); renderKalender(); PR.rinci = {}; muatProgram(true); }
    catch (er) { b.disabled = false; toast(er.message, 'galat', 5000); }
  }
  function renderBentuk() {
    const b = PR.bentuk; if (!b) return;
    $('prg-bentuk-form').hidden = !b.bolehTambah;
    $('prg-bentuk-daftar').innerHTML = b.bentuk.map((x) => '<li><strong>' + esc(x.bentuk) + '</strong>' +
      (x.cocok || x.ket ? '<span class="meta">' + esc([x.cocok, x.ket].filter(Boolean).join(' · ')) + '</span>' : '') +
      (x.oleh && x.oleh !== 'Contoh awal aplikasi' ? '<span class="meta oleh">Rekomendasi ' + esc(namaPendek(x.oleh)) + (x.peran ? ' (' + esc(x.peran) + ')' : '') + '</span>' : '') + '</li>').join('');
  }
  async function tambahBentuk(e) {
    e.preventDefault();
    const bentuk = $('bt-nama').value.trim();
    if (bentuk.length < 5) { $('bt-nama').focus(); toast('Tulis nama bentuk pembinaan minimal 5 huruf.', 'galat'); return; }
    const b = e.target.querySelector('button[type="submit"]'); b.disabled = true;
    try {
      const d = await api('program.tambahBentuk', { bentuk: bentuk, ket: $('bt-ket').value.trim(), cocok: $('bt-cocok').value.trim() });
      PR.bentuk.bentuk = d.bentuk; renderBentuk();
      $('bt-nama').value = ''; $('bt-ket').value = ''; $('bt-cocok').value = '';
      toast('Rekomendasi ditambahkan ke pilihan bentuk pembinaan.', 'hadir');
    } catch (er) { toast(er.message, 'galat', 5000); }
    b.disabled = false;
  }

  /** Riwayat siswa: ringkasan masa pembinaan. */
  function programRiwayatHtml(d) {
    const prg = d.program || [];
    let h = '<h3 class="sub-judul">Masa pembinaan dan skorsing (' + prg.length + ')</h3>';
    h += prg.length ? '<ul class="baris-ringkas">' + prg.map((p) => '<li><strong>' + esc(p.jenis) + ': ' + esc(p.tahap) + '</strong>, ' + p.terlaksana + ' dari ' + p.jumlah + ' hari' +
      (p.tertunda ? ' <span class="tag">+' + p.tertunda + ' diperpanjang</span>' : '') +
      '<span class="meta">' + esc(p.bentuk.join('; ')) + '</span><span class="meta">' + esc(tglManis(p.mulai, true)) + ' sampai ' + esc(tglManis(p.selesai, true)) +
      ', orang tua ' + (p.setuju ? 'sudah tanda tangan' : 'belum tanda tangan') + '. <a class="tautan" href="#pembinaan" data-aksi="lihat-prg" data-id="' + esc(p.id) + '">Lihat jadwal</a></span></li>').join('') + '</ul>'
      : '<p class="kosong">Belum ada masa pembinaan.</p>';
    return h;
  }

  /* =================================================================
   *  EKSKUL: pembina & pelatih yang hadir, foto kegiatan, lampiran
   * ================================================================= */
  const ES = { sesi: null, foto: new Map(), menyimpan: false, timer: null };
  function renderSesiE() {
    const e = eAktif(); if (!e) return;
    const s = ES.sesi || { pembinaHadir: [], pelatihHadir: [], foto: [], catatan: '' };
    const saya = String(S.guru.email || '').toLowerCase();
    const pembina = e.pembina || [];
    const hadirP = ES.sesi ? s.pembinaHadir : [saya];
    $('es-pembina').innerHTML = pembina.length ? pembina.map((g) => '<label class="centang-kecil"><input type="checkbox" value="' + esc(g.email) + '"' + (hadirP.indexOf(g.email) > -1 ? ' checked' : '') + '>' +
      '<span>' + esc(namaPendek(g.nama)) + (g.email === saya ? ' <small>(Anda)</small>' : '') + '</span></label>').join('') : '<p class="keterangan">Belum ada pembina terdaftar.</p>';
    const sudahTtd = s.ttdPelatih || [];
    $('es-pelatih').innerHTML = (e.pelatih || []).length ? e.pelatih.map((n) => {
      const hadir = s.pelatihHadir.indexOf(n) > -1, ttd = sudahTtd.indexOf(n) > -1;
      return '<div class="pelatih-baris"><label class="centang-kecil"><input type="checkbox" value="' + esc(n) + '"' + (hadir ? ' checked' : '') + '><span>' + esc(n) + '</span></label>' +
        (hadir ? '<span class="pelatih-ttd">' + (ttd ? '<span class="tag-ttd">Sudah tanda tangan</span><button type="button" class="tautan" data-ttdp="' + esc(n) + '">Ulangi</button>'
          : '<button type="button" class="tautan" data-ttdp="' + esc(n) + '">Tanda tangan</button>') + '</span>' : '') + '</div>';
    }).join('')
      : '<p class="keterangan">Belum ada nama pelatih. Ketuk Atur nama pelatih untuk menambahkannya.</p>';
    $('es-catatan').value = s.catatan || '';
    $('es-foto').innerHTML = s.foto.map((id) => '<figure data-id="' + esc(id) + '">' + (ES.foto.get(id) ? '<img alt="Foto kegiatan" src="' + ES.foto.get(id) + '">' : '<span class="ganti">Memuat…</span>') +
      '<button type="button" class="tautan merah" data-hapus-foto="' + esc(id) + '">Hapus</button></figure>').join('');
    $('es-foto-label').textContent = s.foto.length >= 6 ? 'Maksimal 6 foto' : s.foto.length ? 'Tambah foto' : 'Ambil foto kegiatan';
    $('es-foto-input').disabled = s.foto.length >= 6;
    $('es-status').textContent = ES.sesi ? 'Tersimpan pukul ' + (s.waktu || '-') + '.' : 'Belum disimpan untuk tanggal ini.';
    const perlu = s.foto.filter((id) => !ES.foto.has(id));
    if (perlu.length) {
      api('ekskul.foto', { ekskul: E.aktif, ids: perlu }).then((d) => {
        Object.keys(d.foto).forEach((id) => { if (d.foto[id].data) ES.foto.set(id, d.foto[id].data); });
        perlu.forEach((id) => { const f = $('es-foto').querySelector('figure[data-id="' + id + '"]'); if (f && ES.foto.get(id)) f.querySelector('.ganti').outerHTML = '<img alt="Foto kegiatan" src="' + ES.foto.get(id) + '">'; });
      }).catch(() => {});
    }
  }
  async function simpanSesiE(tambahan) {
    if (ES.menyimpan) return;
    ES.menyimpan = true;
    $('es-simpan').disabled = true; $('es-status').textContent = 'Menyimpan…';
    try {
      const d = await api('ekskul.sesi', Object.assign({ ekskul: E.aktif, tanggal: E.tanggal,
        pembinaHadir: Array.from($('es-pembina').querySelectorAll('input:checked')).map((x) => x.value),
        pelatihHadir: Array.from($('es-pelatih').querySelectorAll('input:checked')).map((x) => x.value),
        catatan: $('es-catatan').value }, tambahan || {}));
      ES.sesi = d.sesi;
      if (E.tanggal === E.data.hariIni) eAktif().sesi = d.sesi;
      renderSesiE();
      if (d.fotoDitolak) toast(d.fotoDitolak + ' foto tidak tersimpan (maksimal 6 foto per pertemuan).', 'galat', 5000);
      else toast('Pertemuan tersimpan.', 'hadir');
    } catch (er) { $('es-status').textContent = 'Belum tersimpan: ' + er.message; toast(er.message, 'galat', 5000); }
    finally { ES.menyimpan = false; $('es-simpan').disabled = false; }
  }
  /* Tanda tangan pelatih di layar, satu per pertemuan */
  const TP = { nama: '', pad: null };
  function bukaTtdPelatih(nama) {
    TP.nama = nama;
    $('ttdp-judul').textContent = 'Tanda tangan ' + nama;
    $('ttdp-ket').textContent = 'Pelatih ' + E.aktif + ', pertemuan ' + tglManis(E.tanggal, true) + '. Tanda tangan ini tercetak di daftar hadir bulanan.';
    $('ttdp-pesan').textContent = '';
    $('modal-ttdp').hidden = false;
    if (!TP.pad) TP.pad = padTtd($('ttdp-kanvas'));
    requestAnimationFrame(() => TP.pad.ukur());
  }
  function tutupTtdPelatih() { $('modal-ttdp').hidden = true; TP.nama = ''; }
  async function simpanTtdPelatih() {
    if (TP.pad.kosong()) { $('ttdp-pesan').textContent = 'Minta pelatih menandatangani kotak di atas dulu.'; return; }
    const nama = TP.nama, png = TP.pad.png();
    $('ttdp-simpan').disabled = true;
    try {
      const t = {}; t[nama] = png;
      await simpanSesiE({ ttdPelatih: t });
      tutupTtdPelatih();
    } finally { $('ttdp-simpan').disabled = false; }
  }
  /* Daftar nama pelatih, diisi pembina */
  const PL = { daftar: [] };
  function renderPelatihE() {
    $('pl-daftar').innerHTML = PL.daftar.length ? PL.daftar.map((n, i) => '<li><span>' + esc(n) + '</span><button type="button" class="tautan merah" data-hapus-pl="' + i + '">Hapus</button></li>').join('')
      : '<li class="kosong">Belum ada pelatih.</li>';
  }
  function bukaPelatihE() {
    const e = eAktif(); if (!e) return;
    PL.daftar = (e.pelatih || []).slice();
    $('pl-judul').textContent = 'Nama pelatih ' + e.nama;
    $('pl-baru').value = ''; $('pl-pesan').textContent = '';
    renderPelatihE();
    $('modal-pelatih').hidden = false;
    $('pl-baru').focus();
  }
  function tambahPelatihE() {
    const n = $('pl-baru').value.replace(/[,;=|]/g, ' ').replace(/\s+/g, ' ').trim();
    if (n.length < 3) { $('pl-pesan').textContent = 'Tulis nama pelatih minimal 3 huruf.'; return; }
    if (PL.daftar.some((x) => x.toLowerCase() === n.toLowerCase())) { $('pl-pesan').textContent = n + ' sudah ada di daftar.'; return; }
    PL.daftar.push(n); $('pl-baru').value = ''; $('pl-pesan').textContent = ''; renderPelatihE(); $('pl-baru').focus();
  }
  async function simpanPelatihE() {
    if ($('pl-baru').value.trim()) tambahPelatihE();
    $('pl-simpan').disabled = true; $('pl-pesan').textContent = '';
    try {
      const d = await api('ekskul.pelatih', { ekskul: E.aktif, pelatih: PL.daftar });
      const e = eAktif(); if (e) e.pelatih = d.pelatih;
      $('modal-pelatih').hidden = true;
      renderSesiE();
      toast('Daftar pelatih tersimpan.', 'hadir');
    } catch (er) { $('pl-pesan').textContent = er.message; }
    finally { $('pl-simpan').disabled = false; }
  }
  function pasangSesiE() {
    $('es-simpan').addEventListener('click', () => simpanSesiE());
    $('es-pelatih').addEventListener('click', (ev) => {
      const b = ev.target.closest('button[data-ttdp]'); if (!b) return;
      bukaTtdPelatih(b.dataset.ttdp);
    });
    $('es-atur-pelatih').addEventListener('click', bukaPelatihE);
    $('ttdp-ulang').addEventListener('click', () => TP.pad && TP.pad.bersih());
    $('ttdp-batal').addEventListener('click', tutupTtdPelatih);
    $('ttdp-simpan').addEventListener('click', simpanTtdPelatih);
    $('pl-tambah').addEventListener('click', tambahPelatihE);
    $('pl-baru').addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); tambahPelatihE(); } });
    $('pl-daftar').addEventListener('click', (ev) => {
      const b = ev.target.closest('button[data-hapus-pl]'); if (!b) return;
      PL.daftar.splice(Number(b.dataset.hapusPl), 1); renderPelatihE();
    });
    $('pl-batal').addEventListener('click', () => { $('modal-pelatih').hidden = true; });
    $('pl-simpan').addEventListener('click', simpanPelatihE);
    $('es-foto-input').addEventListener('change', async (ev) => {
      const files = Array.from(ev.target.files || []).slice(0, 3); ev.target.value = '';
      if (!files.length) return;
      $('es-status').textContent = 'Mengunggah ' + files.length + ' foto…';
      try {
        const foto = [];
        for (const f of files) foto.push(await kompresFoto(f, 1280, 380000));
        await simpanSesiE({ foto: foto });
      } catch (er) { toast(er.message, 'galat', 5000); }
    });
    $('es-foto').addEventListener('click', (ev) => {
      const b = ev.target.closest('button[data-hapus-foto]'); if (!b) return;
      if (b.dataset.yakin !== '1') { b.dataset.yakin = '1'; b.textContent = 'Yakin?'; return; }
      simpanSesiE({ hapusFoto: [b.dataset.hapusFoto] });
    });
    $('e-rekap-isi').addEventListener('click', async (ev) => {
      const b = ev.target.closest('button[data-aksi="lampiran"]'); if (!b) return;
      b.disabled = true; b.textContent = 'Menyusun lampiran…';
      try {
        const d = await api('ekskul.lampiran', { ekskul: E.aktif, bulan: $('e-bulan').value || E.data.hariIni.slice(0, 7) });
        $('e-lampiran').innerHTML = tautanPdf('Lampiran kehadiran ' + d.pertemuan + ' pertemuan siap', pdfDariBase64(d));
      } catch (er) { toast(er.message, 'galat', 5000); }
      b.disabled = false; b.textContent = 'Buat ulang lampiran PDF';
    });
  }
  function rekapSesiHtml(d) {
    if (!d.sesi || !d.sesi.length) return '';
    let h = '<h3 class="sub-judul">Pembina dan pelatih per pertemuan</h3><ul class="baris-ringkas">' + d.sesi.map((s) =>
      '<li><strong>' + esc(tglManis(s.tgl, true)) + '</strong><span class="meta">Pembina: ' + esc(s.pembina.map(namaPendek).join(', ') || '-') +
      '. Pelatih: ' + esc(s.pelatih.map((n) => n + ((s.ttd || []).indexOf(n) > -1 ? ' (TTD)' : '')).join(', ') || '-') + '. ' + (s.materi ? 'Materi: ' + esc(s.materi) + '. ' : '') + s.foto + ' foto.</span></li>').join('') + '</ul>';
    h += '<div class="aksi-riwayat"><button type="button" class="tombol tombol-garis" data-aksi="lampiran">' + ikon('surat') + (d.lampiran ? 'Buat ulang lampiran PDF' : 'Buat lampiran PDF') + '</button></div>';
    h += '<div id="e-lampiran">' + (d.lampiran && d.lampiran.url ? '<div class="surat-siap">Lampiran tersimpan ' + esc(d.lampiran.dibuat) + ': <a href="' + esc(d.lampiran.url) + '" target="_blank" rel="noopener">Lihat di Drive</a></div>' : '') + '</div>';
    h += '<p class="keterangan">Lampiran bulan lalu dibuat otomatis setiap tanggal 1 pukul 06.00.</p>';
    return h;
  }

  /* ---------------- Mulai ---------------- */
  function pasangKejadian() {
    pasangRuang();
    $('tombol-menu').innerHTML = ikon('menu');
    $('tombol-lapor-besar').innerHTML = ikon('lapor') + 'Lapor pelanggaran';
    $('tombol-menu').addEventListener('click', (e) => { e.stopPropagation(); ($('menu').hidden ? bukaMenu() : tutupMenu()); });
    $('menu-perbarui').addEventListener('click', async () => {
      tutupMenu();
      const sb = S.siap.beranda;
      S.siap = { beranda: sb }; B.data = null; DS.data = null; S.foto.clear(); FS.clear(); sesiTab.hapus('smkt_tatib_awal'); simpan.hapus('smkt_tatib_awal'); simpan.hapus('smkt_tatib_beranda');
      if (!E.antre.size) E.data = null;
      await muatAwal(false); toast('Data diperbarui.', 'hadir');
    });
    $('menu-ujiwa').addEventListener('click', async () => {
      tutupMenu(); toast('Mengirim WA uji…', '', 8000);
      try { const d = await api('tatib.ujiWA'); toast('WA uji terkirim ke ' + d.nomor + ' pukul ' + d.jam + '. Cek WhatsApp Anda.', 'hadir', 6000); }
      catch (e) { toast(e.message, 'galat', 7000); }
    });
    $('menu-keluar').addEventListener('click', keluar);
    $('menu-kios').addEventListener('click', bukaKios);
    $('kios-tutup').addEventListener('click', () => { $('lembar-kios').hidden = true; });
    $('lembar-kios').addEventListener('click', klikKios);
    $('sisi-akun').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-aksi]'); if (!b) return;
      ({ kios: bukaKios, ujiwa: () => $('menu-ujiwa').click(), perbarui: () => $('menu-perbarui').click(), keluar: keluar })[b.dataset.aksi]();
    });
    $('titip-batal').addEventListener('click', tutupTitip);
    $('titip-simpan').addEventListener('click', simpanTitip);
    $('titip-plg').addEventListener('change', infoNaikTitip);
    document.querySelectorAll('.ik-kamera').forEach((el) => { el.outerHTML = ikon('kamera'); });
    pasangPernyataan();
    $('foto-tutup').addEventListener('click', () => { $('modal-foto').hidden = true; });
    $('modal-foto').addEventListener('click', (e) => { if (e.target === $('modal-foto')) $('modal-foto').hidden = true; });
    $('scan-tutup').addEventListener('click', tutupScan);
    $('nav-bawah').addEventListener('click', (e) => { if (e.target.closest('#nav-lainnya')) $('lembar-lainnya').hidden = false; });
    $('lembar-lainnya').addEventListener('click', (e) => { if (e.target === $('lembar-lainnya')) $('lembar-lainnya').hidden = true; });
    window.addEventListener('hashchange', () => { if (!$('layar-utama').hidden && S.menu.length) buka(halamanDariHash()); });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (!$('modal-scan').hidden) tutupScan(); else if (!$('modal-foto').hidden) $('modal-foto').hidden = true; else if (!$('modal-titip').hidden) tutupTitip(); else if (!$('modal-pbn').hidden) tutupPernyataan(); else if (!$('modal-prg').hidden) tutupFormProgram(); else if (!$('modal-akun').hidden) tutupFormAkun(); else if (!$('modal-ttdp').hidden) tutupTtdPelatih(); else if (!$('modal-pelatih').hidden) $('modal-pelatih').hidden = true; else if (!$('ruang-menu').hidden) $('ruang-menu').hidden = true;
      else if (!$('lembar-kios').hidden) $('lembar-kios').hidden = true; else if (!$('lembar-lainnya').hidden) $('lembar-lainnya').hidden = true; else if (!$('menu').hidden) tutupMenu();
    });
    document.addEventListener('click', (e) => { if (!$('menu').hidden && !e.target.closest('#menu') && !e.target.closest('#tombol-menu')) tutupMenu(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) tutupScan(); });
  }
  function mulai() {
    pasangKejadian();
    if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
    const sesi = simpan.get('smkt_sesi', null);
    S.ruang = String(simpan.get('smkt_ruang', '') || '');
    if (sesi && sesi.kedaluwarsa > Date.now() && sesi.sesi && sesi.sesi !== 'demo') { S.sesi = sesi.sesi; S.guru = sesi.guru; bukaUtama(); }
    else tampilLogin();
  }

  window.SMKT_tatib = { keadaan: S, C: C, PB: PB, PR: PR, ES: ES };
  mulai();
})();
