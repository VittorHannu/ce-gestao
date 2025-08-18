import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '@/01-shared/components/MainLayout';
import BackButton from '@/01-shared/components/BackButton';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/01-shared/components/ui/select';
import { Button } from '@/01-shared/components/ui/button';
import { useOutletContext } from 'react-router-dom';
import { useUserProfile } from '@/04-profile/hooks/useUserProfile'; // New import
import { fetchUnclassifiedRelatos, updateRelatoType } from '../services/relatoStatsService'; // Using the new service functions

const RelatosUnclassifiedPage = () => {
  const { showToast } = useOutletContext();
  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile(); // Get user profile
  const canManageRelatos = userProfile?.can_manage_relatos; // Get permission
  const [relatos, setRelatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classifyingId, setClassifyingId] = useState(null); // To track which relato is being classified

  const loadRelatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUnclassifiedRelatos();
      setRelatos(data);
    } catch (err) {
      setError(err);
      showToast(`Erro ao carregar relatos não classificados: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadRelatos();
  }, [loadRelatos]);

  const handleClassifyRelato = async (relatoId, newType) => {
    setClassifyingId(relatoId);
    try {
      await updateRelatoType(relatoId, newType);
      showToast('Relato classificado com sucesso!', 'success');
      loadRelatos(); // Reload the list to remove the classified relato
    } catch (err) {
      showToast(`Erro ao classificar relato: ${err.message}`, 'error');
    } finally {
      setClassifyingId(null);
    }
  };

  if (loading || isLoadingProfile) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Erro: {error.message}</div>;
  }

  return (
    <MainLayout>
      <div className="flex items-center mb-4">
        <BackButton />
        <h1 className="text-2xl font-bold ml-4">Relatos Não Classificados</h1>
      </div>

      {relatos.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">Não há relatos não classificados no momento.</p>
      ) : (
        <div className="space-y-4">
          {relatos.map((relato) => (
            <div key={relato.id} className="p-4 border rounded-lg bg-white shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Relato ID: {relato.id.substring(0, 8)}...</h2>
              <p className="text-gray-700 mb-2">Local: {relato.local_ocorrencia}</p>
              <p className="text-gray-700 mb-4">Descrição: {relato.descricao.substring(0, 100)}...</p>

              <div className="flex items-center gap-2">
                <Select
                  onValueChange={(value) => handleClassifyRelato(relato.id, value)}
                  value={relato.tipo_relato || ''} // Ensure controlled component
                  disabled={classifyingId === relato.id || !canManageRelatos} // Disable if not managing relatos
                >
                  <SelectTrigger className="w-[180px] bg-gray-100">
                    <SelectValue placeholder="Classificar Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Comportamento inseguro">Comportamento inseguro</SelectItem>
                    <SelectItem value="Condição Insegura">Condição Insegura</SelectItem>
                    <SelectItem value="Quase Acidente">Quase Acidente</SelectItem>
                    <SelectItem value="Acidente">Acidente</SelectItem>
                    <SelectItem value="Acidente fatal">Acidente fatal</SelectItem>
                  </SelectContent>
                </Select>
                {classifyingId === relato.id && <LoadingSpinner />}
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
};

export default RelatosUnclassifiedPage;