/*
 * Este arquivo de utilitários JavaScript contém funções para padronizar
 * o tratamento de erros em seu aplicativo. Ele ajuda a formatar mensagens de erro,
 * registrar erros no console e retornar um objeto de erro consistente para o frontend.
 *
 * Visualmente no seu site, ele não tem impacto direto. Sua função é de lógica de bastidores,
 * garantindo que as mensagens de erro exibidas para o usuário (por exemplo, através do sistema de toast)
 * sejam claras e consistentes, e que os erros sejam tratados adequadamente internamente.
 *
 * Ele é utilizado por serviços de dados (como `arquivoMortoService.js`) para encapsular
 * a lógica de tratamento de erros de chamadas ao Supabase.
 */

export const handleServiceError = (context, error, toast) => {
  console.error(`Erro no serviço (${context}):`, error);
  const errorMessage = error.message || 'Ocorreu um erro inesperado.';
  if (toast) {
    toast({
      title: `Erro em ${context}`,
      description: errorMessage,
      variant: 'destructive'
    });
  }
  return { data: null, error: new Error(errorMessage) };
};