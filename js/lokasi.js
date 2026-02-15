import { getAll, put, del, uid, seed } from './db.js';
import { setupLayout } from './common.js';

let editing=null;
async function render(){
  const list=await getAll('lokasi');
  document.querySelector('#lokasi-body').innerHTML=list.map(x=>`<tr><td>${x.nama}</td><td>${x.keterangan||'-'}</td><td class="actions"><button data-e="${x.id}" class="secondary">Edit</button><button data-d="${x.id}" class="danger">Hapus</button></td></tr>`).join('');
  document.querySelectorAll('[data-e]').forEach(b=>b.onclick=async()=>{const item=list.find(i=>i.id===b.dataset.e);editing=item.id;nama.value=item.nama;keterangan.value=item.keterangan||'';});
  document.querySelectorAll('[data-d]').forEach(b=>b.onclick=async()=>{await del('lokasi',b.dataset.d);render();});
}

(async()=>{
  await seed();
  await setupLayout('lokasi.html');
  await render();
  formLokasi.onsubmit=async(e)=>{e.preventDefault();await put('lokasi',{id:editing||uid(),nama:nama.value.trim(),keterangan:keterangan.value.trim()});editing=null;formLokasi.reset();render();};
})();
