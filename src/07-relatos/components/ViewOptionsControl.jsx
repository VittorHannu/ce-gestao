import React from 'react';
import { Settings2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/01-shared/components/ui/popover';
import { Button } from '@/01-shared/components/ui/button';
import { Checkbox } from '@/01-shared/components/ui/checkbox';
import { Label } from '@/01-shared/components/ui/label';

const ViewOptionsControl = ({ viewOptions, onViewOptionsChange }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="lg" className="px-3">
          <Settings2 className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Exibir nos Cards</h4>
            <p className="text-sm text-muted-foreground">
              Selecione as informações que deseja visualizar nos cards dos relatos.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="flex items-center space-x-3">
              <Checkbox id="showDescription" checked={viewOptions.showDescription} onCheckedChange={() => onViewOptionsChange('showDescription')} className="h-5 w-5" />
              <Label htmlFor="showDescription" className="text-base">Descrição</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="showRisks" checked={viewOptions.showRisks} onCheckedChange={() => onViewOptionsChange('showRisks')} className="h-5 w-5" />
              <Label htmlFor="showRisks" className="text-base">Riscos</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="showSolution" checked={viewOptions.showSolution} onCheckedChange={() => onViewOptionsChange('showSolution')} className="h-5 w-5" />
              <Label htmlFor="showSolution" className="text-base">Solução</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="showDamage" checked={viewOptions.showDamage} onCheckedChange={() => onViewOptionsChange('showDamage')} className="h-5 w-5" />
              <Label htmlFor="showDamage" className="text-base">Danos</Label>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ViewOptionsControl;