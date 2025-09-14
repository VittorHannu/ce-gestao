
-- 1. Create classification tables

CREATE TABLE classificacao_agentes (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE classificacao_tarefas (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE classificacao_equipamentos (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE classificacao_causas (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE classificacao_danos (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE classificacao_acoes_corretivas (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE classificacao_riscos (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add permission column to profiles table
ALTER TABLE public.profiles
ADD COLUMN can_manage_classifications BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Set up RLS for all classification tables

-- Helper function to check permission
CREATE OR REPLACE FUNCTION public.can_manage_classifications()
RETURNS BOOLEAN AS $$
DECLARE
    can_manage BOOLEAN;
BEGIN
    SELECT p.can_manage_classifications
    INTO can_manage
    FROM public.profiles p
    WHERE p.id = auth.uid();
    RETURN can_manage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Macro to apply RLS policies to a table
DO $$
DECLARE
    table_name TEXT;
    tables TEXT[] := ARRAY[
        'classificacao_agentes',
        'classificacao_tarefas',
        'classificacao_equipamentos',
        'classificacao_causas',
        'classificacao_danos',
        'classificacao_acoes_corretivas',
        'classificacao_riscos'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', table_name);

        -- Allow read access to all authenticated users
        EXECUTE format('
            CREATE POLICY "Allow read access to authenticated users"
            ON public.%I
            FOR SELECT
            TO authenticated
            USING (true);
        ', table_name);

        -- Allow full access to users with the specific permission
        EXECUTE format('
            CREATE POLICY "Allow full access for classification managers"
            ON public.%I
            FOR ALL
            TO authenticated
            USING (public.can_manage_classifications())
            WITH CHECK (public.can_manage_classifications());
        ', table_name);
    END LOOP;
END;
$$;
