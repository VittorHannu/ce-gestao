import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableRow } from '@/01-shared/components/ui/table';
import { supabase } from '@/01-shared/lib/supabase';
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
        setRelatorName('Não informado');
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
    } else if (relato.concluido_sem_data) {
      return { text: 'Concluído (sem data)', icon: CheckCircle, color: 'text-green-600' };
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

  const renderRow = (label, value) => {
    if (value === null || value === undefined || value === '') return null;
    return (
      <TableRow>
        <TableCell className="whitespace-normal">
          <div>
            <p className="font-bold">{label}</p>
            <div className="break-words">{value}</div>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  const getStatusDisplay = (status) => {
    switch (status) {
    case 'APROVADO':
      return { text: 'Aprovado', color: 'bg-green-100 text-green-800' };
    case 'PENDENTE':
      return { text: 'Pendente', color: 'bg-orange-100 text-orange-800' };
    case 'REPROVADO':
      return { text: 'Reprovado', color: 'bg-red-100 text-red-800' };
    default:
      return { text: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const statusDisplay = getStatusDisplay(relato.status);

  return (
    <div>
      <div className={`p-2 rounded-md text-center font-semibold mb-2 ${statusDisplay.color}`}>
        {statusDisplay.text}
      </div>
      <div className={`flex items-center justify-center p-2 rounded-md text-center font-semibold mb-4 ${statusColor.replace('text-', 'bg-').replace('-600', '-100')} ${statusColor}`}>
        <StatusIcon className="h-4 w-4 mr-2" />
        <span>{statusText}</span>
      </div>
      <Table>
        <TableBody>
          {renderRow('Código do Relato', relato.relato_code || relato.id)}
          {renderRow('Relator', relatorName)}
          {renderRow('Local da Ocorrência', relato.local_ocorrencia)}
          {renderRow('Data da Ocorrência', new Date(relato.data_ocorrencia).toLocaleDateString())}
          {renderRow('Hora Aproximada', relato.hora_aproximada_ocorrencia)}
          {renderRow('Descrição', relato.descricao)}
          {renderRow('Riscos Identificados', relato.riscos_identificados)}
          {renderRow('Danos Ocorridos', relato.danos_ocorridos)}
          {renderRow('Planejamento/Cronologia da Solução', relato.planejamento_cronologia_solucao)}
          {renderRow('Data de Conclusão da Solução', relato.data_conclusao_solucao ? new Date(relato.data_conclusao_solucao).toLocaleDateString() : null)}
          {renderRow('Responsáveis', responsibles && responsibles.length > 0 ? responsibles.map(r => formatFullName(r.full_name)).join(', ') : null)}
          {renderRow('Criado em', new Date(relato.created_at).toLocaleString())}
        </TableBody>
      </Table>
    </div>
  );
};

export default RelatoDisplayDetails;
