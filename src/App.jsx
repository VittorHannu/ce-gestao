/*
 * Este é o componente principal (`App.jsx`) do aplicativo React.
 * Ele configura o roteamento usando `react-router-dom`, gerencia o estado
 * de autenticação do usuário com o Supabase, e define os layouts para
 * rotas públicas e protegidas. Também integra o sistema de notificações (Toast).
 *
 * Visualmente no seu site, este componente é a espinha dorsal que orquestra
 * a navegação entre todas as páginas, garante que o usuário esteja autenticado
 * para acessar áreas restritas e exibe mensagens de feedback (toasts) em todo o aplicativo.
 * Ele decide qual página mostrar com base na URL e no status de login do usuário.
 *
 *
 *
 *
 */

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { supabase } from '@/01-common/lib/supabase';
import Toast from '@/core/components/ui/Toast';
import { useToast } from '@/01-common/hooks/useToast';


import ProtectedRoute from '@/01-common/components/protected-route/ProtectedRoute';
import LoadingSpinner from '@/01-common/components/LoadingSpinner';

const LoginPage = React.lazy(() => import('@/03-auth/pages/LoginPage'));
const HomePage = React.lazy(() => import('@/06-home/pages/HomePage'));
const ProfilePage = React.lazy(() => import('@/04-profile/pages/ProfilePage'));
const UpdatePasswordPage = React.lazy(() => import('@/03-auth/pages/UpdatePasswordPage'));
const ForcePasswordChangePage = React.lazy(() => import('@/03-auth/pages/ForcePasswordChangePage'));
const UpdatePasswordProfilePage = React.lazy(() => import('@/04-profile/pages/UpdatePasswordProfilePage'));
const UpdateEmailPage = React.lazy(() => import('@/04-profile/pages/UpdateEmailPage'));
const ConfirmEmailChangePage = React.lazy(() => import('@/03-auth/pages/ConfirmEmailChangePage'));
const RelatosPage = React.lazy(() => import('@/07-relatos/pages/RelatosPage'));
const CreateRelatoPage = React.lazy(() => import('@/07-relatos/pages/CreateRelatoPage'));
const RelatosAprovacaoPage = React.lazy(() => import('@/07-relatos/pages/RelatosAprovacaoPage'));
const RelatosListaPage = React.lazy(() => import('@/07-relatos/pages/RelatosListaPage'));
const RelatoDetailsPage = React.lazy(() => import('@/07-relatos/pages/RelatoDetailsPage'));
const RelatosStatsPage = React.lazy(() => import('@/07-relatos/pages/RelatosStatsPage'));
const RelatosAtribuidosPage = React.lazy(() => import('@/07-relatos/pages/RelatosAtribuidosPage'));
const UsersPage = React.lazy(() => import('@/05-adm/pages/UsersPage'));
const CreateUserPage = React.lazy(() => import('@/05-adm/pages/CreateUserPage'));
const UserDetailsPage = React.lazy(() => import('@/05-adm/pages/UserDetailsPage'));

import MainLayout from '@/01-common/components/MainLayout';


import PublicLayout from '@/01-common/components/PublicLayout';


import '@/00-global/styles/App.css';



function LayoutWithoutHeader({ user, onLogout, showToast }) {
  return (
    <MainLayout _user={user}>
      <Outlet context={{ user, onLogout, showToast }} />
    </MainLayout>
  );
}

function AppWrapper({ showToast }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReadyForRender, setIsReadyForRender] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, is_active, needs_password_reset, can_manage_relatos, can_view_users, can_create_users, can_delete_users')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUser(data);
      console.log('DEBUG: Perfil do usuário buscado:', data);
      console.log('DEBUG: can_view_users no App.jsx:', data?.can_view_users);
      console.log('DEBUG: needs_password_reset do usuário:', data?.needs_password_reset);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      showToast('Erro ao carregar dados do perfil.', 'error');
    }
  }, [showToast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    localStorage.removeItem('lastPath'); // Limpa o path salvo ao deslogar
    showToast('Você foi desconectado.', 'info');
  };

  useEffect(() => {
    const handleInitialLoad = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);

      // Lógica de redirecionamento do localStorage
      const lastPath = localStorage.getItem('lastPath');
      if (lastPath && lastPath !== location.pathname && lastPath !== '/auth' && lastPath !== '/update-password' && lastPath !== '/force-password-change') {
        navigate(lastPath);
      }
      setIsReadyForRender(true); // Marca que a aplicação está pronta para renderizar as rotas
    };

    handleInitialLoad();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('AppWrapper: onAuthStateChange event, session:', session); // Adicionado para depuração
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id); // Garante que o perfil seja buscado/atualizado
      } else {
        setUser(null);
        localStorage.removeItem('lastPath'); // Limpa o path salvo ao deslogar
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile, location.pathname, navigate]);

  // Salva a última rota visitada no localStorage
  useEffect(() => {
    if (location.pathname !== '/auth' && location.pathname !== '/update-password' && location.pathname !== '/force-password-change') {
      localStorage.setItem('lastPath', location.pathname);
    }
  }, [location.pathname]);

  if (loading || !isReadyForRender || (session && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500 mx-auto"></div>
      </div>
    );
  }

  // Se o usuário precisa trocar a senha, redireciona para a página de troca forçada
  if (session && user && user.needs_password_reset) {
    return (
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="*" element={<Suspense fallback={<LoadingSpinner />}><ForcePasswordChangePage showToast={showToast} /></Suspense>} />
        </Route>
      </Routes>
    );
  }

  // Se não há sessão, renderiza as rotas públicas (Auth, UpdatePasswordPage)
  if (!session) {
    return (
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/update-password" element={<Suspense fallback={<LoadingSpinner />}><UpdatePasswordPage showToast={showToast} /></Suspense>} />
          <Route path="/auth" element={<Suspense fallback={<LoadingSpinner />}><LoginPage showToast={showToast} /></Suspense>} />
          <Route path="/auth/confirm" element={<Suspense fallback={<LoadingSpinner />}><ConfirmEmailChangePage showToast={showToast} /></Suspense>} />
          {/* Qualquer outra rota sem sessão vai para /auth */}
          <Route path="*" element={<Navigate to="/auth" />} />
        </Route>
      </Routes>
    );
  }

  // Se há sessão, renderiza as rotas protegidas
  return (
    <Routes>
      {/* Rotas SEM cabeçalho */}
      <Route element={<LayoutWithoutHeader user={user} onLogout={handleLogout} showToast={showToast} />}>
        <Route path="/" element={<Suspense fallback={<LoadingSpinner />}><HomePage /></Suspense>} />
        <Route path="/perfil" element={<Suspense fallback={<LoadingSpinner />}><ProfilePage /></Suspense>} />
        <Route path="/perfil/update-password" element={<Suspense fallback={<LoadingSpinner />}><UpdatePasswordProfilePage /></Suspense>} />
        <Route path="/perfil/update-email" element={<Suspense fallback={<LoadingSpinner />}><UpdateEmailPage /></Suspense>} />
        <Route path="/relatos" element={<Suspense fallback={<LoadingSpinner />}><RelatosPage /></Suspense>} />
        <Route path="/relatos/novo" element={<Suspense fallback={<LoadingSpinner />}><CreateRelatoPage /></Suspense>} />
        <Route path="/relatos/aprovacao" element={<ProtectedRoute user={user} requiredPermission="can_manage_relatos"><Suspense fallback={<LoadingSpinner />}><RelatosAprovacaoPage /></Suspense></ProtectedRoute>} />
        <Route path="/relatos/lista" element={<Suspense fallback={<LoadingSpinner />}><RelatosListaPage /></Suspense>} />
        <Route path="/relatos/detalhes/:id" element={<Suspense fallback={<LoadingSpinner />}><RelatoDetailsPage /></Suspense>} />
        <Route path="/relatos/estatisticas" element={<Suspense fallback={<LoadingSpinner />}><RelatosStatsPage /></Suspense>} />
        <Route path="/relatos/atribuidos" element={<Suspense fallback={<LoadingSpinner />}><RelatosAtribuidosPage /></Suspense>} />
        <Route path="/users-management" element={<ProtectedRoute user={user} requiredPermission="can_view_users"><Suspense fallback={<LoadingSpinner />}><UsersPage /></Suspense></ProtectedRoute>} />
        <Route path="/users-management/create" element={<ProtectedRoute user={user} requiredPermission="can_create_users"><Suspense fallback={<LoadingSpinner />}><CreateUserPage /></Suspense></ProtectedRoute>} />
        <Route path="/users-management/:userId" element={<ProtectedRoute user={user} requiredPermission="can_view_users"><Suspense fallback={<LoadingSpinner />}><UserDetailsPage /></Suspense></ProtectedRoute>} />
      </Route>

      {/* Fallback para qualquer outra rota quando logado, redireciona para a home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  const { toast, showToast, hideToast } = useToast();

  return (
    <BrowserRouter>
      <AppWrapper showToast={showToast} />
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </BrowserRouter>
  );
}

export default App;
