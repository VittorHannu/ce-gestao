import React, { useState, useEffect, useRef } from 'react';
import { Table, TableBody, TableCell, TableRow } from '@/01-shared/components/ui/table';
import { Textarea } from '@/01-shared/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/01-shared/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/01-shared/lib/supabase';
import useAutosizeTextArea from '@/01-shared/hooks/useAutosizeTextArea';
import { Button } from '@/01-shared/components/ui/button';

// Helper component for editable date fields
const EditableDateField = ({ label, fieldKey, value, onFieldChange, isDirty, originalValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isFieldDirty = isDirty && value !== originalValue;

  const handleDateSelect = (date) => {
    onFieldChange(fieldKey, date.toISOString().split('T')[0]); // formata para YYYY-MM-DD
    setIsOpen(false);
  };

  const handleClear = () => {
    onFieldChange(fieldKey, null);
    setIsOpen(false);
  };

  // Adiciona T00:00:00 para garantir que a data seja interpretada no fuso horário local
  const selectedDate = value ? new Date(`${value.split('T')[0]}T00:00:00`) : null;

  return (
    <TableRow>
      <TableCell className="whitespace-normal">
        <div className={`transition-colors rounded-md ${isFieldDirty ? 'p-2 bg-yellow-50' : ''}`}>
          <p className="font-bold">{label}</p>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <div className="break-words cursor-pointer min-h-[24px]">
                {selectedDate ? selectedDate.toLocaleDateString() : <span className="text-gray-500 italic">Não informado</span>}
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Selecione a data</DialogTitle>
              </DialogHeader>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
              />
              <div className="p-2 border-t">
                <Button variant="ghost" size="sm" className="w-full" onClick={handleClear}>
                  Limpar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </TableCell>
    </TableRow>
  );
};

const EditableTimeField = ({ label, fieldKey, value, onFieldChange, isDirty, originalValue }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setHour(h || '');
      setMinute(m || '');
    } else {
      setHour('');
      setMinute('');
    }
  }, [value]);

  const handleHourChange = (e) => {
    const newHour = e.target.value;
    setHour(newHour);
    if (newHour && minute) {
      onFieldChange(fieldKey, `${newHour}:${minute}`);
    }
  };

  const handleMinuteChange = (e) => {
    const newMinute = e.target.value;
    setMinute(newMinute);
    if (hour && newMinute) {
      onFieldChange(fieldKey, `${hour}:${newMinute}`);
    }
  };

  const handleClear = () => {
    onFieldChange(fieldKey, null);
    setIsEditing(false);
  };

  const isFieldDirty = isDirty && (value !== (originalValue || ''));

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <TableRow>
      <TableCell className="whitespace-normal">
        <div className={`transition-colors rounded-md ${(isFieldDirty) ? 'p-2 bg-yellow-50' : ''}`}>
          <p className="font-bold">{label}</p>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <div className="break-words cursor-pointer min-h-[24px]">
                {value || <span className="text-gray-500 italic">Não informado</span>}
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Selecione a hora</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-2">
                <select value={hour} onChange={handleHourChange} autoFocus className="w-20 bg-transparent focus:outline-none">
                  {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span>:</span>
                <select value={minute} onChange={handleMinuteChange} className="w-20 bg-transparent focus:outline-none">
                  {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <div className="flex-grow"></div>
                <Button variant="ghost" size="md" onClick={handleClear}>
                  Limpar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </TableCell>
    </TableRow>
  );
};

// Helper component for editable fields
const EditableField = ({ label, fieldKey, value, onFieldChange, isDirty, originalValue }) => {
  const [isEditing, setIsEditing] = useState(false);
  const textAreaRef = useRef(null);

  useAutosizeTextArea(textAreaRef.current, value);

  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      const textarea = textAreaRef.current;
      const length = textarea.value.length;
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(length, length);
      }, 0);
    }
  }, [isEditing]);

  const isFieldDirty = isDirty && (value !== (originalValue || ''));

  return (
    <TableRow>
      <TableCell className="whitespace-normal">
        <div className={`transition-colors rounded-md ${(isEditing || isFieldDirty) ? 'p-2 bg-yellow-50' : ''}`}>
          <p className="font-bold">{label}</p>
          {isEditing ? (
            <Textarea
              ref={textAreaRef}
              value={value}
              onChange={(e) => onFieldChange(fieldKey, e.target.value)}
              onBlur={() => setIsEditing(false)}
              autoFocus
              variant="unstyled"
              className="w-full bg-transparent focus:outline-none"
            />
          ) : (
            <div className="break-words cursor-pointer min-h-[24px]" onClick={() => setIsEditing(true)}>
              {value || <span className="text-gray-500 italic">Não informado</span>}
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};


const RelatoDisplayDetails = ({ relato, responsibles = [], editedFields, onFieldChange, isDirty }) => {
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
    const statusMap = { APROVADO: 'Aprovado', PENDENTE: 'Pendente', REPROVADO: 'Reprovado' };
    return statusMap[status] || status;
  };

  if (!relato || !editedFields) {
    return <p>Carregando detalhes do relato...</p>;
  }

  const responsibleNames = responsibles.map(r => formatFullName(r.full_name)).join(', ') || null;

  return (
    <Table>
      <TableBody>
        {renderRow('Código do Relato', relato.relato_code || relato.id)}
        {renderRow('Status de Aprovação', getStatusText(relato.status))}
        <EditableDateField 
          label="Data da Ocorrência" 
          fieldKey="data_ocorrencia" 
          value={editedFields.data_ocorrencia} 
          onFieldChange={onFieldChange} 
          isDirty={isDirty} 
          originalValue={relato.data_ocorrencia} 
        />
        <EditableTimeField 
          label="Hora Aproximada" 
          fieldKey="hora_aproximada_ocorrencia" 
          value={editedFields.hora_aproximada_ocorrencia} 
          onFieldChange={onFieldChange} 
          isDirty={isDirty} 
          originalValue={relato.hora_aproximada_ocorrencia} 
        />
        
        <EditableField label="Local da Ocorrência" fieldKey="local_ocorrencia" value={editedFields.local_ocorrencia} onFieldChange={onFieldChange} isDirty={isDirty} originalValue={relato.local_ocorrencia} />
        
        <TableRow className="border-b-0"><TableCell className="py-4"></TableCell></TableRow>
        
        <EditableField label="Descrição" fieldKey="descricao" value={editedFields.descricao} onFieldChange={onFieldChange} isDirty={isDirty} originalValue={relato.descricao} />
        <EditableField label="Riscos Identificados" fieldKey="riscos_identificados" value={editedFields.riscos_identificados} onFieldChange={onFieldChange} isDirty={isDirty} originalValue={relato.riscos_identificados} />
        <EditableField label="Danos Ocorridos" fieldKey="danos_ocorridos" value={editedFields.danos_ocorridos} onFieldChange={onFieldChange} isDirty={isDirty} originalValue={relato.danos_ocorridos} />
        
        <TableRow className="border-b-0"><TableCell className="py-4"></TableCell></TableRow>
        
        {renderRow('Status da Tratativa', getTreatmentStatusText())}
        {renderRow('Responsáveis', responsibleNames)}

        <EditableField label="Planejamento/Cronologia da Solução" fieldKey="planejamento_cronologia_solucao" value={editedFields.planejamento_cronologia_solucao} onFieldChange={onFieldChange} isDirty={isDirty} originalValue={relato.planejamento_cronologia_solucao} />

        <EditableDateField 
          label="Data de Conclusão da Solução" 
          fieldKey="data_conclusao_solucao" 
          value={editedFields.data_conclusao_solucao} 
          onFieldChange={onFieldChange} 
          isDirty={isDirty} 
          originalValue={relato.data_conclusao_solucao} 
        />
        {renderRow('Concluído Sem Data', relato.concluido_sem_data ? 'Sim' : 'Não')}
        <TableRow className="border-b-0"><TableCell className="py-4"></TableCell></TableRow>
        {renderRow('Tipo de Relato', relato.tipo_relato)}
        <TableRow className="border-b-0"><TableCell className="py-4"></TableCell></TableRow>
        <TableRow>
          <TableCell className="whitespace-normal">
            <div className="flex flex-col gap-2">
              <div>
                <p className="font-bold">Relator</p>
                <div className="break-words text-sm">{relatorName}</div>
              </div>
              <div>
                <p className="font-bold">Anônimo</p>
                <div className="break-words text-sm">{relato.is_anonymous ? 'Sim' : 'Não'}</div>
              </div>
              <div>
                <p className="font-bold">Data de Criação</p>
                <div className="break-words text-sm">{new Date(relato.created_at).toLocaleString()}</div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default RelatoDisplayDetails;