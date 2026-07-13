-- =========================================================
-- 📋 My Digital ID Page — Client & Invoice System
-- =========================================================
-- Jalankan SQL ini di Supabase SQL Editor setelah login sebagai admin.

-- Buat tabel clients
CREATE TABLE IF NOT EXISTS clients (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Buat tabel invoices
CREATE TABLE IF NOT EXISTS invoices (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Buat fungsi generate nomor invoice
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

-- =========================================================
-- 🔐 Row Level Security
-- =========================================================

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama (kalo ada)
DROP POLICY IF EXISTS "public_all_clients" ON clients;
DROP POLICY IF EXISTS "public_all_invoices" ON invoices;
DROP POLICY IF EXISTS "auth_all_clients" ON clients;
DROP POLICY IF EXISTS "auth_all_invoices" ON invoices;

-- CLIENTS: hanya authenticated users bisa akses
CREATE POLICY "users_can_manage_clients" ON clients
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- INVOICES: authenticated bisa manage, anon bisa SELECT (buat print)
CREATE POLICY "users_can_manage_invoices" ON invoices
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "public_can_view_invoices" ON invoices
  FOR SELECT
  USING (true);

-- Add user_id column to existing tables (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='user_id') THEN
    ALTER TABLE clients ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='user_id') THEN
    ALTER TABLE invoices ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;
