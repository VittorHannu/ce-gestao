-- Reverte a migração anterior removendo a coluna 'cargo' da tabela 'profiles'.
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS cargo;
