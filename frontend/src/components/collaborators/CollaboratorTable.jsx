import { Briefcase, Stethoscope, GraduationCap, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const typeConfig = {
  EMPLOYEE: {
    icon: Briefcase,
    label: 'Funcionário',
    color: 'text-primary',
  },
  DOCTOR: {
    icon: Stethoscope,
    label: 'Médico',
    color: 'text-status-active',
  },
  ACADEMIC: {
    icon: GraduationCap,
    label: 'Acadêmico',
    color: 'text-status-pending',
  },
};

const shiftLabels = {
  DAY: 'Dia',
  NIGHT: 'Noite',
};

export function CollaboratorTable({ collaborators = [], onEdit }) {
  const getIdentifier = (c) => {
    if (c.registration) return c.registration;
    if (c.crm) return c.crm;
    if (c.institution) return c.institution;
    return '-';
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12" />
            <TableHead>Nome</TableHead>
            <TableHead className="hidden md:table-cell">
              Identificador
            </TableHead>
            <TableHead className="hidden lg:table-cell">
              Setor
            </TableHead>
            <TableHead className="hidden sm:table-cell">
              Turno
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {collaborators.map((c) => {
            const config = typeConfig[c.type];
            if (!config) return null;

            const TypeIcon = config.icon;
            const isActive = c.active;

            return (
              <TableRow
                key={`${c.type}-${c.id}`}
                className="hover:bg-muted/30"
              >
                {/* ICON */}
                <TableCell>
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center bg-muted',
                      config.color
                    )}
                  >
                    <TypeIcon className="w-4 h-4" />
                  </div>
                </TableCell>

                {/* NAME */}
                <TableCell>
                  <div className="max-w-[220px]">
                    <p className="font-medium text-foreground truncate">
                      {c.full_name}
                    </p>
                    <p className={cn('text-xs', config.color)}>
                      {config.label}
                    </p>
                  </div>
                </TableCell>

                {/* IDENTIFIER */}
                <TableCell className="hidden md:table-cell font-mono text-sm text-muted-foreground">
                  {getIdentifier(c)}
                </TableCell>

                {/* SECTOR */}
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {c.department_name || '-'}
                </TableCell>

                {/* SHIFT */}
                <TableCell className="hidden sm:table-cell">
                  {c.type === 'EMPLOYEE' && c.shift ? (
                    <span
                      className={cn(
                        'text-xs font-medium px-2 py-1 rounded',
                        c.shift === 'DAY'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-foreground'
                      )}
                    >
                      {shiftLabels[c.shift]}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>

                {/* STATUS */}
                <TableCell>
                  <span
                    className={cn(
                      'px-2 py-1 rounded-full text-xs font-semibold',
                      isActive
                        ? 'bg-status-active/10 text-status-active'
                        : 'bg-status-inactive/10 text-status-inactive'
                    )}
                  >
                    {isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </TableCell>

                {/* ACTION */}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit?.(c)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
