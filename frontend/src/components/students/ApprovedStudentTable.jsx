import { GraduationCap, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';


export function ApprovedStudentTable({ requests }) {
  if (requests.length === 0) {
    return (
      <div className="bg-card rounded-xl p-12 text-center shadow-card">
        <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum pedido processado</h3>
        <p className="text-muted-foreground">Os pedidos processados aparecerão aqui</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Aluno</TableHead>
            <TableHead className="hidden md:table-cell">Identificador</TableHead>
            <TableHead className="hidden lg:table-cell">Setor</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((r) => {
            const approved  = r.approved;
            return (
              <TableRow key={r.id} className="opacity-80">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", approved ? "bg-status-active/10" : "bg-destructive/10")}>
                      <GraduationCap className={cn("w-4 h-4", approved ? "text-status-active" : "text-destructive")} />
                    </div>
                    <span className="font-medium text-foreground truncate max-w-[150px]">{r.academic_name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell font-mono text-sm text-muted-foreground">
                  {r.identifier}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">{r.sector_name}</TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
                    approved ? "bg-status-active/10 text-status-active" : "bg-destructive/10 text-destructive"
                  )}>
                    {approved ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {approved ? 'Aprovado' : 'Rejeitado'}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
