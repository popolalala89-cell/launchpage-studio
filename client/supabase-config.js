/* =========================================================
   📋 My Digital ID Page — Supabase Config
   ========================================================= */

const SUPABASE = {
  url: "https://ifozejithwettwcayzqb.supabase.co",
  key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlmb3plaml0aHdldHR3Y2F5enFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0ODI4NTksImV4cCI6MjA5ODA1ODg1OX0.iV6BBTNKIZ7knXYi0-5B_CYgsote-Mg1BpAvlbJjPHM",
};

const supabase = window.supabase.createClient(SUPABASE.url, SUPABASE.key);
