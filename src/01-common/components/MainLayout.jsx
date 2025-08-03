/*
 * Este componente React define o layout principal do seu aplicativo.
 * Ele atua como a "moldura" para a maioria das páginas que exigem autenticação,
 * organizando a estrutura visual da interface.
 *
 * Visualmente, você o vê como a estrutura que contém:
 * - O cabeçalho superior (HeaderComponent), que exibe o título da página.
 * - A área de conteúdo principal, onde o conteúdo específico de cada página é renderizado.
 
 *
 * Ele gerencia como esses elementos se posicionam na tela e como o espaço é utilizado,
 * garantindo uma experiência de usuário consistente em todo o aplicativo.
 *
 *
 *
 *
 */



import React, { useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import BottomNavBar from './bottom-nav-bar/BottomNavBar';


const MainLayout = ({ children, _user }) => {
  const scrollContainerRef = useRef(null);
  const mainRef = useRef(null);
  const location = useLocation();

  // Define as rotas onde a BottomNavBar deve ser visível
  const mainNavPaths = useMemo(() => [
    '/',
    '/relatos',
    '/perfil',
    '/users-management'
  ], []);

  const showBottomNav = mainNavPaths.includes(location.pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div ref={scrollContainerRef} className="h-screen flex flex-col">
      <div className="flex flex-1">
        <main
          ref={mainRef}
          className="flex-grow px-2 overflow-y-visible max-w-screen-md mx-auto"
          style={{
            paddingTop: 'max(12px, env(safe-area-inset-top))',
            paddingBottom: showBottomNav ? 'calc(60px + env(safe-area-inset-bottom) + 15px)' : '15px'
          }}
        >
          {children}
        </main>
      </div>
      {showBottomNav && <BottomNavBar />} {/* Renderiza condicionalmente */}
    </div>
  );
};

export default MainLayout;
