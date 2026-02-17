import { getAll, put, del, uid, seed } from './db.js';
import { setupLayout, fmt } from './common.js';

let editing = null;
let rowsCache = [];

async function render() {
  const asetMut = document.getElementById('asetMut');
  const dari = document.getElementById('dari');
  const ke = document.getElementById('ke');
  const mutBody = document.getElementById('mutBody');

  const [rows, aset, lokasi] = await Promise.all([getAll('mutasi'), getAll('aset'), getAll('lokasi')]);
  rowsCache = rows;
  asetMut.innerHTML = aset.map((a) => `<option value='${a.id}'>${a.nama}</option>`).join('');
  const ops = lokasi.map((l) => `<option>${l.nama}</option>`).join('');
  dari.innerHTML = ops;
  ke.innerHTML = ops;

  mutBody.innerHTML = rows
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    .map((r) => `<tr>
      <td>${aset.find((a) => a.id === r.asetId)?.nama || '-'}</td>
      <td>${r.dari}</td><td>${r.ke}</td><td>${fmt(r.tanggal)}</td><td>${r.pic}</td>
      <td class='actions'><button data-e='${r.id}' class='secondary'>Edit</button><button data-d='${r.id}' class='danger'>Hapus</button></td>
    </tr>`)
    .join('');

  document.querySelectorAll('[data-e]').forEach((b) => {
    b.onclick = () => {
      const x = rowsCache.find((i) => i.id === b.dataset.e);
      if (!x) return;
      editing = x.id;
      document.getElementById('asetMut').value = x.asetId;
      document.getElementById('dari').value = x.dari;
      document.getElementById('ke').value = x.ke;
      document.getElementById('tanggalMut').value = x.tanggal;
      document.getElementById('pic').value = x.pic;
    };
  });
  document.querySelectorAll('[data-d]').forEach((b) => {
    b.onclick = async () => {
      await del('mutasi', b.dataset.d);
      render();
    };
  });
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
      id: editing || uid(),
      asetId: asetMut.value,
      dari: dari.value,
      ke: ke.value,
      tanggal: tanggalMut.value,
      pic: pic.value,
    });
    editing = null;
    form.reset();
    render();
  };

  render();
})();
