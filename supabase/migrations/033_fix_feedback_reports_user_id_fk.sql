-- Altera a chave estrangeira de feedback_reports.user_id para referenciar public.profiles.id

-- Remove a chave estrangeira existente
ALTER TABLE public.feedback_reports
DROP CONSTRAINT IF EXISTS feedback_reports_user_id_fkey;

-- Adiciona a nova chave estrangeira referenciando public.profiles.id
ALTER TABLE public.feedback_reports
ADD CONSTRAINT feedback_reports_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
