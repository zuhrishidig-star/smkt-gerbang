/* Bintang Pagi: rekap siswa yang konsisten datang pagi (dari pindai QR gerbang).
 * Dimuat saat menu dibuka. Memakai window.SMKT_TATIB = { api, toast, esc } dari tatib.js. */
(function () {
  'use strict';
  const T = () => window.SMKT_TATIB;
  const $ = (id) => document.getElementById(id);
  const B = { siap: false, data: null, saring: 'semua', memuat: false };
  const NAMA_BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  function bulanIni() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }
  function namaBulan(b) { const m = /^(\d{4})-(\d{2})$/.exec(b || ''); return m ? NAMA_BULAN[Number(m[2]) - 1] + ' ' + m[1] : b; }
  function persen(x) { return x === null || x === undefined ? '–' : String(x).replace('.', ',') + '%'; }

  function pasang() {
    if (B.siap) return;
    B.siap = true;
    $('bp-bulan').value = bulanIni();
    $('bp-bulan').max = bulanIni();
    $('bp-bulan').addEventListener('change', muat);
    $('bp-kelas').addEventListener('change', muat);
    $('bp-saring').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-saring]'); if (!b) return;
      B.saring = b.dataset.saring;
      $('bp-saring').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      renderSiswa();
    });
    $('bp-csv').addEventListener('click', unduhCsv);
  }

  async function muat() {
    if (B.memuat) return;
    B.memuat = true;
    $('bp-status').textContent = 'Menghitung dari data pindai gerbang…';
    try {
      const d = await T().api('bintang.rekap', { bulan: $('bp-bulan').value || bulanIni(), kelas: $('bp-kelas').value || '' });
      B.data = d;
      render();
    } catch (e) {
      $('bp-status').textContent = 'Gagal memuat: ' + e.message;
    } finally { B.memuat = false; }
  }

  function render() {
    const d = B.data, esc = T().esc;
    const a = d.aturan;
    $('bp-aturan').innerHTML = 'Dihitung <strong>datang pagi</strong> bila pindai QR gerbang sampai pukul <strong>' + esc(a.batas) +
      '</strong>. Predikat <strong>Bintang Pagi</strong> untuk siswa yang datang pagi pada sedikitnya <strong>' + esc(String(a.ambang)) +
      '%</strong> hari sekolah dalam sebulan, minimal ' + esc(String(a.minHari)) + ' hari terhitung. Sakit dan izin tidak dihitung; hadir manual (lupa kartu) dihitung hadir tetapi bukan pagi.' +
      ' Datang lebih awal tidak menambah nilai.';
    const sel = $('bp-kelas');
    const pilih = d.kelasDipilih || '';
    sel.innerHTML = (d.semuaKelas ? '<option value="">Semua kelas</option>' : '') +
      d.pilihanKelas.map((k) => '<option value="' + esc(k) + '"' + (k === pilih ? ' selected' : '') + '>' + esc(k) + '</option>').join('');
    sel.disabled = !d.semuaKelas;
    $('bp-status').textContent = d.hariSekolah
      ? namaBulan(d.bulan) + ': ' + d.hariSekolah + ' hari sekolah tercatat.'
      : 'Belum ada data kehadiran untuk ' + namaBulan(d.bulan) + '.';

    // Tabel kelas
    const mg = d.minggu;
    $('bp-kelas-blok').hidden = !d.kelas.length;
    $('bp-tabel-kelas').innerHTML = '<thead><tr><th scope="col">Kelas</th><th scope="col">Bulan ini</th>' +
      mg.map((m) => '<th scope="col"><abbr title="Minggu mulai Senin ' + esc(m) + '">' + esc(m) + '</abbr></th>').join('') +
      '<th scope="col"><abbr title="Siswa berpredikat Bintang Pagi">Bintang</abbr></th></tr></thead><tbody>' +
      d.kelas.map((k) => '<tr><th scope="row">' + esc(k.kelas) + '</th><td class="persen">' + persen(k.persen) + '</td>' +
        k.minggu.map((x) => '<td>' + persen(x) + '</td>').join('') + '<td>' + k.bintang + ' / ' + k.siswa + '</td></tr>').join('') + '</tbody>';
    renderSiswa();
  }

  function renderSiswa() {
    const d = B.data; if (!d) return;
    const esc = T().esc;
    const daftar = d.siswa.filter((s) => B.saring === 'semua' || (B.saring === 'bintang' ? s.bintang : !s.cukup));
    const nB = d.siswa.filter((s) => s.bintang).length;
    $('bp-ringkas').textContent = nB + ' dari ' + d.siswa.length + ' siswa berpredikat Bintang Pagi.';
    $('bp-kosong').hidden = daftar.length > 0;
    $('bp-tabel-siswa').hidden = !daftar.length;
    $('bp-tabel-siswa').innerHTML = '<thead><tr><th scope="col">Siswa</th><th scope="col"><abbr title="Hari datang pagi / hari terhitung">Pagi</abbr></th>' +
      '<th scope="col">%</th><th scope="col"><abbr title="Hari pagi berturut-turut sampai hari terakhir (terpanjang bulan ini)">Runtun</abbr></th><th scope="col">Status</th></tr></thead><tbody>' +
      daftar.map((s) => '<tr><th scope="row">' + esc(s.nama) + '<br><small class="keterangan">' + esc(s.kelas) + '</small></th>' +
        '<td>' + s.pagi + ' / ' + s.hari + '</td><td class="persen">' + (s.hari ? persen(s.persen) : '–') + '</td>' +
        '<td>' + s.runtun + (s.terpanjang > s.runtun ? ' <small class="keterangan">(' + s.terpanjang + ')</small>' : '') + '</td>' +
        '<td>' + (s.bintang ? '<span class="chip bp-bintang">Bintang Pagi</span>' : (!s.cukup ? '<span class="chip info">Belum cukup data</span>' : '')) + '</td></tr>').join('') + '</tbody>';
  }

  function unduhCsv() {
    const d = B.data; if (!d) return;
    const q = (v) => '"' + String(v === null || v === undefined ? '' : v).replace(/"/g, '""') + '"';
    const baris = [['Bulan', 'NIS', 'Nama', 'Kelas', 'Hari_Terhitung', 'Hari_Pagi', 'Persen', 'Runtun_Terakhir', 'Runtun_Terpanjang', 'Status'].join(',')];
    d.siswa.forEach((s) => baris.push([d.bulan, s.nis, s.nama, s.kelas, s.hari, s.pagi, String(s.persen).replace('.', ','), s.runtun, s.terpanjang,
      s.bintang ? 'Bintang Pagi' : (!s.cukup ? 'Belum cukup data' : '')].map(q).join(',')));
    const blob = new Blob(['﻿' + baris.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Bintang_Pagi_' + d.bulan + (d.kelasDipilih ? '_' + d.kelasDipilih.replace(/\s+/g, '') : '') + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  window.SMKTBintang = { buka: () => { pasang(); muat(); } };
})();
