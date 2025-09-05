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

  return (
    <Table>
      <TableBody>
        {renderRow('Código do Relato', relato.relato_code || relato.id)}
        {renderRow('Status', (
          <div className="flex items-center">
            <StatusIcon className={`h-4 w-4 mr-2 ${statusColor}`} />
            <span className={statusColor}>{statusText}</span>
          </div>
        ))}
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
  );
};

export default RelatoDisplayDetails;
