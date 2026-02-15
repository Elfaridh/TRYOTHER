import { getAll, put, uid, seed } from './db.js';
import { setupLayout, fmt } from './common.js';

async function render() {
  const asetMut = document.getElementById('asetMut');
  const dari = document.getElementById('dari');
  const ke = document.getElementById('ke');
  const mutBody = document.getElementById('mutBody');

  const [rows, aset, lokasi] = await Promise.all([getAll('mutasi'), getAll('aset'), getAll('lokasi')]);
  asetMut.innerHTML = aset.map((a) => `<option value='${a.id}'>${a.nama}</option>`).join('');
  const ops = lokasi.map((l) => `<option>${l.nama}</option>`).join('');
  dari.innerHTML = ops;
  ke.innerHTML = ops;

  mutBody.innerHTML = rows
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    .map(
      (r) =>
        `<tr><td>${aset.find((a) => a.id === r.asetId)?.nama || '-'}</td><td>${r.dari}</td><td>${r.ke}</td><td>${fmt(
          r.tanggal
        )}</td><td>${r.pic}</td></tr>`
    )
    .join('');
}

(async () => {
  await seed();
  await setupLayout('mutasi.html');

  const form = document.getElementById('formMut');
  const asetMut = document.getElementById('asetMut');
  const dari = document.getElementById('dari');
  const ke = document.getElementById('ke');
  const tanggalMut = document.getElementById('tanggalMut');
  const pic = document.getElementById('pic');

  form.onsubmit = async (e) => {
    e.preventDefault();
    await put('mutasi', {
      id: uid(),
      asetId: asetMut.value,
      dari: dari.value,
      ke: ke.value,
      tanggal: tanggalMut.value,
      pic: pic.value,
    });
    form.reset();
    render();
  };

  render();
})();
