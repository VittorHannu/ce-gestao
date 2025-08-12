



/*
 * Este hook React personalizado (`usePageTitle`) é responsável por gerenciar
 * o título da página exibido no cabeçalho do aplicativo e controlar a visibilidade
 * do botão de "voltar" e do cabeçalho em certas páginas.
 *
 * Visualmente no seu site, este hook influencia diretamente:
 * - O texto que aparece no cabeçalho superior de cada página, adaptando-se à rota atual.
 * - A presença ou ausência do botão de seta para voltar no cabeçalho.
 * - A visibilidade do cabeçalho em páginas específicas (como as principais de navegação).
 *
 * Ele mapeia caminhos de URL para títulos de página amigáveis e define
 * quando o botão de voltar e o cabeçalho devem ser exibidos.
 *
 *
 *
 *
 */



import { useLocation, useParams } from 'react-router-dom';

const usePageTitle = () => {
  const location = useLocation();
  const params = useParams();

  const getTitle = () => {
    const { pathname } = location;

    if (pathname === '/') return 'Home';
    if (pathname === '/relatos') return 'Relatos de Segurança';
    if (pathname === '/relatos/todos') return 'Todos os Relatos';
    if (pathname.startsWith('/relatos/status/')) {
      const status = params.status;
      if (status) {
        return `Relatos por Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
      }
      return 'Relatos por Status'; // Fallback if status is undefined
    }
    if (pathname.startsWith('/relatos/') && pathname !== '/relatos/novo') return 'Detalhes do Relato';
    if (pathname === '/relatos/novo') return 'Novo Relato';
    if (pathname === '/arquivos') return 'Arquivo Morto';
    if (pathname === '/perfil') return 'Meu Perfil';
    if (pathname === '/portaria') return 'Portaria';
    if (pathname === '/portaria/veiculos') return 'Veículos da Portaria';
    if (pathname === '/portaria/motoristas') return 'Motoristas da Portaria';
    if (pathname === '/portaria/bloqueados') return 'Veículos Bloqueados';
    if (pathname === '/portaria/logs') return 'Logs da Portaria';
    if (pathname === '/users-management') return 'Gerenciamento de Usuários';
    if (pathname === '/auth') return 'Autenticação';
    if (pathname === '/update-password') return 'Atualizar Senha';
    if (pathname === '/force-password-change') return 'Trocar Senha';

    return 'Relatos Supabase';
  };

  const title = getTitle();
  const showBackButton = location.pathname !== '/' && location.pathname !== '/auth';

  return { title, showBackButton };
};

export default usePageTitle;
