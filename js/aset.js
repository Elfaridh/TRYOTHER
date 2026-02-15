import { getAll, put, del, uid, seed } from './db.js';
import { setupLayout } from './common.js';

let data=[]; let editing=null;
const kategoriOpt=['mebel','elektronik','bangunan','alat ibadah','IT'];

function badge(k){return `<span class="badge ${k==='baik'?'baik':k==='rusak'?'rusak':'rusak-berat'}">${k}</span>`;}
async function toBase64(file){return new Promise((r,j)=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.onerror=j;fr.readAsDataURL(file);});}

async function render(){
  data=await getAll('aset');
  const q=cari.value.toLowerCase();
  const f=data.filter(x=>[x.nama,x.lokasi,x.kategori,x.kondisi].join(' ').toLowerCase().includes(q));
  asetBody.innerHTML=f.map(x=>`<tr><td>${x.nama}</td><td>${x.lokasi}</td><td>${x.kategori}</td><td>${badge(x.kondisi)}</td><td>${x.jumlah}</td><td>${x.tahun||'-'}</td><td>${x.foto?`<img class='preview' src='${x.foto}'/>`:'-'}</td><td class='actions'><button data-e='${x.id}' class='secondary'>Edit</button><button data-d='${x.id}' class='danger'>Hapus</button></td></tr>`).join('');
  document.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>edit(b.dataset.e));
  document.querySelectorAll('[data-d]').forEach(b=>b.onclick=async()=>{await del('aset',b.dataset.d);render();});
}
function edit(id){const x=data.find(v=>v.id===id);editing=id;Object.entries({namaAset:x.nama,lokasiAset:x.lokasi,kategoriAset:x.kategori,kondisiAset:x.kondisi,jumlahAset:x.jumlah,tahunAset:x.tahun}).forEach(([k,v])=>window[k].value=v||'');preview.src=x.foto||'';}

function detectColumns(row){
  const keys=Object.keys(row).reduce((a,k)=>({...a,[k.toLowerCase().replace(/\s|_/g,'')]:k}),{});
  const pick=(...opts)=>opts.map(o=>keys[o]).find(Boolean);
  return {
    nama:pick('namaaset','nama','aset'), lokasi:pick('lokasi','area'), kategori:pick('kategori'), kondisi:pick('kondisi'), jumlah:pick('jumlah','qty'), tahun:pick('tahunperolehan','tahun')
  };
}

async function importRows(rows){
  if(!rows.length) return;
  const c=detectColumns(rows[0]);
  for(const r of rows){
    await put('aset',{id:uid(),nama:r[c.nama]||'Tanpa Nama',lokasi:r[c.lokasi]||'Umum',kategori:(r[c.kategori]||'mebel').toString().toLowerCase(),kondisi:(r[c.kondisi]||'baik').toString().toLowerCase(),jumlah:Number(r[c.jumlah]||1),tahun:r[c.tahun]||'',foto:''});
  }
  render();
  alert(`Import berhasil: ${rows.length} data`);
}

(async()=>{
  await seed(); await setupLayout('aset.html');
  const lokasi=await getAll('lokasi'); lokasiAset.innerHTML=lokasi.map(l=>`<option>${l.nama}</option>`).join('')||'<option>Umum</option>';
  kategoriAset.innerHTML=kategoriOpt.map(k=>`<option>${k}</option>`).join('');
  cari.oninput=render;
  fotoAset.onchange=async()=>{if(fotoAset.files[0]) preview.src=await toBase64(fotoAset.files[0]);};
  formAset.onsubmit=async(e)=>{e.preventDefault();await put('aset',{id:editing||uid(),nama:namaAset.value,lokasi:lokasiAset.value,kategori:kategoriAset.value,kondisi:kondisiAset.value,jumlah:Number(jumlahAset.value||0),tahun:tahunAset.value,foto:preview.src||''});editing=null;formAset.reset();preview.src='';render();};
  importFile.onchange=async()=>{
    const f=importFile.files[0]; if(!f) return;
    const ext=f.name.split('.').pop().toLowerCase();
    if(ext==='json'){importRows(JSON.parse(await f.text()));return;}
    if(ext==='csv'){const [h,...lines]=(await f.text()).split(/\r?\n/).filter(Boolean);const heads=h.split(',');importRows(lines.map(l=>Object.fromEntries(l.split(',').map((v,i)=>[heads[i],v]))));return;}
    if(ext==='xlsx'||ext==='xls'){
      if(!window.XLSX){alert('Parser Excel belum termuat.');return;}
      const buf=await f.arrayBuffer(); const wb=window.XLSX.read(buf,{type:'array'}); const rows=window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]); importRows(rows); return;
    }
    alert('Format belum didukung. Gunakan .csv, .json, .xlsx');
  };
  await render();
})();
