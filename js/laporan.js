import { seed, getAll } from './db.js';
import { setupLayout } from './common.js';
import { exportCSV, exportExcelLike } from './export.js';

const monthKey = (d) => {
  if (!d) return '';
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return '';
  return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}`;
};

function groupSum(rows, keyName, valueName='jumlah') {
  return Object.entries(rows.reduce((a,c)=>{
    const k = c[keyName] || 'Tanpa Kategori';
    a[k] = (a[k] || 0) + Number(c[valueName] || 0);
    return a;
  },{}));
}

async function renderReport() {
  const aset = await getAll('aset');
  const mutasi = await getAll('mutasi');
  const pem = await getAll('pemeliharaan');
  const bulan = document.getElementById('bulan').value;

  const byLokasi = groupSum(aset, 'lokasi');
  const byKategori = groupSum(aset, 'kategori');
  const byKondisi = groupSum(aset, 'kondisi');

  const total = aset.reduce((a,b)=>a+Number(b.jumlah||0),0);

  document.getElementById('lapLokasi').innerHTML = byLokasi.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('') || '<tr><td colspan="2">Belum ada data</td></tr>';
  document.getElementById('lapKategori').innerHTML = byKategori.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('') || '<tr><td colspan="2">Belum ada data</td></tr>';
  document.getElementById('lapKondisi').innerHTML = byKondisi.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td><td>${total?Math.round(v/total*100):0}%</td></tr>`).join('') || '<tr><td colspan="3">Belum ada data</td></tr>';

  const mutasiBulanan = bulan ? mutasi.filter((m)=>monthKey(m.tanggal)===bulan).length : mutasi.length;
  const pemBulanan = bulan ? pem.filter((m)=>monthKey(m.tanggal)===bulan).length : pem.length;
  document.getElementById('lapAktivitas').innerHTML = `
    <tr><td>Total Mutasi ${bulan?`(${bulan})`:''}</td><td>${mutasiBulanan}</td></tr>
    <tr><td>Total Pemeliharaan ${bulan?`(${bulan})`:''}</td><td>${pemBulanan}</td></tr>
    <tr><td>Total Item Aset</td><td>${total}</td></tr>
  `;
}

(async () => {
  await seed();
  await setupLayout('laporan.html');

  document.getElementById('refreshLap').onclick = renderReport;

  document.getElementById('expAsetCsv').onclick = () => exportCSV('aset');
  document.getElementById('expAsetXlsx').onclick = () => exportExcelLike('aset');
  document.getElementById('expLokCsv').onclick = () => exportCSV('lokasi');
  document.getElementById('expMutCsv').onclick = () => exportCSV('mutasi');
  document.getElementById('expPemCsv').onclick = () => exportCSV('pemeliharaan');

  await renderReport();
})();
