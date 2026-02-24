import { useState } from 'react';
import { Check, ChevronsUpDown, MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';


export function SectorCombobox({
    value,
    onSelect,
    sectors = [],
    label = "Setor Atual"
  }) {
    const [open, setOpen] = useState(false);
  
    return (
      <div className="space-y-2">
        <Label className="text-base font-medium flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {label}
        </Label>
  
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between h-14 text-lg rounded-xl border-2",
                value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border"
              )}
            >
              {value || "Buscar setor..."}
              <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
  
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
          >
            <Command>
              <CommandInput
                placeholder="Digite para buscar..."
                className="h-12 text-base"
              />
              <CommandList className="max-h-[300px]">
                <CommandEmpty>Nenhum setor encontrado.</CommandEmpty>
  
                <CommandGroup>
                  {sectors.map((sector) => (
                    <CommandItem
                      key={sector}
                      value={sector}
                      onSelect={() => {
                        onSelect(sector);
                        setOpen(false);
                      }}
                      className="py-3 text-base cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-5 w-5",
                          value === sector ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {sector}
                    </CommandItem>
                  ))}
                </CommandGroup>
  
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }