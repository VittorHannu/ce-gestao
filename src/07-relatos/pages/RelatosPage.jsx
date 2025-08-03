import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/core/components/ui/button';

const RelatosPage = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Meus Relatos</h1>
        <Link to="/relatos/novo">
          <Button>Criar Novo Relato</Button>
        </Link>
      </div>
      {/* O conteúdo futuro da página de relatos virá aqui */}
      <p>Em breve, você poderá ver e gerenciar seus relatos aqui.</p>
    </div>
  );
};

export default RelatosPage;
