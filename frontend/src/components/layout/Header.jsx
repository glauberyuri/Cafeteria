import { User, Bell } from 'lucide-react';


export function Header({ title }) {
  return (
    <header className="h-20 bg-card border-b border-border flex items-center justify-between px-8 shadow-sm">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-3 rounded-lg hover:bg-accent transition-colors touch-manipulation">
          <Bell className="w-6 h-6 text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full" />
        </button>
        
        {/* User Info */}
        <div className="flex items-center gap-3 pl-6 border-l border-border">
          <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center">
            <User className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Galuber</p>
            <p className="text-xs text-muted-foreground">Diretor</p>
          </div>
        </div>
      </div>
    </header>
  );
}
