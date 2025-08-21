import React, { useState, useEffect, useMemo } from 'react';

import BackButton from '@/01-shared/components/BackButton';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';

import { useDateFilter } from '@/01-shared/hooks/useDateFilter';
import { fetchRelatosCountByType } from '../services/relatoStatsService';
import { Link } from 'react-router-dom';
import { Button } from '@/01-shared/components/ui/button';
import { AlignLeft, AlignCenter, Filter, FilterX, Layers } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import DateFilterCard from '../components/DateFilterCard';

const RelatosByTypePage = () => {
  const { startDate, endDate } = useDateFilter();
  const [chartData, setChartData] = useState([]); // Renamed from rawData for clarity
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [barAlignment, setBarAlignment] = useState(() => sessionStorage.getItem('relatosByTypePage_barAlignment') || 'left');
  const [showZeroBars, setShowZeroBars] = useState(() => {
    const storedValue = sessionStorage.getItem('relatosByTypePage_showZeroBars');
    return storedValue !== null ? JSON.parse(storedValue) : false;
  });
  const [showDetailedView, setShowDetailedView] = useState(() => {
    const storedValue = sessionStorage.getItem('relatosByTypePage_showDetailedView');
    return storedValue !== null ? JSON.parse(storedValue) : false;
  });

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

  useEffect(() => {
    sessionStorage.setItem('relatosByTypePage_barAlignment', barAlignment);
  }, [barAlignment]);

  useEffect(() => {
    sessionStorage.setItem('relatosByTypePage_showZeroBars', JSON.stringify(showZeroBars));
  }, [showZeroBars]);

  useEffect(() => {
    sessionStorage.setItem('relatosByTypePage_showDetailedView', JSON.stringify(showDetailedView));
  }, [showDetailedView]);

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
    const dataMap = new Map(chartData.map(item => [normalizeString(item.name), item])); // Store the whole item

    // Create the final result array, ensuring all orderedTypes are present
    let result = orderedTypes.map(type => {
      const item = dataMap.get(normalizeString(type));
      return {
        name: type, // Keep original casing for display
        value: item ? item.value : 0,
        concluido: item ? item.concluido : 0,
        emAndamento: item ? item.emAndamento : 0,
        semTratativa: item ? item.semTratativa : 0
      };
    });

    // Add 'Sem Classificação' only if its value is greater than 0
    const semClassificacaoItem = dataMap.get(normalizeString('Sem Classificação'));
    if (semClassificacaoItem && semClassificacaoItem.value > 0) {
      result.push({
        name: 'Sem Classificação',
        value: semClassificacaoItem.value,
        concluido: semClassificacaoItem.concluido,
        emAndamento: semClassificacaoItem.emAndamento,
        semTratativa: semClassificacaoItem.semTratativa
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

      <div className="mb-4">
        <DateFilterCard />
      </div>

      <div className="p-6 border rounded-lg bg-white shadow-md">
        <div className="pb-4 mb-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Pirâmide de Bird</h2>
          <div className="flex justify-between w-full">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowZeroBars(!showZeroBars)}
                className={!showZeroBars ? 'bg-gray-200' : ''}
              >
                {showZeroBars ? <FilterX className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailedView(!showDetailedView)}
                className={showDetailedView ? 'bg-gray-200' : ''}
              >
                <Layers className="h-4 w-4" />
              </Button>
            </div>
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
                <AlignCenter className="h-4 w-4" />
              </Button>
            </div>
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
                    {item.value === 0 ? (
                      <span className="ml-2 text-gray-700 font-bold">0</span>
                    ) : (
                      showDetailedView ? (
                        <div className={`flex items-center w-full ${barAlignment === 'center' ? 'justify-center' : ''}`}> {/* Wrapper div for detailed view */}
                          <div
                            className={'h-8 rounded-sm flex items-center justify-center text-white font-bold overflow-hidden'}
                            style={{ width: `${barWidth}%`, maxWidth: '600px' }}
                          >
                            {/* Segmented Bar */}
                            {item.concluido > 0 && (
                              <Tooltip.Root delayDuration={300}>
                                <Tooltip.Trigger asChild>
                                  <div
                                    className="bg-green-500 h-full flex items-center justify-center"
                                    style={{ width: `${(item.concluido / item.value) * 100}%` }}
                                  >
                                    {((item.concluido / maxPyramidCount) * 600) > 20 && item.concluido}
                                  </div>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                  <Tooltip.Content className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg z-50">
                                    Concluídos: {item.concluido}
                                    <Tooltip.Arrow className="fill-current text-gray-800" />
                                  </Tooltip.Content>
                                </Tooltip.Portal>
                              </Tooltip.Root>
                            )}
                            {item.emAndamento > 0 && (
                              <Tooltip.Root delayDuration={300}>
                                <Tooltip.Trigger asChild>
                                  <div
                                    className="bg-amber-500 h-full flex items-center justify-center"
                                    style={{ width: `${(item.emAndamento / item.value) * 100}%` }}
                                  >
                                    {((item.emAndamento / maxPyramidCount) * 600) > 20 && item.emAndamento}
                                  </div>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                  <Tooltip.Content className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg z-50">
                                    Em Andamento: {item.emAndamento}
                                    <Tooltip.Arrow className="fill-current text-gray-800" />
                                  </Tooltip.Content>
                                </Tooltip.Portal>
                              </Tooltip.Root>
                            )}
                            {item.semTratativa > 0 && (
                              <Tooltip.Root delayDuration={300}>
                                <Tooltip.Trigger asChild>
                                  <div
                                    className="bg-red-500 h-full flex items-center justify-center"
                                    style={{ width: `${(item.semTratativa / item.value) * 100}%` }}
                                  >
                                    {((item.semTratativa / maxPyramidCount) * 600) > 20 && item.semTratativa}
                                  </div>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                  <Tooltip.Content className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg z-50">
                                    Sem Tratativa: {item.semTratativa}
                                    <Tooltip.Arrow className="fill-current text-gray-800" />
                                  </Tooltip.Content>
                                </Tooltip.Portal>
                              </Tooltip.Root>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className={`flex items-center w-full ${barAlignment === 'center' ? 'justify-center' : ''}`}> {/* Wrapper div for single bar view */}
                          <div
                            className={`h-8 rounded-sm ${backgroundColor} flex items-center justify-center text-white font-bold`}
                            style={{ width: `${barWidth}%`, maxWidth: '600px' }}
                          >
                            {((item.value / maxPyramidCount) * 600) > 20 && item.value}
                          </div>
                          {((item.value / maxPyramidCount) * 600) <= 20 && (
                            <span className="ml-2 text-gray-700 font-bold">{item.value}</span>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500">Nenhum dado disponível para a Pirâmide de Bird.</p>
        )}
        {showDetailedView && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
            <p className="font-semibold mb-2">Legenda de Status:</p>
            <div className="flex items-center mb-1">
              <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
              <span>Concluído</span>
            </div>
            <div className="flex items-center mb-1">
              <span className="w-4 h-4 bg-amber-500 rounded-full mr-2"></span>
              <span>Em Andamento</span>
            </div>
            <div className="flex items-center mb-1">
              <span className="w-4 h-4 bg-red-500 rounded-full mr-2"></span>
              <span>Sem Tratativa</span>
            </div>
          </div>
        )}
      </div>

      
    </div>
  );
};

export default RelatosByTypePage;