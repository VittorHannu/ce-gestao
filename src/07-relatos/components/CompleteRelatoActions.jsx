import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/01-shared/components/ui/card';
import { Button } from '@/01-shared/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/01-shared/components/ui/table';
import { Textarea } from '@/01-shared/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/01-shared/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import useAutosizeTextArea from '@/01-shared/hooks/useAutosizeTextArea';

// Helper components moved from RelatoDisplayDetails
export const EditableDateField = ({ label, fieldKey, value, onFieldChange, isDirty, originalValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isFieldDirty = isDirty && value !== originalValue;

  const handleDateSelect = (date) => {
    onFieldChange(fieldKey, date.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const handleClear = () => {
    onFieldChange(fieldKey, null);
    setIsOpen(false);
  };

  const selectedDate = value ? new Date(`${value.split('T')[0]}T00:00:00`) : null;

  return (
    <TableRow>
      <TableCell className="whitespace-normal">
        <div className={`transition-colors rounded-md ${isFieldDirty ? 'p-2 bg-yellow-50' : ''}`}>
          <p className="font-bold">{label}</p>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <div className="break-words cursor-pointer min-h-[24px]">
                {selectedDate ? selectedDate.toLocaleDateString() : <span className="text-gray-500 italic">Adicionar...</span>}
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Selecione a data</DialogTitle>
              </DialogHeader>
              <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} initialFocus />
              <div className="p-2 border-t">
                <Button variant="ghost" size="sm" className="w-full" onClick={handleClear}>Limpar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </TableCell>
    </TableRow>
  );
};

export const EditableTimeField = ({ label, fieldKey, value, onFieldChange, isDirty, originalValue }) => {
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
    if (newHour && minute) onFieldChange(fieldKey, `${newHour}:${minute}`);
  };

  const handleMinuteChange = (e) => {
    const newMinute = e.target.value;
    setMinute(newMinute);
    if (hour && newMinute) onFieldChange(fieldKey, `${hour}:${newMinute}`);
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
        <div className={`transition-colors rounded-md ${isFieldDirty ? 'p-2 bg-yellow-50' : ''}`}>
          <p className="font-bold">{label}</p>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <div className="break-words cursor-pointer min-h-[24px]">
                {value || <span className="text-gray-500 italic">Adicionar...</span>}
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Selecione a hora</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-2">
                <select value={hour} onChange={handleHourChange} autoFocus className="w-20 bg-transparent focus:outline-none">{hours.map(h => <option key={h} value={h}>{h}</option>)}</select>
                <span>:</span>
                <select value={minute} onChange={handleMinuteChange} className="w-20 bg-transparent focus:outline-none">{minutes.map(m => <option key={m} value={m}>{m}</option>)}</select>
                <div className="flex-grow"></div>
                <Button variant="ghost" size="md" onClick={handleClear}>Limpar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </TableCell>
    </TableRow>
  );
};

export const EditableField = ({ label, fieldKey, value, onFieldChange, isDirty, originalValue }) => {
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
              {value || <span className="text-gray-500 italic">Adicionar...</span>}
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

const fieldLabels = {
  data_ocorrencia: 'Data da Ocorrência',
  hora_aproximada_ocorrencia: 'Hora Aproximada',
  local_ocorrencia: 'Local da Ocorrência',
  descricao: 'Descrição',
  riscos_identificados: 'Riscos Identificados',
  danos_ocorridos: 'Danos Ocorridos',
  planejamento_cronologia_solucao: 'Planejamento da Solução',
  data_conclusao_solucao: 'Data de Conclusão',
};

const fieldComponents = {
  data_ocorrencia: EditableDateField,
  hora_aproximada_ocorrencia: EditableTimeField,
  local_ocorrencia: EditableField,
  descricao: EditableField,
  riscos_identificados: EditableField,
  danos_ocorridos: EditableField,
  planejamento_cronologia_solucao: EditableField,
  data_conclusao_solucao: EditableDateField,
};

const CompleteRelatoActions = ({ missingFields = [], editedFields, onFieldChange, isDirty, originalRelato }) => {
  if (missingFields.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Complete o Relato</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {missingFields.map((fieldKey) => {
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
                  originalValue={originalRelato[fieldKey]}
                />
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CompleteRelatoActions;
