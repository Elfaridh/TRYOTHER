import { getAll, seed } from './db.js';

const KEY='sarpras-session';

export async function login(username,password){
  await seed();
  const users=await getAll('users');
  const found=users.find(u=>u.username===username&&u.password===password);
  if(!found) return null;
  localStorage.setItem(KEY,JSON.stringify({id:found.id,role:found.role,nama:found.nama}));
  return found;
}
export function logout(){localStorage.removeItem(KEY); location.href='login.html';}
export function session(){try{return JSON.parse(localStorage.getItem(KEY));}catch{return null;}}
export function requireAuth(){const s=session(); if(!s) location.href='login.html'; return s;}
