import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RelatoForm from '../components/RelatoForm';

import { supabase } from '@/01-shared/lib/supabase';
import BackButton from '@/01-shared/components/BackButton';

const CreateRelatoPage = ({ showToast }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateRelato = async (formData) => {
    setIsLoading(true);
    console.log('Iniciando envio do relato...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Usuário obtido:', user);

      // Validação crucial: se não for anônimo, precisa de um usuário.
      if (!formData.is_anonymous && !user) {
        showToast('Você precisa estar logado para criar um relato identificado.', 'error');
        setIsLoading(false);
        return; // Para a execução aqui.
      }

      const { responsaveis, ...relatoDetails } = formData;

      const relatoData = {
        ...relatoDetails,
        user_id: formData.is_anonymous ? null : user.id,
        // Converte a hora para null se estiver vazia, para evitar erro no banco de dados
        hora_aproximada_ocorrencia: formData.hora_aproximada_ocorrencia || null
      };

      console.log('Dados que serão inseridos:', relatoData);
      const { data: newRelato, error } = await supabase
        .from('relatos')
        .insert([relatoData])
        .select('id')
        .single(); // .single() para retornar um único objeto em vez de um array

      if (error) throw error;

      // Etapa 2: Se houver responsáveis, associá-los ao relato criado
      if (responsaveis && responsaveis.length > 0) {
        const newRelatoId = newRelato.id;
        const responsaveisData = responsaveis.map(userId => ({
          relato_id: newRelatoId,
          user_id: userId
        }));

        const { error: responsaveisError } = await supabase
          .from('relato_responsaveis')
          .insert(responsaveisData);

        if (responsaveisError) throw responsaveisError;
      }

      // Registrar log de criação do relato
      const { error: logError } = await supabase
        .from('relato_logs')
        .insert({
          relato_id: newRelato.id,
          user_id: formData.is_anonymous ? null : (user ? user.id : null), // ID do usuário que criou, ou null se anônimo
          action_type: 'CREATE',
          details: { ...relatoData, responsaveis: responsaveis } // Fotografia completa dos dados do relato
        });

      if (logError) {
        console.error('Erro ao registrar log de criação:', logError);
        // Não lançar erro fatal aqui, pois o relato já foi criado com sucesso
      }

      console.log('Attempting to show toast and navigate...'); // NEW LINE
      showToast('Relato enviado com sucesso!', 'success');
      // Conditional navigation based on user authentication status
      if (user) { // If user is logged in
        navigate('/relatos'); // Navigate to the main relatos page
      } else { // If user is anonymous
        navigate('/auth'); // Navigate to the login page
      }
    } catch (error) {
      console.error('Erro detalhado ao criar relato:', error);
      showToast(`Erro ao enviar o relato: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4"> {/* Re-added p-4 */}
      <div className="flex items-center gap-4 mb-4">
        <BackButton />
        <h1 className="text-2xl font-bold">Criar Novo Relato</h1>
      </div>
      <p className="mb-6 text-gray-600">
        Preencha o formulário abaixo com o máximo de detalhes possível. Sua contribuição é fundamental para a segurança de todos.
      </p>
      <RelatoForm onSubmit={handleCreateRelato} isLoading={isLoading} submitButtonText="Enviar Relato" />
    </div>
  );
};

export default CreateRelatoPage;
