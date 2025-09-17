import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useRelatoManagement } from '../hooks/useRelatoManagement';
import MainLayout from '@/01-shared/components/MainLayout';
import PageHeader from '@/01-shared/components/PageHeader';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import { Button } from '@/01-shared/components/ui/button';
import { Label } from '@/01-shared/components/ui/label';
import { Input } from '@/01-shared/components/ui/input';
import { Textarea } from '@/01-shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/01-shared/components/ui/select';
import { DatePicker } from '@/01-shared/components/ui/DatePicker';
import { Checkbox } from '@/01-shared/components/ui/checkbox';
import { TimePicker } from '@/01-shared/components/ui/TimePicker';

// FormFieldComponent copied from SectionEditModal
const FormFieldComponent = ({ field, value, onChange, disabled }) => {
  const { key, label, type = 'text', editable = true } = field;

  if (!editable) {
    return null; // Don't render non-editable fields on the edit page
  }

  switch (type) {
  case 'textarea':
    return (
      <div className="space-y-2">
        <Label htmlFor={key}>{label}</Label>
        <Textarea id={key} value={value} onChange={(e) => onChange(key, e.target.value)} className="min-h-[100px] w-full" />
      </div>
    );
  case 'date':
    return (
      <div className="space-y-2">
        <Label htmlFor={key}>{label}</Label>
        <DatePicker value={value} onChange={(date) => onChange(key, date)} disabled={disabled} />
      </div>
    );
  case 'time':
    return (
      <div className="space-y-2">
        <Label htmlFor={key}>{label}</Label>
        <TimePicker value={value} onChange={(time) => onChange(key, time)} />
      </div>
    );
  case 'select':
    return (
      <div className="space-y-2">
        <Label htmlFor={key}>{label}</Label>
        <Select value={value} onValueChange={(newValue) => onChange(key, newValue)}>
          <SelectTrigger id={key} className="w-full">
            <SelectValue placeholder={`Selecione um ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map(option => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  case 'checkbox':
    return (
      <div className="pt-4">
        <Label htmlFor={key} className="flex items-center space-x-2 font-medium cursor-pointer">
          <Checkbox id={key} checked={value} onCheckedChange={(checked) => onChange(key, checked)} />
          <span>{label}</span>
        </Label>
      </div>
    );
  case 'text':
  default:
    return (
      <div className="space-y-2">
        <Label htmlFor={key}>{label}</Label>
        <Input id={key} value={value} onChange={(e) => onChange(key, e.target.value)} className="w-full" />
      </div>
    );
  }
};

const EditSectionPage = () => {
  const { id, sectionKey } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    relato,
    loading,
    error,
    isSaving,
    handleUpdateRelato,
    userProfile,
    isLoadingProfile
  } = useRelatoManagement(id);

  const [fields, setFields] = useState({});
  const canManageRelatos = userProfile?.can_manage_relatos;

  const sectionsConfig = useMemo(() => ({
    cabecalho: {
      title: 'Cabeçalho',
      fields: [
        { key: 'status', label: 'Status de Aprovação', editable: canManageRelatos, type: 'select', options: [
          { value: 'Pendente', label: 'Pendente' },
          { value: 'Aprovado', label: 'Aprovado' },
          { value: 'Reprovado', label: 'Reprovado' }
        ] }
      ]
    },
    ocorrencia: {
      title: 'Detalhes da Ocorrência',
      fields: [
        { key: 'data_ocorrencia', label: 'Data da Ocorrência', editable: canManageRelatos, type: 'date' },
        { key: 'hora_aproximada_ocorrencia', label: 'Hora Aproximada', editable: canManageRelatos, type: 'time' },
        { key: 'local_ocorrencia', label: 'Local da Ocorrência', editable: canManageRelatos, type: 'text' },
        { key: 'descricao', label: 'Descrição', editable: canManageRelatos, type: 'textarea' }
      ]
    },
    analise: {
      title: 'Análise',
      fields: [
        { key: 'riscos_identificados', label: 'Riscos Identificados', editable: canManageRelatos, type: 'textarea' },
        { key: 'danos_ocorridos', label: 'Danos Ocorridos', editable: canManageRelatos, type: 'textarea' }
      ]
    },
    tratativa: {
      title: 'Tratativa',
      fields: [
        { key: 'planejamento_cronologia_solucao', label: 'Planejamento da Solução', editable: canManageRelatos, type: 'textarea' },
        { key: 'concluido_sem_data', label: 'Concluído (sem data de conclusão)', editable: canManageRelatos, type: 'checkbox' },
        { key: 'data_conclusao_solucao', label: 'Data de Conclusão', editable: canManageRelatos, type: 'date' }
      ]
    }
  }), [canManageRelatos]);

  const sectionConfig = sectionsConfig[sectionKey];

  useEffect(() => {
    if (relato && sectionConfig) {
      const initialState = {};
      sectionConfig.fields.forEach(field => {
        if (field.editable) {
          initialState[field.key] = relato[field.key] === null ? '' : (relato[field.key] || '');
        }
      });
      setFields(initialState);
    }
  }, [relato, sectionConfig]);

  const handleChange = (fieldKey, value) => {
    setFields(prev => {
      const newFields = { ...prev, [fieldKey]: value };
      if (fieldKey === 'concluido_sem_data' && value === true) {
        newFields.data_conclusao_solucao = null;
      }
      return newFields;
    });
  };

  const handleSave = async () => {
    const changes = {};
    for (const key in fields) {
      const originalValue = relato[key] || '';
      const currentValue = fields[key] === null ? null : (fields[key] || '');

      if (currentValue !== originalValue) {
        changes[key] = fields[key] === '' ? null : fields[key];
      }
    }

    if (Object.keys(changes).length > 0) {
      const success = await handleUpdateRelato(changes, canManageRelatos);
      if (success) {
        navigate(`/relatos/detalhes/${id}`, { replace: true, state: location.state });
      }
    } else {
      navigate(`/relatos/detalhes/${id}`, { replace: true, state: location.state });
    }
  };

  if (loading || isLoadingProfile) return <LoadingSpinner />;
  if (error) return <div className="container p-4 text-red-500">{error.message || error}</div>;
  if (!relato) return <div className="container p-4">Relato não encontrado.</div>;
  if (!canManageRelatos) return <div className="container p-4">Você não tem permissão para editar este relato.</div>;
  if (!sectionConfig) return <div className="container p-4">Seção não encontrada.</div>;

  const isConcluidoSemData = fields.concluido_sem_data === true;

  return (
    <MainLayout header={<PageHeader title={`Editar Seção: ${sectionConfig.title}`} />}>
      <div className="container mx-auto p-4">
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="space-y-4">
            {sectionConfig.fields.map(field => {
              const isDisabled = field.key === 'data_conclusao_solucao' && isConcluidoSemData;
              return (
                <FormFieldComponent
                  key={field.key}
                  field={field}
                  value={fields[field.key] || ''}
                  onChange={handleChange}
                  disabled={isDisabled}
                />
              );
            })}
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <Button variant="outline" onClick={() => navigate(`/relatos/detalhes/${id}`, { replace: true, state: location.state })} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default EditSectionPage;
