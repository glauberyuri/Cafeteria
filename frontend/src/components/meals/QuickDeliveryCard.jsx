import { CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';


export function QuickDeliveryCard({ meal, onDeliver, isDelivered = false }) {
  return (
    <button
      onClick={() => !isDelivered && onDeliver(meal.id)}
      disabled={isDelivered}
      className={cn(
        "w-full p-5 rounded-xl border-2 transition-all duration-200",
        "flex items-center justify-between gap-4",
        "touch-target min-h-[80px]",
        isDelivered
          ? "bg-status-active/10 border-status-active/30 cursor-default"
          : "bg-card border-transparent hover:border-primary active:bg-primary/10 shadow-md hover:shadow-lg"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
          isDelivered 
            ? "bg-status-active text-white" 
            : "bg-status-pending/10"
        )}>
          {isDelivered ? (
            <CheckCircle className="w-7 h-7" />
          ) : (
            <Clock className="w-7 h-7 text-status-pending" />
          )}
        </div>
        <div className="text-left">
          <h3 className={cn(
            "text-lg font-semibold",
            isDelivered ? "text-status-active" : "text-foreground"
          )}>
            {meal.collaborator_name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {meal.diet_type} • {meal.shift}
          </p>
        </div>
      </div>

      {!isDelivered && (
        <div className="flex items-center gap-2 text-primary">
          <span className="text-sm font-medium hidden sm:block">Toque para entregar</span>
          <CheckCircle className="w-8 h-8" />
        </div>
      )}

      {isDelivered && (
        <span className="text-sm font-medium text-status-active">Entregue ✓</span>
      )}
    </button>
  );
}
