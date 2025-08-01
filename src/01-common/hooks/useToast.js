



/*
 * Este hook React personalizado (`useToast`) fornece uma interface para exibir
 * e gerenciar as notificações "toast" em seu aplicativo.
 * Ele permite que diferentes partes do seu código disparem mensagens de feedback
 * de forma consistente, como avisos de sucesso, erro ou informação.
 *
 * Visualmente no seu site, este hook não é visível diretamente. No entanto,
 * ele é o motor por trás das pequenas caixas de mensagem pop-up que aparecem
 * temporariamente na tela (geralmente no canto superior ou inferior) para
 * informar o usuário sobre o resultado de uma ação.
 *
 *
 *
 *
 */



import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, hideToast };
};
