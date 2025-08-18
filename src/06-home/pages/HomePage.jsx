



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



import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/01-shared/components/MainLayout';
import FeedbackForm from '@/01-shared/components/FeedbackForm';
import { Button } from '@/01-shared/components/ui/button';
import { MessageSquare, List } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
// import { requestNotificationPermission, subscribeUserToPush } from '@/01-shared/lib/pushNotifications';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);

  // const handleSubscribeToPush = async () => {
  //   const permission = await requestNotificationPermission();
  //   if (permission === 'granted') {
  //     await subscribeUserToPush();
  //   } else {
  //     alert('Permissão para notificações negada. Por favor, habilite nas configurações do navegador.');
  //   }
  // };

  

  return (
    <MainLayout title="Página Inicial" hideHeader={true}>
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Ce-SGI</h1>
        <p className="text-base text-gray-600">Sistema de Gestão Integrada</p>
      </div>

      <div className="flex justify-center">
        {/* O card de Gerenciar Usuários foi movido para a barra de navegação */}
      </div>

      <div className="flex flex-col items-center space-y-4 mt-8">
        <Button onClick={() => setIsFeedbackFormOpen(true)} className="w-full max-w-xs">
          <MessageSquare className="w-5 h-5 mr-2" />
          Enviar Feedback / Relatar Erro
        </Button>
        {user?.can_view_feedbacks && (
          <Button onClick={() => navigate('/feedback-reports')} className="w-full max-w-xs">
            <List className="w-5 h-5 mr-2" />
            Ver Relatórios de Feedback
          </Button>
        )}
        {/* <Button onClick={handleSubscribeToPush} className="w-full max-w-xs">
          <Bell className="w-5 h-5 mr-2" />
          Ativar Notificações
        </Button> */}
      </div>

      <FeedbackForm
        isOpen={isFeedbackFormOpen}
        onClose={() => setIsFeedbackFormOpen(false)}
      />
    </MainLayout>
  );
};

export default HomePage;