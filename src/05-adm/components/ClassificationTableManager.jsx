import React, { useState, useEffect } from 'react';
import { useClassifications } from '../hooks/useClassifications';
import { Button } from '../../01-shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../01-shared/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../01-shared/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../01-shared/components/ui/dialog';
import { Input } from '../../01-shared/components/ui/input';
import { Label } from '../../01-shared/components/ui/label';
import { PlusCircle, Trash2 } from 'lucide-react';
import LoadingSpinner from '../../01-shared/components/LoadingSpinner';
import { useToast } from '../../01-shared/hooks/useToast';

const ClassificationTableManager = ({ tableName, title }) => {
  const { classifications, isLoading, isError, addMutation, updateMutation, deleteMutation } = useClassifications(tableName);
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

  const isMutating = addMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div className="text-red-500">Ocorreu um erro ao buscar os dados.</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classifications.map((item) => (
              <TableRow key={item.id} onClick={() => handleOpenDialog(item)} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium break-words whitespace-normal">{item.nome}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {classifications.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Nenhum item encontrado.</p>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentItem ? 'Editar Item' : 'Adicionar Novo Item'}</DialogTitle>
            <DialogDescription>
              {currentItem ? 'Edite as informações do item abaixo.' : 'Preencha as informações do novo item abaixo.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="col-span-3"
                  required
                  disabled={isMutating}
                />
              </div>
            </div>
            <DialogFooter className="flex justify-between w-full">
              <div>
                {currentItem && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isMutating}
                  >
                    {deleteMutation.isPending ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Excluir
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isMutating}>Cancelar</Button>
                <Button type="submit" disabled={isMutating}>
                  {addMutation.isPending || updateMutation.isPending ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
                  Salvar
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ClassificationTableManager;
