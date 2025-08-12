



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

const DataLoader = ({ children, isLoading, error, _loadingMessage = 'Carregando...', _emptyMessage = 'Nenhum dado encontrado.' }) => {
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
        </div>
      </div>
    );
  }

  return children;
};

export default DataLoader;
