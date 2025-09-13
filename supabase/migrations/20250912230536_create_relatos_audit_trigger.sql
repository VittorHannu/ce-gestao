-- Criação do Gatilho de Auditoria para a Tabela 'relatos'
-- Este gatilho conecta a tabela 'relatos' à nossa função de auditoria genérica 'log_audit()'.
-- Ele será acionado automaticamente pelo PostgreSQL após qualquer operação de
-- INSERT, DELETE ou UPDATE na tabela 'relatos', garantindo que todas as
-- modificações nesta tabela crítica sejam registradas.

CREATE TRIGGER relatos_audit_trigger
-- O gatilho é acionado DEPOIS (AFTER) que a operação acontece.
-- Isso garante que a operação original foi bem-sucedida antes de registrarmos o log.
AFTER INSERT OR DELETE OR UPDATE ON public.relatos
-- O gatilho é executado PARA CADA LINHA (FOR EACH ROW) que for afetada pela operação.
FOR EACH ROW EXECUTE FUNCTION public.log_audit();

-- Comentário para documentação do gatilho no banco de dados.
COMMENT ON TRIGGER relatos_audit_trigger ON public.relatos IS 'Gatilho que chama a função log_audit() para registrar todas as alterações na tabela de relatos.';