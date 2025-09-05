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
import { supabase } from '@/01-shared/lib/supabase';
import Toast from '@/01-shared/components/ui/Toast';
import { useToast } from '@/01-shared/hooks/useToast';
import { usePresence } from '@/01-shared/hooks/usePresence';


import ProtectedRoute from '@/01-shared/components/protected-route/ProtectedRoute';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import { Button } from '@/01-shared/components/ui/button';

import MainLayout from '@/01-shared/components/MainLayout';
import PublicLayout from '@/01-shared/components/PublicLayout';
import { DateFilterProvider } from './01-shared/hooks/useDateFilter.jsx';


const ApresentacaoPage = React.lazy(() => import('@/09-presentation/pages/ApresentacaoPage'));
const LoginPage = React.lazy(() => import('@/03-auth/pages/LoginPage'));
const ProfilePage = React.lazy(() => import('@/04-profile/pages/ProfilePage'));
const UpdatePasswordPage = React.lazy(() => import('@/03-auth/pages/UpdatePasswordPage'));

const UpdatePasswordProfilePage = React.lazy(() => import('@/04-profile/pages/UpdatePasswordProfilePage'));
const UpdateEmailPage = React.lazy(() => import('@/04-profile/pages/UpdateEmailPage'));
const ConfirmEmailChangePage = React.lazy(() => import('@/03-auth/pages/ConfirmEmailChangePage'));
const RelatosPage = React.lazy(() => import('@/07-relatos/pages/RelatosPage'));
const CreateRelatoPage = React.lazy(() => import('@/07-relatos/pages/CreateRelatoPage'));
const RelatosAprovacaoPage = React.lazy(() => import('@/07-relatos/pages/RelatosAprovacaoPage'));
const RelatosListaPage = React.lazy(() => import('@/07-relatos/pages/RelatosListaPage'));
const RelatoDetailsPage = React.lazy(() => import('@/07-relatos/pages/RelatoDetailsPage'));
const RelatosStatsPage = React.lazy(() => import('@/07-relatos/pages/RelatosStatsPage'));
const RelatosByTypePage = React.lazy(() => import('@/07-relatos/pages/RelatosByTypePage')); // New import
const RelatosAtribuidosPage = React.lazy(() => import('@/07-relatos/pages/RelatosAtribuidosPage'));
const UsersPage = React.lazy(() => import('@/05-adm/pages/UsersPage'));
const CreateUserPage = React.lazy(() => import('@/05-adm/pages/CreateUserPage'));
const UserDetailsPage = React.lazy(() => import('@/05-adm/pages/UserDetailsPage'));
const FeedbackReportsPage = React.lazy(() => import('@/07-relatos/pages/FeedbackReportsPage'));
const RelatosReprovadosPage = React.lazy(() => import('@/07-relatos/pages/RelatosReprovadosPage'));
const RelatoLogsPage = React.lazy(() => import('@/07-relatos/pages/RelatoLogsPage'));
const NotificationsPage = React.lazy(() => import('@/08-notifications/pages/NotificationsPage'));


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
  const [profileLoadError, setProfileLoadError] = useState(null); // New state
  const [isReadyForRender, setIsReadyForRender] = useState(false);
  const _navigate = useNavigate();
  const _location = useLocation();

  // Ativa o hook de presença se houver uma sessão
  const hasSession = !!session;
  usePresence(hasSession);

  const fetchUserProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, is_active, can_manage_relatos, can_view_users, can_create_users, can_delete_users, can_view_feedbacks')
        .eq('id', userId)
        .limit(1); // Use limit(1) instead of single() for graceful handling of no results

      if (error) throw error;

      let userProfile = data && data.length > 0 ? data[0] : null;

      if (!userProfile) {
        // If no profile found, create one
        console.warn('No profile found for user, creating a new one.');
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: authUser?.email || '', // Use authenticated user's email
            full_name: authUser?.user_metadata?.full_name || authUser?.email || 'Novo Usuário',
            is_active: true,
            can_manage_relatos: false,
            can_view_users: false,
            can_create_users: false,
            can_delete_users: false,
            can_view_feedbacks: false
          })
          .select()
          .single(); // Use single() here as we expect exactly one new record

        if (createError) throw createError;
        userProfile = newProfile;
        showToast('Perfil criado com sucesso!', 'success');
      }

      setUser(userProfile);
      setProfileLoadError(null); // Clear error on success
      console.log('DEBUG: Perfil do usuário buscado:', userProfile);
      console.log('DEBUG: can_view_users no App.jsx:', userProfile?.can_view_users);
    } catch (error) {
      console.error('Erro ao buscar ou criar perfil:', error);
      showToast('Erro ao carregar ou criar dados do perfil.', 'error');
      setProfileLoadError(error); // Set error state
    }
  }, [showToast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
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
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile]);

  if (loading || !isReadyForRender || (session && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {profileLoadError ? (
          <div className="text-center text-red-500">
            <p className="mb-4">Erro ao carregar dados do perfil: {profileLoadError.message}</p>
            <Button onClick={() => fetchUserProfile(session.user.id)}>Tentar Novamente</Button>
            {/* New Logout Button */}
            <Button
              onClick={handleLogout} // Use the existing handleLogout
              className="mt-4 ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sair (Logout)
            </Button>
          </div>
        ) : (
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500 mx-auto"></div>
        )}
      </div>
    );
  }

  

  // Se não há sessão, renderiza as rotas públicas (Auth, UpdatePasswordPage)
  if (!session) {
    return (
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/apresentacao" element={<Suspense fallback={<LoadingSpinner />}><ApresentacaoPage /></Suspense>} />
          <Route path="/update-password" element={<Suspense fallback={<LoadingSpinner />}><UpdatePasswordPage showToast={showToast} /></Suspense>} />
          <Route path="/auth" element={<Suspense fallback={<LoadingSpinner />}><LoginPage showToast={showToast} /></Suspense>} />
          <Route path="/auth/confirm" element={<Suspense fallback={<LoadingSpinner />}><ConfirmEmailChangePage showToast={showToast} /></Suspense>} />
          {/* Rota para criar relato, acessível sem autenticação */}
          <Route path="/relatos/novo" element={<Suspense fallback={<LoadingSpinner />}><CreateRelatoPage showToast={showToast} /></Suspense>} />
          {/* Added for anonymous access */}
          {/* Redireciona a rota raiz para a página de login */}
          <Route path="/" element={<Navigate to="/auth" />} />
          {/* Qualquer outra rota sem sessão vai para a página de login */}
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
        <Route path="/" element={<Navigate to="/relatos" />} />
        <Route path="/perfil" element={<Suspense fallback={<LoadingSpinner />}><ProfilePage /></Suspense>} />
        <Route path="/perfil/update-password" element={<Suspense fallback={<LoadingSpinner />}><UpdatePasswordProfilePage /></Suspense>} />
        <Route path="/perfil/update-email" element={<Suspense fallback={<LoadingSpinner />}><UpdateEmailPage /></Suspense>} />
        <Route path="/notifications" element={<Suspense fallback={<LoadingSpinner />}><NotificationsPage /></Suspense>} />
        <Route path="/relatos" element={<Suspense fallback={<LoadingSpinner />}><RelatosPage /></Suspense>} />
        <Route path="/relatos/novo" element={<Suspense fallback={<LoadingSpinner />}><CreateRelatoPage showToast={showToast} /></Suspense>} />
        <Route path="/relatos/aprovacao" element={<ProtectedRoute user={user} requiredPermission="can_manage_relatos"><Suspense fallback={<LoadingSpinner />}><RelatosAprovacaoPage /></Suspense></ProtectedRoute>} />
        <Route path="/relatos/lista" element={<Suspense fallback={<LoadingSpinner />}><RelatosListaPage /></Suspense>} />
        <Route path="/relatos/detalhes/:id" element={<Suspense fallback={<LoadingSpinner />}><RelatoDetailsPage /></Suspense>} />
        <Route path="/relatos/estatisticas" element={<Suspense fallback={<LoadingSpinner />}><RelatosStatsPage /></Suspense>} />
        <Route path="/relatos/estatisticas/tipo" element={<Suspense fallback={<LoadingSpinner />}><RelatosByTypePage /></Suspense>} /> {/* New route */}
        <Route path="/relatos/atribuidos" element={<Suspense fallback={<LoadingSpinner />}><RelatosAtribuidosPage /></Suspense>} />
        <Route path="/relatos/reprovados" element={<Suspense fallback={<LoadingSpinner />}><RelatosReprovadosPage /></Suspense>} />
        <Route path="/relatos/logs/:id" element={<Suspense fallback={<LoadingSpinner />}><RelatoLogsPage /></Suspense>} />
        <Route path="/users-management" element={<ProtectedRoute user={user} requiredPermission="can_view_users"><Suspense fallback={<LoadingSpinner />}><UsersPage /></Suspense></ProtectedRoute>} />
        <Route path="/users-management/create" element={<ProtectedRoute user={user} requiredPermission="can_create_users"><Suspense fallback={<LoadingSpinner />}><CreateUserPage /></Suspense></ProtectedRoute>} />
        <Route path="/users-management/:userId" element={<ProtectedRoute user={user} requiredPermission="can_view_users"><Suspense fallback={<LoadingSpinner />}><UserDetailsPage /></Suspense></ProtectedRoute>} />
        <Route path="/feedback-reports" element={<ProtectedRoute user={user} requiredPermission="can_view_feedbacks"><Suspense fallback={<LoadingSpinner />}><FeedbackReportsPage /></Suspense></ProtectedRoute>} />
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
      <DateFilterProvider>
        <AppWrapper showToast={showToast} />
        {toast && (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}
      </DateFilterProvider>
    </BrowserRouter>
  );
}

export default App;