import React, { useState, useEffect } from 'react';
import EditModal from '@/01-shared/components/ui/EditModal';
import { Label } from '@/01-shared/components/ui/label';
import { Textarea } from '@/01-shared/components/ui/textarea';

const EditDescriptionModal = ({ isOpen, onClose, onSave, isSaving, relato }) => {
  const [fields, setFields] = useState({
    descricao: '',
    riscos_identificados: '',
    danos_ocorridos: ''
  });

  useEffect(() => {
    if (relato) {
      setFields({
        descricao: relato.descricao || '',
        riscos_identificados: relato.riscos_identificados || '',
        danos_ocorridos: relato.danos_ocorridos || ''
      });
    }
  }, [relato, isOpen]);

  const handleChange = (field, value) => {
    setFields(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const changes = {};
    if (fields.descricao !== (relato.descricao || '')) {
      changes.descricao = fields.descricao;
    }
    if (fields.riscos_identificados !== (relato.riscos_identificados || '')) {
      changes.riscos_identificados = fields.riscos_identificados;
    }
    if (fields.danos_ocorridos !== (relato.danos_ocorridos || '')) {
      changes.danos_ocorridos = fields.danos_ocorridos;
    }

    if (Object.keys(changes).length > 0) {
      onSave(changes);
    }
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      isSaving={isSaving}
      title="Editar Detalhes da Ocorrência"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            value={fields.descricao}
            onChange={(e) => handleChange('descricao', e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="riscos_identificados">Riscos Identificados</Label>
          <Textarea
            id="riscos_identificados"
            value={fields.riscos_identificados}
            onChange={(e) => handleChange('riscos_identificados', e.target.value)}
            className="min-h-[80px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="danos_ocorridos">Danos Ocorridos</Label>
          <Textarea
            id="danos_ocorridos"
            value={fields.danos_ocorridos}
            onChange={(e) => handleChange('danos_ocorridos', e.target.value)}
            className="min-h-[80px]"
          />
        </div>
      </div>
    </EditModal>
  );
};

export default EditDescriptionModal;
