import React, { useState } from 'react';
import MainLayout from '@/01-shared/components/MainLayout';
import { useNavigate } from 'react-router-dom';
import SearchInput from '@/01-shared/components/SearchInput';
import { useUsers } from '@/05-adm/hooks/useUsers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/01-shared/components/ui/button';


function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();

  const { data: users, isLoading: loading, isError, error } = useUsers(searchTerm);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleUserClick = (userId) => {
    navigate(`/users-management/${userId}`);
  };

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4 text-center">Usuários</h1>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex-grow">
          <SearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Pesquisar..."
          />
        </div>
        <Button
          onClick={() => navigate('/users-management/create')}
          title="Criar novo usuário"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Novo Usuário</span>
        </Button>
      </div>
      
      
      {loading ? (
        <p>Carregando usuários...</p>
      ) : isError ? (
        <p className="text-red-500">Erro ao carregar usuários: {error.message}</p>
      ) : users.length === 0 ? (
        <p>Nenhum usuário encontrado.</p>
      ) : (
        <ul className="space-y-2">
          {users.map((user) => (
            <li
              key={user.id}
              className="p-2 rounded-md cursor-pointer bg-white hover:bg-gray-100 transition-colors shadow-sm"
              onClick={() => handleUserClick(user.id)}
            >
              <p className="font-semibold">{user.full_name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-xs text-gray-500">Status: {user.is_active ? 'Ativo' : 'Inativo'}</p>
            </li>
          ))}
        </ul>
      )}
    </MainLayout>
  );
}

export default UsersPage;
