
import React, { useState, useMemo, useEffect } from 'react';
import MainLayout from '@/01-shared/components/MainLayout';
import { useNavigate } from 'react-router-dom';
import SearchInput from '@/01-shared/components/SearchInput';
import { useUsers } from '@/05-adm/hooks/useUsers';
import { usePresence } from '@/01-shared/context/PresenceContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/01-shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/01-shared/components/ui/select';

const filterOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' }
];

function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { onlineUsers, loading: presenceLoading } = usePresence();
  const navigate = useNavigate();

  const [filterStatus, setFilterStatus] = useState(() => {
    return sessionStorage.getItem('userFilterStatus') || 'all';
  });

  useEffect(() => {
    sessionStorage.setItem('userFilterStatus', filterStatus);
  }, [filterStatus]);

  const { data: users, isLoading: loading, isError, error } = useUsers(searchTerm);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleUserClick = (userId) => {
    navigate(`/users-management/${userId}`);
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(user => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'active') return user.is_active;
      if (filterStatus === 'inactive') return !user.is_active;

      const isUserOnline = onlineUsers.some(onlineUser => onlineUser.user_id === user.id);
      if (filterStatus === 'online') return isUserOnline;
      if (filterStatus === 'offline') return !isUserOnline;

      return true;
    });
  }, [users, onlineUsers, filterStatus]);

  return (
    <MainLayout header={<h1 className="text-2xl font-bold">Usuários</h1>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <SearchInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Pesquisar por nome ou email..."
        />
        <div className="flex items-center justify-between gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[fit-content]">
              <SelectValue placeholder="Filtro" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => navigate('/users-management/create')}
            title="Criar novo usuário"
            className="flex-shrink-0"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span className="ml-2">Adicionar Usuário</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <p>Carregando usuários...</p>
      ) : isError ? (
        <p className="text-red-500">Erro ao carregar usuários: {error.message}</p>
      ) : filteredUsers.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">Nenhum usuário encontrado com os filtros aplicados.</p>
      ) : (
        <ul className="space-y-2">
          {filteredUsers.map((user) => {
            const isOnline = onlineUsers.some(onlineUser => onlineUser.user_id === user.id);
            return (
              <li
                key={user.id}
                className="p-2 rounded-md cursor-pointer bg-white hover:bg-gray-100 transition-colors shadow-sm dark:bg-gray-800 dark:hover:bg-gray-700"
                onClick={() => handleUserClick(user.id)}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{user.full_name}</p>
                  <div className={`w-3 h-3 rounded-full ${
                    presenceLoading
                      ? 'bg-gray-300 animate-pulse'
                      : isOnline
                        ? 'bg-green-500'
                        : 'bg-gray-400'
                  }`}></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Status: {user.is_active ? 'Ativo' : 'Inativo'}</p>
              </li>
            );
          })}
        </ul>
      )}
    </MainLayout>
  );
}

export default UsersPage;
