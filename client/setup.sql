-- =========================================================
-- 📋 My Digital ID Page — Client & Invoice System
-- =========================================================
-- Jalankan SQL ini di Supabase SQL Editor (satu kali)
-- =========================================================

-- 1. TABEL CLIENT
CREATE TABLE IF NOT EXISTS clients (
  id BIGSERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  usaha TEXT DEFAULT '',
  no_wa TEXT DEFAULT '',
  email TEXT DEFAULT '',
  alamat TEXT DEFAULT '',
  paket TEXT DEFAULT 'basic' CHECK (paket IN ('basic','pro','premium','kustom')),
  harga INTEGER DEFAULT 0,
  status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif','selesai','dibatalkan')),
  tgl_mulai DATE DEFAULT CURRENT_DATE,
  tgl_selesai DATE,
  catatan TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL INVOICE
CREATE TABLE IF NOT EXISTS invoices (
  id BIGSERIAL PRIMARY KEY,
  nomor_invoice TEXT UNIQUE NOT NULL,
  client_id INTEGER REFERENCES clients(id),
  client_nama TEXT NOT NULL,
  client_usaha TEXT DEFAULT '',
  client_alamat TEXT DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]',
  subtotal INTEGER NOT NULL DEFAULT 0,
  diskon INTEGER DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','dikirim','lunas','batal')),
  tgl_invoice DATE DEFAULT CURRENT_DATE,
  tgl_jatuh_tempo DATE DEFAULT CURRENT_DATE + INTERVAL '7 days',
  tgl_lunas DATE,
  client_wa TEXT DEFAULT '',
  catatan TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_clients_nama ON clients(nama);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);

-- Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_all_clients" ON clients FOR ALL USING (true);
CREATE POLICY "public_all_invoices" ON invoices FOR ALL USING (true);

-- Function: generate nomor invoice (MID/YYMM/XXXX)
CREATE OR REPLACE FUNCTION generate_nomor_invoice()
RETURNS TEXT AS $$
DECLARE
  year_month TEXT;
  seq_num INT;
BEGIN
  year_month := to_char(CURRENT_DATE, 'YYMM');
  SELECT COALESCE(MAX(CAST(SPLIT_PART(nomor_invoice, '/', 3) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM invoices
  WHERE nomor_invoice LIKE 'MID/' || year_month || '/%';

  RETURN 'MID/' || year_month || '/' || LPAD(seq_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
