/*
 * Este componente React (`UpdatePasswordPage`) é utilizado para permitir
 * que os usuários redefinam suas senhas através do fluxo de 'Esqueceu sua Senha'.
 * Ele é acessado por um link enviado ao e-mail do usuário, que contém um token
 * de acesso para autenticação temporária.
 *
 * Visualmente no seu site, você o vê como uma tela de formulário onde o usuário
 * insere e confirma uma nova senha. Diferente da página de 'Troca de Senha Obrigatória',
 * esta página não força o logout após a redefinição, mantendo o usuário logado
 * e redirecionando-o para a página inicial após o sucesso.
 *
 *
 *
 *
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/01-shared/lib/supabase';
import { useNavigate } from 'react-router-dom';

const UpdatePasswordPage = ({ showToast }) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // This useEffect is important for Supabase's password reset flow.
    // When the user clicks the reset link in their email, Supabase redirects them
    // to this page with an access_token in the URL hash.
    // Supabase's client automatically picks up this token and sets the session,
    // allowing the user to update their password.
    const { data: { session } } = supabase.auth.getSession();
    if (!session) {
      showToast('Por favor, use o link do e-mail para redefinir sua senha.', 'info');
    }
  }, [showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (password !== confirmPassword) {
      showToast('As senhas não coincidem.', 'error');
      setLoading(false);
      return;
    }

    if (password.length < 6) { // Minimum password length, adjust as per your Supabase settings
      showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      showToast(`Erro ao atualizar a senha: ${error.message}`, 'error');
    } else {
      showToast('Sua senha foi atualizada com sucesso! Você pode fazer login agora.', 'success');
      setPassword('');
      setConfirmPassword('');
      navigate('/', { replace: true }); // Redireciona para a home page após sucesso
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="w-full max-w-md mx-auto px-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          Redefinir Senha
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Nova Senha
            </label>
            <input
              className="border border-slate-300 rounded-lg w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirmar Nova Senha
            </label>
            <input
              className="border border-slate-300 rounded-lg w-full py-2 px-3 text-slate-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              id="confirmPassword"
              type="password"
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Atualizando...' : 'Atualizar Senha'}
            </button>
          </div>
        </form>
        {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Desenvolvido por <a href="https://github.com/VittorHannu" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">Vittor Hannu</a>
          </p>
          <p className="mt-2 text-xs text-gray-500 max-w-md mx-auto">
            Esta é uma versão beta da plataforma e estou desenvolvendo com a ajuda de IA’s para entregar um sistema otimizado o mais rápido possível. Por isso seu Feedback é muito importante, é com ele que vou saber dos bugs e correções que tem que ser feitas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
