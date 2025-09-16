import React, { useState } from 'react';
import { Button } from '@/01-shared/components/ui/button';
import { TableCell, TableRow } from '@/01-shared/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/01-shared/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';

export default function EditableDateField({ label, fieldKey, value, onFieldChange, isDirty, originalValue }) {
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
}
