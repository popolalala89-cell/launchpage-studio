# LaunchPage Studio

Website profesional siap online dalam 24 jam.
Landing page modern untuk UMKM, personal branding, dan content creator.

## Struktur Proyek

```
launchpage-studio/
├── index.html              # Halaman utama (SPA landing page)
├── css/
│   └── style.css           # Material Design 3 + glassmorphism
├── js/
│   └── main.js             # Interaktivitas, animasi, dark mode
├── demo/
│   ├── restoran.html       # Demo restoran & cafe
│   ├── salon.html          # Demo salon & barbershop
│   ├── freelancer.html     # Demo freelancer portfolio
│   ├── dimsum.html         # Demo dimsum kuliner
│   └── bengkel.html        # Demo bengkel motor
├── gas/
│   └── Code.gs             # Google Apps Script backend API
├── _redirects              # Cloudflare Pages redirect rules
├── sitemap.xml             # SEO sitemap
├── robots.txt              # SEO robots
└── README.md               # File ini
```

## Deployment

### Frontend (Cloudflare Pages)

1. Push folder `launchpage-studio/` ke GitHub/GitLab
2. Di Cloudflare Dashboard → Pages → Connect Git
3. Pilih repo → Framework: None → Build command: (kosongkan)
4. Build output: (root) → Deploy
5. Set custom domain di tab Custom Domains

Atau deploy manual via Wrangler CLI:
```bash
npx wrangler pages publish ./launchpage-studio --project-name=launchpage-studio
```

### Backend (Google Apps Script)

1. Buka https://script.google.com
2. Buat project baru → copy paste `gas/Code.gs`
3. Update `CONFIG.SPREADSHEET_ID` dengan ID Google Sheet kamu
4. Deploy → New deployment → Web app
5. Set "Execute as: Me", "Who has access: Anyone"
6. Copy URL deployment → pakai sebagai endpoint API

### Google Sheet Setup

Buat Google Sheet baru, ID-nya diambil dari URL:
`https://docs.google.com/spreadsheets/d/[ID_INI]/edit`

Sheet akan otomatis terbuat:
- Orders — menyimpan data pesanan
- Contacts — menyimpan pesan kontak
- Log — log aktivitas

## V2 Roadmap

- [ ] Form order multi-step
- [ ] Upload file ke Google Drive via GAS
- [ ] Dashboard pelanggan (cek status pesanan)
- [ ] Integrasi Midtrans/Xendit
- [ ] Sistem booking otomatis

## V3 Roadmap

- [ ] AI Website Generator wizard
- [ ] Template otomatis dari data bisnis
- [ ] Deploy otomatis via Cloudflare API
- [ ] Preview langsung sebelum checkout

## Lisensi

© 2026 LaunchPage Studio. All rights reserved.
