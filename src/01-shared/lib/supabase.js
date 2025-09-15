/*
 * Este arquivo é responsável por inicializar e configurar o cliente Supabase.
 * Ele estabelece a conexão entre o seu aplicativo frontend e o backend do Supabase,
 * permitindo a interação com o banco de dados, autenticação, armazenamento, etc.
 *
 * Visualmente no seu site, este arquivo não tem impacto direto.
 * Sua função é de infraestrutura de bastidores. Sem ele, o aplicativo não conseguiria
 * se comunicar com o banco de dados ou gerenciar usuários, resultando em um site
 * não funcional ou com dados ausentes.
 *
 *
 *
 *
 */



import { createClient } from '@supabase/supabase-js';

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
let supabaseUrl;

// A lógica agora prioriza uma URL de túnel explícita, se ela for fornecida.
// Isso resolve o problema de Mixed Content (HTTPS -> HTTP).
if (import.meta.env.VITE_SUPABASE_TUNNEL_URL) {
  // 1. Prioridade máxima: Usar a URL do túnel se ela estiver definida no .env
  supabaseUrl = import.meta.env.VITE_SUPABASE_TUNNEL_URL;
} else if (import.meta.env.DEV) {
  // 2. Fallback para desenvolvimento: Usar o hostname dinâmico (funciona para localhost e IP de rede)
  supabaseUrl = `http://${window.location.hostname}:8000`;
} else {
  // 3. Em produção: Usar a URL de produção oficial
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { headers: { 'ngrok-skip-browser-warning': 'true' } },
});
