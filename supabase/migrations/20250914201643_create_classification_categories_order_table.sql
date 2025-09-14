CREATE TABLE public.classification_categories (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    table_name text NOT NULL,
    ordem integer NOT NULL,
    CONSTRAINT classification_categories_pkey PRIMARY KEY (id),
    CONSTRAINT classification_categories_table_name_key UNIQUE (table_name)
);

-- RLS
ALTER TABLE public.classification_categories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view" ON public.classification_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage" ON public.classification_categories FOR ALL USING ((get_my_claim('user_role'::text) = '"admin"'::jsonb));


-- Seed data
INSERT INTO public.classification_categories (name, table_name, ordem) VALUES
('Agentes', 'classificacao_agentes', 1),
('Tarefas', 'classificacao_tarefas', 2),
('Equipamentos', 'classificacao_equipamentos', 3),
('Causas', 'classificacao_causas', 4),
('Danos', 'classificacao_danos', 5),
('Ações Corretivas', 'classificacao_acoes_corretivas', 6),
('Riscos', 'classificacao_riscos', 7);
