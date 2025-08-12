



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
import { supabase } from '@/01-shared/lib/supabase';
import { Building } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div className="min-h-screen flex">
      {/* Coluna da Esquerda (Branding da Copa Energia) */}
      <div className="hidden md:flex md:w-1/2 bg-[#EE8800] items-center justify-center p-8 flex-col space-y-6">
        <Building className="w-24 h-24 text-white" />
        <h1 className="text-white text-5xl font-extrabold text-center leading-tight">Copa Energia</h1>
        <p className="text-white text-xl text-center mt-4 max-w-md">Sistema de Gestão Integrada para otimizar suas operações.</p>
      </div>

      {/* Coluna da Direita (Formulário de Login) */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100 p-8">
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto"> {/* Added flex-col wrapper */}
          <div className="w-full bg-white p-8 rounded-lg shadow-lg">
            <div className="flex items-center justify-center mb-6">
              <img src="/favicon.ico" alt="Logo" className="w-8 h-8 mr-3" />
              <h2 className="text-3xl font-bold text-[#243834]">CE-GESTÃO</h2>
            </div>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-[#243834] text-sm font-bold mb-2" htmlFor="email">
                Email
                </label>
                <input
                  className="border border-[#243834] rounded-lg w-full py-2 px-3 text-[#243834] leading-tight focus:outline-none focus:ring-2 focus:ring-[#EE8800] focus:border-transparent"
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-[#243834] text-sm font-bold mb-2" htmlFor="password">
                Senha
                </label>
                <input
                  className="border border-[#243834] rounded-lg w-full py-2 px-3 text-[#243834] mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-[#EE8800] focus:border-transparent"
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col items-center space-y-4"> {/* Changed to flex-col and added space-y */}
                <button
                  className="bg-[#EE8800] hover:bg-[#D47A00] text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE8800] focus:ring-offset-2 w-full" /* Added w-full */
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Carregando...' : 'Entrar'}
                </button>
                <button
                  type="button"
                  className="inline-block align-baseline font-bold text-sm text-[#243834] hover:text-[#1A2825] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE8800] focus:ring-offset-2"
                  onClick={handlePasswordReset}
                  disabled={loading}
                >
                Esqueceu sua senha?
                </button>
              </div>
            </form>
          </div>
          {/* New button for anonymous relato submission */}
          <div className="mt-6 text-center w-full"> {/* Added w-full to ensure it takes full width */}
            <p className="text-sm text-gray-600 mb-2">Não tem uma conta ou quer apenas enviar um relato?</p>
            <Link
              to="/relatos/novo" // Corrected route for CreateRelatoPage
              className="bg-gray-200 hover:bg-gray-300 text-[#243834] font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Enviar Relato
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


