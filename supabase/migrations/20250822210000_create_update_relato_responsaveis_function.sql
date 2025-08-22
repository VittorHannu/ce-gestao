CREATE OR REPLACE FUNCTION public.update_relato_responsaveis(
    p_relato_id uuid,
    p_user_ids uuid[]
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Etapa 1: Remove todos os responsáveis existentes para o relato informado.
    DELETE FROM public.relato_responsaveis
    WHERE relato_id = p_relato_id;

    -- Etapa 2: Insere a nova lista de responsáveis a partir do array fornecido.
    -- A função unnest expande o array em um conjunto de linhas.
    IF array_length(p_user_ids, 1) > 0 THEN
        INSERT INTO public.relato_responsaveis (relato_id, user_id)
        SELECT p_relato_id, unnested_user_id
        FROM unnest(p_user_ids) AS unnested_user_id;
    END IF;
END;
$$;