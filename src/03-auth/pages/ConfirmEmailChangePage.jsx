import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/01-shared/lib/supabase';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import PublicLayout from '@/01-shared/components/PublicLayout';

import { useToast } from '@/01-shared/hooks/useToast';

const ConfirmEmailChangePage = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Confirmando alteração de e-mail...');

  useEffect(() => {
    const confirmEmailChange = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const type = params.get('type');

      if (token && type === 'email_change') {
        try {
          const { error } = await supabase.auth.verifyOtp({ token, type: 'email_change' });

          if (error) {
            throw error;
          }

          setMessage('E-mail alterado com sucesso! Redirecionando...');
          toast({ title: 'Seu e-mail foi alterado com sucesso!', type: 'success' });
          navigate('/perfil', { replace: true }); // Redireciona para a página de perfil
        } catch (error) {
          console.error('Erro ao confirmar alteração de e-mail:', error);
          setMessage(`Erro ao confirmar alteração de e-mail: ${error.message}`);
          toast({ title: `Erro ao confirmar alteração de e-mail: ${error.message}`, type: 'error' });
          navigate('/auth', { replace: true }); // Redireciona para a página de login em caso de erro
        } finally {
          setLoading(false);
        }
      } else {
        setMessage('Link de confirmação inválido.');
        toast({ title: 'Link de confirmação inválido.', type: 'error' });
        setLoading(false);
        navigate('/auth', { replace: true });
      }
    };

    confirmEmailChange();
  }, [location.search, navigate, toast]);

  return (
    <PublicLayout>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <p className="text-center text-lg">{message}</p>
        )}
      </div>
    </PublicLayout>
  );
};

export default ConfirmEmailChangePage;
