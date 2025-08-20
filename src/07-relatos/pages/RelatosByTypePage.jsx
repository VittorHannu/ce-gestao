import React, { useState, useEffect, useMemo } from 'react';

import BackButton from '@/01-shared/components/BackButton';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';

import { useDateFilter } from '@/01-shared/hooks/useDateFilter';
import { fetchRelatosCountByType } from '../services/relatoStatsService';
import { Link } from 'react-router-dom';
import { Button } from '@/01-shared/components/ui/button';
import { AlignLeft, AlignCenterHorizontal } from 'lucide-react';
import DateFilterCard from '../components/DateFilterCard';

const RelatosByTypePage = () => {
  const { startDate, endDate } = useDateFilter();
  const [chartData, setChartData] = useState([]); // Renamed from rawData for clarity
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [barAlignment, setBarAlignment] = useState('left'); // New state for bar alignment
  const [showZeroBars, setShowZeroBars] = useState(true); // New state for showing/hiding zero bars

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
      'Acidente sem afastamento',
      'Primeiros socorros',
      'Quase acidente',
      'Condição insegura',
      'Comportamento inseguro'
    ];

    // Normalize function for comparison
    const normalizeString = (str) => str.toLowerCase().trim();

    // Map the fetched data to a temporary object for easy lookup, normalizing keys
    const dataMap = new Map(chartData.map(item => [normalizeString(item.name), item.value]));

    // Create the final result array, ensuring all orderedTypes are present
    let result = orderedTypes.map(type => ({
      name: type, // Keep original casing for display
      value: dataMap.get(normalizeString(type)) || 0 // Get value from map using normalized key
    }));

    // Add 'Sem Classificação' only if its value is greater than 0
    const semClassificacaoValue = dataMap.get(normalizeString('Sem Classificação')) || 0;
    if (semClassificacaoValue > 0) {
      result.push({
        name: 'Sem Classificação',
        value: semClassificacaoValue
      });
    }

    // Apply filtering based on showZeroBars state
    if (!showZeroBars) {
      result = result.filter(item => item.value > 0);
    }

    return result;
  }, [chartData, showZeroBars]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Erro ao carregar dados: {error.message}</div>;
  }

  const maxPyramidCount = Math.max(...birdPyramidData.map(d => d.value));

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <BackButton />
        <h1 className="text-2xl font-bold ml-4">Relatos por Tipo</h1>
      </div>

      <div className="mb-8">
        <DateFilterCard />
      </div>

      <div className="p-6 border rounded-lg bg-white shadow-md">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Pirâmide de Bird</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBarAlignment('left')}
              className={barAlignment === 'left' ? 'bg-gray-200' : ''}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBarAlignment('center')}
              className={barAlignment === 'center' ? 'bg-gray-200' : ''}
            >
              <AlignCenterHorizontal className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowZeroBars(!showZeroBars)}
              className={showZeroBars ? 'bg-gray-200' : ''}
            >
              {showZeroBars ? 'Esconder Zeros' : 'Mostrar Zeros'}
            </Button>
          </div>
        </div>
        {birdPyramidData.length > 0 && maxPyramidCount > 0 ? (
          <div className="flex flex-col items-center space-y-2">
            {birdPyramidData.map((item, _index) => {
              const barWidth = (item.value / maxPyramidCount) * 100; // Percentage width
              const colorMap = {
                'Fatal': 'bg-black',
                'Severo': 'bg-red-600',
                'Acidente com afastamento': 'bg-red-500',
                'Acidente sem afastamento': 'bg-orange-500',
                'Primeiros socorros': 'bg-yellow-500',
                'Quase acidente': 'bg-yellow-500',
                'Condição insegura': 'bg-yellow-400',
                'Comportamento inseguro': 'bg-yellow-400',
                'Sem Classificação': 'bg-gray-400'
              };

              const backgroundColor = colorMap[item.name] || 'bg-green-500'; // Default if not found

              return (
                <Link
                  key={item.name}
                  to={`/relatos/lista?tipo_relato=${encodeURIComponent(item.name)}&startDate=${startDate}&endDate=${endDate}`}
                  className={`w-full flex flex-col ${barAlignment === 'left' ? 'items-start' : 'items-center'} cursor-pointer`}
                >
                  <p className="text-gray-700 font-medium mb-1">{item.name}</p>
                  <div className={`flex items-center ${barAlignment === 'left' ? 'justify-start' : 'justify-center'} w-full`}>
                    <div
                      className={`h-8 rounded-sm ${backgroundColor} flex items-center justify-center text-white font-bold`}
                      style={{ width: `${barWidth}%`, minWidth: '40px', maxWidth: '600px' }}
                    >{item.value}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500">Nenhum dado disponível para a Pirâmide de Bird.</p>
        )}
      </div>

      
    </div>
  );
};

export default RelatosByTypePage;