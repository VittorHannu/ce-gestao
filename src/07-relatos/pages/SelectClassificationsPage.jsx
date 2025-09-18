import React, { useState, useEffect } from 'react';
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
import { Label } from '@/01-shared/components/ui/label';
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

  // State for selected items
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Data fetching
  const { data: category, isLoading: isLoadingCategory } = useQuery({
    queryKey: ['classification_category', categoryId],
    queryFn: () => fetchCategory(categoryId),
  });

  const tableName = category?.table_name;
  const { classifications: allClassifications, isLoading: isLoadingAll } = useClassifications(tableName);
  const { selectedClassifications, isLoading: isLoadingSelected } = useRelatoClassifications(relatoId);
  
  // Mutation hook
  const { updateCategoryClassifications, isUpdating } = useClassificationManagement();

  // Effect to initialize selected state once data is loaded
  useEffect(() => {
    if (category && selectedClassifications) {
      const initialSelected = selectedClassifications
        .filter(sel => sel.classification_table === category.table_name)
        .map(sel => sel.classification_id);
      setSelectedIds(new Set(initialSelected));
    }
  }, [selectedClassifications, category]);

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

  const isLoading = isLoadingCategory || isLoadingAll || isLoadingSelected;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <MainLayout header={<PageHeader title={category?.name || 'Selecionar'} />}>
      <div className="container mx-auto p-4">
        <div className="p-4 bg-white rounded-lg shadow-sm space-y-4">
          {allClassifications?.map(item => (
            <Label 
              key={item.id} 
              htmlFor={`item-${item.id}`}
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors duration-150 ease-in-out"
            >
              <Checkbox
                id={`item-${item.id}`}
                checked={selectedIds.has(item.id)}
                onCheckedChange={() => handleCheckboxChange(item.id)}
              />
              <span className="text-base font-normal">
                {item.nome}
              </span>
            </Label>
          ))}
        </div>
        <FormActionButtons
          onConfirm={handleSave}
          onCancel={() => navigate(-1)}
          isConfirming={isUpdating}
          confirmText="Salvar"
          cancelText="Cancelar"
        />
      </div>
    </MainLayout>
  );
};

export default SelectClassificationsPage;