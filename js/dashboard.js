import { getAll, get, seed } from './db.js';
import { setupLayout } from './common.js';

const percent = (n, d) => (d ? Math.round((n / d) * 100) : 0);

(async()=>{
  await seed();
  await setupLayout('index.html');

  const aset=await getAll('aset');
  const inst = await get('settings','institution');
  if (inst?.name) document.getElementById('inst-name').textContent = inst.name;

  const total=aset.reduce((a,b)=>a+(Number(b.jumlah)||0),0);
  const baik=aset.filter(a=>a.kondisi==='baik').reduce((x,y)=>x+Number(y.jumlah||0),0);
  const rusak=aset.filter(a=>a.kondisi==='rusak').reduce((x,y)=>x+Number(y.jumlah||0),0);
  const rusakBerat=aset.filter(a=>a.kondisi==='rusak berat').reduce((x,y)=>x+Number(y.jumlah||0),0);

  document.querySelector('#kpi-total').textContent=total;
  document.querySelector('#kpi-baik').textContent=baik;
  document.querySelector('#kpi-rusak').textContent=rusak + rusakBerat;
  document.querySelector('#kpi-rawat').textContent=rusak + rusakBerat;

  const pBaik = percent(baik, total);
  const pRusak = percent(rusak, total);
  const pRusakBerat = Math.max(0, 100 - pBaik - pRusak);

  document.getElementById('p-baik').textContent = `${pBaik}%`;
  document.getElementById('p-rusak').textContent = `${pRusak}%`;
  document.getElementById('p-rusak-berat').textContent = `${pRusakBerat}%`;

  const chart = document.getElementById('kondisi-chart');
  chart.style.background = `conic-gradient(#12b76a 0 ${pBaik}%, #f79009 ${pBaik}% ${pBaik+pRusak}%, #d92d20 ${pBaik+pRusak}% 100%)`;

  const bars = [
    ['Baik', baik, pBaik, 'baik'],
    ['Rusak', rusak, pRusak, 'rusak'],
    ['Rusak Berat', rusakBerat, pRusakBerat, 'rusak-berat']
  ];
  document.getElementById('kondisi-bars').innerHTML = bars.map(([label,val,p,cls])=>`
    <div class='bar-item'>
      <div class='bar-head'><span>${label}</span><b>${val}</b></div>
      <div class='track'><span class='fill ${cls}' style='width:${p}%;'></span></div>
    </div>
  `).join('');
})();
