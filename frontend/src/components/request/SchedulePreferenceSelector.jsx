import { Calendar, CalendarDays, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const preferences = [
  {
    id: 'manual' ,
    label: 'Manual',
    description: 'Solicito quando precisar',
    icon: Calendar,
  },
  {
    id: 'automatic' ,
    label: 'Segunda a Sexta',
    description: 'Refeição automática dias úteis',
    icon: CalendarDays,
  },
  {
    id: 'alternate',
    label: 'Plantonista',
    description: 'Conforme escala de plantão',
    icon: Clock,
  },
];

export function SchedulePreferenceSelector({ value, onChange }) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-muted-foreground">
        Frequência de Refeição
      </label>
      <div className="grid grid-cols-1 gap-3">
        {preferences.map((pref) => {
          const Icon = pref.icon;
          const isSelected = value === pref.id;
          
          return (
            <button
              key={pref.id}
              type="button"
              onClick={() => onChange(pref.id)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border-2 transition-all touch-target text-left",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-accent/50"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                isSelected ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground"
              )}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "font-semibold text-base",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {pref.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {pref.description}
                </div>
              </div>
              <div className={cn(
                "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center",
                isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
              )}>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
