import { Check, X, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

export function PendingStudentTable({ requests, onApprove, onReject }) {

  if (requests.length === 0) {
    return (
      <div className="bg-card rounded-xl p-12 text-center shadow-card">
        <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Nenhum pedido pendente
        </h3>
        <p className="text-muted-foreground">
          Todos os pedidos de alunos foram processados
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">

      <Table>

        <TableHeader>

          <TableRow className="bg-muted/50">

            <TableHead>Aluno</TableHead>

            <TableHead className="hidden md:table-cell">
              Matrícula
            </TableHead>

            <TableHead className="hidden lg:table-cell">
              Setor
            </TableHead>

            <TableHead>
              Solicitado
            </TableHead>

            <TableHead className="text-right">
              Ações
            </TableHead>

          </TableRow>

        </TableHeader>

        <TableBody>

          {requests.map((r) => (

            <TableRow key={r.id}>

              <TableCell>

                <div className="flex items-center gap-2">

                  <div className="w-8 h-8 rounded-lg bg-status-pending/10 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-status-pending" />
                  </div>

                  <span className="font-medium text-foreground truncate max-w-[150px]">
                    {r.academic_name}
                  </span>

                </div>

              </TableCell>

              <TableCell className="hidden md:table-cell font-mono text-sm text-muted-foreground">
                {r.identifier}
              </TableCell>

              <TableCell className="hidden lg:table-cell text-muted-foreground">
                {r.sector_name}
              </TableCell>

              <TableCell className="text-muted-foreground">

                {new Date(r.created_at).toLocaleTimeString(
                  'pt-BR',
                  { hour: '2-digit', minute: '2-digit' }
                )}

              </TableCell>

              <TableCell className="text-right">

                <div className="flex justify-end gap-2">

                  <Button
                    size="sm"
                    className="bg-green-400 hover:bg-blue-600/90"
                    onClick={() => onApprove(r.id)}
                  >
                    <Check className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => onReject(r.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>

                </div>

              </TableCell>

            </TableRow>

          ))}

        </TableBody>

      </Table>

    </div>
  )
}