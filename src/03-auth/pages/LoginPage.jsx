



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
import { Building, Edit3, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useToast } from '@/01-shared/hooks/useToast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/01-shared/components/ui/accordion';

const LoginPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [openAccordion, setOpenAccordion] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: error.message, type: 'error' });
    }
    setLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast({ title: 'Por favor, digite seu e-mail para redefinir a senha.', type: 'info' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: '/update-password'
    });
    if (error) {
      toast({ title: error.message, type: 'error' });
    } else {
      toast({ title: 'Verifique seu e-mail para o link de redefinição de senha!', type: 'success' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex md:w-1/2 bg-[#EE8800] items-center justify-center p-8 flex-col space-y-6">
        <Building className="w-24 h-24 text-white" />
        <h1 className="text-white text-5xl font-extrabold text-center leading-tight">Copa Energia</h1>
        <p className="text-white text-xl text-center mt-4 max-w-md">Sistema de Gestão Integrada para otimizar suas operações.</p>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100 p-4 sm:p-8">
        <div className="w-full max-w-md mx-auto space-y-6">
          <div className="flex items-center justify-center mb-6">
            <img src="/favicon.ico" alt="Logo" className="w-8 h-8 mr-3" />
            <h2 className="text-3xl font-bold text-[#243834]">CE-GESTÃO</h2>
          </div>

          <Accordion type="single" collapsible value={openAccordion} onValueChange={setOpenAccordion} className="w-full">
            <AccordionItem value="login" className="border-none">
              <div className="w-full bg-white p-6 rounded-lg shadow-lg">
                <AccordionTrigger>
                  <div className="flex items-center text-lg font-semibold">
                    <LogIn className="w-5 h-5 mr-2" />
                    Acessar o sistema
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
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
                    <div className="flex flex-col items-center space-y-4">
                      <button
                        className="bg-[#EE8800] hover:bg-[#D47A00] text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE8800] focus:ring-offset-2 w-full"
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
                </AccordionContent>
              </div>
            </AccordionItem>
          </Accordion>

          <Link
            to="/relatos/novo"
            className="block w-full bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => setOpenAccordion('')}
          >
            <div className="flex items-center text-lg font-semibold">
              <Edit3 className="w-5 h-5 mr-2" />
              Fazer um relato
            </div>
            <p className="text-sm text-gray-600 mt-1">Não precisa de conta. Contribua para a segurança de forma rápida e anônima.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


