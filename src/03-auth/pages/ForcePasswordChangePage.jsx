/*
 * Este componente React (`ForcePasswordChangePage`) é uma página dedicada
 * para forçar o usuário a alterar sua senha no primeiro login. Ele garante
 * que novos usuários definam uma senha segura antes de acessar o sistema.
 *
 * Visualmente no seu site, você o vê como uma tela de formulário simples
 * onde o usuário deve inserir e confirmar uma nova senha. Após a atualização
 * bem-sucedida, o usuário é automaticamente desconectado e redirecionado para
 * a página de login, garantindo que a nova senha seja usada para o próximo acesso.
 *
 *
 *
 *
 */

import React, { useState } from 'react';
import { supabase } from '@/01-common/lib/supabase';
import { useNavigate } from 'react-router-dom';

const ForcePasswordChangePage = ({ showToast }) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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
      // Get the current user session to get the user ID
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (currentUser) {
        // Update the needs_password_reset flag in the profiles table
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ needs_password_reset: false })
          .eq('id', currentUser.id);

        if (profileUpdateError) {
          console.error('Erro ao atualizar flag needs_password_reset:', profileUpdateError);
          showToast(`Senha atualizada, mas houve um erro ao finalizar o processo: ${profileUpdateError.message}`, 'warning');
        } else {
          showToast('Sua senha foi atualizada com sucesso!', 'success');
        }
      } else {
        showToast('Sua senha foi atualizada com sucesso! Por favor, faça login novamente.', 'success');
      }

      setPassword('');
      setConfirmPassword('');
      await supabase.auth.signOut(); // Desloga o usuário explicitamente
      navigate('/auth', { replace: true }); // Redireciona para a página de login após sucesso
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    showToast('Você foi desconectado.', 'info');
    navigate('/auth', { replace: true });
  };

  return (
    <div>
      <div className="w-full max-w-md mx-auto px-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          Definir Nova Senha
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
            <button
              className="inline-block align-baseline font-bold text-sm text-gray-600 hover:text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              type="button"
              onClick={handleLogout}
              disabled={loading}
            >
              Sair
            </button>
          </div>
        </form>

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

export default ForcePasswordChangePage;
