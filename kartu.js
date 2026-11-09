/* Kartu pelajar ber-QR untuk Administrator (dimuat saat menu Kartu pelajar dibuka).
 * PDF disusun di browser dengan jsPDF; QR digambar sebagai vektor (qrcode-generator) berisi NIS,
 * sama dengan yang dibaca Gerbang dan Kios. Ukuran kartu ID-1: 85,6 x 54 mm. */
(function () {
  'use strict';
  const T = window.SMKT_TATIB;
  const $ = (id) => document.getElementById(id);
  const W = 85.6, H = 54;
  const WARNA = { dongker: '#0B3558', biru: '#0B6AAA', langit: '#0090DA', gunung: '#7AC02B', lencana: '#FFE600', tinta: '#0B2238', redup: '#5B6B7E', latar: '#EEF5FA' };
  const K = { awal: null, pilih: new Set(), logo: '', latar: null, menyusun: false, tata: 'bawaan', huruf: false };

  const skrip = {};
  const VERSI_ASET = '20261109b';
  function muatSkrip(src) {
    src = src + (src.indexOf('?') > -1 ? '&' : '?') + 'v=' + VERSI_ASET;
    if (!skrip[src]) skrip[src] = new Promise((ok, gagal) => {
      const s = document.createElement('script'); s.src = src; s.onload = ok;
      s.onerror = () => { delete skrip[src]; gagal(new Error('Gagal memuat ' + src + '. Periksa sinyal lalu coba lagi.')); };
      document.head.appendChild(s);
    });
    return skrip[src];
  }
  async function siapkanPustaka() {
    await Promise.all([muatSkrip('vendor/jspdf.umd.min.js'), muatSkrip('vendor/qrcode.js')]);
    if (!K.logo) K.logo = await keDataUrl('icons/logo-256.png');
  }
  async function siapkanHuruf() {
    await muatSkrip('vendor/font-kartu.js');
  }
  /** Daftarkan huruf Kobalt Emas pada satu dokumen jsPDF. */
  function pasangHuruf(doc) {
    const F = window.SMKT_FONT_KARTU;
    doc.addFileToVFS('OpenSans-Bold.ttf', F.OpenSansBold); doc.addFont('OpenSans-Bold.ttf', 'OpenSans', 'bold');
    doc.addFileToVFS('OpenSans-Regular.ttf', F.OpenSans); doc.addFont('OpenSans-Regular.ttf', 'OpenSans', 'normal');
    doc.addFileToVFS('Poppins-Regular.ttf', F.Poppins); doc.addFont('Poppins-Regular.ttf', 'Poppins', 'normal');
  }
  async function keDataUrl(url) {
    const b = await (await fetch(url)).blob();
    return new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(b); });
  }
  function muatGambar(src) {
    return new Promise((ok, gagal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = gagal; i.src = src; });
  }
  /** Foto dipotong 3:4 (tengah) dan diperkecil agar PDF ringan. */
  async function fotoTigaEmpat(dataUrl) {
    const img = await muatGambar(dataUrl);
    const c = document.createElement('canvas'); c.width = 300; c.height = 400;
    const r = Math.max(300 / img.width, 400 / img.height);
    const w = img.width * r, h = img.height * r;
    const x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, 300, 400);
    x.drawImage(img, (300 - w) / 2, (400 - h) / 2.6, w, h);
    return c.toDataURL('image/jpeg', 0.85);
  }

  /* ---------------- Gambar kartu (satuan mm) ---------------- */
  function qr(doc, teks, x, y, s) {
    const q = window.qrcode(0, 'M'); q.addData(String(teks)); q.make();
    const n = q.getModuleCount(), tepi = 1.6, m = s / (n + tepi * 2);
    doc.setFillColor('#FFFFFF'); doc.rect(x, y, s, s, 'F');
    doc.setFillColor('#000000');
    for (let r = 0; r < n; r++) {
      let c = 0;
      while (c < n) {
        if (!q.isDark(r, c)) { c++; continue; }
        let p = c; while (p < n && q.isDark(r, p)) p++;
        doc.rect(x + (tepi + c) * m, y + (tepi + r) * m, (p - c) * m + 0.01, m + 0.01, 'F');
        c = p;
      }
    }
  }
  function teks(doc, isi, x, y, o) {
    o = o || {};
    doc.setFont(o.huruf || 'helvetica', o.tebal ? 'bold' : 'normal'); doc.setFontSize(o.pt || 7); doc.setTextColor(o.warna || WARNA.tinta);
    const opsi = { align: o.rata || 'left', maxWidth: o.lebar, baseline: 'alphabetic' };
    if (o.spasi) opsi.charSpace = o.spasi;
    if (o.jarak) opsi.lineHeightFactor = o.jarak / (o.pt * 0.3528);
    doc.text(isi, x, y, opsi);
  }
  function garisPanduan(doc, x, y, w, h, label) {
    doc.setDrawColor('#E5007E'); doc.setLineWidth(0.25); doc.setLineDashPattern([1, 0.8], 0);
    doc.rect(x, y, w, h, 'S'); doc.setLineDashPattern([], 0);
    teks(doc, label, x + w / 2, y + h / 2 + 1, { pt: 4.6, warna: '#E5007E', rata: 'center', lebar: w - 1, tebal: true });
  }

  /** opsi: { siswa, foto, latar, teksPutih, panduan, polos } */
  function depan(doc, ox, oy, o) {
    const s = o.siswa || { nama: 'NAMA LENGKAP SISWA', nis: '0000', nisn: '0000000000', kelas: '7A' };
    const tinta = o.teksPutih ? '#FFFFFF' : WARNA.tinta;
    const label = o.teksPutih ? '#E6EEF5' : WARNA.redup;
    if (o.latar) {
      doc.addImage(o.latar, ox, oy, W, H, 'latarD', 'FAST');
    } else {
      doc.setFillColor('#FFFFFF'); doc.rect(ox, oy, W, H, 'F');
      doc.setFillColor(WARNA.latar); doc.rect(ox, oy + 15.5, W, 33, 'F');
      doc.setFillColor(WARNA.dongker); doc.rect(ox, oy, W, 14, 'F');
      doc.setFillColor(WARNA.lencana); doc.rect(ox, oy + 14, W, 0.9, 'F');
      doc.setFillColor(WARNA.gunung); doc.rect(ox, oy + 14.9, W, 0.6, 'F');
      if (K.logo) doc.addImage(K.logo, 'PNG', ox + 3, oy + 2, 10, 10, 'logoSek', 'FAST');
      teks(doc, 'SMP NEGERI 1 WONOSARI', ox + 15, oy + 5.6, { pt: 8.6, tebal: true, warna: '#FFFFFF' });
      teks(doc, 'KARTU PELAJAR', ox + 15, oy + 9.2, { pt: 6.6, tebal: true, warna: WARNA.lencana });
      teks(doc, 'Kabupaten Malang  ·  NPSN 20517508', ox + 15, oy + 12.2, { pt: 4.8, warna: '#D6E4F0' });
      doc.setFillColor(WARNA.biru); doc.rect(ox, oy + 49, W, 5, 'F');
      teks(doc, 'Berlaku selama terdaftar sebagai siswa' + (K.awal && K.awal.tahunAjaran ? '  ·  TA ' + K.awal.tahunAjaran : ''), ox + 4, oy + 52.3, { pt: 4.6, warna: '#FFFFFF' });
    }
    if (o.polos) return;
    // Foto 3:4
    const fx = ox + 4, fy = oy + 18.5, fw = 19, fh = 25.3;
    if (o.panduan) garisPanduan(doc, fx, fy, fw, fh, 'FOTO 3x4');
    else if (o.foto) { doc.addImage(o.foto, 'JPEG', fx, fy, fw, fh, undefined, 'FAST'); doc.setDrawColor('#FFFFFF'); doc.setLineWidth(0.6); doc.rect(fx, fy, fw, fh, 'S'); }
    else { doc.setFillColor('#D9E4EE'); doc.rect(fx, fy, fw, fh, 'F'); teks(doc, 'FOTO', fx + fw / 2, fy + fh / 2 + 1, { pt: 5, warna: WARNA.redup, rata: 'center' }); }
    // Data
    const tx = ox + 26, lw = 31;
    if (o.panduan) {
      garisPanduan(doc, tx, oy + 18.5, lw, 9, 'NAMA (2 baris)');
      garisPanduan(doc, tx, oy + 29.5, lw, 6, 'NIS / NISN');
      garisPanduan(doc, tx, oy + 37.5, lw, 6, 'KELAS');
      garisPanduan(doc, ox + 59.6, oy + 18, 22, 22, 'QR (NIS) area putih');
      return;
    }
    teks(doc, 'Nama', tx, oy + 20.6, { pt: 4.8, warna: label });
    const baris = doc.setFont('helvetica', 'bold').setFontSize(8).splitTextToSize(s.nama.toUpperCase(), lw).slice(0, 2);
    teks(doc, baris, tx, oy + 24, { pt: baris.length > 1 || s.nama.length > 22 ? 7.2 : 8, tebal: true, warna: tinta });
    teks(doc, 'NIS / NISN', tx, oy + 31.4, { pt: 4.8, warna: label });
    teks(doc, s.nis + (s.nisn ? '  /  ' + s.nisn : ''), tx, oy + 34.4, { pt: 6.8, warna: tinta });
    teks(doc, 'Kelas', tx, oy + 39.4, { pt: 4.8, warna: label });
    teks(doc, s.kelas || '-', tx, oy + 43, { pt: 9, tebal: true, warna: tinta });
    qr(doc, s.nis, ox + 59.6, oy + 18, 22);
    teks(doc, 'Pindai di gerbang', ox + 70.6, oy + 43.2, { pt: 4.4, warna: label, rata: 'center' });
  }

  function belakang(doc, ox, oy, o) {
    if (o.latar) { doc.addImage(o.latar, ox, oy, W, H, 'latarB', 'FAST'); }
    else {
      doc.setFillColor('#FFFFFF'); doc.rect(ox, oy, W, H, 'F');
      doc.setFillColor(WARNA.dongker); doc.rect(ox, oy, W, 8, 'F');
      doc.setFillColor(WARNA.lencana); doc.rect(ox, oy + 8, W, 0.7, 'F');
      teks(doc, 'KETENTUAN KARTU PELAJAR', ox + 4, oy + 5.4, { pt: 6.6, tebal: true, warna: '#FFFFFF' });
      if (K.logo) doc.addImage(K.logo, 'PNG', ox + W - 10, oy + 1, 6, 6, 'logoSek', 'FAST');
      const aturan = [
        'Kartu wajib dibawa setiap hari dan dipindai saat tiba di sekolah.',
        'Kartu hanya untuk pemiliknya. Meminjamkan kartu atau titip absen termasuk pelanggaran tata tertib.',
        'Kartu yang hilang atau rusak segera dilaporkan kepada wali kelas.',
        'Bila menemukan kartu ini, mohon dikembalikan ke alamat sekolah di bawah.'
      ];
      let y = oy + 12.6;
      aturan.forEach((a, i) => {
        teks(doc, (i + 1) + '.', ox + 4, y, { pt: 5.2, warna: WARNA.tinta });
        const b = doc.setFont('helvetica', 'normal').setFontSize(5.2).splitTextToSize(a, 46);
        teks(doc, b, ox + 7, y, { pt: 5.2, warna: WARNA.tinta });
        y += b.length * 2.3 + 1.1;
      });
      // Tanda tangan kepala sekolah
      const kx = ox + 70.5;
      teks(doc, 'Kepala Sekolah,', kx, oy + 13, { pt: 5.2, rata: 'center' });
      const ks = K.awal && K.awal.kepsek;
      teks(doc, ks ? ks.nama : '(.............................)', kx, oy + 31, { pt: 5.2, tebal: true, rata: 'center', lebar: 26 });
      teks(doc, 'NIP. ' + (ks && ks.nip ? ks.nip : '.....................'), kx, oy + 33.6, { pt: 4.6, rata: 'center' });
      doc.setFillColor(WARNA.latar); doc.rect(ox, oy + 42.5, W, 11.5, 'F');
      teks(doc, 'SMP Negeri 1 Wonosari  ·  Jl. Raya Bumirejo 45 Wonosari, Kab. Malang 65161', ox + W / 2, oy + 47, { pt: 4.8, rata: 'center', tebal: true });
      teks(doc, 'esempenegeri1wonosari@gmail.com  ·  smpn01wonosari.sch.id', ox + W / 2, oy + 50.3, { pt: 4.6, rata: 'center', warna: WARNA.redup });
      doc.setFillColor(WARNA.gunung); doc.rect(ox, oy + 53.2, W, 0.8, 'F');
    }
    if (o.panduan) garisPanduan(doc, ox + 57, oy + 10, 27, 26, 'TTD KEPALA SEKOLAH (opsional)');
  }

  /* ---------- Tata letak "Kobalt Emas" (desain Canva tegak 54 x 85,6 mm) ----------
   * Posisi diukur dari template Canva sekolah. Latar depan/belakang = ekspor Canva
   * tanpa nama, NIS, NISN, TTL, alamat, foto (depan) dan tanpa QR (belakang). */
  const KOBALT = {
    w: 54, h: 85.6,
    foto: { x: 28.83, y: 32.0, w: 22.16, bawahLurus: 57.4, ujung: 61.25, r: 0.9, isi: '#4C9DD4' },
    nama: { x: 2.83, y: 26.78, jarak: 2.75, pt: 8.2, pt2: 7.2, spasi: 0.16, lebar: 47 },
    nis: { x: 2.83, y: 35.30, pt: 6.5, spasi: 0.07 }, nisn: { x: 12.45, y: 35.30 },
    ttl: { x: 2.83, y: 40.70, jarak: 2.61, pt: 6.5, spasi: 0.07, lebar: 25 },
    alamat: { x: 2.83, y: 48.43, jarak: 2.29, pt: 6.0, spasi: 0.06, lebar: 26.0, baris: 3 },
    qr: { kotak: { x: 9.57, y: 26.48, s: 37.36 }, x: 12.5, y: 29.41, s: 31.5 }
  };
  const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  function tglPanjang(v) {
    const m = String(v || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? Number(m[3]) + ' ' + BULAN[Number(m[2]) - 1] + ' ' + m[1] : String(v || '');
  }
  /** Bungkus kata dengan memperhitungkan jarak antarhuruf (charSpace). */
  function bungkus(doc, isi, lebar, spasi) {
    const ukur = (t) => doc.getTextWidth(t) + t.length * spasi;
    const out = []; let baris = '';
    String(isi || '').split(/\s+/).filter(Boolean).forEach((k) => {
      const coba = baris ? baris + ' ' + k : k;
      if (!baris || ukur(coba) <= lebar) baris = coba; else { out.push(baris); baris = k; }
    });
    if (baris) out.push(baris);
    return out;
  }
  function bentukFoto(doc, ox, oy, mode) {
    const f = KOBALT.foto, x = ox + f.x, y = oy + f.y, w = f.w, r = f.r, k = 0.55 * r;
    doc.moveTo(x + r, y); doc.lineTo(x + w - r, y);
    doc.curveTo(x + w - r + k, y, x + w, y + r - k, x + w, y + r);
    doc.lineTo(x + w, oy + f.bawahLurus); doc.lineTo(x + w / 2, oy + f.ujung); doc.lineTo(x, oy + f.bawahLurus);
    doc.lineTo(x, y + r); doc.curveTo(x, y + r - k, x + r - k, y, x + r, y);
    doc.close();
    if (mode === 'isi') doc.fill(); else { doc.clip(); doc.discardPath(); }
  }
  /** Latar pengganti mirip template Kobalt Emas, dipakai bila latar Canva belum diunggah. */
  function latarKobalt(doc, ox, oy, sisi) {
    const L = KOBALT, abu = '#AFBED4', putih = '#FFFFFF';
    doc.setFillColor('#061A4A'); doc.rect(ox, oy, L.w, L.h, 'F');
    doc.setFillColor('#0B3C9E'); doc.triangle(ox + L.w, oy + 22, ox + L.w, oy + 62, ox + 6, oy + 62, 'F');
    doc.setFillColor('#1257C8'); doc.triangle(ox + L.w, oy + 30, ox + L.w, oy + 58, ox + 24, oy + 58, 'F');
    doc.setFillColor('#041334'); doc.rect(ox, oy + 61, L.w, L.h - 61, 'F');
    const y0 = sisi === 'depan' ? 0 : 4;
    if (K.logo) doc.addImage(K.logo, 'PNG', ox + 2.5, oy + 2 + y0, 9.5, 9.5, 'logoSek', 'FAST');
    teks(doc, 'SMP NEGERI 1', ox + 12.8, oy + 5.4 + y0, { pt: 9, tebal: true, warna: putih, huruf: 'OpenSans' });
    teks(doc, 'WONOSARI', ox + 12.8, oy + 10.4 + y0, { pt: 15, tebal: true, warna: putih, huruf: 'OpenSans' });
    teks(doc, 'KABUPATEN MALANG', ox + 12.8, oy + 13 + y0, { pt: 3.6, tebal: true, warna: abu, huruf: 'OpenSans' });
    if (sisi === 'depan') {
      teks(doc, 'KARTU PELAJAR', ox + L.w / 2, oy + 18.9, { pt: 8.6, tebal: true, warna: putih, rata: 'center', huruf: 'OpenSans', spasi: 0.3 });
      doc.setFillColor(putih); doc.rect(ox + 11.5, oy + 20.3, 31, 0.5, 'F');
      const lbl = (t, x, y) => teks(doc, t, ox + x, oy + y, { pt: 3.9, warna: abu, huruf: 'OpenSans', spasi: 0.25 });
      lbl('NAMA PESERTA DIDIK', 2.83, 23.6); lbl('NIS', 2.83, 32.8); lbl('NISN', 12.45, 32.8); lbl('TTL', 2.83, 38.1); lbl('Alamat', 2.83, 46.0);
      teks(doc, 'TATA TERTIB PEMAKAIAN KARTU', ox + L.w / 2, oy + 66, { pt: 5.6, tebal: true, warna: putih, rata: 'center', huruf: 'OpenSans' });
      doc.setDrawColor(putih); doc.setLineWidth(0.3); doc.roundedRect(ox + 6.3, oy + 67.4, 41.4, 12.4, 1.2, 1.2, 'S');
      ['Kartu wajib dipakai di lingkungan sekolah.', 'Tidak boleh dipinjamkan kepada orang lain.', 'Jika hilang, segera lapor ke wali kelas.', 'Menjaga kartu agar tidak rusak atau kotor.']
        .forEach((t, i) => teks(doc, '•  ' + t, ox + 8, oy + 70.2 + i * 2.5, { pt: 4.2, tebal: true, warna: putih, huruf: 'OpenSans' }));
    } else {
      doc.setFillColor('#3A5A8C'); doc.rect(ox + 8, oy + 18.6, 38, 0.2, 'F');
      teks(doc, 'QR ABSENSI', ox + L.w / 2, oy + 23, { pt: 8, warna: putih, rata: 'center', huruf: 'OpenSans', spasi: 0.2 });
      teks(doc, 'Pindai untuk mencatat kehadiran', ox + L.w / 2, oy + 25.3, { pt: 4.1, warna: putih, rata: 'center', huruf: 'OpenSans' });
      doc.setFillColor('#F4F4F4'); doc.roundedRect(ox + 2.5, oy + 66.5, 23, 17, 1.2, 1.2, 'F');
      const ks = (K.awal && K.awal.kepsek) || { nama: 'Moh. Munif S.Pd, M.M.Pd.', nip: '196911171995121003' };
      teks(doc, 'Kepala Sekolah', ox + 14, oy + 69.5, { pt: 4.4, warna: '#000000', rata: 'center', huruf: 'OpenSans' });
      teks(doc, ks.nama, ox + 14, oy + 80.4, { pt: 4.4, warna: '#000000', rata: 'center', huruf: 'OpenSans', lebar: 22 });
      teks(doc, 'NIP. ' + (ks.nip || '-'), ox + 14, oy + 82.3, { pt: 3.4, warna: '#000000', rata: 'center', huruf: 'OpenSans' });
      doc.setDrawColor(putih); doc.setLineWidth(0.3); doc.roundedRect(ox + 28, oy + 66.5, 23.5, 15, 1.2, 1.2, 'S');
      teks(doc, 'Kartu ini adalah milik resmi sekolah dan hanya digunakan oleh pemegang yang tertera.', ox + 29.5, oy + 69.5, { pt: 4.4, warna: putih, huruf: 'OpenSans', lebar: 21 });
    }
  }
  function kobaltDepan(doc, ox, oy, o) {
    const s = o.siswa || { nama: 'NAMA PESERTA DIDIK', nis: '0000', nisn: '0000', tempatLahir: 'Malang', tanggalLahir: '2013-01-01', alamat: 'Alamat siswa' };
    const L = KOBALT, putih = o.tinta || '#FFFFFF';
    if (o.latar) doc.addImage(o.latar, ox, oy, L.w, L.h, 'latarD', 'FAST');
    else latarKobalt(doc, ox, oy, 'depan');
    // Foto berbingkai segi lima seperti template
    doc.setFillColor(L.foto.isi); bentukFoto(doc, ox, oy, 'isi');
    if (o.foto) {
      doc.saveGraphicsState(); bentukFoto(doc, ox, oy, 'klip');
      doc.addImage(o.foto, 'JPEG', ox + L.foto.x, oy + L.foto.y, L.foto.w, L.foto.w * 4 / 3, undefined, 'FAST');
      doc.restoreGraphicsState();
    } else {
      teks(doc, 'FOTO', ox + L.foto.x + L.foto.w / 2, oy + 45, { pt: 6, warna: putih, rata: 'center', huruf: 'Poppins' });
    }
    // Nama: huruf kapital, maksimal 2 baris (mengecil bila perlu)
    let pt = L.nama.pt, baris;
    doc.setFont('OpenSans', 'bold');
    for (;;) {
      doc.setFontSize(pt);
      baris = bungkus(doc, String(s.nama || '').toUpperCase(), L.nama.lebar, L.nama.spasi);
      if (baris.length <= 2 || pt <= 6) break;
      pt -= 0.5;
    }
    baris.slice(0, 2).forEach((b, i) => teks(doc, b, ox + L.nama.x, oy + L.nama.y + i * L.nama.jarak, { pt: pt, tebal: true, warna: putih, huruf: 'OpenSans', spasi: L.nama.spasi }));
    teks(doc, s.nis || '-', ox + L.nis.x, oy + L.nis.y, { pt: L.nis.pt, warna: putih, huruf: 'OpenSans', spasi: L.nis.spasi });
    teks(doc, s.nisn || '-', ox + L.nisn.x, oy + L.nisn.y, { pt: L.nis.pt, warna: putih, huruf: 'OpenSans', spasi: L.nis.spasi });
    const ttl = s.tempatLahir || s.tanggalLahir ? [(s.tempatLahir || '-') + ',', tglPanjang(s.tanggalLahir) || '-'] : ['-'];
    ttl.forEach((b, i) => teks(doc, b, ox + L.ttl.x, oy + L.ttl.y + i * L.ttl.jarak, { pt: L.ttl.pt, warna: putih, huruf: 'Poppins', spasi: L.ttl.spasi }));
    doc.setFont('Poppins', 'normal').setFontSize(L.alamat.pt);
    const al = bungkus(doc, String(s.alamat || '-'), L.alamat.lebar, L.alamat.spasi).slice(0, L.alamat.baris);
    al.forEach((b, i) => teks(doc, b, ox + L.alamat.x, oy + L.alamat.y + i * L.alamat.jarak, { pt: L.alamat.pt, warna: putih, huruf: 'Poppins', spasi: L.alamat.spasi }));
  }
  function kobaltBelakang(doc, ox, oy, o) {
    const L = KOBALT;
    if (o.latar) doc.addImage(o.latar, ox, oy, L.w, L.h, 'latarB', 'FAST');
    else latarKobalt(doc, ox, oy, 'belakang');
    const k = L.qr.kotak;
    doc.setFillColor('#FFFFFF'); doc.roundedRect(ox + k.x, oy + k.y, k.s, k.s, 1.6, 1.6, 'F');
    qr(doc, (o.siswa || { nis: '0000' }).nis, ox + L.qr.x, oy + L.qr.y, L.qr.s);
  }

  /** Ukuran dan penggambar untuk tata letak yang dipilih. */
  function tataLetak() {
    return K.tata === 'kobalt'
      ? { w: KOBALT.w, h: KOBALT.h, tegak: true, depan: kobaltDepan, belakang: kobaltBelakang, kolom: 3, baris: 3 }
      : { w: W, h: H, tegak: false, depan: depan, belakang: belakang, kolom: 2, baris: 5 };
  }

  function tandaPotong(doc, x, y, w, h) {
    w = w || W; h = h || H;
    doc.setDrawColor('#9AA7B4'); doc.setLineWidth(0.1);
    [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([a, b]) => {
      doc.line(a - 3, b, a - 0.8, b); doc.line(a + 0.8, b, a + 3, b);
      doc.line(a, b - 3, a, b - 0.8); doc.line(a, b + 0.8, a, b + 3);
    });
  }

  /* ---------------- Penyusunan PDF ---------------- */
  function status(t) { $('kt-status').textContent = t; }

  async function ambilFoto(siswa) {
    const out = {};
    for (let i = 0; i < siswa.length; i += 25) {
      status('Mengambil foto ' + Math.min(i + 25, siswa.length) + ' dari ' + siswa.length + '…');
      let d;
      try { d = await T.api('kartu.foto', { nis: siswa.slice(i, i + 25).map((s) => s.nis) }); }
      catch (e) { K.galatFoto = e.message; continue; }
      for (const nis of Object.keys(d.foto || {})) {
        const f = d.foto[nis];
        if (f && f.data) { try { out[nis] = await fotoTigaEmpat(f.data); } catch (e) { /* foto rusak: kotak kosong */ } }
      }
    }
    return out;
  }

  async function latarDipakai() {
    if (!$('kt-pakai-latar').checked) return { depan: '', belakang: '' };
    if (!K.latar) { status('Mengambil latar desain Canva…'); K.latar = await T.api('kartu.ambilLatar'); }
    return K.latar;
  }

  async function unduhKartu() {
    if (K.menyusun) return;
    const kelas = Array.from(K.pilih);
    if (!kelas.length) { status('Pilih minimal satu kelas.'); return; }
    K.menyusun = true; $('kt-unduh').disabled = true;
    try {
      await siapkanPustaka();
      status('Mengambil data siswa…');
      const d = await T.api('kartu.data', { kelas: kelas });
      if (!d.siswa.length) { status('Tidak ada siswa aktif di kelas yang dipilih.'); return; }
      K.galatFoto = '';
      const foto = $('kt-foto').checked ? await ambilFoto(d.siswa) : {};
      const latar = await latarDipakai();
      const putih = $('kt-teks-putih').checked;
      const a4 = $('kt-format').value === 'a4';
      const tl = tataLetak();
      if (K.tata === 'kobalt') {
        await siapkanHuruf();
      }
      status('Menyusun PDF ' + d.siswa.length + ' kartu…');
      await new Promise((r) => setTimeout(r, 30));
      const { jsPDF } = window.jspdf;
      const orientasi = tl.tegak ? 'portrait' : 'landscape';
      let doc;
      const opsiD = (s) => ({ siswa: s, foto: foto[s.nis], latar: latar.depan, teksPutih: putih });
      const opsiB = (s) => ({ siswa: s, latar: latar.belakang });
      if (a4) {
        doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
        if (K.tata === 'kobalt') pasangHuruf(doc);
        const per = tl.kolom * tl.baris;
        const mx = (210 - tl.kolom * tl.w) / 2, my = (297 - tl.baris * tl.h) / 2;
        for (let i = 0; i < d.siswa.length; i += per) {
          const isi = d.siswa.slice(i, i + per);
          if (i) doc.addPage();
          isi.forEach((s, j) => { const x = mx + (j % tl.kolom) * tl.w, y = my + Math.floor(j / tl.kolom) * tl.h; tl.depan(doc, x, y, opsiD(s)); tandaPotong(doc, x, y, tl.w, tl.h); });
          teks(doc, 'Halaman depan ' + (i / per + 1) + '  ·  ' + kelas.join(', '), 105, 293, { pt: 6, warna: WARNA.redup, rata: 'center' });
          doc.addPage();
          // Halaman belakang dicerminkan kiri-kanan untuk cetak bolak-balik (balik sisi panjang).
          isi.forEach((s, j) => { const x = mx + (tl.kolom - 1 - (j % tl.kolom)) * tl.w, y = my + Math.floor(j / tl.kolom) * tl.h; tl.belakang(doc, x, y, opsiB(s)); tandaPotong(doc, x, y, tl.w, tl.h); });
          teks(doc, 'Halaman belakang ' + (i / per + 1) + ' (cetak bolak-balik, balik pada sisi panjang)', 105, 293, { pt: 6, warna: WARNA.redup, rata: 'center' });
        }
      } else {
        doc = new jsPDF({ unit: 'mm', format: [tl.w, tl.h], orientation: orientasi, compress: true });
        if (K.tata === 'kobalt') pasangHuruf(doc);
        d.siswa.forEach((s, i) => {
          if (i) doc.addPage([tl.w, tl.h], orientasi);
          tl.depan(doc, 0, 0, opsiD(s));
          doc.addPage([tl.w, tl.h], orientasi);
          tl.belakang(doc, 0, 0, opsiB(s));
        });
      }
      const nama = 'Kartu_Pelajar_' + (kelas.length > 3 ? kelas.length + '_kelas' : kelas.join('_')) + (a4 ? '_A4' : '_ukuran_kartu') + '.pdf';
      doc.save(nama);
      const tanpaFoto = $('kt-foto').checked ? d.siswa.filter((s) => !foto[s.nis]).length : 0;
      status(d.siswa.length + ' kartu tersimpan sebagai ' + nama + '.' + (tanpaFoto ? ' ' + tanpaFoto + ' siswa belum punya foto (kotak FOTO kosong).' : '') + (K.galatFoto ? ' Sebagian foto gagal diambil: ' + K.galatFoto : ''));
      T.toast('PDF kartu pelajar diunduh.', 'hadir');
    } catch (e) { status(e.message); }
    finally { K.menyusun = false; $('kt-unduh').disabled = false; }
  }

  async function unduhTemplate() {
    try {
      await siapkanPustaka();
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: 'mm', format: [W, H], orientation: 'landscape', compress: true });
      depan(doc, 0, 0, { panduan: true });
      doc.addPage([W, H], 'landscape'); belakang(doc, 0, 0, { panduan: true });
      doc.addPage([W, H], 'landscape'); depan(doc, 0, 0, { polos: true });
      doc.addPage([W, H], 'landscape'); belakang(doc, 0, 0, {});
      doc.addPage('a4', 'portrait');
      const p = [
        'Panduan template kartu pelajar SMKT',
        '',
        'Ukuran kartu 85,6 x 54 mm (ID-1, sama dengan kartu ATM). Halaman 1-2 menandai area data dengan garis putus-putus;',
        'halaman 3-4 adalah latar polos yang siap diedit di Canva.',
        '',
        'Cara memakai desain Canva:',
        '1. Di Canva: Buat desain > Impor file, pilih PDF ini. Edit halaman 3 (depan) dan 4 (belakang).',
        '2. Biarkan area FOTO, NAMA, NIS/NISN, KELAS, dan QR (lihat halaman 1) tetap polos. Aplikasi mengisinya otomatis.',
        '   Area QR akan diberi kotak putih; jangan menaruh hiasan penting di sana.',
        '3. Unduh dari Canva sebagai PNG atau JPG, ukuran minimal 1012 x 638 piksel (300 dpi), tanpa garis potong.',
        '4. Di aplikasi SMKT, menu Kartu pelajar > Latar desain Canva: unggah latar depan dan belakang.',
        '5. Centang "Pakai latar desain Canva", lalu unduh PDF kartu. Pilih "Teks putih" bila latar depan berwarna gelap.',
        '',
        'Isi QR adalah NIS siswa, sama dengan yang dibaca Gerbang dan Kios. Jangan mengganti QR dengan buatan Canva.'
      ];
      p.forEach((t, i) => teks(doc, t, 18, 24 + i * 7, { pt: i ? 10 : 15, tebal: !i, lebar: 175 }));
      doc.save('Template_Kartu_Pelajar_SMKT.pdf');
      status('Template tersimpan: Template_Kartu_Pelajar_SMKT.pdf (5 halaman).');
    } catch (e) { status(e.message); }
  }

  async function unduhCsv() {
    const kelas = Array.from(K.pilih);
    try {
      const d = await T.api('kartu.data', { kelas: kelas });
      const sel = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
      const csv = ['Nama,NIS,NISN,Kelas,Tempat_Lahir,Tanggal_Lahir,Alamat'].concat(d.siswa.map((s) => [s.nama, s.nis, s.nisn, s.kelas, s.tempatLahir, tglPanjang(s.tanggalLahir), s.alamat].map(sel).join(','))).join('\r\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
      a.download = 'Data_Kartu_Pelajar' + (kelas.length ? '_' + (kelas.length > 3 ? kelas.length + '_kelas' : kelas.join('_')) : '') + '.csv';
      document.body.appendChild(a); a.click(); a.remove();
      status(d.siswa.length + ' baris data diunduh untuk Canva Bulk Create.');
    } catch (e) { status(e.message); }
  }

  /** Latar diperkecil ke 1500 piksel lebar agar unggahan ringan. */
  async function unggahLatar(sisi, file) {
    if (!file) return;
    if (!/^image\/(png|jpeg)$/.test(file.type)) { status('Pilih gambar PNG atau JPG.'); return; }
    status('Mengunggah latar ' + sisi + '…');
    try {
      const img = await muatGambar(URL.createObjectURL(file));
      const tl = tataLetak();
      if ((img.height > img.width) !== tl.tegak) throw new Error('Gambar ' + (img.height > img.width ? 'tegak' : 'mendatar') + ', sedangkan tata letak terpilih ' + (tl.tegak ? 'tegak' : 'mendatar') + '. Ganti tata letak dulu atau unggah gambar yang sesuai.');
      if (Math.max(img.width, img.height) < 900) T.toast('Resolusi latar rendah (' + img.width + 'x' + img.height + ' piksel). Untuk cetak tajam, unduh dari Canva dengan ukuran 3x atau sebagai PNG ukuran besar.', 'telat', 8000);
      const lebar = Math.min(tl.tegak ? 1100 : 1500, img.width), tinggi = Math.round(lebar * tl.h / tl.w);
      const c = document.createElement('canvas'); c.width = lebar; c.height = tinggi;
      const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, lebar, tinggi);
      x.drawImage(img, 0, 0, lebar, tinggi);
      if (Math.abs(img.width / img.height - tl.w / tl.h) > 0.04) T.toast('Perbandingan gambar tidak sesuai ukuran kartu, latar akan sedikit tertarik. Sebaiknya ekspor ulang dari Canva.', 'telat', 7000);
      await T.api('kartu.latar', { sisi: sisi, gambar: c.toDataURL('image/jpeg', 0.9) });
      K.awal.latar[sisi] = true; K.latar = null;
      renderLatar(); $('kt-pakai-latar').checked = true;
      status('Latar ' + sisi + ' tersimpan.');
    } catch (e) { status(e.message); }
  }
  async function hapusLatar(sisi) {
    try { await T.api('kartu.latar', { sisi: sisi, hapus: true }); K.awal.latar[sisi] = false; K.latar = null; renderLatar(); status('Latar ' + sisi + ' dihapus. Kartu kembali memakai desain bawaan.'); }
    catch (e) { status(e.message); }
  }

  async function gantiTata() {
    const v = $('kt-tata').value;
    const ada = K.awal.latar.depan || K.awal.latar.belakang;
    if (ada && !confirmGanti(v)) { $('kt-tata').value = K.tata; return; }
    try {
      await T.api('kartu.latar', { tata: v });
      K.tata = v; K.awal.tata = v; renderTata();
      status('Tata letak: ' + $('kt-tata').selectedOptions[0].textContent + '.' + (v === 'kobalt' ? ' Unggah latar depan dan belakang hasil ekspor Canva.' : ''));
    } catch (e) { $('kt-tata').value = K.tata; status(e.message); }
  }
  function confirmGanti() { return true; }
  function renderTata() {
    $('kt-tata').value = K.tata;
    $('kt-tata').hidden = true; const lb = document.querySelector('label[for="kt-tata"]'); if (lb) lb.hidden = true;
    $('kt-tata-ket').textContent = K.tata === 'kobalt'
      ? 'Kartu tegak 54 x 85,6 mm. Depan: nama, NIS, NISN, TTL, alamat, dan foto. Belakang: QR. Lembar A4 memuat 9 kartu.'
      : 'Kartu mendatar 85,6 x 54 mm dengan desain bawaan aplikasi. Lembar A4 memuat 10 kartu.';
    $('kt-template').hidden = K.tata === 'kobalt';
    $('kt-panduan-kobalt').hidden = K.tata !== 'kobalt';
    $('kt-teks-putih').closest('label').hidden = K.tata === 'kobalt';
    $('kt-format').options[0].textContent = 'Kertas A4, ' + (K.tata === 'kobalt' ? 9 : 10) + ' kartu per lembar, bolak-balik (dipotong)';
  }
  function renderLatar() {
    const l = K.awal.latar;
    ['depan', 'belakang'].forEach((s) => {
      $('kt-latar-' + s + '-ket').textContent = l[s] ? 'Sudah diunggah' : 'Belum ada (memakai desain bawaan)';
      $('kt-latar-' + s + '-hapus').hidden = !l[s];
    });
    const ada = l.depan || l.belakang;
    $('kt-pakai-latar').disabled = !ada;
    if (!ada) $('kt-pakai-latar').checked = false;
  }

  function renderKelas() {
    const k = K.awal.kelas;
    $('kt-kelas').innerHTML = k.map((x) => '<label class="centang-kecil"><input type="checkbox" value="' + T.esc(x.kelas) + '"' + (K.pilih.has(x.kelas) ? ' checked' : '') +
      '><span>' + T.esc(x.kelas) + ' <small>(' + x.jumlah + ')</small></span></label>').join('');
    const n = k.filter((x) => K.pilih.has(x.kelas)).reduce((a, x) => a + x.jumlah, 0);
    $('kt-jumlah').textContent = K.pilih.size ? n + ' kartu dari ' + K.pilih.size + ' kelas' : 'Belum ada kelas dipilih';
  }

  let terpasang = false;
  function pasang() {
    if (terpasang) return; terpasang = true;
    $('kt-kelas').addEventListener('change', (e) => { const v = e.target.value; if (e.target.checked) K.pilih.add(v); else K.pilih.delete(v); renderKelas(); });
    $('kt-semua').addEventListener('click', () => { const semua = K.pilih.size === K.awal.kelas.length; K.pilih = new Set(semua ? [] : K.awal.kelas.map((x) => x.kelas)); renderKelas(); });
    $('kt-unduh').addEventListener('click', unduhKartu);
    $('kt-tata').addEventListener('change', gantiTata);
    $('kt-template').addEventListener('click', unduhTemplate);
    $('kt-csv').addEventListener('click', unduhCsv);
    ['depan', 'belakang'].forEach((s) => {
      $('kt-latar-' + s).addEventListener('change', (e) => { unggahLatar(s, e.target.files[0]); e.target.value = ''; });
      $('kt-latar-' + s + '-hapus').addEventListener('click', () => hapusLatar(s));
    });
  }

  async function buka() {
    pasang();
    status('');
    $('kt-ket').textContent = 'Memuat…';
    try {
      K.awal = await T.api('kartu.awal');
      $('kt-ket').textContent = K.awal.kelas.reduce((a, x) => a + x.jumlah, 0) + ' siswa aktif di ' + K.awal.kelas.length + ' kelas. QR berisi NIS, sama dengan yang dibaca Gerbang dan Kios.';
      $('kt-canva').hidden = !K.awal.canva;
      if (K.awal.canva) $('kt-canva').href = K.awal.canva;
      K.tata = 'kobalt';   // desain mendatar ditiadakan; semua kartu memakai Kobalt Emas (tegak)
      renderKelas(); renderLatar(); renderTata();
      if (K.tata === 'kobalt' && (K.awal.latar.depan || K.awal.latar.belakang)) $('kt-pakai-latar').checked = true;
      if (K.awal.kolomBaru && K.awal.kolomBaru.length) status('Kolom ' + K.awal.kolomBaru.join(', ') + ' ditambahkan di ujung kanan tab Siswa. Isi dari data Dapodik agar TTL dan alamat tercetak.');
      siapkanPustaka().catch(() => {});
    } catch (e) { $('kt-ket').textContent = e.message; }
  }

  window.SMKTKartu = { buka: buka, _uji: { depan: depan, belakang: belakang, kobaltDepan: kobaltDepan, kobaltBelakang: kobaltBelakang, pasangHuruf: pasangHuruf, siapkanHuruf: siapkanHuruf, siapkanPustaka: siapkanPustaka, K: K, KOBALT: KOBALT } };
})();
