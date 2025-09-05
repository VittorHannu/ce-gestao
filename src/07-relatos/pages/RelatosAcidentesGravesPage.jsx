
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/01-shared/lib/supabase';
import RelatoCard from '../components/RelatoCard';
import MainLayout from '@/01-shared/components/MainLayout';
import BackButton from '@/01-shared/components/BackButton';

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
  const { data: relatos, isLoading, error } = useQuery({
    queryKey: ['acidentesGraves'],
    queryFn: fetchAcidentesGraves,
  });

  return (
    <MainLayout>
      <div className="p-4">
        <div className="flex items-center mb-4">
          <BackButton />
          <h1 className="text-2xl font-bold ml-4">Acidentes Graves</h1>
        </div>
        {isLoading && <p>Carregando...</p>}
        {error && <p>Ocorreu um erro ao carregar os relatos.</p>}
        {relatos && (
          <div className="space-y-4">
            {relatos.map((relato) => (
              <RelatoCard key={relato.id} relato={relato} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RelatosAcidentesGravesPage;
