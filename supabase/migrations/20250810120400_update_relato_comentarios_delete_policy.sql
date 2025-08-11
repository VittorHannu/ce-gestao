DROP POLICY IF EXISTS "Allow users to delete their own comments" ON public.relato_comentarios;

CREATE POLICY "Allow users to delete their own comments or if they can delete any comment" ON public.relato_comentarios FOR DELETE TO authenticated USING (
    (auth.uid() = user_id) OR (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND can_delete_any_comment = TRUE)
    )
);
