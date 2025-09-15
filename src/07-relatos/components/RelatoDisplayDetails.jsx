import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableRow } from '@/01-shared/components/ui/table';
import { supabase } from '@/01-shared/lib/supabase';

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

  const getTreatmentStatusText = () => {
    if (relato.data_conclusao_solucao) return 'Concluído';
    if (relato.concluido_sem_data) return 'Concluído (sem data)';
    if (relato.planejamento_cronologia_solucao) return 'Em Andamento';
    return 'Sem Tratativa';
  };

  if (!relato) {
    return <p>Nenhum relato para exibir.</p>;
  }

  const renderRow = (label, value) => {
    const displayValue = value === null || value === undefined || value === '' ? <span className="text-gray-500 italic">Não informado</span> : value;
    return (
      <TableRow>
        <TableCell className="whitespace-normal">
          <div>
            <p className="font-bold">{label}</p>
            <div className="break-words">{displayValue}</div>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  const getStatusText = (status) => {
    const statusMap = {
      APROVADO: 'Aprovado',
      PENDENTE: 'Pendente',
      REPROVADO: 'Reprovado'
    };
    return statusMap[status] || status;
  };

  const responsibleNames = responsibles.map(r => formatFullName(r.full_name)).join(', ') || null;

  return (
    <Table>
      <TableBody>
        {renderRow('Código do Relato', relato.relato_code || relato.id)}
        {renderRow('Data da Ocorrência', new Date(relato.data_ocorrencia).toLocaleDateString())}
        {renderRow('Hora Aproximada', relato.hora_aproximada_ocorrencia)}
        {renderRow('Local da Ocorrência', relato.local_ocorrencia)}
        <TableRow className="border-b-0"><TableCell className="py-4"></TableCell></TableRow>
        {renderRow('Descrição', relato.descricao)}
        {renderRow('Riscos Identificados', relato.riscos_identificados)}
        {renderRow('Danos Ocorridos', relato.danos_ocorridos)}
        <TableRow className="border-b-0"><TableCell className="py-4"></TableCell></TableRow>
        {renderRow('Status da Tratativa', getTreatmentStatusText())}
        {renderRow('Responsáveis', responsibleNames)}
        {renderRow('Planejamento/Cronologia da Solução', relato.planejamento_cronologia_solucao)}
        {renderRow('Data de Conclusão da Solução', relato.data_conclusao_solucao ? new Date(relato.data_conclusao_solucao).toLocaleDateString() : null)}
        {renderRow('Concluído Sem Data', relato.concluido_sem_data ? 'Sim' : 'Não')}
        <TableRow className="border-b-0"><TableCell className="py-4"></TableCell></TableRow>
        {renderRow('Tipo de Relato', relato.tipo_relato)}
        <TableRow className="border-b-0"><TableCell className="py-4"></TableCell></TableRow>
        {renderRow('Relator', relatorName)}
        {renderRow('Anônimo', relato.is_anonymous ? 'Sim' : 'Não')}
        {renderRow('Data de Criação', new Date(relato.created_at).toLocaleString())}
        {renderRow('Status de Aprovação', getStatusText(relato.status))}
      </TableBody>
    </Table>
  );
};

export default RelatoDisplayDetails;
