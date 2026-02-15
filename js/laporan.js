import { seed, getAll } from './db.js';
import { setupLayout } from './common.js';
import { exportCSV, exportExcelLike } from './export.js';

(async () => {
  await seed();
  await setupLayout('laporan.html');

  const lapBody = document.getElementById('lapBody');
  const expAsetCsv = document.getElementById('expAsetCsv');
  const expAsetXlsx = document.getElementById('expAsetXlsx');
  const expLokCsv = document.getElementById('expLokCsv');

  const aset = await getAll('aset');
  const byLokasi = Object.entries(
    aset.reduce((a, c) => {
      a[c.lokasi] = (a[c.lokasi] || 0) + Number(c.jumlah || 0);
      return a;
    }, {})
  );

  lapBody.innerHTML = byLokasi.map(([lok, jml]) => `<tr><td>${lok}</td><td>${jml}</td></tr>`).join('');
  expAsetCsv.onclick = () => exportCSV('aset');
  expAsetXlsx.onclick = () => exportExcelLike('aset');
  expLokCsv.onclick = () => exportCSV('lokasi');
})();
