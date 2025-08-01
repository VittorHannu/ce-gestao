import React, { useState } from 'react';
import MainLayout from '@/01-common/components/MainLayout';
import { useNavigate } from 'react-router-dom';
import SearchInput from '@/01-common/components/SearchInput';
import { useUsers } from '@/05-adm/hooks/useUsers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';


function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const { data: users, isLoading: loading, isError, error } = useUsers(searchTerm);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleUserClick = (userId) => {
    navigate(`/users-management/${userId}`);
  };

  return (
    <MainLayout>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex-grow">
          <SearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Pesquisar..."
          />
        </div>
        <button
          onClick={() => navigate('/users-management/create')}
          className="bg-green-500 hover:bg-green-600 text-white font-bold p-2 rounded-full w-10 h-10 flex items-center justify-center shadow-md"
          title="Criar novo usuário"
        >
          <FontAwesomeIcon icon={faPlus} size="lg" />
        </button>
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
            </li>
          ))}
        </ul>
      )}
    </MainLayout>
  );
}

export default UsersPage;
