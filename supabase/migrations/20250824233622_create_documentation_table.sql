CREATE TABLE documentacao (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    section_key TEXT NOT NULL UNIQUE,
    title TEXT,
    content TEXT,
    meta JSONB, -- Campo para dados extras, como cores ou ícones
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE documentacao IS 'Tabela para armazenar o conteúdo da página de documentação interativa, permitindo que seja editado sem alterar o código.';
COMMENT ON COLUMN documentacao.section_key IS 'Chave única para identificar a seção, ex: "pyramid_level_1"';
COMMENT ON COLUMN documentacao.title IS 'Título principal do conteúdo, se aplicável.';
COMMENT ON COLUMN documentacao.content IS 'O corpo principal do conteúdo, pode ser texto simples ou Markdown.';
COMMENT ON COLUMN documentacao.meta IS 'Dados estruturados adicionais, como cores para gráficos ou nomes de ícones.';

-- Habilitar RLS
ALTER TABLE documentacao ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública
CREATE POLICY "Public read access for documentation" ON documentacao
FOR SELECT USING (true);
