-- Sincroniza os emails existentes na tabela public.profiles com os emails da tabela auth.users
UPDATE public.profiles AS p
SET email = au.email
FROM auth.users AS au
WHERE p.id = au.id AND p.email IS DISTINCT FROM au.email;