import React, { useState, useEffect } from 'react';
import EditModal from '@/01-shared/components/ui/EditModal';
import { Label } from '@/01-shared/components/ui/label';
import { Input } from '@/01-shared/components/ui/input';
import { Textarea } from '@/01-shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/01-shared/components/ui/select';
import { DatePicker } from '@/01-shared/components/ui/DatePicker';

import { TimePicker } from '@/01-shared/components/ui/TimePicker';

const FormFieldComponent = ({ field, value, onChange }) => {
  const { key, label, type = 'text', editable = true } = field;

  // Render non-editable fields as styled text, but with the standard Label.
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

  // Render editable fields based on their type
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
        <DatePicker value={value} onChange={(date) => onChange(key, date)} />
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
        initialState[field.key] = relato[field.key] || '';
      });
      setFields(initialState);
    }
  }, [relato, fieldsConfig, isOpen]);

  const handleChange = (fieldKey, value) => {
    setFields(prev => ({ ...prev, [fieldKey]: value }));
  };

  const handleSave = () => {
    const changes = {};
    for (const key in fields) {
      const originalValue = relato[key] || '';
      const currentValue = fields[key] || '';
      if (currentValue !== originalValue) {
        changes[key] = fields[key];
      }
    }

    if (Object.keys(changes).length > 0) {
      onSave(changes);
    } else {
      onClose();
    }
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      isSaving={isSaving}
      title={title}
    >
      <div className="space-y-4">
        {fieldsConfig && fieldsConfig.map(field => (
          <FormFieldComponent
            key={field.key}
            field={field}
            value={fields[field.key] || ''}
            onChange={handleChange}
          />
        ))}
      </div>
    </EditModal>
  );
};

export default SectionEditModal;