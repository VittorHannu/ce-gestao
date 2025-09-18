import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useClassifications } from '../hooks/useClassifications';
import { Button } from '../../01-shared/components/ui/button';
import { Card, CardContent, CardHeader } from '../../01-shared/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '../../01-shared/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../01-shared/components/ui/dialog';
import { Textarea } from '../../01-shared/components/ui/textarea';
import { Label } from '../../01-shared/components/ui/label';
import { PlusCircle, Trash2 } from 'lucide-react';
import LoadingSpinner from '../../01-shared/components/LoadingSpinner';
import { useToast } from '../../01-shared/hooks/useToast';

function SortableItem({ id, item, index, isReorderMode, onRowClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 'auto'
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      onClick={() => !isReorderMode && onRowClick(item)}
      className={`${!isReorderMode ? 'cursor-pointer hover:bg-muted/50' : ''} ${isDragging ? 'bg-muted' : ''}`}
    >
      <TableCell className="font-medium break-words whitespace-normal py-4">
        <div className="flex items-center">
          {isReorderMode ? (
            <span {...attributes} {...listeners} className="cursor-grab touch-none p-2 mr-2">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </span>
          ) : (
            <span className="mr-4 text-muted-foreground w-6 text-center">{index + 1}.</span>
          )}
          {item.nome}
        </div>
      </TableCell>
    </TableRow>
  );
}

const ClassificationTableManager = ({ tableName }) => {
  const {
    classifications,
    isLoading,
    isError,
    addMutation,
    updateMutation,
    deleteMutation,
    updateOrderMutation
  } = useClassifications(tableName);

  const [isReorderMode, setIsReorderMode] = useState(false);
  const [orderedItems, setOrderedItems] = useState([]);

  useEffect(() => {
    if (classifications) {
      setOrderedItems(classifications);
    }
  }, [classifications]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [itemName, setItemName] = useState('');
  const { toast } = useToast();

  const handleOpenDialog = (item = null) => {
    setCurrentItem(item);
    setItemName(item ? item.nome : '');
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    try {
      if (currentItem) {
        await updateMutation.mutateAsync({ id: currentItem.id, updates: { nome: itemName } });
      } else {
        await addMutation.mutateAsync({ nome: itemName });
      }
      const successMsg = currentItem ? 'Item atualizado com sucesso.' : 'Item adicionado com sucesso.';
      toast({ title: 'Sucesso', description: successMsg, variant: 'success' });
      handleCloseDialog();
    } catch (error) {
      if (error.message.includes('duplicate key value')) {
        toast({ title: 'Erro de Duplicidade', description: 'Este item já existe e não pode ser duplicado.', variant: 'destructive' });
      } else {
        toast({ title: 'Erro', description: `Não foi possível salvar o item: ${error.message}`, variant: 'destructive' });
      }
    }
  };

  const handleDelete = async () => {
    if (!currentItem) return;

    if (window.confirm('Tem certeza que deseja excluir este item? A ação não pode ser desfeita.')) {
      try {
        await deleteMutation.mutateAsync(currentItem.id);
        toast({ title: 'Sucesso', description: 'Item excluído com sucesso.', variant: 'success' });
        handleCloseDialog();
      } catch (error) {
        toast({ title: 'Erro', description: `Não foi possível excluir o item: ${error.message}`, variant: 'destructive' });
      }
    }
  };

  // Effect to reset form when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setCurrentItem(null);
      setItemName('');
    }
  }, [isDialogOpen]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with a tolerance of 5px of movement
      activationConstraint: {
        delay: 250,
        tolerance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
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
      ordem: index + 1
    }));

    try {
      await updateOrderMutation.mutateAsync({ tableName, items: itemsToUpdate });
      toast({ title: 'Sucesso', description: 'Ordem atualizada com sucesso.', variant: 'success' });
      setIsReorderMode(false);
    } catch (error) {
      toast({ title: 'Erro', description: `Não foi possível atualizar a ordem: ${error.message}`, variant: 'destructive' });
    }
  };

  const handleCancelReorder = () => {
    setOrderedItems(classifications);
    setIsReorderMode(false);
  };

  const isMutating = addMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const isOrderChanged = classifications && orderedItems && JSON.stringify(classifications.map(c => c.id)) !== JSON.stringify(orderedItems.map(o => o.id));

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div className="text-red-500">Ocorreu um erro ao buscar os dados.</div>;

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground text-center">
        Total de itens na categoria: {orderedItems.length}
      </p>
      <Card className="max-w-lg mx-auto">
        <CardHeader className="flex flex-row items-center justify-end">
          <div className="flex gap-2">
            {isReorderMode ? (
              <>
                <Button variant="outline" onClick={handleCancelReorder}>Cancelar</Button>
                {isOrderChanged && (
                  <Button onClick={handleSaveChanges}>
                    {updateOrderMutation.isPending ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
                    Salvar Ordem
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsReorderMode(true)}>Alterar Ordem</Button>
                <Button onClick={() => handleOpenDialog()}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Table>
              <TableBody>
                <SortableContext
                  items={orderedItems.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {orderedItems.map((item, index) => (
                    <SortableItem
                      key={item.id}
                      id={item.id}
                      item={item}
                      index={index}
                      isReorderMode={isReorderMode}
                      onRowClick={handleOpenDialog}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </DndContext>
          {orderedItems.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Nenhum item encontrado.</p>
          )}
        </CardContent>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-[calc(100vw-2rem)] rounded-lg">
            <DialogHeader>
              <DialogTitle>{currentItem ? 'Editar Item' : 'Adicionar Novo Item'}</DialogTitle>
              <DialogDescription>
                {currentItem ? 'Edite as informações do item abaixo.' : 'Preencha as informações do novo item abaixo.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 gap-4">
                  <Label htmlFor="name" className="text-right pt-2">
                    Nome
                  </Label>
                  <Textarea
                    id="name"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="col-span-3"
                    required
                    disabled={isMutating}
                    rows="3"
                  />
                </div>
              </div>
              <DialogFooter className="flex flex-col items-center gap-2 pt-4">
                <Button type="submit" disabled={isMutating} className="w-full">
                  {addMutation.isPending || updateMutation.isPending ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
                  Salvar
                </Button>
                {currentItem && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isMutating}
                    className="w-full"
                  >
                    {deleteMutation.isPending ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Excluir
                  </Button>
                )}
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </Card>
    </>
  );
};

export default ClassificationTableManager;
