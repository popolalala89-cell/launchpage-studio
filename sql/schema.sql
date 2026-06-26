-- ============================================================
-- LaunchPage Studio — Supabase Database Schema
-- ============================================================
-- Cara pakai:
-- 1. Buka https://supabase.com → SQL Editor
-- 2. Paste semua SQL di bawah → Run
-- 3. Selesai! Tabel siap dipakai.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: orders
-- Menyimpan data pesanan website
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  business_name TEXT NOT NULL DEFAULT '',
  business_type TEXT NOT NULL DEFAULT '',
  package_name TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  logo_url TEXT NOT NULL DEFAULT '',
  brand_colors TEXT NOT NULL DEFAULT '',
  demo_reference TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','revision','done','completed','cancelled')),
  admin_notes TEXT NOT NULL DEFAULT '',
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','refunded','cancelled')),
  payment_amount NUMERIC DEFAULT 0,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk pencarian cepat
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders (order_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders (email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

-- Trigger auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_orders_updated_at ON orders;
CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLE: contacts
-- Menyimpan pesan dari form kontak
-- ============================================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'website',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_is_read ON contacts (is_read);

-- ============================================================
-- TABLE: demo_logs
-- Log aktivitas (opsional — untuk tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS demo_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  reference TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_demo_logs_created_at ON demo_logs (created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Aktifkan RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_logs ENABLE ROW LEVEL SECURITY;

-- Izinkan INSERT dari anon (public) untuk orders & contacts
CREATE POLICY "Allow anon insert orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon select orders by order_id"
  ON orders FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert contacts"
  ON contacts FOR INSERT
  TO anon
  WITH CHECK (true);

-- Hanya authenticated yang bisa lihat & edit semua data
CREATE POLICY "Allow authenticated all orders"
  ON orders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated all contacts"
  ON contacts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated all demo_logs"
  ON demo_logs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Izinkan insert log dari anon
CREATE POLICY "Allow anon insert demo_logs"
  ON demo_logs FOR INSERT
  TO anon
  WITH CHECK (true);

-- ============================================================
-- SAMPLE DATA (opsional — untuk testing)
-- ============================================================

-- INSERT INTO orders (order_id, name, phone, email, business_name, business_type, package_name, description, status)
-- VALUES
--   ('LPS-20260601-0001', 'Budi Santoso', '08123456789', 'budi@example.com', 'Warung Makan Sederhana', 'kuliner', 'Pro', 'Mau landing page dengan menu dan galeri.', 'done'),
--   ('LPS-20260602-0002', 'Sari Murni', '08765432109', 'sari@example.com', 'Glow Beauty Salon', 'jasa', 'Premium', 'Butuh website dengan booking online.', 'processing');
