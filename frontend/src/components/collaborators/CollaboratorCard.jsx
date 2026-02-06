import { Briefcase, Stethoscope, GraduationCap, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const typeConfig = {
  EMPLOYEE: {
    icon: Briefcase,
    label: 'Funcionário',
    color: 'bg-primary',
  },
  DOCTOR: {
    icon: Stethoscope,
    label: 'Médico',
    color: 'bg-status-active',
  },
  ACADEMIC: {
    icon: GraduationCap,
    label: 'Acadêmico',
    color: 'bg-status-pending',
  },
};

export function CollaboratorCard({ collaborator, onEdit }) {
  const config = typeConfig[collaborator.type];
  if (!config) return null;

  const TypeIcon = config.icon;
  const isActive = collaborator.active;

  const getIdentifier = () => {
    if (collaborator.registration) {
      return { label: 'Matrícula', value: collaborator.registration };
    }
    if (collaborator.crm) {
      return { label: 'CRM', value: collaborator.crm };
    }
    if (collaborator.institution) {
      return { label: 'Instituição', value: collaborator.institution };
    }
    return null;
  };

  const identifier = getIdentifier();

  return (
    <div className="bg-card rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 relative group">
      {/* Edit */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
        onClick={() => onEdit?.(collaborator)}
      >
        <Pencil className="w-4 h-4" />
      </Button>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
            config.color
          )}
        >
          <TypeIcon className="w-7 h-7 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-1">
            <h3 className="text-lg font-semibold truncate pr-8 text-foreground">
              {collaborator.full_name}
            </h3>

            <span
              className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap',
                isActive
                  ? 'bg-status-active/10 text-status-active'
                  : 'bg-status-inactive/10 text-status-inactive'
              )}
            >
              {isActive ? 'Ativo' : 'Inativo'}
            </span>
          </div>

          <p className="text-sm text-primary font-medium mb-3">
            {config.label}
          </p>

          <div className="space-y-2 text-sm">
            {identifier && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground min-w-[80px]">
                  {identifier.label}:
                </span>
                <span className="font-medium text-foreground">
                  {identifier.value}
                </span>
              </div>
            )}

            {/* Setor */}
            {collaborator.type === 'EMPLOYEE' &&
              collaborator.department_name && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground min-w-[80px]">
                    Setor:
                  </span>
                  <span className="font-medium text-foreground">
                    {collaborator.department_name}
                  </span>
                </div>
              )}

            {/* Turno */}
            {collaborator.type === 'EMPLOYEE' && collaborator.shift && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground min-w-[80px]">
                  Turno:
                </span>
                <span
                  className={cn(
                    'font-medium px-2 py-0.5 rounded',
                    collaborator.shift === 'DAY'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-foreground'
                  )}
                >
                  {collaborator.shift === 'DAY' ? 'Dia' : 'Noite'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
