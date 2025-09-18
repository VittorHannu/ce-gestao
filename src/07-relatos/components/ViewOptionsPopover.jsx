
import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Button } from '@/01-shared/components/ui/button';
import { Label } from '@/01-shared/components/ui/label';
import { Switch } from '@/01-shared/components/ui/switch';
import { Eye } from 'lucide-react';

const ViewOptionsPopover = ({ viewOptions, setViewOptions }) => {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          Exibir
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-64 bg-white p-4 rounded-lg shadow-lg border z-10">
        <div className="space-y-4">
          <h4 className="font-medium text-center">Exibir nos Cards</h4>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-description">Descrição</Label>
            <Switch
              id="show-description"
              checked={viewOptions.showDescription}
              onCheckedChange={(checked) => setViewOptions(prev => ({ ...prev, showDescription: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-risks">Riscos</Label>
            <Switch
              id="show-risks"
              checked={viewOptions.showRisks}
              onCheckedChange={(checked) => setViewOptions(prev => ({ ...prev, showRisks: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-solution">Solução</Label>
            <Switch
              id="show-solution"
              checked={viewOptions.showSolution}
              onCheckedChange={(checked) => setViewOptions(prev => ({ ...prev, showSolution: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-damage">Danos</Label>
            <Switch
              id="show-damage"
              checked={viewOptions.showDamage}
              onCheckedChange={(checked) => setViewOptions(prev => ({ ...prev, showDamage: checked }))}
            />
          </div>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
};

export default ViewOptionsPopover;
