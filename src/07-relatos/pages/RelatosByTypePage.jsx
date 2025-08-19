import React, { useState, useEffect, useMemo } from 'react';
import MainLayout from '@/01-shared/components/MainLayout';
import BackButton from '@/01-shared/components/BackButton';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import DateFilter from '@/01-shared/components/DateFilter';
import { useDateFilter } from '@/01-shared/hooks/useDateFilter';
import { fetchRelatosCountByType } from '../services/relatoStatsService';
import { Link } from 'react-router-dom';
import { Button } from '@/01-shared/components/ui/button';
import { Tag } from 'lucide-react';

const RelatosByTypePage = () => {
  const { startDate, endDate } = useDateFilter();
  const [chartData, setChartData] = useState([]); // Renamed from rawData for clarity
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [barAlignment, setBarAlignment] = useState('center'); // New state for bar alignment

  useEffect(() => {
    const getChartData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchRelatosCountByType(startDate, endDate);
        setChartData(data); // Set the directly formatted data
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getChartData();
  }, [startDate, endDate]);

  const birdPyramidData = useMemo(() => {
    const orderedTypes = [
      'Fatal',
      'Severo',
      'Acidente com afastamento',
      'Acidentes sem afastamento',
      'Primeiros socorros',
      'quase acidente',
      'condição insegura',
      'comportamento inseguro'
    ];

    // Normalize function for comparison
    const normalizeString = (str) => str.toLowerCase().trim();

    // Map the fetched data to a temporary object for easy lookup, normalizing keys
    const dataMap = new Map(chartData.map(item => [normalizeString(item.name), item.value]));

    // Create the final result array, ensuring all orderedTypes are present
    const result = orderedTypes.map(type => ({
      name: type, // Keep original casing for display
      value: dataMap.get(normalizeString(type)) || 0 // Get value from map using normalized key
    }));

    return result;
  }, [chartData]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Erro ao carregar dados: {error.message}</div>;
  }

  const maxPyramidCount = Math.max(...birdPyramidData.map(d => d.value));

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Pirâmide de Bird</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBarAlignment('left')}
              className={barAlignment === 'left' ? 'bg-gray-200' : ''}
            >
              Esquerda
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBarAlignment('center')}
              className={barAlignment === 'center' ? 'bg-gray-200' : ''}
            >
              Centro
            </Button>
          </div>
        </div>
        {birdPyramidData.length > 0 && maxPyramidCount > 0 ? (
          <div className="flex flex-col items-center space-y-2">
            {birdPyramidData.map((item, index) => {
              const barWidth = (item.value / maxPyramidCount) * 100; // Percentage width
              const backgroundColor = index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : index === 2 ? 'bg-yellow-500' : 'bg-green-500';

              return (
                <div key={item.name} className={`w-full flex flex-col ${barAlignment === 'left' ? 'items-start' : 'items-center'}`}>
                  <p className="text-gray-700 font-medium mb-1">{item.name}</p>
                  <div className={`flex items-center ${barAlignment === 'left' ? 'justify-start' : 'justify-center'} w-full`}>
                    <div
                      className={`h-8 rounded-sm ${backgroundColor} flex items-center justify-center text-white font-bold`}
                      style={{ width: `${barWidth}%`, minWidth: '40px', maxWidth: '600px' }}
                    >{item.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500">Nenhum dado disponível para a Pirâmide de Bird.</p>
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