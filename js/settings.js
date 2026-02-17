import { get, put, getAll, seed, uid } from './db.js';
import { setupLayout } from './common.js';

const toBase64 = (file) => new Promise((resolve, reject) => {
  const fr = new FileReader();
  fr.onload = () => resolve(fr.result);
  fr.onerror = reject;
  fr.readAsDataURL(file);
});

(async()=>{
  await seed();
  await setupLayout('settings.html');

  const form = document.getElementById('formSettings');
  const logoInput = document.getElementById('setLogo');
  const preview = document.getElementById('setLogoPreview');
  const fields = {
    name: document.getElementById('setName'),
    shortName: document.getElementById('setShort'),
    email: document.getElementById('setEmail'),
    phone: document.getElementById('setPhone'),
    leader: document.getElementById('setLeader'),
    address: document.getElementById('setAddress'),
    description: document.getElementById('setDesc'),
  };

  let current = await get('settings','institution');
  if (!current) {
    current = { id:'institution', name:'Daarul Amiin IBS', shortName:'DA-IBS', logo:'assets/logo-daarul-amiin.svg', address:'', phone:'', email:'', leader:'', description:'' };
    await put('settings', current);
  }

  Object.keys(fields).forEach((k)=> fields[k].value = current[k] || '');
  preview.src = current.logo || 'assets/logo-daarul-amiin.svg';

  logoInput.onchange = async () => {
    if (logoInput.files[0]) preview.src = await toBase64(logoInput.files[0]);
  };

  form.onsubmit = async (e) => {
    e.preventDefault();
    const payload = { ...current, id:'institution', logo: preview.src || current.logo };
    Object.keys(fields).forEach((k)=> payload[k] = fields[k].value.trim());
    await put('settings', payload);
    alert('Pengaturan lembaga berhasil disimpan.');
    location.reload();
  };

  document.getElementById('btnBackup').onclick = async () => {
    const stores = ['users','lokasi','aset','pemeliharaan','mutasi','settings'];
    const dump = {};
    for (const s of stores) dump[s] = await getAll(s);
    const blob = new Blob([JSON.stringify(dump, null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `backup-sarpras-${Date.now()}.json`;
    a.click();
  };

  document.getElementById('btnRestore').onclick = () => document.getElementById('restoreFile').click();
  document.getElementById('restoreFile').onchange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const data = JSON.parse(await f.text());
    const stores = ['users','lokasi','aset','pemeliharaan','mutasi','settings'];
    for (const s of stores) {
      for (const row of (data[s] || [])) await put(s, { id: row.id || uid(), ...row });
    }
    alert('Restore data selesai.');
    location.reload();
  };
})();
