CREATE TABLE public.relato_responsaveis (
  relato_id UUID NOT NULL REFERENCES public.relatos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (relato_id, user_id)
);

ALTER TABLE public.relato_responsaveis ENABLE ROW LEVEL SECURITY;

-- Policy for admin to manage responsibles
CREATE POLICY "Admins can manage relato responsibles" ON public.relato_responsaveis
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND can_manage_relatos = TRUE));

-- Policy for users to read their own assigned responsibilities (optional, but good for UI)
CREATE POLICY "Users can read their own assigned responsibilities" ON public.relato_responsaveis
  FOR SELECT USING (user_id = auth.uid());
