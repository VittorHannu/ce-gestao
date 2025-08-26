import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faShield, faUsers, faBook } from '@fortawesome/free-solid-svg-icons';

const DesktopSidebar = ({ user }) => {
  const navItems = [
    { to: '/', icon: <FontAwesomeIcon icon={faHome} className="mr-3" />, label: 'Início' },
    { to: '/relatos', icon: <FontAwesomeIcon icon={faShield} className="mr-3" />, label: 'Relatos' },
    user?.can_view_users && { to: '/users-management', icon: <FontAwesomeIcon icon={faUsers} className="mr-3" />, label: 'Usuários' },
    { to: '/perfil', icon: <FontAwesomeIcon icon={faUser} className="mr-3" />, label: 'Perfil' },
    { to: '/apresentacao', icon: <FontAwesomeIcon icon={faBook} className="mr-3" />, label: 'Apresentação' }
  ].filter(Boolean);

  return (
    <aside className="w-64 h-full bg-gray-50 border-r border-gray-200 p-6 flex-col fixed hidden md:flex">
      <h1 className="text-2xl font-bold tracking-tight mb-2">SGI Copa</h1>
      <p className="text-sm text-gray-500 mb-8">Gestão de Segurança</p>
      <nav className="space-y-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-md text-lg transition-colors duration-200 ${
                isActive ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default DesktopSidebar;