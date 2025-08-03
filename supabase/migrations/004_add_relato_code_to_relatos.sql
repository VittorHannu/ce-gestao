-- Adiciona a coluna relato_code à tabela relatos
ALTER TABLE public.relatos
ADD COLUMN relato_code TEXT UNIQUE;

-- Cria uma sequência para gerar números sequenciais para o relato_code
CREATE SEQUENCE relato_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Cria uma função para gerar o relato_code no formato REL<ANO><SEQUENCIAL>
CREATE OR REPLACE FUNCTION generate_relato_code()
RETURNS TRIGGER AS $$
DECLARE
    next_val BIGINT;
    current_year TEXT;
BEGIN
    -- Obtém o próximo valor da sequência
    SELECT nextval('relato_seq') INTO next_val;
    -- Obtém o ano atual
    SELECT to_char(now(), 'YYYY') INTO current_year;
    
    -- Formata o relato_code
    NEW.relato_code := 'REL' || current_year || LPAD(next_val::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cria um gatilho para executar a função antes de cada inserção na tabela relatos
CREATE TRIGGER set_relato_code
BEFORE INSERT ON public.relatos
FOR EACH ROW
EXECUTE FUNCTION generate_relato_code();
