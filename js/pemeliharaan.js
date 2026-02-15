import { getAll, put, uid, seed } from './db.js';
import { setupLayout, fmt } from './common.js';

async function render() {
  const asetRef = document.getElementById('asetRef');
  const pemBody = document.getElementById('pemBody');
  const [logs, aset] = await Promise.all([getAll('pemeliharaan'), getAll('aset')]);

  asetRef.innerHTML = aset.map((a) => `<option value='${a.id}'>${a.nama} - ${a.lokasi}</option>`).join('');
  pemBody.innerHTML = logs
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    .map((l) => `<tr><td>${aset.find((a) => a.id === l.asetId)?.nama || '-'}</td><td>${fmt(l.tanggal)}</td><td>${l.catatan}</td></tr>`)
    .join('');
}

(async () => {
  await seed();
  await setupLayout('pemeliharaan.html');

  const form = document.getElementById('formPem');
  const asetRef = document.getElementById('asetRef');
  const tanggalPem = document.getElementById('tanggalPem');
  const catatanPem = document.getElementById('catatanPem');

  form.onsubmit = async (e) => {
    e.preventDefault();
    await put('pemeliharaan', {
      id: uid(),
      asetId: asetRef.value,
      tanggal: tanggalPem.value,
      catatan: catatanPem.value,
    });
    form.reset();
    render();
  };

  render();
})();
