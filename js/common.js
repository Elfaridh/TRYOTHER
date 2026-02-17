import { get } from './db.js';
import { requireAuth, logout } from './auth.js';

export const APP_VERSION = 'v3.2.0';

export async function setupLayout(active){
  requireAuth();
  const top=document.querySelector('#topbar-brand');
  if(top){
    const inst=await get('settings','institution');
    top.innerHTML=`<img src="${inst?.logo||'assets/logo-daarul-amiin.svg'}" alt="logo"> <span>${inst?.name||'Daarul Amiin IBS'}</span>`;
  }
  const nav=document.querySelector('#main-nav');
  if(nav){
    const items=[['index.html','Dashboard'],['lokasi.html','Lokasi'],['aset.html','Aset'],['pemeliharaan.html','Pemeliharaan'],['mutasi.html','Mutasi'],['laporan.html','Laporan'],['settings.html','Pengaturan']];
    nav.innerHTML=items.map(([h,t])=>`<a href="${h}" class="${active===h?'active':''}">${t}</a>`).join('')+`<a href="#" id="logout-btn">Logout</a><span class="version-pill">${APP_VERSION}</span>`;
    nav.querySelector('#logout-btn').onclick=(e)=>{e.preventDefault();logout();};
  }
}

export const fmt=(d)=>new Date(d).toLocaleDateString('id-ID');
