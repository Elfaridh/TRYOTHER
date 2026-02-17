import { getAll, put, del, uid, seed } from './db.js';
import { setupLayout, fmt } from './common.js';

let editing = null;
let logsCache = [];

async function render() {
  const asetRef = document.getElementById('asetRef');
  const pemBody = document.getElementById('pemBody');
  const [logs, aset] = await Promise.all([getAll('pemeliharaan'), getAll('aset')]);
  logsCache = logs;

  asetRef.innerHTML = aset.map((a) => `<option value='${a.id}'>${a.nama} - ${a.lokasi}</option>`).join('');
  pemBody.innerHTML = logs
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    .map((l) => `<tr>
      <td>${aset.find((a) => a.id === l.asetId)?.nama || '-'}</td>
      <td>${fmt(l.tanggal)}</td>
      <td>${l.catatan}</td>
      <td class='actions'><button data-e='${l.id}' class='secondary'>Edit</button><button data-d='${l.id}' class='danger'>Hapus</button></td>
    </tr>`)
    .join('');

  document.querySelectorAll('[data-e]').forEach((b) => {
    b.onclick = () => {
      const x = logsCache.find((i) => i.id === b.dataset.e);
      if (!x) return;
      editing = x.id;
      document.getElementById('asetRef').value = x.asetId;
      document.getElementById('tanggalPem').value = x.tanggal;
      document.getElementById('catatanPem').value = x.catatan;
    };
  });
  document.querySelectorAll('[data-d]').forEach((b) => {
    b.onclick = async () => {
      await del('pemeliharaan', b.dataset.d);
      render();
    };
  });
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
      id: editing || uid(),
      asetId: asetRef.value,
      tanggal: tanggalPem.value,
      catatan: catatanPem.value,
    });
    editing = null;
    form.reset();
    render();
  };

  render();
})();
