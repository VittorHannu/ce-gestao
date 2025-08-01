



/*
 * Este componente representa a página inicial (Home Page) do aplicativo.
 * Ele serve como um ponto de entrada central, exibindo uma mensagem de boas-vindas
 * e fornecendo acesso rápido a funcionalidades chave, como o gerenciamento de usuários.
 *
 * Visualmente, é uma tela simples com o nome da empresa e do sistema no topo.
 * Abaixo, há um cartão grande e centralizado para "GERENCIAR USUÁRIOS". Este cartão
 * muda de aparência e funcionalidade dependendo se o usuário logado é um super administrador
 * ou não, ficando desabilitado e esmaecido para usuários comuns.
 */



import React from 'react';
import MainLayout from '@/01-common/components/MainLayout';

const HomePage = () => {

  

  return (
    <MainLayout title="Página Inicial" hideHeader={true}>
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Copa Energia</h1>
        <p className="text-base text-gray-600">Sistema de Gestão Integrada</p>
      </div>

      <div className="flex justify-center">
        {/* O card de Gerenciar Usuários foi movido para a barra de navegação */}
      </div>
    </MainLayout>
  );
};

export default HomePage;