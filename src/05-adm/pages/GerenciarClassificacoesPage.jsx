import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronRight, Loader2 } from 'lucide-react';
import { useClassificationCategories } from '../hooks/useClassificationCategories';
import { useClassificationCounts } from '../hooks/useClassificationCounts';
import { Button } from '../../01-shared/components/ui/button';
import { Card, CardContent, CardHeader } from '../../01-shared/components/ui/card';
import { Badge } from '../../01-shared/components/ui/badge';
import PageHeader from '../../01-shared/components/PageHeader';
import MainLayout from '../../01-shared/components/MainLayout';
import LoadingSpinner from '../../01-shared/components/LoadingSpinner';

function SortableLink({ id, category, count, isLoadingCount, isReorderMode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 'auto',
  };

  const linkContent = (
      <div className="flex items-center justify-between w-full p-4 group-hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
            {isReorderMode && (
            <span {...attributes} {...listeners} className="cursor-grab touch-none p-2 -ml-2">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
            </span>
            )}
            <span className="font-medium">{category.name}</span>
        </div>
        <div className="flex items-center gap-4">
            {isLoadingCount ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
            <Badge variant="secondary">{count}</Badge>
            )}
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
  );

  return (
    <div ref={setNodeRef} style={style} className="group bg-background">
        {isReorderMode ? (
            linkContent
        ) : (
            <Link to={`/adm/classificacoes/${category.table_name}`} className="w-full">
                {linkContent}
            </Link>
        )}
    </div>
  );
}


const GerenciarClassificacoesPage = () => {
  const { data: counts, isLoading: isLoadingCounts, isError: isErrorCounts } = useClassificationCounts();
  const { categories, isLoading: isLoadingCategories, isError: isErrorCategories, updateOrderMutation } = useClassificationCategories();

  const [isReorderMode, setIsReorderMode] = useState(false);
  const [orderedItems, setOrderedItems] = useState([]);

  useEffect(() => {
    if (categories) {
      setOrderedItems(categories);
    }
  }, [categories]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setOrderedItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveChanges = async () => {
    const itemsToUpdate = orderedItems.map((item, index) => ({
      id: item.id,
      ordem: index + 1,
    }));
    await updateOrderMutation.mutateAsync(itemsToUpdate);
    setIsReorderMode(false);
  };

  const handleCancelReorder = () => {
    setOrderedItems(categories);
    setIsReorderMode(false);
  };

  const isOrderChanged = categories && orderedItems && JSON.stringify(categories.map(c => c.id)) !== JSON.stringify(orderedItems.map(o => o.id));

  if (isLoadingCategories) return <LoadingSpinner />;
  if (isErrorCategories || isErrorCounts) return <div className="text-red-500">Ocorreu um erro ao buscar os dados.</div>;

  return (
    <MainLayout header={<PageHeader title="Gerenciar Classificações" />}>
      <p className="mb-6 text-muted-foreground">
        Selecione uma categoria para visualizar, adicionar, editar ou remover itens. Arraste para reordenar.
      </p>
      <Card className="max-w-lg mx-auto">
        <CardHeader className="flex flex-row items-center justify-end p-4 border-b">
            <div className="flex gap-2">
                {isReorderMode ? (
                <>
                    <Button variant="outline" onClick={handleCancelReorder}>Cancelar</Button>
                    {isOrderChanged && (
                    <Button onClick={handleSaveChanges} disabled={updateOrderMutation.isPending}>
                        {updateOrderMutation.isPending && <LoadingSpinner className="mr-2 h-4 w-4" />}
                        Salvar Ordem
                    </Button>
                    )}
                </>
                ) : (
                <Button variant="outline" onClick={() => setIsReorderMode(true)}>Alterar Ordem</Button>
                )}
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
              <div className="divide-y divide-border">
                {orderedItems.map((category) => {
                  const count = counts?.[category.table_name] ?? 0;
                  return (
                    <SortableLink
                      key={category.id}
                      id={category.id}
                      category={category}
                      count={count}
                      isLoadingCount={isLoadingCounts}
                      isReorderMode={isReorderMode}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default GerenciarClassificacoesPage;
