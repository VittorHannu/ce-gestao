-- Adiciona as colunas para gerenciamento de tratativa na tabela relatos.
ALTER TABLE public.relatos
ADD COLUMN planejamento_cronologia_solucao TEXT,
ADD COLUMN data_conclusao_solucao DATE;

-- Opcional: Adicionar comentários para documentação
COMMENT ON COLUMN public.relatos.planejamento_cronologia_solucao IS 'Detalhes do planejamento e cronologia da solução do relato.';
COMMENT ON COLUMN public.relatos.data_conclusao_solucao IS 'Data de conclusão da solução do relato.';
