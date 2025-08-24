



/*
 * Este componente React é projetado para gerenciar e exibir o estado de carregamento e erro de dados.
 * Ele atua como um "invólucro" para o conteúdo que depende de dados assíncronos.
 *
 * Visualmente, você o vê como uma mensagem de "Carregando..." (ou um spinner/indicador de progresso)
 * que aparece na tela enquanto o aplicativo está buscando informações do servidor.
 * Se ocorrer um problema na busca dos dados, ele exibirá uma mensagem de erro para o usuário.
 * Ele garante que o usuário sempre tenha feedback visual sobre o estado dos dados.
 *
 *
 *
 *
 */



import React from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button'; // Assumindo este caminho para o componente Button

const DataLoader = ({ children, isLoading, error, onRetry, _loadingMessage = 'Carregando...', _emptyMessage = 'Nenhum dado encontrado.' }) => {
  const supabase = useSupabaseClient();
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log('Attempting to log out...');
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error('Error during logout:', signOutError.message);
      // Opcionalmente, exibir um toast de erro de logout
    } else {
      console.log('Logged out successfully. Redirecting to login.');
      navigate('/auth/login'); // Redireciona para a página de login
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>Erro ao carregar dados: {error.message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Tentar Novamente
            </button>
          )}
          {/* Novo Botão de Logout */}
          <Button
            onClick={handleLogout}
            className="mt-4 ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sair (Logout)
          </Button>
        </div>
      </div>
    );
  }

  return children;
};

export default DataLoader;
