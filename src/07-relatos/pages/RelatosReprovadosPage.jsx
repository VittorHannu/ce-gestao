import React, { useState, useEffect } from 'react';
import { supabase } from '@/01-shared/lib/supabase';
import { useToast } from '@/01-shared/hooks/useToast';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import RelatoCard from '../components/RelatoCard';
import BackButton from '@/01-shared/components/BackButton';

const RelatosReprovadosPage = () => {
  const [reprovadosRelatos, setReprovadosRelatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchReprovados = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('relatos')
        .select('*')
        .eq('status', 'REPROVADO')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar relatos reprovados:', error);
        showToast('Erro ao buscar relatos reprovados.', 'error');
      } else {
        setReprovadosRelatos(data);
      }
      setLoading(false);
    };

    fetchReprovados();
  }, [showToast]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <BackButton />
        <h1 className="text-2xl font-bold ml-4">Relatos Reprovados</h1>
      </div>
      
      {reprovadosRelatos.length === 0 ? (
        <p>Não há relatos reprovados no momento.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reprovadosRelatos.map((relato) => (
            <RelatoCard key={relato.id} relato={relato} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RelatosReprovadosPage;
