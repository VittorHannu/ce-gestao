import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faShield, faUsers, faUser } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';
import { useUserProfile } from '@/04-profile/hooks/useUserProfile';
import './BottomNavBar.css';

const BottomNavBar = () => {
  const { data: user, isLoading } = useUserProfile();
  const canViewUsers = user?.can_view_users;

  // Usa useMemo para criar os itens de navegação, recalculando apenas quando isSuperAdmin muda.
  const navItems = useMemo(() => {
    const items = [
      { to: '/', icon: <FontAwesomeIcon icon={faHome} size="lg" />, label: 'Início' },
      { to: '/relatos', icon: <FontAwesomeIcon icon={faShield} size="lg" />, label: 'Relatos' },
      // Adiciona o item 'Usuários' apenas se o usuário for um super administrador
      canViewUsers && { to: '/users-management', icon: <FontAwesomeIcon icon={faUsers} size="lg" />, label: 'Usuários' },
      { to: '/perfil', icon: <FontAwesomeIcon icon={faUser} size="lg" />, label: 'Perfil' }
    ];
    // Filtra quaisquer itens nulos (como o item 'Usuários' quando isSuperAdmin é falso)
    return items.filter(Boolean);
  }, [canViewUsers]);

  if (isLoading) {
    return null; // Não mostra nada enquanto carrega o perfil do usuário
  }

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end // Garante que a rota seja exata para aplicar a classe 'active'
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          {item.icon}
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNavBar;
