-- 1. Create the polymorphic join table to link relatos to items from any classification table
CREATE TABLE public.relato_classificacoes (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    relato_id UUID NOT NULL,
    classification_table TEXT NOT NULL,
    classification_id BIGINT NOT NULL,

    -- Foreign key to the relatos table
    CONSTRAINT fk_relato
        FOREIGN KEY(relato_id) 
        REFERENCES public.relatos(id)
        ON DELETE CASCADE,

    -- Ensure that a relato cannot have the same classification item added twice
    CONSTRAINT unique_relato_classification UNIQUE (relato_id, classification_table, classification_id)
);

-- 2. Enable Row Level Security
ALTER TABLE public.relato_classificacoes ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Users can see the classifications for any relato they are allowed to see.
-- The check relies on the RLS already present on the `relatos` table itself.
CREATE POLICY "Allow read access if user can see the relato"
ON public.relato_classificacoes
FOR SELECT
TO authenticated
USING (
    (EXISTS (SELECT 1 FROM public.relatos WHERE id = relato_id))
);

-- Users can modify the classifications if they are the author of the relato or an admin.
CREATE POLICY "Allow modification if user is the relato author or admin"
ON public.relato_classificacoes
FOR ALL
TO authenticated
USING (
    (EXISTS (SELECT 1 FROM public.relatos WHERE id = relato_id AND user_id = auth.uid())) OR
    (get_my_claim('user_role'::text) = '"admin"'::jsonb)
)
WITH CHECK (
    (EXISTS (SELECT 1 FROM public.relatos WHERE id = relato_id AND user_id = auth.uid())) OR
    (get_my_claim('user_role'::text) = '"admin"'::jsonb)
);
