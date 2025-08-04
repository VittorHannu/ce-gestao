CREATE POLICY "Allow authenticated users to view all relatos" ON public.relatos
  FOR SELECT USING (auth.uid() IS NOT NULL);
