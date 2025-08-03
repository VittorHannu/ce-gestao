-- 1. Adiciona a coluna de permissão na tabela de perfis existente.
ALTER TABLE public.profiles
ADD COLUMN can_manage_relatos BOOLEAN DEFAULT FALSE;

-- 2. Cria a nova tabela para armazenar os relatos de segurança.
CREATE TABLE public.relatos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- ID do usuário que criou o relato. Nulo se for anônimo.
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Dados do formulário
    is_anonymous BOOLEAN DEFAULT FALSE,
    local_ocorrencia TEXT NOT NULL,
    data_ocorrencia DATE NOT NULL,
    hora_aproximada_ocorrencia TIME,
    descricao TEXT NOT NULL,
    riscos_identificados TEXT NOT NULL,
    danos_ocorridos TEXT,

    -- Coluna para o fluxo de aprovação
    status TEXT NOT NULL DEFAULT 'PENDENTE' -- Valores possíveis: PENDENTE, APROVADO, REPROVADO
);

-- 3. Habilita o Row Level Security (RLS) na tabela de relatos.
-- Isso garante que, por padrão, ninguém pode ver os relatos, a menos que criemos políticas específicas.
ALTER TABLE public.relatos ENABLE ROW LEVEL SECURITY;

-- 4. Cria políticas de acesso (RLS Policies).

-- Política 1: Permite que usuários autenticados criem novos relatos.
CREATE POLICY "Allow authenticated users to create relatos"
ON public.relatos
FOR INSERT
TO authenticated
WITH CHECK (TRUE);

-- Política 2: Permite que o usuário veja os próprios relatos (a menos que sejam anônimos).
CREATE POLICY "Allow users to view their own relatos"
ON public.relatos
FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND is_anonymous = FALSE);

-- Política 3: Permite que administradores de relatos vejam TODOS os relatos (incluindo anônimos).
CREATE POLICY "Allow relato managers to view all relatos"
ON public.relatos
FOR SELECT
TO authenticated
USING ((SELECT can_manage_relatos FROM public.profiles WHERE id = auth.uid()) = TRUE);

-- Política 4: Permite que administradores de relatos atualizem o status de qualquer relato.
CREATE POLICY "Allow relato managers to update any relato"
ON public.relatos
FOR UPDATE
TO authenticated
USING ((SELECT can_manage_relatos FROM public.profiles WHERE id = auth.uid()) = TRUE);
