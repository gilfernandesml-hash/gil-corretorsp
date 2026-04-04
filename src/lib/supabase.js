import { createClient } from '@supabase/supabase-js';

// 🔥 Pegando variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (import.meta.env.DEV) {
  console.log("=== SUPABASE DEBUG ===");
  console.log("URL:", supabaseUrl);
  console.log("KEY:", supabaseAnonKey ? "OK (existe)" : "MISSING");
}

// 🚨 Validação
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ ERRO CRÍTICO: Variáveis do Supabase não encontradas.\n' +
    'Verifique no Vercel:\n' +
    '- VITE_SUPABASE_URL\n' +
    '- VITE_SUPABASE_ANON_KEY'
  );
}

// 🚨 Proteção contra uso de chave errada
if (
  supabaseAnonKey &&
  (supabaseAnonKey.startsWith('sb_secret') ||
    supabaseAnonKey.includes('secret'))
) {
  console.error(
    '❌ ERRO: Você está usando uma SECRET KEY no frontend!\n' +
    'Use apenas a ANON KEY.'
  );
}

// 🚀 Criação do client
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
    : null;

// 🧪 Teste de conexão (opcional)
export const testConnection = async () => {
  if (!supabase) {
    console.error("❌ Supabase não inicializado");
    return false;
  }

  try {
    const { count, error } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    console.log('✅ Conexão com Supabase OK!');
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    return false;
  }
};