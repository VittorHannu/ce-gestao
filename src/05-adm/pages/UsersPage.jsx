import React, { useState } from 'react';
import MainLayout from '@/01-common/components/MainLayout';
import { useNavigate } from 'react-router-dom';
import SearchInput from '@/01-common/components/SearchInput';
import { useUsers } from '@/05-adm/hooks/useUsers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/core/components/ui/button';
import { Checkbox } from '@/core/components/ui/checkbox';
import { Label } from '@/core/components/ui/label';


function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNeedsPasswordReset, setFilterNeedsPasswordReset] = useState(false);
  const navigate = useNavigate();

  const { data: users, isLoading: loading, isError, error } = useUsers(searchTerm, filterNeedsPasswordReset);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
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
        <Button
          onClick={() => navigate('/users-management/create')}
          title="Criar novo usuário"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Novo Usuário</span>
        </Button>
      </div>
      <div className="mb-4 flex items-center space-x-2">
        <Checkbox
          id="needsPasswordResetFilter"
          checked={filterNeedsPasswordReset}
          onCheckedChange={setFilterNeedsPasswordReset}
        />
        <Label htmlFor="needsPasswordResetFilter">Apenas usuários que precisam redefinir a senha</Label>
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
              {user.needs_password_reset && (
                <p className="text-xs text-red-500">Redefinir Senha</p>
              )}
              
            </li>
          ))}
        </ul>
      )}
    </MainLayout>
  );
}

export default UsersPage;
