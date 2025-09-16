import React, { useState } from 'react';
import { Button } from '@/01-shared/components/ui/button';
import { TableCell, TableRow } from '@/01-shared/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/01-shared/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/01-shared/components/ui/select';
import { Label } from '@/01-shared/components/ui/label';
import { Textarea } from '@/01-shared/components/ui/textarea';

const statusOptions = {
  PENDENTE: 'Pendente',
  APROVADO: 'Aprovado',
  REPROVADO: 'Reprovado',
};

export default function EditableStatusField({ label, fieldKey, value, onFieldChange, isDirty, originalValue, canManage }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isReproveDialogOpen, setIsReproveDialogOpen] = useState(false);
  const [reproveReason, setReproveReason] = useState('');
  const isFieldDirty = isDirty && value !== originalValue;

  if (!canManage) {
    return (
      <TableRow>
        <TableCell>
          <p className="font-bold">{label}</p>
          <div>{statusOptions[value] || value}</div>
        </TableCell>
      </TableRow>
    );
  }

  const handleValueChange = (newValue) => {
    if (newValue === 'REPROVADO') {
      setIsReproveDialogOpen(true);
    } else {
      onFieldChange(fieldKey, newValue);
      setIsEditing(false);
    }
  };

  const handleReproveConfirm = () => {
    if (reproveReason.trim()) {
      onFieldChange(fieldKey, 'REPROVADO');
      onFieldChange('reproval_reason', reproveReason);
      setIsReproveDialogOpen(false);
      setReproveReason('');
      setIsEditing(false);
    }
  };

  const handleDialogClose = () => {
    setIsReproveDialogOpen(false);
    setReproveReason('');
  };

  return (
    <>
      <TableRow>
        <TableCell className="whitespace-normal">
          <div className={`transition-colors rounded-md ${(isEditing || isFieldDirty) ? 'p-2 bg-yellow-50' : ''}`}>
            <p className="font-bold">{label}</p>
            {isEditing ? (
              <Select
                value={value}
                onValueChange={handleValueChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mudar status..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusOptions).map(([val, lab]) => (
                    <SelectItem key={val} value={val}>
                      {lab}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="break-words cursor-pointer min-h-[24px]" onClick={() => setIsEditing(true)}>
                {statusOptions[value] || value}
              </div>
            )}
          </div>
        </TableCell>
      </TableRow>

      <Dialog open={isReproveDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reprovar Relato</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reproveReason">Motivo da Reprovação</Label>
            <Textarea
              id="reproveReason"
              value={reproveReason}
              onChange={(e) => setReproveReason(e.target.value)}
              placeholder="Descreva o motivo para reprovar este relato..."
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={handleDialogClose}>Cancelar</Button>
            <Button onClick={handleReproveConfirm} disabled={!reproveReason.trim()}>
              Confirmar Reprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
