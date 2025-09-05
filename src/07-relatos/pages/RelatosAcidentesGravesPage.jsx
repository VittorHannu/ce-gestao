
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/01-shared/lib/supabase';
import RelatoCard from '../components/RelatoCard';
import MainLayout from '@/01-shared/components/MainLayout';
import BackButton from '@/01-shared/components/BackButton';
import SearchInput from '@/01-shared/components/SearchInput';

const fetchAcidentesGraves = async () => {
  const { data, error } = await supabase
    .from('relatos')
    .select('*')
    .in('tipo_relato', ['Acidente com afastamento', 'Fatal', 'Severo'])
    .order('data_ocorrencia', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const RelatosAcidentesGravesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: relatos, isLoading, error } = useQuery({
    queryKey: ['acidentesGraves'],
    queryFn: fetchAcidentesGraves,
  });

  const filteredRelatos = relatos?.filter((relato) => {
    const searchTermLower = searchTerm.toLowerCase();
    const { descricao, local_exato } = relato;

    return (
      (descricao && descricao.toLowerCase().includes(searchTermLower)) ||
      (local_exato && local_exato.toLowerCase().includes(searchTermLower))
    );
  });

  return (
    <MainLayout
      header={(
        <>
          <BackButton />
          <h1 className="text-2xl font-bold ml-4">Acidentes Graves</h1>
        </>
      )}
    >
      <div className="p-4">
        <div className="mb-4">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Pesquisar por descrição ou local..." />
        </div>
        {isLoading && <p>Carregando...</p>}
        {error && <p>Ocorreu um erro ao carregar os relatos.</p>}
        {filteredRelatos && (
          <div className="space-y-4">
            {filteredRelatos.map((relato) => (
              <RelatoCard key={relato.id} relato={relato} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RelatosAcidentesGravesPage;
