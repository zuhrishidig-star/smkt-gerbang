/*
 * Pengaturan aplikasi Gerbang SMKT.
 * Isi API_URL dan GOOGLE_CLIENT_ID setelah backend Apps Script dipasang
 * (lihat panduan "Versi Gratis" di dokumen Blueprint SMKT).
 * Selama API_URL masih kosong, aplikasi berjalan dalam MODE DEMO
 * dengan data contoh, tanpa menyentuh spreadsheet sekolah.
 */
window.SMKT_CONFIG = {
  // URL Web App Apps Script, berakhiran /exec
  API_URL: 'https://script.google.com/macros/s/AKfycbzb5UGdrsECTl94MNY_nGiib5_codt40yXn_TyS2yIqrXSiTRAjaPu6TO8fi4jKSe-t/exec',

  // Client ID OAuth dari Google Cloud Console, berakhiran .apps.googleusercontent.com
  GOOGLE_CLIENT_ID: '138341335340-sjlp1hr7help0701gebueai4khr666pf.apps.googleusercontent.com',

  // Lama foto siswa tampil sebelum tersimpan otomatis (milidetik)
  DURASI_POPUP_MS: 2000,

  NAMA_SEKOLAH: 'SMP Negeri 1 Wonosari'
};
