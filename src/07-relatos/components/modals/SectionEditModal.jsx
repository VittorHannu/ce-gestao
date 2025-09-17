import React, { useState, useEffect } from 'react';
import EditModal from '@/01-shared/components/ui/EditModal';
import { Label } from '@/01-shared/components/ui/label';
import { Input } from '@/01-shared/components/ui/input';
import { Textarea } from '@/01-shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/01-shared/components/ui/select';
import { DatePicker } from '@/01-shared/components/ui/DatePicker';
import { Checkbox } from '@/01-shared/components/ui/checkbox';
import { TimePicker } from '@/01-shared/components/ui/TimePicker';

const FormFieldComponent = ({ field, value, onChange, disabled }) => {
  const { key, label, type = 'text', editable = true } = field;

  if (!editable) {
    return (
      <div className="space-y-2">
        <Label htmlFor={key}>{label}</Label>
        <div id={key} className="break-words text-sm p-2 rounded-md bg-gray-100 text-gray-700 w-full min-h-[40px] flex items-center">
          {value === null || value === undefined || value === '' ? (
            <span className="text-gray-400 italic">Não informado</span>
          ) : (
            String(value)
          )}
        </div>
      </div>
    );
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

const SectionEditModal = ({ isOpen, onClose, onSave, isSaving, title, relato, fieldsConfig }) => {
  const [fields, setFields] = useState({});

  useEffect(() => {
    if (relato && fieldsConfig) {
      const initialState = {};
      fieldsConfig.forEach(field => {
        initialState[field.key] = relato[field.key] === null ? '' : (relato[field.key] || '');
      });
      setFields(initialState);
    }
  }, [relato, fieldsConfig, isOpen]);

  const handleChange = (fieldKey, value) => {
    setFields(prev => {
      const newFields = { ...prev, [fieldKey]: value };
      if (fieldKey === 'concluido_sem_data' && value === true) {
        newFields.data_conclusao_solucao = null;
      }
      return newFields;
    });
  };

  const handleSave = () => {
    const changes = {};
    for (const key in fields) {
      const originalValue = relato[key] || '';
      const currentValue = fields[key] === null ? null : (fields[key] || '');

      if (currentValue !== originalValue) {
        changes[key] = fields[key] === '' ? null : fields[key];
      }
    }

    if (Object.keys(changes).length > 0) {
      onSave(changes);
    } else {
      onClose();
    }
  };

  const isConcluidoSemData = fields.concluido_sem_data === true;

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      isSaving={isSaving}
      title={title}
    >
      <div className="space-y-4">
        {fieldsConfig && fieldsConfig.map(field => {
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
    </EditModal>
  );
};

export default SectionEditModal;