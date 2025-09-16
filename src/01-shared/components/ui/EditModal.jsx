import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/01-shared/components/ui/dialog';
import { Button } from '@/01-shared/components/ui/button';

const EditModal = ({
  isOpen,
  onClose,
  title,
  children,
  onSave,
  isSaving,
  saveButtonText = 'Salvar Alterações',
  cancelButtonText = 'Cancelar',
}) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {children}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {cancelButtonText}
            </Button>
          </DialogClose>
          <Button type="button" onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Salvando...' : saveButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditModal;
