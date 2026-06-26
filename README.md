# LaunchPage Studio

Website profesional siap online dalam 24 jam.
Landing page modern untuk UMKM, personal branding, dan content creator.

**Live Demo:** [launchpage-studio.com](https://launchpage-studio.com)
**GitHub:** [github.com/popolalala89-cell/launchpage-studio](https://github.com/popolalala89-cell/launchpage-studio)

---

## Struktur Proyek

```
launchpage-studio/
├── index.html              # Halaman utama (SPA landing page)
├── css/
│   └── style.css           # Material Design 3 + glassmorphism
├── js/
│   ├── main.js             # Interaktivitas, animasi, dark mode
│   └── supabase.js         # Supabase client & API functions
├── sql/
│   └── schema.sql          # Database schema (PostgreSQL)
├── demo/
│   ├── restoran.html       # Demo restoran & cafe
│   ├── salon.html          # Demo salon & barbershop
│   ├── freelancer.html     # Demo freelancer portfolio
│   ├── dimsum.html         # Demo dimsum kuliner
│   └── bengkel.html        # Demo bengkel motor
├── gas/
│   └── Code.gs             # Google Apps Script backend (legacy)
├── _redirects              # Cloudflare Pages redirect rules
├── sitemap.xml             # SEO sitemap
├── robots.txt              # SEO robots
└── README.md               # File ini
```

---

## 🚀 Setup Supabase

### 1. Buat Project di Supabase

1. Buka [supabase.com](https://supabase.com) → **Start new project**
2. Isi:
   - **Name:** `launchpage-studio`
   - **Database Password:** simpan baik-baik
   - **Region:** pilih yang terdekat (Singapore atau Asia Southeast)
3. Tunggu provisioning (~2 menit)

### 2. Jalankan Database Schema

1. Di dashboard Supabase, buka **SQL Editor**
2. Buka file `sql/schema.sql` dari proyek ini — copy semua isinya
3. Paste ke SQL Editor → **Run**
4. Selesai! Tabel `orders`, `contacts`, `demo_logs` terbuat otomatis.

### 3. Dapatkan API Credentials

1. Buka **Project Settings** → **API**
2. Copy **Project URL** (contoh: `https://abcdefghijklm.supabase.co`)
3. Copy **anon public key** (contoh: `eyJhbGciOiJIUzI1NiIs...`)

### 4. Konfigurasi di Website

Buka `js/supabase.js` dan ganti baris ini:

```js
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

Menjadi:

```js
const SUPABASE_URL = 'https://abcdefghijklm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIs...';
```

### 5. Test!

- Buka website → klik **Pesan Sekarang** di pricing
- Modal akan muncul → isi form → submit
- Cek di Supabase **Table Editor** → tabel `orders` — data harus masuk

---

## Deployment Frontend

### Cloudflare Pages (rekomendasi)

1. Push ke GitHub (udah selesai ✅)
2. Buka [cloudflare.com](https://cloudflare.com) → Pages
3. **Connect Git** → pilih `popolalala89-cell/launchpage-studio`
4. **Build settings:**
   - Framework: `None`
   - Build command: (kosongkan)
   - Build output: (root)
5. **Deploy!**
6. Set custom domain di tab **Custom Domains**

### Atau via Wrangler CLI

```bash
npx wrangler pages publish . --project-name=launchpage-studio
```

---

## Fitur

### V1 ✅ (Selesai)
- [x] Landing page dengan M3 design system
- [x] Dark mode toggle (persist di localStorage)
- [x] Glassmorphism, animasi scroll, ripple effect
- [x] Counter animasi (100+ website, 98% puas, dll)
- [x] Filter portfolio berdasarkan kategori
- [x] Testimonial carousel (swipe + drag)
- [x] FAQ accordion
- [x] Pricing cards dengan featured "Populer"
- [x] Floating WhatsApp FAB
- [x] Scroll progress bar
- [x] Back to top button
- [x] 5 demo pages fungsional (restoran, salon, freelancer, dimsum, bengkel)
- [x] SEO: sitemap, robots.txt, Schema.org, Open Graph
- [x] **Supabase backend** — order form + database
- [x] Google Apps Script backend (legacy)

### V2 🔄 (Rencana)
- [ ] Form order multi-step dengan upload file
- [ ] Dashboard pelanggan (cek status via OrderID)
- [ ] Integrasi payment gateway (Midtrans/Xendit)
- [ ] Sistem booking/reservasi otomatis
- [ ] Email notifikasi via Supabase Edge Functions

### V3 🚀 (Masa Depan)
- [ ] AI Website Generator wizard
- [ ] Template otomatis dari data bisnis
- [ ] Deploy otomatis via Cloudflare API
- [ ] Preview langsung sebelum checkout

---

## Stack Teknologi

| Komponen | Teknologi |
|----------|-----------|
| Frontend | HTML, CSS, JavaScript ES2023 |
| Design System | Material Design 3 (CSS vars) |
| Backend Database | **Supabase** (PostgreSQL) |
| Backend Legacy | Google Apps Script |
| Hosting | Cloudflare Pages |
| Fonts | Google Fonts (Poppins + Inter) |
| Integrasi | WhatsApp API (wa.me links) |

---

## Lisensi

© 2026 LaunchPage Studio. All rights reserved.
