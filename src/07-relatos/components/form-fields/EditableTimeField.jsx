import React, { useState, useEffect } from 'react';
import { Button } from '@/01-shared/components/ui/button';
import { TableCell, TableRow } from '@/01-shared/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/01-shared/components/ui/dialog';

export default function EditableTimeField({ label, fieldKey, value, onFieldChange, isDirty, originalValue }) {
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
}
