import React from 'react';
import { Button } from '@/01-shared/components/ui/button';

const FormActionButtons = ({
  onCancel,
  onConfirm,
  isConfirming,
  confirmText = 'Salvar',
  cancelText = 'Cancelar',
  confirmingText = 'Salvando...',
  confirmButtonType = 'button'
}) => {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={onCancel} disabled={isConfirming}>
        {cancelText}
      </Button>
      <Button type={confirmButtonType} onClick={onConfirm} disabled={isConfirming}>
        {isConfirming ? confirmingText : confirmText}
      </Button>
    </div>
  );
};

export default FormActionButtons;
