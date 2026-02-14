# Deployability Checklist — Sarpras Daarul Aminn IBS

Dokumen ini menjawab pertanyaan: **"Kenapa belum bisa di-deploy?"**

## Alasan utama belum bisa deploy
Konsep sebelumnya baru berupa desain produk + rancangan database. Agar bisa deploy, minimal harus ada:

1. Source code backend (API) yang bisa dijalankan.
2. Source code frontend (web app) yang bisa dijalankan.
3. File deployment (`Dockerfile`, `docker-compose.yml`, env vars).
4. Migrasi database yang executable.
5. Pipeline CI/CD dan healthcheck.

Tanpa 5 komponen ini, sistem masih di tahap **blueprint**, belum **deployable artifact**.

---

## Definition of Done (DoD) agar “bisa deploy”

### A. Backend siap deploy
- [ ] Endpoint healthcheck: `GET /health`.
- [ ] Endpoint auth + RBAC dasar berjalan.
- [ ] Modul aset, booking, maintenance minimal CRUD.
- [ ] Prisma migration sukses pada PostgreSQL.
- [ ] Dockerfile backend build & run tanpa error.

### B. Frontend siap deploy
- [ ] Login page + dashboard ringkas tampil.
- [ ] Integrasi API auth berjalan.
- [ ] Dark/Light mode tersedia.
- [ ] Dockerfile frontend build production sukses.

### C. Infra siap deploy
- [ ] `docker-compose.yml` untuk local staging.
- [ ] Secrets/env dipisah (`.env`, secret manager).
- [ ] Reverse proxy + HTTPS (Nginx/Traefik + cert).
- [ ] Backup PostgreSQL terjadwal.
- [ ] Observability: logs + metrics + error tracking.

### D. Operasional & keamanan
- [ ] SSL aktif.
- [ ] RBAC diuji minimal 5 role.
- [ ] Rate limiting auth endpoint.
- [ ] Audit log untuk perubahan aset dan approval.
- [ ] Restore test backup berhasil.

---

## Rekomendasi urutan implementasi (supaya cepat live)

### Sprint 1 (1 minggu)
- Scaffold NestJS + Next.js.
- Setup PostgreSQL + Prisma.
- Implement auth + roles.

### Sprint 2 (1 minggu)
- Modul aset + QR token + dashboard statistik dasar.
- Deploy ke staging dengan Docker Compose.

### Sprint 3 (1 minggu)
- Booking fasilitas + approval flow.
- Maintenance ticket + upload foto.

### Sprint 4 (1 minggu)
- Hardening keamanan + observability.
- Generate PDF laporan bulanan + go-live production.

---

## Command validasi minimal saat nanti sudah ada source code

```bash
# 1) Jalankan service
make up

# 2) Jalankan migrasi DB
make migrate

# 3) Cek health API
curl -f http://localhost:3001/health

# 4) Jalankan test backend/frontend
make test

# 5) Build production image
make build
```

Jika semua lolos, status dapat dikategorikan **deployable**.
