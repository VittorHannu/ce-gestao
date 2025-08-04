import React, { useState, useEffect } from 'react';
import { supabase } from '@/01-common/lib/supabase';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const RelatoDisplayDetails = ({ relato, responsibles = [] }) => {
  const [relatorName, setRelatorName] = useState('Carregando...');

  useEffect(() => {
    const fetchRelatorName = async () => {
      if (relato.is_anonymous) {
        setRelatorName('Anônimo');
        return;
      }

      if (relato.user_id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', relato.user_id)
          .single();

        if (error) {
          console.error('Erro ao buscar nome do relator:', error);
          setRelatorName('Erro ao carregar');
        } else if (data) {
          setRelatorName(data.full_name || 'Não informado');
        } else {
          setRelatorName('Não informado');
        }
      } else {
        setRelatorName('Não informado'); // Caso user_id seja nulo e não seja anônimo (situação inesperada)
      }
    };

    fetchRelatorName();
  }, [relato.is_anonymous, relato.user_id]);

  const formatFullName = (fullName) => {
    if (!fullName) return 'Não informado';
    const names = fullName.split(' ');
    if (names.length <= 3) return fullName;
    return `${names[0]} ${names[1]} ${names[2]}...`;
  };

  const getTreatmentStatusDisplay = () => {
    if (relato.data_conclusao_solucao) {
      return { text: 'Concluído', icon: CheckCircle, color: 'text-green-600' };
    } else if (relato.planejamento_cronologia_solucao) {
      return { text: 'Em Andamento', icon: Clock, color: 'text-orange-600' };
    } else {
      return { text: 'Sem Tratativa', icon: AlertCircle, color: 'text-red-600' };
    }
  };

  const { text: statusText, icon: StatusIcon, color: statusColor } = getTreatmentStatusDisplay();

  if (!relato) {
    return <p>Nenhum relato para exibir.</p>;
  }

  return (
    <div className="space-y-2 text-sm">
      <p><strong>Relator:</strong> {relatorName}</p>
      <p><strong>Código do Relato:</strong> {relato.relato_code || relato.id}</p>
      <p><strong>Local da Ocorrência:</strong> {relato.local_ocorrencia}</p>
      <p><strong>Data da Ocorrência:</strong> {new Date(relato.data_ocorrencia).toLocaleDateString()}</p>
      {relato.hora_aproximada_ocorrencia && <p><strong>Hora Aproximada:</strong> {relato.hora_aproximada_ocorrencia}</p>}
      <p><strong>Descrição:</strong> {relato.descricao}</p>
      <p><strong>Riscos Identificados:</strong> {relato.riscos_identificados}</p>
      {relato.danos_ocorridos && <p><strong>Danos Ocorridos:</strong> {relato.danos_ocorridos}</p>}
      {relato.planejamento_cronologia_solucao && <p><strong>Planejamento/Cronologia da Solução:</strong> {relato.planejamento_cronologia_solucao}</p>}
      {relato.data_conclusao_solucao && <p><strong>Data de Conclusão da Solução:</strong> {new Date(relato.data_conclusao_solucao).toLocaleDateString()}</p>}
      {responsibles.length > 0 && (
        <p><strong>Responsáveis:</strong> {responsibles.map(r => formatFullName(r.full_name)).join(', ')}</p>
      )}
      <div className="flex items-center">
        <StatusIcon className={`h-4 w-4 mr-2 ${statusColor}`} />
        <p><strong>Status:</strong> <span className={statusColor}>{statusText}</span></p>
      </div>
      <p><strong>Criado em:</strong> {new Date(relato.created_at).toLocaleString()}</p>
    </div>
  );
};

export default RelatoDisplayDetails;
