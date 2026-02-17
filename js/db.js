const DB_NAME='rekap-sarpras-db';
const DB_VERSION=2;
let dbPromise;

export function openDB(){
  if(dbPromise) return dbPromise;
  dbPromise=new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=(e)=>{
      const db=e.target.result;
      const stores=['users','lokasi','aset','pemeliharaan','mutasi','settings'];
      stores.forEach(s=>{if(!db.objectStoreNames.contains(s)){db.createObjectStore(s,{keyPath:'id'});}});
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
  return dbPromise;
}

export async function put(store,val){const db=await openDB();return tx(db,store,'readwrite',s=>s.put(val));}
export async function del(store,id){const db=await openDB();return tx(db,store,'readwrite',s=>s.delete(id));}
export async function get(store,id){const db=await openDB();return tx(db,store,'readonly',s=>s.get(id));}
export async function getAll(store){const db=await openDB();return tx(db,store,'readonly',s=>s.getAll());}

function tx(db,store,mode,fn){
  return new Promise((resolve,reject)=>{
    const t=db.transaction(store,mode);const s=t.objectStore(store);const req=fn(s);
    req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
  });
}

export const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;

export async function seed(){
  const users=await getAll('users');
  if(!users.length){
    await put('users',{id:uid(),username:'admin',password:'admin123',role:'admin',nama:'Admin Sarpras'});
    await put('users',{id:uid(),username:'petugas',password:'petugas123',role:'petugas',nama:'Petugas Sarpras'});
  }
  const settings=await get('settings','institution');
  if(!settings){await put('settings',{id:'institution',name:'Daarul Amiin IBS',shortName:'DA-IBS',logo:'assets/logo-daarul-amiin.svg',address:'',phone:'',email:'',leader:'',description:'Sistem Rekap Sarpras Pesantren'});}
}
