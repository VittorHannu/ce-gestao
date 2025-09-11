import React, { useState, useEffect } from 'react';
import { supabase } from '@/01-shared/lib/supabase';
import { useToast } from '@/01-shared/hooks/useToast';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import RelatoCard from '../components/RelatoCard';
import PageHeader from '@/01-shared/components/PageHeader';
import MainLayout from '@/01-shared/components/MainLayout';

const RelatosReprovadosPage = () => {
  const [reprovadosRelatos, setReprovadosRelatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
        toast({ title: 'Erro ao buscar relatos reprovados.', variant: 'destructive' });
      } else {
        setReprovadosRelatos(data);
      }
      setLoading(false);
    };

    fetchReprovados();
  }, [toast]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <MainLayout
      header={<PageHeader title="Relatos Reprovados" />}
    >
      <div className="p-4">
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
    </MainLayout>
  );
};

export default RelatosReprovadosPage;
