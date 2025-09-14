-- Add 'ordem' column to all classification tables
ALTER TABLE public.classificacao_agentes ADD COLUMN ordem INTEGER;
ALTER TABLE public.classificacao_tarefas ADD COLUMN ordem INTEGER;
ALTER TABLE public.classificacao_equipamentos ADD COLUMN ordem INTEGER;
ALTER TABLE public.classificacao_causas ADD COLUMN ordem INTEGER;
ALTER TABLE public.classificacao_danos ADD COLUMN ordem INTEGER;
ALTER TABLE public.classificacao_acoes_corretivas ADD COLUMN ordem INTEGER;
ALTER TABLE public.classificacao_riscos ADD COLUMN ordem INTEGER;

-- Populate the 'ordem' column based on the alphabetical order of 'nome'
WITH ordered_agentes AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY nome) as rn FROM public.classificacao_agentes
)
UPDATE public.classificacao_agentes SET ordem = ordered_agentes.rn FROM ordered_agentes WHERE public.classificacao_agentes.id = ordered_agentes.id;

WITH ordered_tarefas AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY nome) as rn FROM public.classificacao_tarefas
)
UPDATE public.classificacao_tarefas SET ordem = ordered_tarefas.rn FROM ordered_tarefas WHERE public.classificacao_tarefas.id = ordered_tarefas.id;

WITH ordered_equipamentos AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY nome) as rn FROM public.classificacao_equipamentos
)
UPDATE public.classificacao_equipamentos SET ordem = ordered_equipamentos.rn FROM ordered_equipamentos WHERE public.classificacao_equipamentos.id = ordered_equipamentos.id;

WITH ordered_causas AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY nome) as rn FROM public.classificacao_causas
)
UPDATE public.classificacao_causas SET ordem = ordered_causas.rn FROM ordered_causas WHERE public.classificacao_causas.id = ordered_causas.id;

WITH ordered_danos AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY nome) as rn FROM public.classificacao_danos
)
UPDATE public.classificacao_danos SET ordem = ordered_danos.rn FROM ordered_danos WHERE public.classificacao_danos.id = ordered_danos.id;

WITH ordered_acoes_corretivas AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY nome) as rn FROM public.classificacao_acoes_corretivas
)
UPDATE public.classificacao_acoes_corretivas SET ordem = ordered_acoes_corretivas.rn FROM ordered_acoes_corretivas WHERE public.classificacao_acoes_corretivas.id = ordered_acoes_corretivas.id;

WITH ordered_riscos AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY nome) as rn FROM public.classificacao_riscos
)
UPDATE public.classificacao_riscos SET ordem = ordered_riscos.rn FROM ordered_riscos WHERE public.classificacao_riscos.id = ordered_riscos.id;

-- Add NOT NULL constraint now that the column is populated
ALTER TABLE public.classificacao_agentes ALTER COLUMN ordem SET NOT NULL;
ALTER TABLE public.classificacao_tarefas ALTER COLUMN ordem SET NOT NULL;
ALTER TABLE public.classificacao_equipamentos ALTER COLUMN ordem SET NOT NULL;
ALTER TABLE public.classificacao_causas ALTER COLUMN ordem SET NOT NULL;
ALTER TABLE public.classificacao_danos ALTER COLUMN ordem SET NOT NULL;
ALTER TABLE public.classificacao_acoes_corretivas ALTER COLUMN ordem SET NOT NULL;
ALTER TABLE public.classificacao_riscos ALTER COLUMN ordem SET NOT NULL;
