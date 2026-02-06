import { cn } from '@/lib/utils';


export function FilterButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-5 py-3 rounded-lg text-base font-medium transition-all duration-200 min-h-[48px] touch-manipulation",
        active
          ? "bg-primary text-primary-foreground shadow-md"
          : "bg-card text-foreground hover:bg-accent border border-border"
      )}
    >
      {label}
    </button>
  );
}
