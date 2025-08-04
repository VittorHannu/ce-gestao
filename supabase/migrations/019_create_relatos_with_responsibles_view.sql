CREATE OR REPLACE VIEW public.relatos_with_responsibles_view AS
SELECT
  r.*,
  (SELECT json_agg(json_build_object('id', p.id, 'full_name', p.full_name, 'email', p.email))
   FROM public.relato_responsaveis rr
   JOIN public.profiles p ON rr.user_id = p.id
   WHERE rr.relato_id = r.id
  ) AS responsibles_details
FROM public.relatos r;

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.relatos_with_responsibles_view TO authenticated;
