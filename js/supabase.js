/**
 * LaunchPage Studio — Supabase Client & API
 *
 * Cara pakai:
 * 1. Buat project di https://supabase.com
 * 2. Jalankan SQL dari sql/schema.sql di SQL Editor
 * 3. Copy URL & Anon Key dari Settings → API
 * 4. Isi di SUPABASE_URL dan SUPABASE_ANON_KEY di bawah
 * 5. (Optional) pindahin ke .env untuk production
 */

const SUPABASE_URL = 'https://ifozejithwettwcayzqb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlmb3plaml0aHdldHR3Y2F5enFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0ODI4NTksImV4cCI6MjA5ODA1ODg1OX0.iV6BBTNKIZ7knXYi0-5B_CYgsote-Mg1BpAvlbJjPHM';

// Inisialisasi Supabase client
let supabaseClient = null;

function initSupabase() {
  if (supabaseClient) return supabaseClient;

  // Cek apakah key sudah diganti
  if (SUPABASE_URL.includes('YOUR_PROJECT_ID')) {
    console.warn('⚠️ Supabase belum dikonfigurasi. Ganti SUPABASE_URL dan SUPABASE_ANON_KEY di js/supabase.js');
    return null;
  }

  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false // No auth needed for public forms
      }
    });
    console.log('✅ Supabase client ready');
    return supabaseClient;
  } catch (err) {
    console.error('❌ Supabase init error:', err);
    return null;
  }
}

// ============================================================
// API: ORDER
// ============================================================

async function submitOrder(data) {
  const client = initSupabase();
  if (!client) {
    return { status: 'error', message: 'Supabase belum dikonfigurasi. Hubungi admin.' };
  }

  try {
    const orderId = generateOrderId();
    const timestamp = new Date().toISOString();

    const orderData = {
      order_id: orderId,
      name: data.name || '',
      phone: data.phone || '',
      email: data.email || '',
      business_name: data.businessName || '',
      business_type: data.businessType || '',
      package_name: data.package || '',
      description: data.description || '',
      logo_url: data.logoUrl || '',
      brand_colors: data.colors || '',
      demo_reference: data.reference || '',
      status: 'pending',
      payment_status: 'unpaid',
      created_at: timestamp,
      updated_at: timestamp
    };

    const { data: result, error } = await client
      .from('orders')
      .insert([orderData])
      .select();

    if (error) throw error;

    console.log('✅ Order created:', orderId);
    return {
      status: 'success',
      message: 'Pesanan berhasil dibuat! Kami akan menghubungi Anda segera.',
      orderId: orderId,
      data: orderData
    };
  } catch (err) {
    console.error('❌ Order error:', err);
    return {
      status: 'error',
      message: 'Gagal membuat pesanan. Silakan coba lagi atau hubungi WhatsApp.'
    };
  }
}

// ============================================================
// API: CONTACT
// ============================================================

async function submitContact(data) {
  const client = initSupabase();
  if (!client) {
    return { status: 'error', message: 'Supabase belum dikonfigurasi.' };
  }

  try {
    const { error } = await client
      .from('contacts')
      .insert([{
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        message: data.message || '',
        source: data.source || 'website',
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;

    return {
      status: 'success',
      message: 'Pesan berhasil dikirim! Kami akan membalas segera.'
    };
  } catch (err) {
    console.error('❌ Contact error:', err);
    return {
      status: 'error',
      message: 'Gagal mengirim pesan. Silakan coba lagi.'
    };
  }
}

// ============================================================
// API: GET ORDER STATUS (untuk dashboard V2)
// ============================================================

async function getOrderStatus(orderId) {
  const client = initSupabase();
  if (!client) return { status: 'error', message: 'Supabase belum dikonfigurasi.' };

  try {
    const { data, error } = await client
      .from('orders')
      .select('order_id, name, business_name, package_name, status, payment_status, created_at')
      .eq('order_id', orderId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { status: 'error', message: 'Order tidak ditemukan.' };
      }
      throw error;
    }

    return { status: 'success', order: data };
  } catch (err) {
    console.error('❌ GetOrder error:', err);
    return { status: 'error', message: 'Gagal mengambil data order.' };
  }
}

async function getOrdersByEmail(email) {
  const client = initSupabase();
  if (!client) return { status: 'error', message: 'Supabase belum dikonfigurasi.' };

  try {
    const { data, error } = await client
      .from('orders')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { status: 'success', orders: data || [] };
  } catch (err) {
    console.error('❌ GetOrders error:', err);
    return { status: 'error', message: 'Gagal mengambil data orders.' };
  }
}

// ============================================================
// UTILITY
// ============================================================

function generateOrderId() {
  const date = new Date();
  const yymmdd = date.getFullYear().toString() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
  return 'LPS-' + yymmdd + '-' + rand;
}

// ============================================================
// EXPOSE ke global scope
// ============================================================
window.LP = {
  submitOrder,
  submitContact,
  getOrderStatus,
  getOrdersByEmail,
  generateOrderId
};
