CREATE TABLE public.relato_comentarios (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    relato_id uuid NOT NULL REFERENCES public.relatos(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    comment_text text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.relato_comentarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read comments for accessible relatos" ON public.relato_comentarios FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.relatos WHERE id = relato_comentarios.relato_id)
);

CREATE POLICY "Allow authenticated users to insert comments" ON public.relato_comentarios FOR INSERT TO authenticated WITH CHECK (
    (auth.uid() = user_id) AND EXISTS (SELECT 1 FROM public.relatos WHERE id = relato_comentarios.relato_id)
);

CREATE POLICY "Allow users to update their own comments" ON public.relato_comentarios FOR UPDATE TO authenticated USING (
    auth.uid() = user_id
);

CREATE POLICY "Allow users to delete their own comments" ON public.relato_comentarios FOR DELETE TO authenticated USING (
    auth.uid() = user_id
);
