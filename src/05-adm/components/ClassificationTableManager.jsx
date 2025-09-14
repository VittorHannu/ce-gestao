import React, { useState } from 'react';
import { useClassifications } from '../hooks/useClassifications';
import { Button } from '../../01-shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../01-shared/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../01-shared/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../01-shared/components/ui/dialog';
import { Input } from '../../01-shared/components/ui/input';
import { Label } from '../../01-shared/components/ui/label';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import LoadingSpinner from '../../01-shared/components/LoadingSpinner';
import { useToast } from '../../01-shared/hooks/useToast';

const ClassificationTableManager = ({ tableName, title }) => {
  const { classifications, isLoading, isError, addClassification, updateClassification, deleteClassification } = useClassifications(tableName);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [itemName, setItemName] = useState('');
  const { showToast } = useToast();

  const handleOpenDialog = (item = null) => {
    setCurrentItem(item);
    setItemName(item ? item.nome : '');
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentItem(null);
    setItemName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    try {
      if (currentItem) {
        await updateClassification({ id: currentItem.id, updates: { nome: itemName } });
        showToast('Sucesso', 'Item atualizado com sucesso.', 'success');
      } else {
        await addClassification({ nome: itemName });
        showToast('Sucesso', 'Item adicionado com sucesso.', 'success');
      }
      handleCloseDialog();
    } catch (error) {
      showToast('Erro', `Não foi possível salvar o item: ${error.message}`, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await deleteClassification(id);
        showToast('Sucesso', 'Item excluído com sucesso.', 'success');
      } catch (error) {
        showToast('Erro', `Não foi possível excluir o item: ${error.message}`, 'error');
      }
    }
  };

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
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classifications.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.nome}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
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
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ClassificationTableManager;
