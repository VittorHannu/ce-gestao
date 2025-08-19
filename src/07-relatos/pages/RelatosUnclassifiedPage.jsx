import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '@/01-shared/components/MainLayout';
import BackButton from '@/01-shared/components/BackButton';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/01-shared/components/ui/select';

import { Button } from '@/01-shared/components/ui/button';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useUserProfile } from '@/04-profile/hooks/useUserProfile'; // New import
import RelatoDisplayDetails from '../components/RelatoDisplayDetails';
import { fetchUnclassifiedRelatos, updateRelatoType } from '../services/relatoStatsService'; // Using the new service functions

const _formatFullName = (fullName) => {
  if (!fullName) return 'Não informado';
  const names = fullName.split(' ');
  if (names.length <= 3) return fullName;
  return `${names[0]} ${names[1]} ${names[2]}...`;
};

const _getTreatmentStatusDisplay = (relato) => {
  if (relato.data_conclusao_solucao) {
    return { text: 'Concluído', icon: CheckCircle, color: 'text-green-600' };
  } else if (relato.planejamento_cronologia_solucao) {
    return { text: 'Em Andamento', icon: Clock, color: 'text-orange-600' };
  } else {
    return { text: 'Sem Tratativa', icon: AlertCircle, color: 'text-red-600' };
  }
};

const RelatosUnclassifiedPage = () => {
  const { showToast } = useOutletContext();
  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile(); // Get user profile
  const canManageRelatos = userProfile?.can_manage_relatos; // Get permission
  const [relatos, setRelatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classifyingId, setClassifyingId] = useState(null); // To track which relato is being classified
  const [selectedTypes, setSelectedTypes] = useState({}); // New state to hold selected types temporarily

  const loadRelatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUnclassifiedRelatos();
      setRelatos(data);
      // Initialize selectedTypes with current relato types (which should be null for unclassified)
      const initialSelectedTypes = {};
      data.forEach(relato => {
        initialSelectedTypes[relato.id] = relato.tipo_relato || 'CLEAR_SELECTION'; // Map null to CLEAR_SELECTION
      });
      setSelectedTypes(initialSelectedTypes);
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

  const handleSaveClassification = async (relatoId) => {
    const newType = selectedTypes[relatoId];
    // If newType is an empty string (from "Nenhum"), set it to null for the database
    const typeToSave = newType === 'CLEAR_SELECTION' ? null : newType;

    setClassifyingId(relatoId);
    try {
      await updateRelatoType(relatoId, typeToSave); // Use typeToSave
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
        <div className="w-full space-y-4">
          {relatos.map((relato) => (
            <div key={relato.id} className="p-4 border rounded-lg bg-white shadow-md">
              <h2 className="text-lg font-semibold text-gray-800">Relato ID: {relato.relato_code}</h2>
              <p className="text-gray-700">Local: {relato.local_ocorrencia}</p>
              <RelatoDisplayDetails relato={relato} />
              <div className="flex items-center gap-2 mt-4">
                <Select
                  onValueChange={(value) => setSelectedTypes(prev => ({ ...prev, [relato.id]: value }))}
                  value={selectedTypes[relato.id]} // Use selectedTypes state directly
                  disabled={classifyingId === relato.id || !canManageRelatos} // Disable if not managing relatos
                >
                  <SelectTrigger className="w-[180px] bg-gray-100">
                    <SelectValue placeholder="Classificar Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLEAR_SELECTION">Nenhum</SelectItem> {/* Simplified text */}
                    <SelectItem value="Fatal">Fatal</SelectItem>
                    <SelectItem value="Severo">Severo</SelectItem>
                    <SelectItem value="Acidente com afastamento">Acidente com afastamento</SelectItem>
                    <SelectItem value="Acidente sem afastamento">Acidente sem afastamento</SelectItem>
                    <SelectItem value="Primeiros socorros">Primeiros socorros</SelectItem>
                    <SelectItem value="Quase acidente">Quase acidente</SelectItem>
                    <SelectItem value="Condição insegura">Condição insegura</SelectItem>
                    <SelectItem value="Comportamento inseguro">Comportamento inseguro</SelectItem>
                  </SelectContent>
                </Select>
                {canManageRelatos && selectedTypes[relato.id] !== 'CLEAR_SELECTION' && ( // Only show save button if user can manage relatos and a classification is selected
                  <Button
                    onClick={() => handleSaveClassification(relato.id)}
                    disabled={classifyingId === relato.id || selectedTypes[relato.id] === relato.tipo_relato} // Adjusted disabled logic
                    className="ml-2"
                  >
                    {classifyingId === relato.id ? 'Salvando...' : 'Salvar'}
                  </Button>
                )}
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