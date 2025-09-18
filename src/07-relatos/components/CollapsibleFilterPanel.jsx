import React, { useState } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Button } from '@/01-shared/components/ui/button';
import { Filter } from 'lucide-react';

const CollapsibleFilterPanel = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="flex justify-end mb-4">
        <Collapsible.Trigger asChild>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </Collapsible.Trigger>
      </div>
      <Collapsible.Content>
        <div className="p-4 bg-gray-50 border rounded-lg">
          {children}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

export default CollapsibleFilterPanel;
