import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faShield, faUsers } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';
import './BottomNavBar.css';

const BottomNavBar = ({ user }) => {
  console.log('DEBUG: User object in BottomNavBar:', user);
  const navItems = [
    { to: '/relatos', icon: <FontAwesomeIcon icon={faShield} size="lg" />, label: 'Relatos' },
    user?.can_view_users && { to: '/users-management', icon: <FontAwesomeIcon icon={faUsers} size="lg" />, label: 'Usuários' },
    { to: '/perfil', icon: <FontAwesomeIcon icon={faUser} size="lg" />, label: 'Perfil' }
  ].filter(Boolean);

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
