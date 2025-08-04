import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '@/01-common/lib/supabase';
import LoadingSpinner from '@/01-common/components/LoadingSpinner';
import PublicLayout from '@/01-common/components/PublicLayout';

const ConfirmEmailChangePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
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
          showToast('Seu e-mail foi alterado com sucesso!', 'success');
          navigate('/perfil', { replace: true }); // Redireciona para a página de perfil
        } catch (error) {
          console.error('Erro ao confirmar alteração de e-mail:', error);
          setMessage(`Erro ao confirmar alteração de e-mail: ${error.message}`);
          showToast(`Erro ao confirmar alteração de e-mail: ${error.message}`, 'error');
          navigate('/auth', { replace: true }); // Redireciona para a página de login em caso de erro
        } finally {
          setLoading(false);
        }
      } else {
        setMessage('Link de confirmação inválido.');
        showToast('Link de confirmação inválido.', 'error');
        setLoading(false);
        navigate('/auth', { replace: true });
      }
    };

    confirmEmailChange();
  }, [location.search, navigate, showToast]);

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
