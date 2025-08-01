



/*
 * Este componente React é responsável por gerenciar a autenticação de usuários no aplicativo.
 * Ele lida com o processo de login e, se necessário, a redefinição de senha, interagindo com o Supabase.
 *
 * Visualmente, ele se apresenta como a tela de login/cadastro do seu aplicativo.
 * É onde os usuários inserem seus e-mails e senhas para acessar o sistema.
 * Inclui campos de entrada para e-mail e senha, botões para "Entrar" e "Esqueceu sua senha?",
 * e exibe mensagens de carregamento ou erro conforme a interação com o backend.
 *
 *
 *
 *
 */



import React, { useState } from 'react';
import { supabase } from '@/01-common/lib/supabase';

const LoginPage = ({ showToast }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('handleLogin: Iniciando login...');
    setLoading(true);
    console.log('handleLogin: Email', email, 'Password', password);
    console.log('handleLogin: Verificando supabase e signInWithPassword:', supabase, typeof supabase.auth.signInWithPassword);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    console.log('handleLogin: Resultado do login - error:', error);
    if (error) {
      showToast(error.message, 'error');
      console.error('handleLogin: Erro de login:', error.message);
    }
    setLoading(false);
    console.log('handleLogin: Login finalizado.');
  };

  const handlePasswordReset = async () => {
    if (!email) {
      showToast('Por favor, digite seu e-mail para redefinir a senha.', 'info');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: '/update-password' // Redireciona para uma página onde o usuário pode definir a nova senha
    });
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Verifique seu e-mail para o link de redefinição de senha!', 'success');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md mx-auto px-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          Sistema de Gestão
        </h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="border border-slate-300 rounded-lg w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Senha
            </label>
            <input
              className="border border-slate-300 rounded-lg w-full py-2 px-3 text-slate-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Carregando...' : 'Entrar'}
            </button>
            <button
              type="button"
              className="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={handlePasswordReset}
              disabled={loading}
            >
              Esqueceu sua senha?
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

export default LoginPage;


