-- Adiciona colunas de permissão de usuário à tabela profiles
ALTER TABLE public.profiles
ADD COLUMN can_view_users BOOLEAN DEFAULT FALSE;

ALTER TABLE public.profiles
ADD COLUMN can_create_users BOOLEAN DEFAULT FALSE;

ALTER TABLE public.profiles
ADD COLUMN can_delete_users BOOLEAN DEFAULT FALSE;
