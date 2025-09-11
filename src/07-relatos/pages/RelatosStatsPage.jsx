import React from 'react';
import PageHeader from '@/01-shared/components/PageHeader';
import { Link } from 'react-router-dom'; // New import
import { BarChart } from 'lucide-react'; // New import
import MainLayout from '@/01-shared/components/MainLayout';

const RelatosStatsPage = () => {
  return (
    <MainLayout
      header={<PageHeader title="Gráficos e Estatísticas" />}
    >
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          <Link to="/relatos/estatisticas/tipo" className="block">
            <div className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-xl transition-shadow duration-300 h-full flex flex-col justify-between items-center text-center">
              <BarChart className="h-12 w-12 text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800">Relatos por Tipo</h2>
              <p className="text-sm text-gray-600 mt-2">Visualize a distribuição de relatos por categoria.</p>
            </div>
          </Link>
          {/* More links to other stats pages will go here */}
        </div>
      </div>
    </MainLayout>
  );
};

export default RelatosStatsPage;
