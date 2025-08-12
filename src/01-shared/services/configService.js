/*
 * Este arquivo de serviço JavaScript é responsável por buscar
 * opções de configuração no banco de dados do Supabase.
 *
 * Visualmente no seu site, ele não tem impacto direto. Sua função é de lógica de bastidores,
 * fornecendo as listas de opções que aparecem em menus de seleção (dropdowns) nos formulários.
 * Por exemplo, quando você seleciona um "Tipo de Ocorrência" ou "Local da Ocorrência"
 * em um formulário de relato, as opções exibidas são carregadas por este serviço.
 *
 * Ele é utilizado por componentes que precisam preencher esses menus com dados dinâmicos
 * do banco de dados, como a página de criação/edição de relatos de segurança (`RelatoPage.jsx`).
 *
 *
 *
 *
 */

import { supabase } from '@/01-common/lib/supabase';

export const getConfigOptions = async (category) => {
  const { data, error } = await supabase
    .from('config_options')
    .select('value')
    .eq('category', category);

  if (error) {
    console.error(`Error fetching config options for category ${category}:`, error);
    return [];
  }

  return data.map(item => item.value);
};
