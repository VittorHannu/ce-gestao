import React, { useState, useEffect } from 'react'; // Added useEffect
import { useNavigate } from 'react-router-dom';
import RelatoForm from '../components/RelatoForm';

import { supabase } from '@/01-shared/lib/supabase';
import BackButton from '@/01-shared/components/BackButton';
import MainLayout from '@/01-shared/components/MainLayout';

import { useToast } from '@/01-shared/hooks/useToast';

const CreateRelatoPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); // New state for login status
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsUserLoggedIn(!!session); // Set true if session exists, false otherwise
    };
    checkUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsUserLoggedIn(!!session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // Run once on mount, and cleanup on unmount

  const handleCreateRelato = async (formData) => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!formData.is_anonymous && !user) {
        toast({ title: 'Você precisa estar logado para criar um relato identificado.', type: 'error' });
        setIsLoading(false);
        return;
      }

      const { responsaveis, ...relatoDetails } = formData;

      const relatoData = {
        ...relatoDetails,
        user_id: formData.is_anonymous ? null : user.id,
        hora_aproximada_ocorrencia: formData.hora_aproximada_ocorrencia || null
      };

      // Etapa 1: Inserir o relato principal (funciona para anônimos e autenticados)
      const { data: newRelato, error } = await supabase
        .from('relatos')
        .insert([relatoData])
        .select('id')
        .single();

      if (error) throw error;

      // Etapa 2: Associar responsáveis e registrar log (apenas para usuários autenticados)
      if (!formData.is_anonymous && user) {
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

        const { error: logError } = await supabase
          .from('relato_logs')
          .insert({
            relato_id: newRelato.id,
            user_id: user.id,
            action_type: 'CREATE',
            details: { ...relatoData, responsaveis: responsaveis }
          });

        if (logError) {
          console.error('Erro ao registrar log de criação:', logError);
        }
      }

      toast({ title: 'Relato enviado com sucesso!', type: 'success' });
      if (user) {
        navigate('/relatos');
      } else {
        navigate('/auth');
      }
    } catch (error) {
      console.error('Erro detalhado ao criar relato:', error);
      toast({ title: `Erro ao enviar o relato: ${error.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout
      header={(
        <>
          <BackButton />
          <h1 className="text-2xl font-bold ml-4">Criar Novo Relato</h1>
        </>
      )}
    >
      <div className="p-4">
        <p className="mb-6 text-gray-600">
          Preencha o formulário abaixo com o máximo de detalhes possível. Sua contribuição é fundamental para a segurança de todos.
        </p>
        <RelatoForm
          onSubmit={handleCreateRelato}
          isLoading={isLoading}
          submitButtonText="Enviar Relato"
          isUserLoggedIn={isUserLoggedIn} // Pass the new prop
        />
      </div>
    </MainLayout>
  );
};

export default CreateRelatoPage;