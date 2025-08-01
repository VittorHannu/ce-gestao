



/*
 * Este arquivo de utilitários JavaScript contém funções auxiliares genéricas
 * que são usadas em várias partes do seu aplicativo.
 *
 * Visualmente no seu site, ele não tem impacto direto. Sua função é de lógica de bastidores,
 * fornecendo ferramentas para outros componentes e serviços funcionarem corretamente.
 * Por exemplo, a função `cn` é utilizada para combinar classes CSS de forma condicional,
 * o que afeta a aparência de muitos elementos da interface do usuário.
 *
 *
 *
 *
 */



import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function debounce(func, delay) {
  let timeout;
  const debounced = function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };

  debounced.cancel = () => {
    clearTimeout(timeout);
  };

  return debounced;
}
