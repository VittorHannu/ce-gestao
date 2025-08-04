



/*
 * Este componente React implementa uma rota protegida no aplicativo.
 * Ele garante que apenas usuários autenticados e/ou com permissões específicas
 * possam acessar determinadas partes do sistema.
 *
 * Visualmente, este componente não é visível diretamente. Sua função é de controle de acesso.
 * Se um usuário tentar acessar uma página protegida sem estar logado ou sem as permissões necessárias,
 * ele será redirecionado para a página de login ou verá uma mensagem de "Acesso Negado".
 *
 *
 *
 *
 */



import React from 'react';
import { Navigate } from 'react-router-dom';
import AccessDeniedMessage from './AccessDeniedMessage';

const ProtectedRoute = ({ children, user, requiredPermission }) => {
  console.log('ProtectedRoute: Initial render - user:', user, 'requiredPermission:', requiredPermission);
  // 1. Verificar se o usuário está logado
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 2. Verificar se o usuário precisa trocar a senha
  //    Redireciona para a página de troca de senha forçada, a menos que já esteja lá
  if (false) {
    return <Navigate to="/force-password-change" replace />;
  }

  // 3. Verificar permissão específica, se houver
  console.log('ProtectedRoute: user object', user);
  console.log('ProtectedRoute: requiredPermission', requiredPermission);
  if (requiredPermission) {
    let hasPermission = false;

    if (Array.isArray(requiredPermission)) {
      // Se requiredPermission é um array, verifica se o usuário tem QUALQUER UMA das permissões
      hasPermission = requiredPermission.some(perm => {
        console.log(`Checking permission: ${perm}, user has: ${user && user[perm]}`);
        return user && user[perm];
      });
    } else {
      // Se requiredPermission é uma string, verifica aquela permissão específica
      console.log(`Checking permission: ${requiredPermission}, user has: ${user && user[requiredPermission]}`);
      hasPermission = user && user[requiredPermission];
    }

    console.log('ProtectedRoute: hasPermission result', hasPermission);

    if (!hasPermission) {
      return <AccessDeniedMessage />;
    }
  }

  // Se o usuário está logado e tem a permissão necessária (ou nenhuma permissão é exigida além do login)
  return children;
};

export default ProtectedRoute;
