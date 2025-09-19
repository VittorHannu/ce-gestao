import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/01-shared/components/ui/dialog';
import { Button } from '@/01-shared/components/ui/button';
import { Checkbox } from '@/01-shared/components/ui/checkbox';
import { Label } from '@/01-shared/components/ui/label';
import { Settings2 } from 'lucide-react';

const ViewOptionsModal = ({ viewOptions, onViewOptionsChange, children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-lg p-6">
        <DialogHeader>
          <DialogTitle>Exibir nos Cards</DialogTitle>
          <DialogDescription>
            Selecione as informações que deseja visualizar nos cards dos relatos.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-4">
            <div className="flex items-center space-x-3">
              <Checkbox id="showDescriptionModal" checked={viewOptions.showDescription} onCheckedChange={() => onViewOptionsChange('showDescription')} className="h-5 w-5" />
              <Label htmlFor="showDescriptionModal" className="text-base">Descrição</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="showRisksModal" checked={viewOptions.showRisks} onCheckedChange={() => onViewOptionsChange('showRisks')} className="h-5 w-5" />
              <Label htmlFor="showRisksModal" className="text-base">Riscos</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="showSolutionModal" checked={viewOptions.showSolution} onCheckedChange={() => onViewOptionsChange('showSolution')} className="h-5 w-5" />
              <Label htmlFor="showSolutionModal" className="text-base">Solução</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="showDamageModal" checked={viewOptions.showDamage} onCheckedChange={() => onViewOptionsChange('showDamage')} className="h-5 w-5" />
              <Label htmlFor="showDamageModal" className="text-base">Danos</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="showTipoRelatoModal" checked={viewOptions.showTipoRelato} onCheckedChange={() => onViewOptionsChange('showTipoRelato')} className="h-5 w-5" />
              <Label htmlFor="showTipoRelatoModal" className="text-base">Tipo de Relato</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="showTreatmentStatusModal" checked={viewOptions.showTreatmentStatus} onCheckedChange={() => onViewOptionsChange('showTreatmentStatus')} className="h-5 w-5" />
              <Label htmlFor="showTreatmentStatusModal" className="text-base">Status da Tratativa</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="showResponsiblesModal" checked={viewOptions.showResponsibles} onCheckedChange={() => onViewOptionsChange('showResponsibles')} className="h-5 w-5" />
              <Label htmlFor="showResponsiblesModal" className="text-base">Responsáveis</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
            <p className="text-xs text-muted-foreground">
                As opções são salvas automaticamente.
            </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewOptionsModal;
