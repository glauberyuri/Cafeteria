import { Leaf } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useKiosk } from '@/contexts/KioskContext';

export function DietTypeSelector({ selected, onSelect }) {
  const { dietTypes } = useKiosk();

  return (
    <div className="space-y-2">
      <Label className="text-base font-medium flex items-center gap-2">
        <Leaf className="w-4 h-4" />
        Tipo de Dieta
      </Label>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {dietTypes.map((diet) => (
          <button
            key={diet.id}
            type="button"
            onClick={() => onSelect(diet.name)}
            className={cn(
              "px-4 py-3 rounded-xl text-sm font-medium transition-all",
              "border-2 min-h-[48px] text-left",
              selected === diet.name
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-foreground hover:border-primary/50"
            )}
          >
            <span className="block font-semibold">
              {diet.name}
            </span>

            {diet.description && (
              <span className="block text-xs text-muted-foreground mt-0.5">
                {diet.description}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}