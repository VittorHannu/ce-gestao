-- Adiciona a coluna can_view_feedbacks à tabela profiles
ALTER TABLE public.profiles
ADD COLUMN can_view_feedbacks BOOLEAN DEFAULT FALSE;