import { UtensilsCrossed, Clock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MealCard({ meal }) {

  const statusConfig = {
    PENDING: {
      icon: Clock,
      className: 'bg-status-pending/10 text-status-pending border-status-pending/30',
      iconColor: 'text-status-pending',
    },
    DELIVERED: {
      icon: CheckCircle,
      className: 'bg-status-active/10 text-status-active border-status-active/30',
      iconColor: 'text-status-active',
    },
    CANCELLED: {
      icon: XCircle,
      className: 'bg-destructive/10 text-destructive border-destructive/30',
      iconColor: 'text-destructive',
    },
  };

  const config = statusConfig[meal.status];
  const StatusIcon = config.icon;

  return (
    <div className="bg-card rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
            <UtensilsCrossed className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{meal.collaborator_name}</h3>
            <p className="text-sm text-muted-foreground">{meal.sector_name}</p>
          </div>
        </div>

        <span
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border",
            config.className
          )}
        >
          <StatusIcon className={cn("w-4 h-4", config.iconColor)} />
          {meal.status_display}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-muted-foreground text-xs mb-1">Tipo Refeição</p>
          <p className="font-semibold text-foreground">{meal.diet_type}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-muted-foreground text-xs mb-1">Hora</p>
          <p className="font-semibold text-foreground">{meal.meal_type_display}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-muted-foreground text-xs mb-1">Date</p>
          <p className="font-semibold text-foreground">{meal.date}</p>
        </div>
      </div>
    </div>
  );
}
