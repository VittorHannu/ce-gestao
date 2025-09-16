import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableRow } from '@/01-shared/components/ui/table';
import { supabase } from '@/01-shared/lib/supabase';
import EditableField from './EditableField';
import EditableDateField from './EditableDateField';
import EditableTimeField from './EditableTimeField';
import EditableStatusField from './EditableStatusField';

const fieldLabels = {
  status: 'Status de Aprovação',
  data_ocorrencia: 'Data da Ocorrência',
  hora_aproximada_ocorrencia: 'Hora Aproximada',
  local_ocorrencia: 'Local da Ocorrência',
  descricao: 'Descrição',
  riscos_identificados: 'Riscos Identificados',
  danos_ocorridos: 'Danos Ocorridos',
  planejamento_cronologia_solucao: 'Planejamento da Solução',
  data_conclusao_solucao: 'Data de Conclusão'
};

const fieldComponents = {
  status: EditableStatusField,
  data_ocorrencia: EditableDateField,
  hora_aproximada_ocorrencia: EditableTimeField,
  local_ocorrencia: EditableField,
  descricao: EditableField,
  riscos_identificados: EditableField,
  danos_ocorridos: EditableField,
  planejamento_cronologia_solucao: EditableField,
  data_conclusao_solucao: EditableDateField
};

const RelatoForm = ({ relato, editedFields, onFieldChange, isDirty, canManageRelatos, responsibles = [] }) => {
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

  const responsibleNames = responsibles.map(r => formatFullName(r.full_name)).join(', ') || null;

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <Table>
          <TableBody>
            {renderStaticRow('Código do Relato', relato.relato_code || relato.id)}
            {renderField('status')}
            {renderStaticRow('Tipo de Relato', relato.tipo_relato)}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-2 px-4">Detalhes da Ocorrência</h3>
        <Table>
          <TableBody>
            {renderField('data_ocorrencia')}
            {renderField('hora_aproximada_ocorrencia')}
            {renderField('local_ocorrencia')}
            {renderField('descricao')}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-2 px-4">Análise</h3>
        <Table>
          <TableBody>
            {renderField('riscos_identificados')}
            {renderField('danos_ocorridos')}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-2 px-4">Tratativa</h3>
        <Table>
          <TableBody>
            {renderStaticRow('Status da Tratativa', getTreatmentStatusText())}
            {renderStaticRow('Responsáveis', responsibleNames)}
            {renderField('planejamento_cronologia_solucao')}
            {renderField('data_conclusao_solucao')}
            {renderStaticRow('Concluído Sem Data', relato.concluido_sem_data ? 'Sim' : 'Não')}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-2 px-4">Informações Adicionais</h3>
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

export default RelatoForm;
