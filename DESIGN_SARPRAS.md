# Konsep Aplikasi Sarpras Pesantren Daarul Aminn IBS

## 1) Branding Aplikasi

### Opsi Nama
1. **D-AMIN ASSET HUB**
2. **PRASARANA DAARUL AMINN**

### Tagline
**"Modern Management for Blessed Facilities"**

### Identitas Visual (Elegan & Modern)
- **Tema warna**: Emerald (utama), Slate (netral), Gold (aksen premium).
- **Mode tampilan**: Dark/Light mode dengan transisi halus.
- **Tipografi**: Inter / Plus Jakarta Sans untuk nuansa profesional.
- **Komponen UI**: card glassmorphism ringan, shadow lembut, chart minimalis.

---

## 2) Modul Inti yang Wajib Ada

## A. Dashboard Eksekutif
**Tujuan**: Memberi ringkasan kondisi aset dan fasilitas secara cepat untuk pimpinan.

**Widget utama:**
- Total aset aktif, aset rusak, aset dalam perbaikan.
- Nilai buku aset (akumulasi nilai inventaris).
- Utilisasi fasilitas (ruang/lapangan) per minggu.
- Top 10 aset dengan frekuensi maintenance tertinggi.
- Heatmap lokasi gedung dengan status kondisi.

**Visualisasi:**
- Bar chart tren kerusakan bulanan.
- Donut chart kategori aset.
- Line chart utilisasi peminjaman.

## B. Sistem Peminjaman Fasilitas
**Tujuan**: Booking ruang/lapangan terintegrasi agenda pesantren.

**Fitur:**
- Kalender fasilitas (harian/mingguan/bulanan).
- Cek ketersediaan real-time dan anti bentrok jadwal.
- Alur persetujuan berjenjang (pengurus → pimpinan opsional).
- Pengingat otomatis (push/email/WhatsApp gateway opsional).
- Check-in/check-out saat penggunaan fasilitas.

**Status alur:**
`Draft -> Menunggu Persetujuan -> Disetujui/Ditolak -> Sedang Digunakan -> Selesai`

## C. Maintenance Tracking
**Tujuan**: Menangani laporan kerusakan dari santri/ustadz secara transparan.

**Fitur:**
- Pelaporan kerusakan dengan foto/video singkat.
- Prioritas (rendah/sedang/tinggi/kritis).
- Penugasan teknisi/petugas sarpras.
- Timeline status real-time:
  `Dilaporkan -> Diverifikasi -> Dikerjakan -> Selesai -> Ditutup`
- SLA per kategori kerusakan (mis. listrik kritis < 4 jam).

## D. Audit Aset Digital (QR Code)
**Tujuan**: Mempercepat stock opname dan validasi lokasi aset.

**Fitur:**
- Tiap aset memiliki QR unik (UUID).
- Scan via mobile untuk melihat detail aset.
- Update kondisi & lokasi saat audit lapangan.
- Riwayat perpindahan aset (movement log).
- Notifikasi bila aset tidak ditemukan pada audit periodik.

## E. Laporan “Megah” untuk Pimpinan
**Format laporan bulanan profesional:**
- Ringkasan KPI (utilisasi, downtime, biaya maintenance).
- Daftar aset baru, aset rusak, dan aset dihapus.
- Rekap peminjaman fasilitas + tingkat keterisian.
- Analisis biaya per kategori aset.
- Export **PDF** berkop pesantren + tanda tangan digital.

---

## 3) Role-Based Access (RBAC)

### Peran Utama
1. **Santri**
   - Lapor kerusakan.
   - Ajukan pinjam fasilitas.
   - Lihat status tiket/laporan milik sendiri.

2. **Ustadz/Guru**
   - Fitur santri + prioritas peminjaman tertentu.
   - Verifikasi awal laporan di area asrama/kelas.

3. **Pengurus Sarpras**
   - CRUD aset, lokasi, kategori.
   - Kelola jadwal peminjaman.
   - Assign & monitor maintenance.
   - Menjalankan audit QR.

4. **Pimpinan**
   - Akses dashboard strategis & laporan eksekutif.
   - Approval kebijakan/aset bernilai tinggi.

5. **Super Admin**
   - Manajemen user, role, konfigurasi sistem, integrasi.

---

## 4) Struktur Database (PostgreSQL)

> Di bawah ini struktur inti yang siap dikembangkan. Gunakan UUID sebagai primary key untuk skalabilitas dan sinkronisasi cloud.

```sql
-- Extension opsional
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Master pengguna dan role
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL, -- SANTRI, USTADZ, PENGURUS, PIMPINAN, SUPER_ADMIN
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE,
  phone VARCHAR(30) UNIQUE,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- 2) Master lokasi dan kategori aset
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(120) NOT NULL,
  type VARCHAR(50) NOT NULL, -- GEDUNG, RUANGAN, LAPANGAN, GUDANG
  parent_id UUID REFERENCES locations(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE asset_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(120) NOT NULL,
  useful_life_months INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3) Aset dan audit QR
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_code VARCHAR(50) UNIQUE NOT NULL,
  qr_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  category_id UUID REFERENCES asset_categories(id),
  location_id UUID REFERENCES locations(id),
  purchase_date DATE,
  purchase_value NUMERIC(16,2),
  condition_status VARCHAR(30) NOT NULL DEFAULT 'BAIK',
  asset_status VARCHAR(30) NOT NULL DEFAULT 'AKTIF', -- AKTIF, DIPINJAM, RUSAK, DIHAPUS
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE asset_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  from_location_id UUID REFERENCES locations(id),
  to_location_id UUID REFERENCES locations(id),
  moved_by UUID REFERENCES users(id),
  moved_at TIMESTAMPTZ DEFAULT now(),
  reason TEXT
);

CREATE TABLE asset_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  audited_by UUID NOT NULL REFERENCES users(id),
  audited_at TIMESTAMPTZ DEFAULT now(),
  scanned_qr_token UUID NOT NULL,
  condition_status VARCHAR(30) NOT NULL,
  location_id UUID REFERENCES locations(id),
  notes TEXT,
  is_match BOOLEAN GENERATED ALWAYS AS (scanned_qr_token IS NOT NULL) STORED
);

-- 4) Peminjaman fasilitas
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(40) UNIQUE NOT NULL,
  name VARCHAR(120) NOT NULL,
  location_id UUID REFERENCES locations(id),
  capacity INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE facility_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  requester_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(160) NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
  approval_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CHECK (end_at > start_at)
);

CREATE INDEX idx_facility_bookings_time ON facility_bookings (facility_id, start_at, end_at);

-- 5) Maintenance / tiket kerusakan
CREATE TABLE maintenance_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_no VARCHAR(30) UNIQUE NOT NULL,
  asset_id UUID REFERENCES assets(id),
  location_id UUID REFERENCES locations(id),
  reported_by UUID NOT NULL REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  issue_title VARCHAR(160) NOT NULL,
  issue_description TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'SEDANG',
  status VARCHAR(30) NOT NULL DEFAULT 'DILAPORKAN',
  reported_at TIMESTAMPTZ DEFAULT now(),
  verified_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

CREATE TABLE maintenance_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES maintenance_tickets(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type VARCHAR(20) NOT NULL, -- IMAGE, VIDEO, DOC
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES maintenance_tickets(id) ON DELETE CASCADE,
  from_status VARCHAR(30),
  to_status VARCHAR(30) NOT NULL,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT now(),
  note TEXT
);

-- 6) Notifikasi dan laporan
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(160) NOT NULL,
  body TEXT,
  channel VARCHAR(20) NOT NULL DEFAULT 'IN_APP', -- IN_APP, EMAIL, WA
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_month INT NOT NULL,
  period_year INT NOT NULL,
  generated_by UUID REFERENCES users(id),
  generated_at TIMESTAMPTZ DEFAULT now(),
  report_url TEXT,
  UNIQUE (period_month, period_year)
);
```

### Catatan Optimasi Database
- Gunakan index tambahan pada `maintenance_tickets(status, priority, reported_at)`.
- Pertimbangkan **table partitioning** untuk `maintenance_logs` dan `notifications` jika volume besar.
- Tambahkan **materialized view** untuk KPI dashboard agar query cepat.

---

## 5) Rekomendasi Tech Stack (Cepat & Scalable)

## Opsi terbaik (balanced speed + maintainability)

### Backend
- **NestJS (Node.js + TypeScript)**
  - Modular, cocok untuk domain besar (aset, booking, maintenance, laporan).
  - Dukungan WebSocket untuk status real-time.
- **ORM**: Prisma
  - Migrasi schema jelas, aman, developer-friendly.
- **API**: REST + optional GraphQL untuk dashboard kompleks.

### Frontend Web
- **Next.js (React + TypeScript)**
  - Cepat untuk dashboard interaktif.
  - SSR/ISR untuk performa laporan dan halaman publik.
- **UI**: Tailwind CSS + shadcn/ui
  - Mudah membangun tema dark/light elegan.
- **Charting**: ECharts / Recharts / ApexCharts

### Mobile (opsional namun direkomendasikan)
- **Flutter** atau **React Native**
  - Scan QR, upload foto kerusakan, notifikasi realtime saat lapangan.

### Database & Infrastruktur
- **PostgreSQL** (utama).
- **Redis** untuk cache, queue, dan rate limiting.
- **Object Storage** (S3/MinIO) untuk foto/video maintenance.
- **Message Queue**: BullMQ (Redis) untuk proses async (generate PDF, notifikasi).
- **Realtime**: WebSocket (Socket.IO) atau Supabase Realtime.

### Deployment
- Containerized dengan **Docker**.
- Orkestrasi awal: Docker Compose; scale lanjut: Kubernetes.
- CI/CD: GitHub Actions/GitLab CI.
- Monitoring: Prometheus + Grafana + Sentry.

---

## 6) Arsitektur High-Level

1. User mengakses Web/Mobile.
2. API Gateway (NestJS) memvalidasi JWT + role.
3. Service domain:
   - Asset Service
   - Booking Service
   - Maintenance Service
   - Reporting Service
4. Data disimpan di PostgreSQL.
5. File foto/video ke Object Storage.
6. Event status dikirim via Redis Queue + WebSocket.
7. Dashboard menarik data KPI dari materialized view/cache.

---

## 7) KPI Utama untuk Pimpinan
- Persentase aset dalam kondisi baik.
- MTTR (Mean Time To Repair) per kategori.
- Utilisasi fasilitas (% jam terpakai).
- Jumlah tiket lewat SLA.
- Biaya maintenance bulanan vs anggaran.

---

## 8) Roadmap Implementasi (12 Minggu)

### Fase 1 (Minggu 1-3): Fondasi
- Setup auth, RBAC, master data aset/lokasi.
- UI dasar + dark/light mode.

### Fase 2 (Minggu 4-6): Booking Fasilitas
- Kalender booking, approval workflow, notifikasi.

### Fase 3 (Minggu 7-9): Maintenance + QR Audit
- Ticketing kerusakan, upload foto, realtime status.
- QR generation/scanning + audit log.

### Fase 4 (Minggu 10-12): Dashboard & Laporan
- KPI eksekutif, generate PDF laporan bulanan.
- Hardening keamanan, load test, go-live.

---

## 9) Keamanan & Tata Kelola
- JWT + refresh token + optional MFA untuk admin.
- Audit trail semua perubahan kritikal.
- Encrypt data sensitif at-rest/in-transit.
- Backup otomatis harian + disaster recovery plan.
- Role policy ketat untuk akses laporan pimpinan.

---

## 10) Nilai Tambah “Megah”
- Landing dashboard dengan salam pesantren dan ringkasan kinerja hari ini.
- Komponen UI premium: gradient halus, chart animasi subtil.
- Report template berkop resmi Daarul Aminn IBS.
- Leaderboard unit ter-rapi/terpatuh maintenance untuk mendorong budaya tertib sarpras.

---

## 11) Kenapa Belum Bisa Deploy (Status Saat Ini)

Dokumen ini bersifat **arsitektur & perencanaan**. Artinya, artefak deployable belum lengkap karena belum ada:
- Source code backend/frontend yang executable.
- Dockerfile per service.
- Pipeline CI/CD.
- File env production dan secret management.
- Skrip migrasi yang benar-benar dijalankan pada environment target.

Agar menjadi deployable, gunakan `DEPLOY_CHECKLIST.md` sebagai acuan Definition of Done.
