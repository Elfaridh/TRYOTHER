import { getAll, put, del, uid, seed } from './db.js';
import { setupLayout } from './common.js';

let data = [];
let editing = null;
const kategoriOpt = ['mebel', 'elektronik', 'bangunan', 'alat ibadah', 'IT'];

const el = {
  form: () => document.getElementById('formAset'),
  nama: () => document.getElementById('namaAset'),
  lokasi: () => document.getElementById('lokasiAset'),
  kategori: () => document.getElementById('kategoriAset'),
  kondisi: () => document.getElementById('kondisiAset'),
  jumlah: () => document.getElementById('jumlahAset'),
  tahun: () => document.getElementById('tahunAset'),
  foto: () => document.getElementById('fotoAset'),
  preview: () => document.getElementById('preview'),
  cari: () => document.getElementById('cari'),
  body: () => document.getElementById('asetBody'),
  importFile: () => document.getElementById('importFile'),
};

function badge(k) {
  return `<span class="badge ${k === 'baik' ? 'baik' : k === 'rusak' ? 'rusak' : 'rusak-berat'}">${k}</span>`;
}

async function toBase64(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

function detectColumns(row) {
  const keys = Object.keys(row).reduce(
    (a, k) => ({ ...a, [k.toLowerCase().replace(/\s|_/g, '')]: k }),
    {}
  );
  const pick = (...opts) => opts.map((o) => keys[o]).find(Boolean);
  return {
    nama: pick('namaaset', 'nama', 'aset'),
    lokasi: pick('lokasi', 'area'),
    kategori: pick('kategori'),
    kondisi: pick('kondisi'),
    jumlah: pick('jumlah', 'qty'),
    tahun: pick('tahunperolehan', 'tahun'),
  };
}

async function importRows(rows) {
  if (!rows.length) return;
  const c = detectColumns(rows[0]);
  const allAset = await getAll('aset');
  const allLokasi = await getAll('lokasi');
  const lokasiByName = new Map(allLokasi.map((l) => [String(l.nama || '').toLowerCase().trim(), l]));

  let insertCount = 0;
  let updateCount = 0;

  for (const r of rows) {
    const nama = (r[c.nama] || 'Tanpa Nama').toString().trim();
    const lokasi = (r[c.lokasi] || 'Umum').toString().trim();
    const kategori = (r[c.kategori] || 'mebel').toString().toLowerCase().trim();
    const kondisi = (r[c.kondisi] || 'baik').toString().toLowerCase().trim();
    const jumlah = Number(r[c.jumlah] || 1);
    const tahun = (r[c.tahun] || '').toString().trim();

    if (!lokasiByName.has(lokasi.toLowerCase())) {
      const newLok = { id: uid(), nama: lokasi, keterangan: 'Auto dari import' };
      await put('lokasi', newLok);
      lokasiByName.set(lokasi.toLowerCase(), newLok);
    }

    const existing = allAset.find(
      (a) => String(a.nama || '').toLowerCase().trim() === nama.toLowerCase() &&
             String(a.lokasi || '').toLowerCase().trim() === lokasi.toLowerCase()
    );

    if (existing) {
      existing.kategori = kategori || existing.kategori;
      existing.kondisi = kondisi || existing.kondisi;
      existing.jumlah = Number.isFinite(jumlah) ? jumlah : existing.jumlah;
      existing.tahun = tahun || existing.tahun;
      await put('aset', existing);
      updateCount += 1;
    } else {
      const inserted = {
        id: uid(),
        nama,
        lokasi,
        kategori,
        kondisi,
        jumlah: Number.isFinite(jumlah) ? jumlah : 1,
        tahun,
        foto: '',
      };
      await put('aset', inserted);
      allAset.push(inserted);
      insertCount += 1;
    }
  }

  await render();
  alert(`Import selesai. Data baru: ${insertCount}, diperbarui: ${updateCount}`);
}

function edit(id) {
  const x = data.find((v) => v.id === id);
  if (!x) return;
  editing = id;
  el.nama().value = x.nama || '';
  el.lokasi().value = x.lokasi || '';
  el.kategori().value = x.kategori || '';
  el.kondisi().value = x.kondisi || '';
  el.jumlah().value = x.jumlah || 0;
  el.tahun().value = x.tahun || '';
  el.preview().src = x.foto || '';
}

async function render() {
  data = await getAll('aset');
  const q = el.cari().value.toLowerCase();
  const filtered = data.filter((x) =>
    [x.nama, x.lokasi, x.kategori, x.kondisi].join(' ').toLowerCase().includes(q)
  );

  el.body().innerHTML = filtered
    .map(
      (x) => `<tr>
        <td>${x.nama}</td><td>${x.lokasi}</td><td>${x.kategori}</td><td>${badge(x.kondisi)}</td>
        <td>${x.jumlah}</td><td>${x.tahun || '-'}</td>
        <td>${x.foto ? `<img class='preview' src='${x.foto}'/>` : '-'}</td>
        <td class='actions'>
          <button data-e='${x.id}' class='secondary'>Edit</button>
          <button data-d='${x.id}' class='danger'>Hapus</button>
        </td>
      </tr>`
    )
    .join('');

  document.querySelectorAll('[data-e]').forEach((b) => (b.onclick = () => edit(b.dataset.e)));
  document.querySelectorAll('[data-d]').forEach((b) => {
    b.onclick = async () => {
      await del('aset', b.dataset.d);
      render();
    };
  });
}

(async () => {
  await seed();
  await setupLayout('aset.html');

  const lokasi = await getAll('lokasi');
  el.lokasi().innerHTML = lokasi.map((l) => `<option>${l.nama}</option>`).join('') || '<option>Umum</option>';
  el.kategori().innerHTML = kategoriOpt.map((k) => `<option>${k}</option>`).join('');

  el.cari().oninput = render;
  el.foto().onchange = async () => {
    if (el.foto().files[0]) el.preview().src = await toBase64(el.foto().files[0]);
  };

  el.form().onsubmit = async (e) => {
    e.preventDefault();
    await put('aset', {
      id: editing || uid(),
      nama: el.nama().value,
      lokasi: el.lokasi().value,
      kategori: el.kategori().value,
      kondisi: el.kondisi().value,
      jumlah: Number(el.jumlah().value || 0),
      tahun: el.tahun().value,
      foto: el.preview().src || '',
    });
    editing = null;
    el.form().reset();
    el.preview().src = '';
    render();
  };

  el.importFile().onchange = async () => {
    const f = el.importFile().files[0];
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();

    if (ext === 'json') {
      await importRows(JSON.parse(await f.text()));
      return;
    }

    if (ext === 'csv') {
      const [h, ...lines] = (await f.text()).split(/\r?\n/).filter(Boolean);
      const heads = h.split(',');
      await importRows(lines.map((l) => Object.fromEntries(l.split(',').map((v, i) => [heads[i], v]))));
      return;
    }

    if (ext === 'xlsx' || ext === 'xls') {
      if (!window.XLSX) {
        alert('Parser Excel belum termuat.');
        return;
      }
      const buf = await f.arrayBuffer();
      const wb = window.XLSX.read(buf, { type: 'array' });
      const rows = window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      await importRows(rows);
      return;
    }

    alert('Format belum didukung. Gunakan .csv, .json, .xlsx, .xls');
  };

  await render();
})();
