import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardFooter } from '@/01-shared/components/ui/card';
import { Calendar, MapPin, User } from 'lucide-react';
import { Button } from '@/01-shared/components/ui/button';

const RelatoAprovacaoCard = ({ relato, onUpdateStatus }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAction = (e, status) => {
    e.stopPropagation(); // Impede a navegação para a página de detalhes
    onUpdateStatus(relato.id, status);
  };

  const handleCardClick = () => {
    navigate(`/relatos/detalhes/${relato.id}`, { state: { from: location } });
  };

  return (
    <Card
      className="w-full bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
          <span className="text-sm font-semibold text-gray-600">Pendente</span>
        </div>
        <h2 className="text-lg font-bold text-gray-800 mt-2">{relato.relato_code}</h2>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span>{new Date(relato.data_ocorrencia).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span>{relato.local_ocorrencia}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4 flex-shrink-0" />
          <span>{relato.is_anonymous ? 'Anônimo' : relato.user_full_name || 'Usuário desconhecido'}</span>
        </div>
        <div>
          <h4 className="font-bold text-gray-700">Descrição do Evento</h4>
          <p className="text-gray-600 text-sm mt-1 line-clamp-3">{relato.descricao}</p>
        </div>
      </CardContent>

      <CardFooter className="p-4 border-t border-gray-200 flex justify-end space-x-2">
        <Button size="sm" variant="outline" onClick={(e) => handleAction(e, 'REPROVADO')}>Reprovar</Button>
        <Button size="sm" onClick={(e) => handleAction(e, 'APROVADO')}>Aprovar</Button>
      </CardFooter>
    </Card>
  );
};

export default RelatoAprovacaoCard;
