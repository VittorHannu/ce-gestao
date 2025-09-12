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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL_LOCAL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { 'ngrok-skip-browser-warning': 'true' } } });