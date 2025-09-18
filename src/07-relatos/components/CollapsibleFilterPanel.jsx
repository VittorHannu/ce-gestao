
import React from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Button } from '@/01-shared/components/ui/button';
import { ChevronDown } from 'lucide-react';

const CollapsibleFilterPanel = ({ children }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} className="w-full">
      {/* The trigger is now external to this component */}
      <Collapsible.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
        <div className="p-4 border-t bg-gray-50">
          {children}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

export default CollapsibleFilterPanel;
