CREATE TABLE public.relatos_audit_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  relato_id uuid NOT NULL REFERENCES public.relatos(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES auth.users(id),
  change_timestamp timestamp with time zone DEFAULT now(),
  change_type text NOT NULL, -- e.g., 'INSERT', 'UPDATE', 'DELETE'
  old_data jsonb, -- Snapshot of the row before the change
  new_data jsonb -- Snapshot of the row after the change
);

ALTER TABLE public.relatos_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.relatos_audit_log FOR SELECT USING (true);
