import { getAll, seed } from './db.js';
import { setupLayout } from './common.js';

(async()=>{
  await seed();
  await setupLayout('index.html');
  const aset=await getAll('aset');
  const total=aset.reduce((a,b)=>a+(Number(b.jumlah)||0),0);
  const baik=aset.filter(a=>a.kondisi==='baik').reduce((x,y)=>x+Number(y.jumlah||0),0);
  const rusak=aset.filter(a=>a.kondisi!=='baik').reduce((x,y)=>x+Number(y.jumlah||0),0);
  document.querySelector('#kpi-total').textContent=total;
  document.querySelector('#kpi-baik').textContent=baik;
  document.querySelector('#kpi-rusak').textContent=rusak;
  document.querySelector('#kpi-rawat').textContent=rusak;
})();
