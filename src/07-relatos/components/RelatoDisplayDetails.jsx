import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableRow } from '@/01-shared/components/ui/table';
import { supabase } from '@/01-shared/lib/supabase';

const RelatoDisplayDetails = ({ 
  relato,
  responsibles = [],
  editedFields,
  onFieldChange,
  isDirty,
  fieldsToDisplay = [],
  fieldComponents = {},
  fieldLabels = {},
  canManageRelatos
}) => {
  const [relatorName, setRelatorName] = useState('Carregando...');

  useEffect(() => {
    const fetchRelatorName = async () => {
      if (relato.is_anonymous) {
        setRelatorName('Anônimo');
        return;
      }
      if (relato.user_id) {
        const { data, error } = await supabase.from('profiles').select('full_name').eq('id', relato.user_id).single();
        if (error) {
          console.error('Erro ao buscar nome do relator:', error);
          setRelatorName('Erro ao carregar');
        } else {
          setRelatorName(data?.full_name || 'Não informado');
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

  const getStatusText = (status) => {
    const statusMap = { APROVADO: 'Aprovado', PENDENTE: 'Pendente', REPROVADO: 'Reprovado' };
    return statusMap[status] || status;
  };

  if (!relato || !editedFields) {
    return <p>Carregando detalhes do relato...</p>;
  }

  const responsibleNames = responsibles.map(r => formatFullName(r.full_name)).join(', ') || null;

  const renderField = (fieldKey) => {
    const Component = fieldComponents[fieldKey];
    if (!Component) return null;
    return (
      <Component
        key={fieldKey}
        label={fieldLabels[fieldKey] || fieldKey}
        fieldKey={fieldKey}
        value={editedFields[fieldKey]}
        onFieldChange={onFieldChange}
        isDirty={isDirty}
        originalValue={relato[fieldKey]}
        canManage={canManageRelatos}
      />
    );
  };

  const renderStaticRow = (label, value) => (
    <TableRow key={label}>
      <TableCell className="whitespace-normal">
        <div>
          <p className="font-bold">{label}</p>
          <div className="break-words">{value === null || value === undefined || value === '' ? <span className="text-gray-500 italic">Não informado</span> : value}</div>
        </div>
      </TableCell>
    </TableRow>
  );

  const occurrenceFields = ['data_ocorrencia', 'hora_aproximada_ocorrencia', 'local_ocorrencia', 'descricao'];
  const analysisFields = ['riscos_identificados', 'danos_ocorridos'];
  const treatmentFields = ['planejamento_cronologia_solucao', 'data_conclusao_solucao'];

  const visibleOccurrenceFields = occurrenceFields.filter(f => fieldsToDisplay.includes(f));
  const visibleAnalysisFields = analysisFields.filter(f => fieldsToDisplay.includes(f));
  const visibleTreatmentFields = treatmentFields.filter(f => fieldsToDisplay.includes(f));

  const renderSection = (fields) => {
    if (fields.length === 0) return null;
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <Table>
          <TableBody>
            {fields.map(renderField)}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <Table>
          <TableBody>
            {renderStaticRow('Código do Relato', relato.relato_code || relato.id)}
            {fieldsToDisplay.includes('status') ? renderField('status') : renderStaticRow('Status de Aprovação', getStatusText(relato.status))}
            {renderStaticRow('Tipo de Relato', relato.tipo_relato)}
          </TableBody>
        </Table>
      </div>

      {renderSection(visibleOccurrenceFields)}
      {renderSection(visibleAnalysisFields)}

      <div className="p-4 bg-white rounded-lg shadow-sm">
        <Table>
          <TableBody>
            {renderStaticRow('Status da Tratativa', getTreatmentStatusText())}
            {renderStaticRow('Responsáveis', responsibleNames)}
            {visibleTreatmentFields.map(renderField)}
            {renderStaticRow('Concluído Sem Data', relato.concluido_sem_data ? 'Sim' : 'Não')}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 bg-white rounded-lg shadow-sm">
        <Table>
          <TableBody>
            {renderStaticRow('Relator', relatorName)}
            {renderStaticRow('Anônimo', relato.is_anonymous ? 'Sim' : 'Não')}
            {renderStaticRow('Data de Criação', new Date(relato.created_at).toLocaleString())}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RelatoDisplayDetails;
