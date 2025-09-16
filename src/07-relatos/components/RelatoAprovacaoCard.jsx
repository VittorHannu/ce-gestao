import React from 'react';
import { Button } from '@/01-shared/components/ui/button';
import RelatoCard from './RelatoCard';

const RelatoAprovacaoCard = ({ relato, onUpdateStatus }) => {
  return (
    <div className="border p-4 rounded-lg shadow-sm bg-white">
      <RelatoCard relato={relato} />
      <div className="mt-4 flex space-x-2 justify-end">
        <Button variant="outline" size="sm" onClick={() => onUpdateStatus(relato.id, 'REPROVADO')}>
          Reprovar
        </Button>
        <Button size="sm" onClick={() => onUpdateStatus(relato.id, 'APROVADO')}>
          Aprovar
        </Button>
      </div>
    </div>
  );
};

export default RelatoAprovacaoCard;
