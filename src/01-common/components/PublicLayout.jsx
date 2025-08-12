



/*
 * Este componente React define o layout para páginas públicas do seu aplicativo,
 * ou seja, páginas que não exigem autenticação (como login, registro ou redefinição de senha).
 * Ele fornece uma estrutura básica e consistente para essas telas.
 *
 * Visualmente no seu site, você o vê como a "moldura" que envolve as páginas
 * antes do usuário fazer login. Ele pode definir um fundo, centralizar o conteúdo,
 * e incluir elementos como um cabeçalho simplificado, garantindo uma experiência
 * de usuário coesa mesmo para visitantes não autenticados.
 *
 *
 *
 *
 */



import React from 'react';
import { Outlet } from 'react-router-dom';



const PublicLayout = () => {

  return (
    <div className="min-h-screen flex flex-col">
      <main
        className="flex-1 px-2 py-3"
        style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
