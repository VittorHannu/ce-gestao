ALTER TABLE public.relatos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to insert up to 8 relatos per day" ON public.relatos
FOR INSERT WITH CHECK (
  (SELECT count(*) FROM public.relatos
   WHERE user_id = auth.uid()
     AND created_at >= (now() - interval '24 hours')) < 8
);
