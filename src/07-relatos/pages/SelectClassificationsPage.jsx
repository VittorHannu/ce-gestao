import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useClassificationManagement } from '../hooks/useClassificationManagement';
import { useClassifications } from '@/05-adm/hooks/useClassifications';
import { useRelatoClassifications } from '../hooks/useRelatoClassifications';
import { supabase } from '@/01-shared/lib/supabase';

import MainLayout from '@/01-shared/components/MainLayout';
import PageHeader from '@/01-shared/components/PageHeader';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import FormActionButtons from '@/01-shared/components/FormActionButtons';
import { Checkbox } from '@/01-shared/components/ui/checkbox';
import { Input } from '@/01-shared/components/ui/input';
import { useToast } from '@/01-shared/hooks/useToast';

// Fetch category details
const fetchCategory = async (categoryId) => {
  const { data, error } = await supabase
    .from('classification_categories')
    .select('name, table_name')
    .eq('id', categoryId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

const SelectClassificationsPage = () => {
  const { id: relatoId, categoryId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for selected items and search term
  const [selectedIds, setSelectedIds] = useState(null); // Initialize with null to prevent race conditions
  const [searchTerm, setSearchTerm] = useState('');

  // Data fetching
  const { data: category, isLoading: isLoadingCategory } = useQuery({
    queryKey: ['classification_category', categoryId],
    queryFn: () => fetchCategory(categoryId)
  });

  const tableName = category?.table_name;
  const { classifications: allClassifications, isLoading: isLoadingAll } = useClassifications(tableName);
  const { selectedClassifications, isLoading: isLoadingSelected } = useRelatoClassifications(relatoId);
  
  // Mutation hook
  const { updateCategoryClassifications, isUpdating } = useClassificationManagement();

  // Effect to initialize selected state once data is loaded, and only once.
  useEffect(() => {
    if (selectedIds === null && category && selectedClassifications) {
      const initialSelected = selectedClassifications
        .filter(sel => sel.classification_table === category.table_name)
        .map(sel => sel.classification_id);
      setSelectedIds(new Set(initialSelected));
    }
  }, [selectedClassifications, category, selectedIds]);

  const handleCheckboxChange = (id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    if (selectedIds === null) return; // Avoid saving if state is not initialized
    updateCategoryClassifications({ 
      relatoId, 
      categoryId, 
      classificationIds: Array.from(selectedIds) 
    }, {
      onSuccess: () => {
        toast({ title: 'Classificações salvas com sucesso!', type: 'success' });
        navigate(-1); // Go back to the previous page
      },
      onError: (error) => {
        toast({ title: `Erro ao salvar: ${error.message}`, type: 'error' });
      }
    });
  };

  const filteredClassifications = useMemo(() => {
    if (!allClassifications) return [];
    return allClassifications.filter(item => 
      item.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allClassifications, searchTerm]);

  const isLoading = isLoadingCategory || isLoadingAll || isLoadingSelected || selectedIds === null;

  return (
    <MainLayout header={<PageHeader title={category?.name || 'Selecionar'} />}>
      <div className="container mx-auto p-4 pb-24"> {/* Padding at bottom to avoid overlap with sticky footer */}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="mb-4">
              <Input 
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="border rounded-md">
              {filteredClassifications.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`flex items-center p-3 ${index < filteredClassifications.length - 1 ? 'border-b' : ''}`}>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      onCheckedChange={() => handleCheckboxChange(item.id)}
                      checked={selectedIds.has(item.id)}
                      className="h-5 w-5"
                      id={`checkbox-${item.id}`}
                    />
                    <label htmlFor={`checkbox-${item.id}`} className="cursor-pointer">{item.nome}</label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer for Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="container mx-auto">
          <FormActionButtons
            onConfirm={handleSave}
            onCancel={() => navigate(-1)}
            isConfirming={isUpdating}
            confirmText="Salvar"
            cancelText="Cancelar"
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default SelectClassificationsPage;