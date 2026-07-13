/* =========================================================
   📋 My Digital ID Page — Supabase Config
   =========================================================
   GANTI URL & KEY dengan credential Supabase Pa
   ========================================================= */

const SUPABASE = {
  url: "https://xxx.supabase.co",    // GANTI: URL project
  key: "eyJxxx...",                   // GANTI: anon key
};

// Init Supabase
const supabase = window.supabase.createClient(SUPABASE.url, SUPABASE.key);
