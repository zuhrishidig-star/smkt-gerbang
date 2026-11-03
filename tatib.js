/*
 * Tata Tertib SMKT · aplikasi web guru · v1.0 (3 November 2026)
 * Setiap guru mencatat pelanggaran yang ditemukan dan langsung mendapat
 * panduan: siapa yang menangani, langkahnya, dan kapan harus diteruskan.
 * Pelanggaran ringan selesai di tangan guru yang menemukan; yang perlu
 * diteruskan masuk ke menu Tindak lanjut penerimanya.
 * Memakai login dan sesi yang sama dengan Gerbang (localStorage smkt_sesi).
 */
(function () {
  'use strict';

  const CFG = window.SMKT_CONFIG || {};
  const PENERIMA = ['Wali Kelas', 'BK', 'Tim Tatib', 'Wakasek', 'Kepala Sekolah'];
  const URUT_KATEGORI = ['Ringan I', 'Ringan II', 'Sedang I', 'Sedang II', 'Berat I', 'Berat II', 'Berat Sekali'];
  const BATAS_ULANG = 3;
  const HARI_IZIN_MUNDUR = 7;
  const IKON_QR = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm8-2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h4v2h-2v2h-2v-4zm-4 4h2v4h-2v-4zm4 2h4v2h-4v-2zm2-4h2v2h-2v-2z"/></svg>';

  const $ = (id) => document.getElementById(id);

  const S = {
    sesi: null, guru: null, akses: {},
    siswa: new Map(), master: new Map(), panduan: {}, eskalasi: [],
    tab: 'catat', siap: {},
    kamera: null, scanCb: null,
  };

  /* ---------------- Bantu ---------------- */
  const esc = (v) => String(v === null || v === undefined ? '' : v).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() :
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
    }));
  const fmtTanggal = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' });
  const hariIni = (geserHari) => fmtTanggal.format(new Date(Date.now() + (geserHari || 0) * 86400000));
  const inisial = (nama) => String(nama || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0].toUpperCase()).join('');
  const punya = (daftar) => (S.guru && S.guru.peran || []).some((p) => daftar.indexOf(p) > -1);
  const rapat = (t) => String(t || '').toLowerCase().replace(/\s+/g, '');

  const simpan = {
    get(k, bawaan) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : bawaan; } catch (e) { return bawaan; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* penyimpanan penuh atau diblokir */ } },
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

  function labelLevel(level) { return level > 0 ? 'Level ' + level : 'Aman'; }
  function lencanaLevel(level) { return '<span class="level l' + (level || 0) + '">' + labelLevel(level) + '</span>'; }
  function levelDari(total) {
    let lv = 0;
    S.eskalasi.forEach((e) => { if (total >= e.ambang) lv = Math.max(lv, e.level); });
    return lv;
  }
  function infoLevel(level) { return S.eskalasi.filter((e) => e.level === level)[0] || null; }

  /* ---------------- API ---------------- */
  async function api(aksi, data) {
    if (!CFG.API_URL) throw new Error('API_URL di config.js belum diisi.');
    const isi = Object.assign({ aksi: aksi, sesi: S.sesi }, data || {});
    let res;
    try {
      res = await fetch(CFG.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(isi),
        redirect: 'follow',
      });
    } catch (e) {
      throw Object.assign(new Error('Tidak ada sinyal ke server. Coba lagi.'), { jaringan: true });
    }
    if (!res.ok) throw Object.assign(new Error('Server menjawab ' + res.status + '. Coba lagi.'), { jaringan: true });
    let j;
    try { j = await res.json(); } catch (e) {
      throw Object.assign(new Error('Jawaban server tidak terbaca. Coba lagi sebentar lagi.'), { jaringan: true });
    }
    if (!j.ok) {
      if (j.kode === 'SESI' || j.kode === 'TIDAK_TERDAFTAR') {
        hapusSesi();
        tampilLogin(j.pesan);
      }
      throw Object.assign(new Error(j.pesan || 'Permintaan ditolak server.'), { kode: j.kode });
    }
    return j.data;
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
      if (!googleSiap) {
        google.accounts.id.initialize({ client_id: CFG.GOOGLE_CLIENT_ID, callback: (r) => masukDenganToken(r.credential) });
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
      S.sesi = d.sesi; S.guru = d.guru;
      simpan.set('smkt_sesi', { sesi: d.sesi, kedaluwarsa: d.kedaluwarsa, guru: d.guru });
      $('login-pesan').textContent = '';
      bukaUtama();
    } catch (e) {
      $('login-pesan').textContent = e.message;
    }
  }

  function hapusSesi() {
    S.sesi = null; S.guru = null;
    simpan.hapus('smkt_sesi');
    sesiTab.hapus('smkt_tatib_awal');
  }

  async function keluar() {
    tutupMenu();
    if (!confirm('Keluar dari aplikasi? Data siswa di HP ini akan dihapus.')) return;
    try { await api('keluar'); } catch (e) { /* tetap keluar */ }
    hapusSesi();
    // Data siswa milik modul Gerbang juga dibersihkan, seperti saat keluar dari Gerbang.
    try { indexedDB.deleteDatabase('smkt-gerbang'); } catch (e) { /* abaikan */ }
    simpan.hapus('smkt_waktu_sinkron');
    try { Object.keys(localStorage).forEach((k) => { if (k.indexOf('smkt_log_') === 0) simpan.hapus(k); }); } catch (e) { /* abaikan */ }
    S.siswa = new Map(); S.siap = {};
    if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect();
    location.reload();
  }

  /* ---------------- Layar utama ---------------- */
  async function bukaUtama() {
    $('layar-login').hidden = true;
    $('layar-utama').hidden = false;
    $('nama-guru').textContent = S.guru.nama;
    const cache = sesiTab.get('smkt_tatib_awal');
    if (cache && cache.sesi === S.sesi && cache.data) {
      terapkanAwal(cache.data);
      pilihTab(sesiTab.get('smkt_tatib_tab') || 'catat');
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
      if (!diam) pilihTab(sesiTab.get('smkt_tatib_tab') || 'catat');
    } catch (e) {
      if (diam) return;
      if (e.kode === 'SESI' || e.kode === 'TIDAK_TERDAFTAR') return;
      $('memuat').hidden = false;
      $('memuat').innerHTML = esc(e.message) + '<br><button type="button" class="tautan" id="coba-lagi">Coba lagi</button>';
      $('coba-lagi').addEventListener('click', () => muatAwal(false));
    }
  }

  function terapkanAwal(d) {
    S.guru = d.guru; S.akses = d.akses || {};
    S.siswa = new Map((d.siswa || []).map((s) => [s.nis, s]));
    S.master = new Map((d.master || []).map((m) => [m.id, m]));
    S.panduan = d.panduan || {};
    S.eskalasi = d.eskalasi || [];
    $('nama-guru').textContent = S.guru.nama + (S.guru.kelasWali ? ' · Wali ' + S.guru.kelasWali : '');
    const tampil = { catat: true, tindak: !!S.akses.tindakLanjut, siswa: !!S.akses.riwayat, zona: !!S.akses.zona, pulih: !!S.akses.pemulihan, izin: !!S.akses.izin };
    let jumlah = 0;
    document.querySelectorAll('#tab-tatib button').forEach((b) => { b.hidden = !tampil[b.dataset.tab]; if (!b.hidden) jumlah++; });
    $('tab-tatib').hidden = jumlah < 2;
    $('menu-gerbang').hidden = !S.guru.bolehGerbang;
    aturLencana(d.menunggu || 0);
    $('memuat').hidden = true;
  }

  function aturLencana(n) {
    const b = $('badge-tindak');
    b.hidden = !n;
    b.textContent = n > 99 ? '99+' : String(n);
  }

  function pilihTab(nama) {
    const b = document.querySelector('#tab-tatib button[data-tab="' + nama + '"]');
    if (!b || b.hidden) nama = 'catat';
    S.tab = nama;
    sesiTab.set('smkt_tatib_tab', nama);
    document.querySelectorAll('#tab-tatib button').forEach((x) => x.setAttribute('aria-selected', String(x.dataset.tab === nama)));
    document.querySelectorAll('.panel').forEach((p) => { p.hidden = p.id !== 'p-' + nama; });
    const init = { catat: initCatat, tindak: muatTL, siswa: initRiwayat, zona: muatZona, pulih: muatPulih, izin: initIzin };
    init[nama]();
    window.scrollTo(0, 0);
  }

  /* ---------------- Menu ---------------- */
  function bukaMenu() {
    const g = S.guru || {};
    $('menu-info').textContent = g.nama + ' · ' + (g.peran || []).join(', ') + (g.kelasWali ? ' · Wali kelas ' + g.kelasWali : '');
    $('menu').hidden = false;
    $('tombol-menu').setAttribute('aria-expanded', 'true');
  }
  function tutupMenu() { $('menu').hidden = true; $('tombol-menu').setAttribute('aria-expanded', 'false'); }

  /* ---------------- Pemilih siswa (cari nama/NIS atau scan QR) ---------------- */
  function cariSiswa(daftar, q) {
    const kata = q.toLowerCase().split(/\s+/).filter(Boolean);
    const hasil = daftar.filter((s) => {
      const tumpuk = (s.nama + ' ' + s.kelas + ' ' + rapat(s.kelas) + ' ' + s.nis).toLowerCase();
      return kata.every((k) => tumpuk.indexOf(k) > -1);
    });
    const awal = q.toLowerCase();
    hasil.sort((a, b) => (b.nis === q) - (a.nis === q) ||
      (b.nama.toLowerCase().indexOf(awal) === 0) - (a.nama.toLowerCase().indexOf(awal) === 0) ||
      a.nama.localeCompare(b.nama));
    return hasil;
  }

  function pemilihSiswa(wadah, opsi) {
    const id = opsi.id;
    wadah.innerHTML =
      '<label class="label" for="' + id + '-q">' + esc(opsi.label || 'Cari siswa') + '</label>' +
      '<div class="cari-baris"><input id="' + id + '-q" class="isian" type="search" autocomplete="off" enterkeyhint="search" placeholder="Nama, NIS, atau kelas">' +
      '<button type="button" class="tombol-scan" aria-label="Scan kartu pelajar">' + IKON_QR + '<span>Scan</span></button></div>' +
      (opsi.catatan ? '<p class="keterangan">' + esc(opsi.catatan) + '</p>' : '') +
      '<ul class="hasil-cari" id="' + id + '-hasil"></ul>';
    const q = wadah.querySelector('input');
    const ul = wadah.querySelector('ul');
    const boleh = () => Array.from(S.siswa.values()).filter(opsi.saring || (() => true));
    const pilih = (s) => { q.value = ''; render(); opsi.pilih(s); };
    function render() {
      const teks = q.value.trim();
      const daftar = boleh();
      let hasil;
      if (!teks) hasil = opsi.tampilSemua && daftar.length <= 40 ? daftar.sort((a, b) => a.nama.localeCompare(b.nama)) : [];
      else hasil = cariSiswa(daftar, teks).slice(0, 8);
      if (teks && !hasil.length) { ul.innerHTML = '<li class="kosong">Tidak ada siswa yang cocok.</li>'; return; }
      ul.innerHTML = hasil.map((s) =>
        '<li><button type="button" data-nis="' + esc(s.nis) + '"><span class="mini">' + esc(inisial(s.nama)) + '</span>' +
        '<span><span class="nm">' + esc(s.nama) + '</span><span class="kl">' + esc(s.kelas) + ' · NIS ' + esc(s.nis) + '</span></span></button></li>').join('');
    }
    q.addEventListener('input', render);
    q.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const b = ul.querySelector('button');
      if (b) b.click();
    });
    ul.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-nis]');
      if (b) pilih(S.siswa.get(b.dataset.nis));
    });
    wadah.querySelector('.tombol-scan').addEventListener('click', () => bukaScan((nis) => {
      const s = S.siswa.get(nis);
      if (!s) { toast('Kartu dengan NIS ' + nis + ' tidak ada di daftar siswa aktif.', 'galat'); return; }
      if (opsi.saring && !opsi.saring(s)) { toast(s.nama + ' (' + s.kelas + ') di luar daftar yang bisa Anda pilih di sini.', 'galat'); return; }
      pilih(s);
    }));
    render();
    return { render: render, fokus: () => q.focus() };
  }

  function kartuSiswa(s, aksiGanti) {
    return '<div class="siswa-pilih"><span class="mini">' + esc(inisial(s.nama)) + '</span>' +
      '<span><span class="nm">' + esc(s.nama) + '</span><span class="kl">' + esc(s.kelas) + ' · NIS ' + esc(s.nis) + '</span></span>' +
      (aksiGanti ? '<button type="button" class="tautan" data-aksi="' + aksiGanti + '">Ganti</button>' : '') + '</div>';
  }

  /* ---------------- Pemindai QR ---------------- */
  async function bukaScan(cb) {
    if (!window.Html5Qrcode) { toast('Pemindai QR gagal dimuat. Ketik nama siswa.', 'galat'); return; }
    S.scanCb = cb;
    $('modal-scan').hidden = false;
    $('scan-ket').textContent = 'Menyalakan kamera…';
    if (!S.kamera) S.kamera = new Html5Qrcode('scan-reader', { formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE], verbose: false });
    try {
      await S.kamera.start(
        { facingMode: 'environment' },
        { fps: 12, aspectRatio: 1, qrbox: (w, h) => { const s = Math.max(160, Math.floor(Math.min(w, h) * 0.7)); return { width: s, height: s }; } },
        (teks) => {
          const f = S.scanCb;
          if (!f) return;
          tutupScan();
          f(String(teks || '').trim());
        },
        () => {}
      );
      if ($('modal-scan').hidden) { tutupScan(); return; }
      $('scan-ket').textContent = 'Arahkan kamera ke QR kartu pelajar.';
    } catch (e) {
      $('scan-ket').textContent = 'Kamera belum bisa dibuka. Izinkan akses kamera di browser, atau tutup lalu ketik nama siswa.';
    }
  }

  async function tutupScan() {
    S.scanCb = null;
    $('modal-scan').hidden = true;
    try {
      const st = S.kamera ? S.kamera.getState() : 1;
      if (st === 2 || st === 3) await S.kamera.stop();
    } catch (e) { /* sudah berhenti */ }
  }

  /* =================================================================
   *  CATAT PELANGGARAN
   * ================================================================= */
  const C = { siswa: null, ringkas: null, plg: null, kategori: '', idCatat: null, penanganan: 'sendiri', ke: '', menyimpan: false, pemilih: null };

  function initCatat() {
    if (S.siap.catat) return;
    S.siap.catat = true;
    C.pemilih = pemilihSiswa($('c-siswa-pilih'), {
      id: 'cs', label: 'Cari siswa yang melanggar', pilih: pilihSiswaCatat,
      tampilSemua: false,
    });
    $('c-cari-plg').addEventListener('input', renderDaftarPlg);
    $('c-kategori').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-kat]');
      if (!b) return;
      C.kategori = b.dataset.kat;
      renderDaftarPlg();
    });
    $('c-daftar-plg').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-id]');
      if (b) pilihPlg(S.master.get(b.dataset.id));
    });
    $('c-melawan').addEventListener('change', renderPenanganan);
    $('c-penanganan').addEventListener('change', (e) => {
      if (e.target.name === 'c-tangani') C.penanganan = e.target.value;
      if (e.target.id === 'c-ke') C.ke = e.target.value;
      renderPenanganan();
    });
    $('c-tindakan').addEventListener('input', aturTombolSimpan);
    $('c-simpan').addEventListener('click', simpanCatat);
    $('p-catat').addEventListener('click', (e) => {
      const a = e.target.closest('[data-aksi]');
      if (!a) return;
      if (a.dataset.aksi === 'ganti-siswa') resetCatat(true);
      if (a.dataset.aksi === 'ganti-plg') bukaDaftarPlg();
      if (a.dataset.aksi === 'lagi-siswa-ini') { const s = C.siswa; resetCatat(false); pilihSiswaCatat(s); }
      if (a.dataset.aksi === 'siswa-lain') resetCatat(true);
    });
    resetCatat(false);
  }

  function resetCatat(fokus) {
    Object.assign(C, { siswa: null, ringkas: null, plg: null, kategori: '', idCatat: null, penanganan: 'sendiri', ke: '' });
    $('c-siswa-pilih').hidden = false;
    $('c-siswa-kartu').hidden = true;
    $('c-plg').hidden = true;
    $('c-tindak').hidden = true;
    $('c-hasil').hidden = true;
    $('c-melawan').checked = false;
    $('c-ket').value = ''; $('c-tindakan').value = '';
    $('c-cari-plg').value = '';
    if (C.pemilih) C.pemilih.render();
    if (fokus && C.pemilih) C.pemilih.fokus();
  }

  async function pilihSiswaCatat(s) {
    if (!s) return;
    C.siswa = s; C.ringkas = null; C.plg = null; C.idCatat = uuid();
    C.penanganan = 'sendiri'; C.ke = '';
    $('c-melawan').checked = false;
    $('c-ket').value = ''; $('c-tindakan').value = '';
    $('c-siswa-pilih').hidden = true;
    $('c-hasil').hidden = true;
    $('c-tindak').hidden = true;
    renderKartuCatat('Memuat poin siswa…');
    bukaDaftarPlg();
    try {
      const d = await api('tatib.ringkas', { nis: s.nis });
      if (C.siswa !== s) return;
      C.ringkas = d;
      renderKartuCatat();
      renderDaftarPlg();
      if (C.plg) renderPanduan();
    } catch (e) {
      if (C.siswa !== s) return;
      renderKartuCatat('Poin siswa belum bisa dimuat (' + e.message + '). Catatan tetap bisa disimpan.');
    }
  }

  function renderKartuCatat(pesan) {
    const s = C.siswa, r = C.ringkas;
    let h = kartuSiswa(s, 'ganti-siswa');
    if (r) {
      h += '<div class="ringkas"><span>Poin <strong>' + r.poin + '</strong> ' + lencanaLevel(r.level) + '</span>' +
        '<span><strong>' + r.jumlah30 + '</strong> catatan dalam 30 hari</span>' +
        (r.siswa.wali ? '<span>Wali kelas: <strong>' + esc(r.siswa.wali) + '</strong></span>' : '') + '</div>';
      if (r.terakhir && r.terakhir.length) {
        h += '<ul class="terakhir">' + r.terakhir.map((t) => '<li>' + esc(t.tanggal) + ' · ' + esc(t.nama) + ' · +' + t.poin + '</li>').join('') + '</ul>';
      }
    } else if (pesan) {
      h += '<p class="keterangan" style="margin-top:10px">' + esc(pesan) + '</p>';
    }
    $('c-siswa-kartu').innerHTML = h;
    $('c-siswa-kartu').hidden = false;
  }

  function bukaDaftarPlg() {
    C.plg = null;
    $('c-plg').hidden = false;
    $('c-plg-cari').hidden = false;
    $('c-plg-terpilih').hidden = true;
    $('c-tindak').hidden = true;
    renderKategori();
    renderDaftarPlg();
  }

  function urutKategori(a, b) {
    const ia = URUT_KATEGORI.indexOf(a), ib = URUT_KATEGORI.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
  }

  function renderKategori() {
    const kat = Array.from(new Set(Array.from(S.master.values()).map((m) => m.kategori).filter(Boolean))).sort(urutKategori);
    $('c-kategori').innerHTML = ['', ...kat].map((k) =>
      '<button type="button" data-kat="' + esc(k) + '" aria-pressed="' + (C.kategori === k) + '">' + esc(k || 'Semua') + '</button>').join('');
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
      return '<li><button type="button" data-id="' + esc(m.id) + '"><span class="nm">' + esc(m.nama) + '</span>' +
        '<span class="pn">+' + m.bobot + '</span>' +
        '<span class="kt">' + esc(m.kategori) + ' · ' + esc(m.id) +
        (n ? ' · <span class="ulang">sudah ' + n + '× dalam 30 hari</span>' : '') + '</span></button></li>';
    }).join('');
  }

  function pilihPlg(m) {
    if (!m) return;
    C.plg = m;
    const p = panduanUntuk(m);
    C.penanganan = 'sendiri';
    C.ke = p.teruskanKe;
    $('c-plg-cari').hidden = true;
    $('c-plg-terpilih').innerHTML = '<div class="plg-pilih"><span><span class="nm">' + esc(m.nama) + '</span><br>' +
      '<span class="kt">' + esc(m.kategori) + ' · ' + esc(m.id) + ' · ' + m.bobot + ' poin</span></span>' +
      '<button type="button" class="tautan" data-aksi="ganti-plg">Ganti</button></div>';
    $('c-plg-terpilih').hidden = false;
    $('c-tindak').hidden = false;
    renderPanduan();
    $('c-tindak').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function panduanUntuk(m) {
    return S.panduan[m.kategori] || { ditangani: 'Guru yang menemukan', langkah: 'Tegur siswa, jalankan sanksi di daftar tata tertib, lalu catat.', teruskanKe: 'Wali Kelas', wajib: false, syarat: '' };
  }

  function renderPanduan() {
    const m = C.plg, p = panduanUntuk(m);
    let h = '<div class="panduan-kepala"><span id="c-panduan-judul"></span><small>Ditangani oleh: ' + esc(p.ditangani || '-') + '</small></div><div class="panduan-isi"><dl>';
    if (p.langkah) h += '<div><dt>Langkah</dt><dd>' + esc(p.langkah) + '</dd></div>';
    if (m.sanksi) h += '<div><dt>Sanksi di daftar tata tertib</dt><dd>' + esc(m.sanksi) + '</dd></div>';
    if (p.syarat) h += '<div><dt>Kapan diteruskan</dt><dd>' + esc(p.syarat) + '</dd></div>';
    h += '</dl></div>';
    $('c-panduan').innerHTML = h;
    renderPenanganan();
  }

  /** Judul dan warna panduan mengikuti keputusan akhir: hijau ditangani sendiri, kuning/merah diteruskan. */
  function aturJudulPanduan(k) {
    let judul, kelas = '';
    if (k.waliSendiri) { judul = 'Tanggung jawab Anda sebagai wali kelas'; kelas = 'terus'; }
    else if (k.terus) {
      judul = (k.p.wajib ? 'Wajib diteruskan ke ' : k.paksa ? 'Perlu diteruskan ke ' : 'Anda meneruskan ke ') + k.ke;
      kelas = ['Tim Tatib', 'BK', 'Wakasek', 'Kepala Sekolah'].indexOf(k.ke) > -1 && k.p.wajib ? 'berat' : 'terus';
    } else judul = 'Bisa Anda tangani sendiri';
    $('c-panduan').className = 'panduan' + (kelas ? ' ' + kelas : '');
    $('c-panduan-judul').textContent = judul;
  }

  /** Meniru aturan server agar guru tahu sebelum menyimpan: diteruskan atau selesai. */
  function keputusanCatat() {
    const m = C.plg, p = panduanUntuk(m);
    const melawan = $('c-melawan').checked;
    const ulang = ((C.ringkas && C.ringkas.hitung30 && C.ringkas.hitung30[m.id]) || 0) + 1;
    const alasan = [];
    if (p.wajib) alasan.push('kategori ' + m.kategori + ' wajib diteruskan');
    if (melawan) alasan.push('siswa membangkang');
    if (ulang >= BATAS_ULANG) alasan.push('pelanggaran yang sama ke-' + ulang + ' dalam 30 hari');
    const paksa = alasan.length > 0;
    const terus = paksa || C.penanganan === 'teruskan';
    let ke = p.wajib ? p.teruskanKe : (PENERIMA.indexOf(C.ke) > -1 ? C.ke : p.teruskanKe);
    const waliSendiri = terus && ke === 'Wali Kelas' && punya(['Wali Kelas']) && S.guru.kelasWali === C.siswa.kelas;
    return { p: p, melawan: melawan, ulang: ulang, alasan: alasan, paksa: paksa, terus: terus && !waliSendiri, ke: ke, waliSendiri: waliSendiri };
  }

  function pilihanPenerima(terpilih) {
    return '<select id="c-ke" class="isian" aria-label="Teruskan ke">' + PENERIMA.map((x) =>
      '<option' + (x === terpilih ? ' selected' : '') + '>' + esc(x) + '</option>').join('') + '</select>';
  }

  function renderPenanganan() {
    if (!C.plg) return;
    const k = keputusanCatat();
    aturJudulPanduan(k);
    let h = '<p class="judul-kecil">Penanganan</p>';
    if (k.paksa) {
      if (k.waliSendiri) {
        h += '<div class="kunci sendiri">Anda wali kelas ' + esc(C.siswa.kelas) + ', jadi catatan ini langsung menjadi tanggung jawab Anda.' +
          '<small>Alasan perlu ditindaklanjuti: ' + esc(k.alasan.join('; ')) + '. Tulis tindakan Anda di bawah.</small>' +
          (!k.p.wajib ? '<small>Bila perlu bantuan, teruskan ke:</small>' + pilihanPenerima(k.ke) : '') + '</div>';
      } else {
        h += '<div class="kunci">Catatan akan diteruskan ke ' + esc(k.ke) +
          '<small>Alasan: ' + esc(k.alasan.join('; ')) + '.</small>' +
          (!k.p.wajib ? '<small>Penerima:</small>' + pilihanPenerima(k.ke) : '') + '</div>';
      }
    } else {
      h += '<div class="opsi" role="radiogroup" aria-label="Penanganan">' +
        '<label><input type="radio" name="c-tangani" value="sendiri"' + (C.penanganan === 'sendiri' ? ' checked' : '') + '>' +
        '<span><strong>Saya tangani sendiri</strong><small>Catatan langsung selesai dan tidak masuk ke daftar tim tata tertib.</small></span></label>' +
        '<label><input type="radio" name="c-tangani" value="teruskan"' + (C.penanganan === 'teruskan' ? ' checked' : '') + '>' +
        '<span><strong>Perlu diteruskan</strong><small>Pilih ini hanya bila Anda butuh bantuan menangani siswa.</small>' +
        (C.penanganan === 'teruskan' ? pilihanPenerima(k.ke) : '') + '</span></label></div>';
      if (C.penanganan === 'teruskan' && k.waliSendiri) {
        h += '<p class="keterangan">Anda wali kelas siswa ini, jadi catatan tetap selesai di tangan Anda. Pilih BK atau Tim Tatib bila butuh bantuan.</p>';
      }
    }
    $('c-penanganan').innerHTML = h;
    $('c-penanganan').className = 'penanganan';
    const butuhTindakan = !k.terus;
    $('c-tindakan').placeholder = butuhTindakan ? 'Contoh: ditegur, seragam dirapikan saat itu juga' : 'Contoh: siswa diamankan dan dibawa ke ruang BK';
    document.querySelector('label[for="c-tindakan"]').innerHTML = butuhTindakan
      ? 'Tindakan yang sudah Anda lakukan'
      : 'Tindakan awal yang sudah Anda lakukan <span class="redup">(opsional)</span>';
    renderPratinjau(k);
    aturTombolSimpan();
  }

  function renderPratinjau(k) {
    const m = C.plg;
    const poin = m.bobot * (k.melawan ? 2 : 1);
    let h = 'Poin <strong>+' + poin + '</strong>' + (k.melawan ? ' (×2 karena membangkang)' : '') + '.';
    if (C.ringkas) {
      const total = C.ringkas.poin + poin;
      const lv = levelDari(total);
      h += ' Total ' + C.ringkas.poin + ' → <strong>' + total + ' poin</strong> ' + lencanaLevel(lv) + '.';
      if (lv > C.ringkas.level) {
        const info = infoLevel(lv);
        h += '<span class="naik">Siswa akan naik ke Level ' + lv + '. ' + esc(info ? info.tindakan + ' Penanggung jawab: ' + info.pj + '.' : '') + '</span>';
      }
    }
    $('c-pratinjau').innerHTML = h;
  }

  function aturTombolSimpan() {
    if (!C.plg) return;
    const k = keputusanCatat();
    const b = $('c-simpan');
    b.textContent = C.menyimpan ? 'Menyimpan…' : (k.terus ? 'Simpan dan teruskan ke ' + k.ke : 'Simpan, selesai ditangani');
    b.disabled = C.menyimpan || (!k.terus && !$('c-tindakan').value.trim());
  }

  async function simpanCatat() {
    if (C.menyimpan || !C.siswa || !C.plg) return;
    const k = keputusanCatat();
    const tindakan = $('c-tindakan').value.trim();
    if (!k.terus && !tindakan) { $('c-tindakan').focus(); return; }
    C.menyimpan = true; aturTombolSimpan();
    try {
      const d = await api('tatib.catat', {
        nis: C.siswa.nis, idPlg: C.plg.id, melawan: k.melawan,
        keterangan: $('c-ket').value.trim(), tindakan: tindakan,
        penanganan: C.penanganan, teruskanKe: k.ke, idCatat: C.idCatat,
      });
      C.menyimpan = false;
      tampilHasilCatat(d);
    } catch (e) {
      C.menyimpan = false; aturTombolSimpan();
      toast(e.jaringan ? 'Belum tersimpan: ' + e.message + ' Tekan Simpan lagi; catatan tidak akan tercatat dua kali.' : e.message, 'galat', 6000);
    }
  }

  function tampilHasilCatat(d) {
    $('c-plg').hidden = true;
    $('c-tindak').hidden = true;
    const plg = d.pelanggaran || C.plg;
    let h = '<h2>' + (d.sudahTercatat ? 'Sudah tercatat sebelumnya' : 'Tercatat') + '</h2>' +
      '<p>' + esc(d.siswa.nama) + ' (' + esc(d.siswa.kelas) + ') · ' + esc(plg.nama) + ' · <strong>+' + d.poin + ' poin</strong>' +
      (d.melawan ? ' (×2 membangkang)' : '') + '</p>' +
      '<p>Total poin sekarang <strong>' + d.total + '</strong> ' + lencanaLevel(d.level) + '</p>';
    if (d.diteruskan) {
      h += '<p>Diteruskan ke <strong>' + esc(d.diteruskan.ke) + '</strong>' +
        (d.diteruskan.alasan && d.diteruskan.alasan.length ? ' karena ' + esc(d.diteruskan.alasan.join('; ')) : '') +
        '. Catatan masuk ke menu Tindak lanjut mereka; Anda tidak perlu melapor lagi.</p>';
    } else {
      h += '<p>Selesai ditangani. Tidak perlu dilaporkan ke tim tata tertib.</p>';
    }
    if (d.naikLevel && d.langkahLevel) {
      h += '<p class="naik">Naik ke Level ' + d.level + ': ' + esc(d.langkahLevel.tindakan) + ' Penanggung jawab: ' + esc(d.langkahLevel.pj) + '.</p>';
    }
    h += '<div class="aksi"><button type="button" class="tombol tombol-utama" data-aksi="siswa-lain">Catat siswa lain</button>' +
      '<button type="button" class="tombol tombol-garis" data-aksi="lagi-siswa-ini">Pelanggaran lain untuk ' + esc(d.siswa.nama.split(' ')[0]) + '</button></div>';
    const el = $('c-hasil');
    el.className = 'blok hasil' + (d.diteruskan ? ' terus' : '');
    el.innerHTML = h;
    el.hidden = false;
    // Perbarui ringkasan di kartu siswa
    if (C.ringkas) {
      C.ringkas.poin = d.total; C.ringkas.level = d.level; C.ringkas.jumlah30 += d.sudahTercatat ? 0 : 1;
      renderKartuCatat();
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    toast(d.diteruskan ? 'Tersimpan, diteruskan ke ' + d.diteruskan.ke : 'Tersimpan', 'hadir');
  }

  /* =================================================================
   *  TINDAK LANJUT
   * ================================================================= */
  const T = { status: 'Menunggu', item: [], memuat: false };

  function initTL() {
    if (S.siap.tindak) return;
    S.siap.tindak = true;
    document.querySelectorAll('#p-tindak .segmen button').forEach((b) => b.addEventListener('click', () => {
      T.status = b.dataset.status;
      document.querySelectorAll('#p-tindak .segmen button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      muatTL();
    }));
    $('tl-daftar').addEventListener('click', klikTL);
    $('tl-daftar').addEventListener('change', (e) => {
      if (e.target.name && e.target.name.indexOf('tl-akhir-') === 0) {
        const f = e.target.closest('.form-tl');
        f.querySelector('select').hidden = e.target.value !== 'teruskan';
      }
    });
  }

  async function muatTL() {
    initTL();
    const status = T.status;
    $('tl-ket').textContent = 'Memuat…';
    try {
      const d = await api('tatib.tindakLanjut', { status: status });
      if (status !== T.status) return;
      T.item = d.item || [];
      renderTL();
    } catch (e) {
      $('tl-ket').textContent = e.message;
    }
  }

  function untukSaya() {
    const bagian = [];
    if (punya(['Wali Kelas']) && S.guru.kelasWali) bagian.push('wali kelas ' + S.guru.kelasWali);
    ['BK', 'Tim Tatib', 'Wakasek', 'Kepala Sekolah'].forEach((p) => { if (punya([p])) bagian.push(p); });
    return bagian.join(', ');
  }

  function renderTL() {
    const n = T.item.length;
    if (T.status === 'Menunggu') {
      aturLencana(n);
      $('tl-ket').textContent = (n ? n + ' catatan menunggu tindakan Anda' : 'Tidak ada catatan yang menunggu') +
        ' (diteruskan ke ' + untukSaya() + ').';
    } else {
      $('tl-ket').textContent = n ? 'Catatan yang sudah ditindaklanjuti dalam 60 hari terakhir.' : 'Belum ada catatan selesai dalam 60 hari terakhir.';
    }
    $('tl-daftar').innerHTML = T.item.map(kartuTL).join('');
  }

  function kartuTL(it) {
    const p = S.panduan[it.kategori];
    const lain = PENERIMA.filter((x) => x !== it.ke);
    let h = '<li class="kasus ' + esc(it.status) + '" data-id="' + esc(it.idLog) + '">' +
      '<div class="kasus-kepala"><span><span class="nm">' + esc(it.nama) + '</span> <span class="kl">' + esc(it.kelas) + '</span></span>' +
      '<span class="wkt">' + esc(it.tanggal) + (it.waktu ? ' ' + esc(it.waktu) : '') + '</span></div>' +
      '<p class="plg">' + esc(it.pelanggaran) + ' <span class="tag">' + esc(it.kategori || '-') + '</span> <span class="tag">+' + it.poin + '</span>' +
      (it.melawan ? ' <span class="tag merah">membangkang</span>' : '') + '</p>' +
      '<p class="meta">Dicatat oleh ' + esc(it.pelapor || '-') + ' · diteruskan ke ' + esc(it.ke) +
      (it.status === 'Selesai' && it.ditindakOleh ? ' · ditindak oleh ' + esc(it.ditindakOleh) : '') + '</p>';
    if (it.catatan) h += '<div class="catatan">Kejadian: ' + esc(it.catatan) + '</div>';
    if (it.tindakan) h += '<div class="catatan">' + esc(it.tindakan) + '</div>';
    if (it.status === 'Menunggu' && p && p.langkah) {
      h += '<div class="langkah"><strong>Panduan kategori ' + esc(it.kategori) + '</strong>' + esc(p.langkah) + '</div>';
    }
    h += '<div class="aksi">';
    if (it.status === 'Menunggu') h += '<button type="button" class="tombol tombol-utama" data-aksi="buka-tl">Tindak lanjuti</button>';
    if (S.akses.riwayat) h += '<button type="button" class="tombol tombol-garis" data-aksi="riwayat" data-nis="' + esc(it.nis) + '">Riwayat siswa</button>';
    h += '</div>';
    if (it.status === 'Menunggu') {
      const nama = 'tl-akhir-' + esc(it.idLog);
      h += '<div class="form-tl" hidden>' +
        '<label class="label" for="tl-t-' + esc(it.idLog) + '">Tindakan yang sudah dilakukan</label>' +
        '<textarea id="tl-t-' + esc(it.idLog) + '" class="isian" rows="3" maxlength="500" placeholder="Contoh: siswa dipanggil, orang tua dihubungi lewat telepon"></textarea>' +
        '<div class="opsi" style="margin-top:10px">' +
        '<label><input type="radio" name="' + nama + '" value="selesai" checked><span><strong>Selesai</strong><small>Kasus ditutup.</small></span></label>' +
        '<label><input type="radio" name="' + nama + '" value="teruskan"><span><strong>Teruskan</strong><small>Perlu ditangani peran lain.</small>' +
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
    if (a.dataset.aksi === 'buka-tl') {
      const f = li.querySelector('.form-tl');
      f.hidden = !f.hidden;
      if (!f.hidden) f.querySelector('textarea').focus();
      return;
    }
    if (a.dataset.aksi === 'simpan-tl') {
      const f = li.querySelector('.form-tl');
      const tindakan = f.querySelector('textarea').value.trim();
      if (!tindakan) { f.querySelector('textarea').focus(); toast('Tulis dulu tindakan yang sudah dilakukan.', 'galat'); return; }
      const terus = f.querySelector('input[value="teruskan"]').checked;
      const ke = terus ? f.querySelector('select').value : '';
      a.disabled = true; a.textContent = 'Menyimpan…';
      try {
        const d = await api('tatib.selesaikan', { idLog: li.dataset.id, tindakan: tindakan, teruskanKe: ke });
        T.item = T.item.filter((x) => x.idLog !== li.dataset.id);
        renderTL();
        toast(d.status === 'Selesai' ? 'Tindak lanjut tersimpan. Kasus selesai.' : 'Tersimpan dan diteruskan ke ' + ke, 'hadir');
      } catch (err) {
        a.disabled = false; a.textContent = 'Simpan tindak lanjut';
        toast(err.message, 'galat', 5000);
      }
    }
  }

  /* =================================================================
   *  RIWAYAT SISWA
   * ================================================================= */
  let pemilihRiwayat = null;
  const bolehLihat = (s) => punya(['BK', 'Tim Tatib', 'Wakasek', 'Kepala Sekolah']) || (punya(['Wali Kelas']) && !!S.guru.kelasWali && s.kelas === S.guru.kelasWali);

  function initRiwayat() {
    if (S.siap.siswa) return;
    S.siap.siswa = true;
    const luas = punya(['BK', 'Tim Tatib', 'Wakasek', 'Kepala Sekolah']);
    pemilihRiwayat = pemilihSiswa($('r-siswa-pilih'), {
      id: 'r', label: 'Pilih siswa', saring: bolehLihat, tampilSemua: true,
      catatan: luas ? '' : 'Daftar siswa kelas ' + S.guru.kelasWali + '.',
      pilih: (s) => bukaRiwayat(s.nis),
    });
    $('r-detail').addEventListener('click', (e) => {
      const a = e.target.closest('[data-aksi="catat-siswa"]');
      if (!a) return;
      const s = S.siswa.get(a.dataset.nis);
      pilihTab('catat');
      resetCatat(false);
      pilihSiswaCatat(s);
    });
  }

  function bukaRiwayatDari(nis) {
    pilihTab('siswa');
    bukaRiwayat(nis);
  }

  async function bukaRiwayat(nis) {
    const el = $('r-detail');
    el.hidden = false;
    el.innerHTML = '<div class="blok"><p class="memuat">Memuat riwayat…</p></div>';
    try {
      const d = await api('tatib.riwayat', { nis: nis });
      el.innerHTML = renderRiwayat(d);
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
      el.innerHTML = '<div class="blok"><p class="kosong">' + esc(e.message) + '</p></div>';
    }
  }

  function renderRiwayat(d) {
    const s = d.siswa, L = d.langkahLevel || {};
    let h = '<div class="blok"><div class="kepala-riwayat"><div><h2>' + esc(s.nama) + '</h2>' +
      '<p>' + esc(s.kelas) + ' · NIS ' + esc(s.nis) + (s.nisn ? ' · NISN ' + esc(s.nisn) : '') + '</p>' +
      (s.wali ? '<p>Wali kelas: ' + esc(s.wali) + '</p>' : '') + '</div>' +
      '<div class="poin-besar"><b>' + d.poin + '</b><span>poin sejak ' + esc(d.periodeMulai) + '</span></div></div>' +
      '<p style="margin:10px 0 0">' + lencanaLevel(d.level) + '</p>' +
      '<div class="langkah-level">' + (d.level > 0 ? '<strong>' + esc(L.pj) + ':</strong> ' : '') + esc(L.tindakan) +
      (L.ambangBerikut ? ' Level berikutnya pada ' + L.ambangBerikut + ' poin.' : '') + '</div>';
    const k = d.kehadiran || {};
    h += '<div class="statistik">' + ['Hadir', 'Terlambat', 'Sakit', 'Izin', 'Alfa'].map((x) =>
      '<div><b>' + (k[x] || 0) + '</b><span>' + x + '</span></div>').join('') + '</div>';

    h += '<h3 class="sub-judul">Pelanggaran (' + d.pelanggaran.length + ')</h3>';
    h += d.pelanggaran.length ? '<ul class="baris-ringkas">' + d.pelanggaran.map((p) =>
      '<li><strong>+' + p.poin + '</strong> ' + esc(p.pelanggaran) + (p.melawan ? ' <span class="tag merah">membangkang</span>' : '') +
      '<span class="meta">' + esc(p.tanggal) + ' · ' + esc(p.kategori || '-') + ' · dicatat ' + esc(p.pelapor || '-') +
      (p.ke ? ' · ' + (p.status === 'Menunggu' ? 'menunggu ' : 'ditangani ') + esc(p.ke) : ' · ditangani sendiri') + '</span>' +
      (p.tindakan ? '<span class="meta" style="white-space:pre-wrap">' + esc(p.tindakan) + '</span>' : '') + '</li>').join('') + '</ul>'
      : '<p class="kosong">Belum ada pelanggaran pada periode ini.</p>';

    if (d.pemulihan.length) {
      h += '<h3 class="sub-judul">Pemulihan dan pembinaan</h3><ul class="baris-ringkas">' + d.pemulihan.map((r) =>
        '<li>' + esc(r.kategori) + ' · <strong>' + esc(r.status) + '</strong>' + (r.potongan ? ' <span class="tag hijau">−' + r.potongan + ' poin</span>' : '') +
        '<span class="meta">' + esc(r.tanggal) + (r.catatan ? ' · ' + esc(r.catatan) : '') + '</span></li>').join('') + '</ul>';
    }
    if (d.surat.length) {
      h += '<h3 class="sub-judul">Surat pernyataan</h3><ul class="baris-ringkas">' + d.surat.map((x) =>
        '<li>Lapis ' + x.lapis + ' · ' + esc(x.tanggal) + '<span class="meta">' + esc(x.id) + ' · ' + x.poin + ' poin saat dicetak · tanda tangan: ' + esc(x.ttd || '-') + '</span></li>').join('') + '</ul>';
    }
    if (d.catatanHadir.length) {
      h += '<h3 class="sub-judul">Catatan kehadiran</h3><ul class="baris-ringkas">' + d.catatanHadir.map((x) =>
        '<li><strong>' + esc(x.status) + '</strong> · ' + esc(x.tanggal) + (x.jam ? ' · ' + esc(x.jam) : '') +
        (x.ket ? '<span class="meta">' + esc(x.ket) + '</span>' : '') + '</li>').join('') + '</ul>';
    }
    h += '<button type="button" class="tombol tombol-garis" style="margin-top:16px" data-aksi="catat-siswa" data-nis="' + esc(s.nis) + '">Catat pelanggaran untuk siswa ini</button></div>';
    return h;
  }

  /* =================================================================
   *  ZONA MERAH & SURAT
   * ================================================================= */
  const Z = { siswa: [], bolehSurat: false, pdf: {} };

  async function muatZona() {
    if (!S.siap.zona) {
      S.siap.zona = true;
      $('z-daftar').addEventListener('click', klikZona);
    }
    $('z-ket').textContent = 'Memuat…';
    try {
      const d = await api('tatib.zona');
      Z.siswa = d.siswa || []; Z.bolehSurat = !!d.bolehSurat;
      renderZona();
    } catch (e) {
      $('z-ket').textContent = e.message;
    }
  }

  function renderZona() {
    const luas = punya(['BK', 'Tim Tatib', 'Wakasek', 'Kepala Sekolah']);
    const n = Z.siswa.length;
    $('z-ket').textContent = (n ? n + ' siswa' + (luas ? '' : ' kelas ' + S.guru.kelasWali) + ' sudah mencapai level tindakan.' : 'Belum ada siswa yang mencapai Level 1. Bagus!') +
      (n && !Z.bolehSurat ? ' Surat pernyataan dibuat oleh BK atau Tim Tatib.' : '');
    $('z-daftar').innerHTML = Z.siswa.map((s) => {
      const L = s.langkah || {};
      const berikut = s.lapisTerakhir < s.lapisPerlu ? s.lapisTerakhir + 1 : 0;
      let h = '<li class="kasus lv' + s.level + '" data-nis="' + esc(s.nis) + '">' +
        '<div class="kasus-kepala"><span><span class="nm">' + esc(s.nama) + '</span> <span class="kl">' + esc(s.kelas) + '</span></span>' + lencanaLevel(s.level) + '</div>' +
        '<p class="plg">' + s.poin + ' poin' + (L.ambangBerikut ? ' <span class="redup">· level berikutnya ' + L.ambangBerikut + '</span>' : '') + '</p>' +
        '<div class="langkah"><strong>' + esc(L.pj || 'Tindakan') + '</strong>' + esc(L.tindakan) + '</div>' +
        '<p class="meta">Surat terakhir: ' + (s.lapisTerakhir ? 'Lapis ' + s.lapisTerakhir : 'belum ada') +
        (berikut ? ' · <span class="tag merah">perlu Surat Lapis ' + berikut + '</span>' : '') + '</p>';
      const pdf = Z.pdf[s.nis];
      if (pdf) {
        h += '<div class="surat-siap">Surat Lapis ' + pdf.lapis + ' siap: <a href="' + pdf.url + '" target="_blank" rel="noopener">Buka PDF</a>' +
          '<a href="' + pdf.url + '" download="' + esc(pdf.nama) + '">Unduh</a>' +
          (pdf.drive ? '<a href="' + esc(pdf.drive) + '" target="_blank" rel="noopener">Lihat di Drive</a>' : '') + '</div>';
      }
      h += '<div class="aksi">';
      if (Z.bolehSurat && berikut) h += '<button type="button" class="tombol tombol-utama" data-aksi="surat" data-lapis="' + berikut + '">Buat Surat Lapis ' + berikut + '</button>';
      else if (Z.bolehSurat && s.lapisPerlu) h += '<button type="button" class="tombol tombol-garis" data-aksi="surat" data-lapis="' + s.lapisPerlu + '">Cetak ulang Lapis ' + s.lapisPerlu + '</button>';
      h += '<button type="button" class="tombol tombol-garis" data-aksi="riwayat">Riwayat</button></div></li>';
      return h;
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
        const bin = atob(d.pdf);
        const isi = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) isi[i] = bin.charCodeAt(i);
        const lama = Z.pdf[nis];
        if (lama) URL.revokeObjectURL(lama.url);
        Z.pdf[nis] = { lapis: lapis, url: URL.createObjectURL(new Blob([isi], { type: 'application/pdf' })), nama: d.namaFile, drive: d.url };
        const s = Z.siswa.filter((x) => x.nis === nis)[0];
        if (s) s.lapisTerakhir = Math.max(s.lapisTerakhir, lapis);
        renderZona();
        toast('Surat Lapis ' + lapis + ' dibuat dan disimpan di folder Surat_SMKT.', 'hadir');
      } catch (err) {
        renderZona();
        toast(err.message, 'galat', 6000);
      }
    }
  }

  /* =================================================================
   *  PEMULIHAN
   * ================================================================= */
  const P = { item: [], potongan: 15 };

  async function muatPulih() {
    if (!S.siap.pulih) {
      S.siap.pulih = true;
      $('pm-daftar').addEventListener('click', klikPulih);
      if (S.akses.pembinaanLain) {
        $('pm-lain').hidden = false;
        P.pemilih = pemilihSiswa($('pm-siswa-pilih'), { id: 'pm', label: 'Siswa', pilih: (s) => pilihSiswaPembinaan(s) });
        $('pm-simpan').addEventListener('click', simpanPembinaan);
        $('pm-lain').addEventListener('click', (e) => { if (e.target.closest('[data-aksi="ganti-pm"]')) pilihSiswaPembinaan(null); });
      }
    }
    $('pm-ket').textContent = 'Memuat…';
    try {
      const d = await api('tatib.pemulihan');
      P.item = d.item || []; P.potongan = d.potongan || 15;
      renderPulih();
    } catch (e) {
      $('pm-ket').textContent = e.message;
    }
  }

  function renderPulih() {
    $('pm-ket').textContent = P.item.length
      ? 'Kasus yang bisa ditebus dengan program pembinaan fisik. Status Lulus mengurangi ' + P.potongan + ' poin, sekali untuk setiap kasus.'
      : 'Belum ada kasus yang bisa ditebus dengan program fisik pada periode ini.';
    const urut = P.item.slice().sort((a, b) => (a.sudahDipotong - b.sudahDipotong));
    $('pm-daftar').innerHTML = urut.map((it) =>
      '<li class="kasus ' + (it.sudahDipotong ? 'Selesai' : 'Menunggu') + '" data-id="' + esc(it.idLog) + '">' +
      '<div class="kasus-kepala"><span><span class="nm">' + esc(it.nama) + '</span> <span class="kl">' + esc(it.kelas) + '</span></span><span class="wkt">' + esc(it.tanggal) + '</span></div>' +
      '<p class="plg">' + esc(it.pelanggaran) + ' <span class="tag">+' + it.poin + '</span></p>' +
      '<p class="meta">Status program fisik: ' + (it.sudahDipotong ? '<span class="tag hijau">Lulus, −' + P.potongan + ' poin</span>' : esc(it.statusTerakhir || 'belum dijadwalkan')) + '</p>' +
      (it.sudahDipotong ? '' : '<div class="aksi">' +
        ['Dijadwalkan', 'Berjalan'].filter((x) => x !== it.statusTerakhir).map((x) => '<button type="button" class="tombol tombol-garis" data-status="' + x + '">' + x + '</button>').join('') +
        '<button type="button" class="tombol tombol-utama" data-status="Lulus">Lulus (−' + P.potongan + ')</button>' +
        '<button type="button" class="tombol tombol-garis" data-status="Tidak Lulus">Tidak lulus</button></div>') +
      '</li>').join('');
  }

  async function klikPulih(e) {
    const a = e.target.closest('button[data-status]');
    if (!a) return;
    const li = a.closest('.kasus');
    const it = P.item.filter((x) => x.idLog === li.dataset.id)[0];
    if (!it) return;
    const status = a.dataset.status;
    if (status === 'Lulus' && !confirm(it.nama + ' lulus program fisik? Poinnya berkurang ' + P.potongan + '.')) return;
    a.disabled = true;
    try {
      await api('tatib.catatPemulihan', { nis: it.nis, kategori: 'Program Fisik', status: status, ref: it.idLog });
      it.statusTerakhir = status;
      if (status === 'Lulus') it.sudahDipotong = true;
      renderPulih();
      toast(status === 'Lulus' ? 'Lulus. Poin ' + it.nama + ' berkurang ' + P.potongan + '.' : 'Status ' + status + ' tersimpan.', 'hadir');
    } catch (err) {
      a.disabled = false;
      toast(err.message, 'galat', 5000);
    }
  }

  function pilihSiswaPembinaan(s) {
    P.siswaLain = s;
    const w = $('pm-siswa-pilih');
    let kartu = w.querySelector('.kartu-terpilih');
    if (!kartu) { kartu = document.createElement('div'); kartu.className = 'kartu-terpilih'; w.appendChild(kartu); }
    kartu.innerHTML = s ? kartuSiswa(s, 'ganti-pm') : '';
    w.querySelector('.cari-baris').hidden = !!s;
    w.querySelector('label').hidden = !!s;
    w.querySelector('.hasil-cari').hidden = !!s;
  }

  async function simpanPembinaan() {
    const s = P.siswaLain;
    if (!s) { toast('Pilih siswa dulu.', 'galat'); return; }
    const b = $('pm-simpan');
    b.disabled = true; b.textContent = 'Menyimpan…';
    try {
      const d = await api('tatib.catatPemulihan', { nis: s.nis, kategori: $('pm-kategori').value, status: $('pm-status').value, catatan: $('pm-catatan').value.trim() });
      toast(d.kategori + ' untuk ' + d.nama + ' tersimpan.', 'hadir');
      $('pm-catatan').value = '';
      pilihSiswaPembinaan(null);
    } catch (e) {
      toast(e.message, 'galat', 5000);
    } finally {
      b.disabled = false; b.textContent = 'Simpan pembinaan';
    }
  }

  /* =================================================================
   *  IZIN / SAKIT
   * ================================================================= */
  const I = { siswa: null };

  function initIzin() {
    if (S.siap.izin) return;
    S.siap.izin = true;
    const semua = !!S.akses.izinSemuaKelas;
    $('iz-ket').textContent = (semua ? 'Untuk siswa semua kelas. ' : 'Untuk siswa kelas ' + S.guru.kelasWali + '. ') +
      'Bisa dicatat sampai ' + HARI_IZIN_MUNDUR + ' hari ke belakang dan menggantikan status Alfa.';
    pemilihSiswa($('iz-siswa-pilih'), {
      id: 'iz', label: 'Siswa', tampilSemua: !semua,
      saring: semua ? null : (s) => s.kelas === S.guru.kelasWali,
      pilih: pilihSiswaIzin,
    });
    $('iz-siswa-pilih').addEventListener('click', (e) => { if (e.target.closest('[data-aksi="ganti-iz"]')) pilihSiswaIzin(null); });
    const t = $('iz-tanggal');
    t.value = hariIni(); t.max = hariIni(); t.min = hariIni(-HARI_IZIN_MUNDUR);
    $('iz-simpan').addEventListener('click', simpanIzin);
  }

  function pilihSiswaIzin(s) {
    I.siswa = s;
    const w = $('iz-siswa-pilih');
    let kartu = w.querySelector('.kartu-terpilih');
    if (!kartu) { kartu = document.createElement('div'); kartu.className = 'kartu-terpilih'; w.appendChild(kartu); }
    kartu.innerHTML = s ? kartuSiswa(s, 'ganti-iz') : '';
    w.querySelector('.cari-baris').hidden = !!s;
    w.querySelector('label').hidden = !!s;
    w.querySelector('.hasil-cari').hidden = !!s;
  }

  async function simpanIzin() {
    const s = I.siswa;
    if (!s) { toast('Pilih siswa dulu.', 'galat'); return; }
    const status = document.querySelector('input[name="iz-status"]:checked').value;
    const b = $('iz-simpan');
    b.disabled = true; b.textContent = 'Menyimpan…';
    try {
      const d = await api('tatib.izin', { nis: s.nis, tanggal: $('iz-tanggal').value, status: status, keterangan: $('iz-ket-isi').value.trim() });
      toast(d.status + ' tercatat untuk ' + d.nama + ' (' + d.tanggal + ')' + (d.menimpa ? ', menggantikan ' + d.menimpa : '') + '.', 'hadir', 4500);
      $('iz-ket-isi').value = '';
      pilihSiswaIzin(null);
    } catch (e) {
      toast(e.message, 'galat', 5000);
    } finally {
      b.disabled = false; b.textContent = 'Simpan';
    }
  }

  /* ---------------- Mulai ---------------- */
  function pasangKejadian() {
    document.querySelectorAll('#tab-tatib button').forEach((b) => b.addEventListener('click', () => pilihTab(b.dataset.tab)));
    $('tombol-menu').addEventListener('click', () => ($('menu').hidden ? bukaMenu() : tutupMenu()));
    $('menu-perbarui').addEventListener('click', async () => {
      tutupMenu();
      S.siap = {};
      sesiTab.hapus('smkt_tatib_awal');
      await muatAwal(false);
      toast('Data diperbarui.', 'hadir');
    });
    $('menu-keluar').addEventListener('click', keluar);
    $('scan-tutup').addEventListener('click', tutupScan);
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (!$('modal-scan').hidden) tutupScan();
      else if (!$('menu').hidden) tutupMenu();
    });
    document.addEventListener('click', (e) => {
      if (!$('menu').hidden && !e.target.closest('#menu') && !e.target.closest('#tombol-menu')) tutupMenu();
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) tutupScan(); });
  }

  function mulai() {
    pasangKejadian();
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
    const sesi = simpan.get('smkt_sesi', null);
    if (sesi && sesi.kedaluwarsa > Date.now() && sesi.sesi && sesi.sesi !== 'demo') {
      S.sesi = sesi.sesi; S.guru = sesi.guru;
      bukaUtama();
    } else {
      tampilLogin();
    }
  }

  window.SMKT_tatib = { keadaan: S, C: C };
  mulai();
})();
