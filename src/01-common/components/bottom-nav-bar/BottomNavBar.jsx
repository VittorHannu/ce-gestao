import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';
import './BottomNavBar.css';

const BottomNavBar = () => {
  const navItems = [
    { to: '/', icon: <FontAwesomeIcon icon={faHome} size="lg" />, label: 'Início' },
    { to: '/perfil', icon: <FontAwesomeIcon icon={faUser} size="lg" />, label: 'Perfil' }
  ];

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
