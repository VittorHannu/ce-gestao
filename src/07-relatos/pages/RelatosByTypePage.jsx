import React, { useState, useEffect } from 'react';
import MainLayout from '@/01-shared/components/MainLayout';
import BackButton from '@/01-shared/components/BackButton';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import DateFilter from '@/01-shared/components/DateFilter';
import { useDateFilter } from '@/01-shared/hooks/useDateFilter';
import { fetchRelatosCountByType } from '../services/relatoStatsService';
import BarChartComponent from '../components/charts/BarChartComponent';
import { Link } from 'react-router-dom'; // New import
import { Button } from '@/01-shared/components/ui/button'; // New import
import { Tag } from 'lucide-react'; // New import

const RelatosByTypePage = () => {
  const { startDate, endDate } = useDateFilter();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getChartData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchRelatosCountByType(startDate, endDate);
        setChartData(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getChartData();
  }, [startDate, endDate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Erro ao carregar dados: {error.message}</div>;
  }

  return (
    <MainLayout>
      <div className="flex items-center mb-4">
        <BackButton />
        <h1 className="text-2xl font-bold ml-4">Relatos por Tipo</h1>
      </div>

      <div className="mb-8">
        <DateFilter />
      </div>

      <div className="p-4 border rounded-lg bg-white shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Distribuição de Relatos por Tipo</h2>
        {chartData.length > 0 ? (
          <BarChartComponent data={chartData} /> // Changed component
        ) : (
          <p className="text-center text-gray-500">Nenhum dado disponível para o período selecionado.</p>
        )}
      </div>
    <div className="flex justify-center mt-8">
        <Link to="/relatos/nao-classificados" className="w-full max-w-xs">
          <Button variant="default" size="lg" className="w-full flex items-center justify-center space-x-2 shadow-none">
            <Tag className="h-5 w-5" />
            <span>Classificar Relatos Pendentes</span>
          </Button>
        </Link>
      </div>
    </MainLayout>
  );
};

export default RelatosByTypePage;