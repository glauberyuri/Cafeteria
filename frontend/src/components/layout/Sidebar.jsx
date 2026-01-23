import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UtensilsCrossed, LogOut, ClipboardPlus, GraduationCap, Leaf, BarChart3, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: ClipboardPlus, label: 'Solicitar Refeição', path: '/request' },
  { icon: Users, label: 'Colaboradores', path: '/collaborators' },
  { icon: UtensilsCrossed, label: 'Refeições', path: '/meals' },
  { icon: GraduationCap, label: 'Aprovação Alunos', path: '/student-approval' },
  { icon: BarChart3, label: 'Relatórios', path: '/reports' },
  { icon: Leaf, label: 'Tipos de Dieta', path: '/diet_type' },
  { icon: Building2, label: 'Setor', path: '/sectors' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar flex flex-col shadow-lg z-50">
      {/* Logo Area */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <UtensilsCrossed className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">MealTrack</h1>
            <p className="text-xs text-sidebar-foreground/70">Sistema Hospitalar</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 px-4 py-4 rounded-lg transition-all duration-200 touch-manipulation min-h-[56px]",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-base font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-sidebar-border">
        <NavLink
          to="/"
          className="flex items-center gap-4 px-4 py-4 rounded-lg text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 touch-manipulation min-h-[56px]"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-base font-medium">Sair</span>
        </NavLink>
      </div>
    </aside>
  );
}
