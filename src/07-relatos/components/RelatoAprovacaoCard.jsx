import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/01-shared/components/ui/button';

const RelatoAprovacaoCard = ({ relato, onUpdateStatus }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAction = (e, status) => {
    e.stopPropagation(); // Impede a navegação para a página de detalhes
    onUpdateStatus(relato.id, status);
  };

  return (
    <div onClick={() => navigate(`/relatos/detalhes/${relato.id}`, { state: { from: location } })} className="p-4 border rounded-lg bg-white cursor-pointer hover:bg-gray-50">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-lg">{relato.relato_code}</p>
          <p className="text-sm text-gray-600">{relato.tipo_relato}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{new Date(relato.data_ocorrencia).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">{relato.local_ocorrencia}</p>
        </div>
      </div>
      <p className="mt-2 text-gray-800 line-clamp-2">{relato.descricao}</p>
      <div className="mt-4 flex justify-end space-x-2">
        <Button size="sm" variant="outline" onClick={(e) => handleAction(e, 'REPROVADO')}>Reprovar</Button>
        <Button size="sm" onClick={(e) => handleAction(e, 'APROVADO')}>Aprovar</Button>
      </div>
    </div>
  );
};

export default RelatoAprovacaoCard;