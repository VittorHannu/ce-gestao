CREATE TABLE public.config_options (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category text NOT NULL,
  value text NOT NULL,
  CONSTRAINT unique_category_value UNIQUE (category, value)
);

ALTER TABLE public.config_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.config_options FOR SELECT USING (true);

INSERT INTO public.config_options (category, value) VALUES
('tipo_incidente', 'Acidente'),
('tipo_incidente', 'Incidente'),
('tipo_incidente', 'Quase Acidente'),
('tipo_incidente', 'Observação'),
('gravidade', 'Baixa'),
('gravidade', 'Média'),
('gravidade', 'Alta'),
('gravidade', 'Crítica')
ON CONFLICT (category, value) DO NOTHING;
