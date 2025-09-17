import React, { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/01-shared/components/ui/popover';
import { Button } from '@/01-shared/components/ui/button';
import { Command, CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty } from '@/01-shared/components/ui/command';
import { Badge } from '@/01-shared/components/ui/badge';
import { ScrollArea } from '@/01-shared/components/ui/scroll-area';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const MultiSelect = ({ label, options, selectedValues, onChange, placeholder = 'Selecione...' }) => {
  const [open, setOpen] = useState(false);

  const selectedItems = options.filter(option => selectedValues.includes(String(option.id)));

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10"
          >
            <div className="flex flex-wrap gap-1">
              {selectedItems.length > 0 ? (
                selectedItems.map(item => (
                  <Badge key={item.id} variant="secondary">{item.nome}</Badge>
                ))
              ) : (
                <span className="font-normal text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-50 bg-white">
          <Command>
            <CommandInput placeholder="Pesquisar..." />
            <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
            <ScrollArea className="h-60">
              <CommandList>
                <CommandGroup>
                  {options.map(option => {
                    const isSelected = selectedValues.includes(String(option.id));
                    return (
                      <CommandItem
                        key={option.id}
                        value={option.nome}
                        onSelect={() => onChange(option.id)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            isSelected ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {option.nome}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MultiSelect;
