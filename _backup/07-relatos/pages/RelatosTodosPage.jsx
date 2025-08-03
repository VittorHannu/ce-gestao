import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import MainLayout from '@/01-common/components/MainLayout';
import { useRelatos } from '@/07-relatos/hooks/useRelatos';

import RelatoCard from '@/07-relatos/components/RelatoCard';
import SearchInput from '@/01-common/components/SearchInput';
import BackButton from '@/01-common/components/BackButton';

const RelatosTodosPage = () => {
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const { relatos, loading, error, filters, setFilters, isFetching } = useRelatos({}, user);

  const handleRelatoClick = (relato) => {
    navigate(`/relatos/${relato.id}`);
  };

  const handleSearchChange = (e) => {
    setFilters({ busca: e.target.value });
  };

  if (error) {
    return (
      <MainLayout title="Todos os Relatos de Segurança">
        <div className="text-center text-red-500 py-10">
          <p>Erro ao carregar os relatos: {error.message}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Todos os Relatos de Segurança">
      <div className="mb-6 flex items-center space-x-2">
        <BackButton />
        <div className="flex-grow">
          <SearchInput
            value={filters.busca || ''}
            onChange={handleSearchChange}
            placeholder="Pesquisar relatos..."
          />
        </div>
        {isFetching && !loading && (
          <div className="text-gray-500 text-sm">
            Buscando...
          </div>
        )}
      </div>
      {loading ? (
        <p>Carregando relatos...</p>
      ) : relatos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatos.map((relato) => (
            <RelatoCard
              key={relato.id}
              relato={relato}
              onClick={handleRelatoClick}
            />
          ))}
        </div>
      ) : (
        <div className="col-span-full text-center py-12">
          <div className="text-gray-400 text-lg">
            Nenhum relato cadastrado ainda.
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default RelatosTodosPage;
