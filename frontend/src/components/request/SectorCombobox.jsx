import { useState } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

export function SectorCombobox({
  value,
  onSelect,
  sectors = [],
  label = "Setor Atual",
}) {
  const [open, setOpen] = useState(false);

  const selectedSector = sectors.find((s) => s.id === value);

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
            {selectedSector?.name || "Buscar setor..."}
            <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border shadow-md z-50"
        >
          <Command className="bg-popover">
            <CommandInput
              placeholder="Digite para buscar..."
              className="h-12 text-base"
            />

            <CommandList className="max-h-[300px]">
              <CommandEmpty>Nenhum setor encontrado.</CommandEmpty>

              <CommandGroup>
                {sectors.map((sector) => (
                  <CommandItem
                    key={sector.id}
                    value={sector.name}
                    onSelect={() => {
                      onSelect(sector.id);
                      setOpen(false);
                    }}
                    className="py-3 text-base cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-5 w-5",
                        value === sector.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {sector.name}
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