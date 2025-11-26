// Configuración de Supabase
// IMPORTANTE: Reemplaza estos valores con tus credenciales de Supabase
// Instrucciones en README.md

const SUPABASE_URL = 'https://cygvkuyaqtfvhnooyvtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5Z3ZrdXlhcXRmdmhub295dnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwOTQ4NzAsImV4cCI6MjA3OTY3MDg3MH0.90h67osVyZ6TJt6INgP7bhhcwvykldn9-8Xe32pJbxU';

// Configuración OK
// Configuración OK

// Exportar configuración
window.SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
};
