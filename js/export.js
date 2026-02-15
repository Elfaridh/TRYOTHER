import { getAll } from './db.js';

export async function exportCSV(type){
  const rows=await getAll(type); if(!rows.length){alert('Data kosong');return;}
  const headers=[...new Set(rows.flatMap(r=>Object.keys(r)))];
  const csv=[headers.join(','),...rows.map(r=>headers.map(h=>`"${(r[h]??'').toString().replaceAll('"','""')}"`).join(','))].join('\n');
  const blob=new Blob([csv],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`${type}.csv`; a.click();
}

export async function exportExcelLike(type){
  const rows=await getAll(type); if(!rows.length){alert('Data kosong');return;}
  const ws=window.XLSX.utils.json_to_sheet(rows); const wb=window.XLSX.utils.book_new(); window.XLSX.utils.book_append_sheet(wb,ws,type); window.XLSX.writeFile(wb,`${type}.xlsx`);
}
