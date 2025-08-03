import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RelatoForm from '../components/RelatoForm';
import { useToast } from '@/01-common/hooks/useToast';
import { supabase } from '@/01-common/lib/supabase';

const CreateRelatoPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleCreateRelato = async (formData) => {
    setIsLoading(true);
    console.log("Iniciando envio do relato...");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Usuário obtido:", user);

      // Validação crucial: se não for anônimo, precisa de um usuário.
      if (!formData.is_anonymous && !user) {
        showToast('Você precisa estar logado para criar um relato identificado.', 'error');
        setIsLoading(false);
        return; // Para a execução aqui.
      }

      const relatoData = {
        ...formData,
        user_id: formData.is_anonymous ? null : user.id,
        // Converte a hora para null se estiver vazia, para evitar erro no banco de dados
        hora_aproximada_ocorrencia: formData.hora_aproximada_ocorrencia || null,
      };

      console.log("Dados que serão inseridos:", relatoData);
      const { error } = await supabase.from('relatos').insert([relatoData]);

      if (error) {
        throw error;
      }

      showToast('Relato enviado com sucesso!', 'success');
      navigate('/relatos');
    } catch (error) {
      console.error('Erro detalhado ao criar relato:', error);
      showToast(`Erro ao enviar o relato: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Criar Novo Relato de Segurança</h1>
      <p className="mb-6 text-gray-600">
        Preencha o formulário abaixo com o máximo de detalhes possível. Sua contribuição é fundamental para a segurança de todos.
      </p>
      <RelatoForm onSubmit={handleCreateRelato} isLoading={isLoading} />
    </div>
  );
};

export default CreateRelatoPage;
