import { Check, Printer, Plus, Clock, Briefcase, Stethoscope, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const typeConfig = {
  employee: { icon: Briefcase, label: 'Funcionário', color: 'bg-primary' },
  doctor: { icon: Stethoscope, label: 'Médico', color: 'bg-status-active' },
  student: { icon: GraduationCap, label: 'Aluno', color: 'bg-status-pending' },
};

export function MealReceipt({ request, onNewRequest }) {
  const config = typeConfig[request.collaboratorType];
  const isAwaitingApproval = request.status === 'AwaitingApproval';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">

        <div className={cn(
          "p-6 text-center",
          isAwaitingApproval ? "bg-yellow-300" : "bg-green-600"
        )}>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            {isAwaitingApproval ? (
              <Clock className="w-8 h-8 text-white" />
            ) : (
              <Check className="w-8 h-8 text-white" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            {isAwaitingApproval ? 'Aguardando Aprovação' : 'Solicitação Confirmada'}
          </h2>
          <p className="text-white/80 text-sm">
            {isAwaitingApproval 
              ? 'Seu pedido foi enviado para análise'
              : 'Apresente este comprovante no refeitório'
            }
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-accent rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Código do Pedido</p>
            <p className="text-2xl font-mono font-bold text-foreground tracking-wider">
              {request.id.toString().toUpperCase()}
            </p>
          </div>

          {/* Tipo de colaborador */}
          <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-xl">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", config.color)}>
              <config.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{config.label}</p>
              <p className="font-semibold text-foreground">{request.collaboratorName}</p>
            </div>
          </div>

          {/* Informações do pedido */}
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Identificação</span>
              <span className="font-medium text-foreground">{request.identifier}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Setor</span>
              <span className="font-medium text-foreground">{request.sector}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Refeição</span>
              <span className="font-medium text-foreground">
                {request.mealType === 'Lunch' ? 'Almoço' : 'Jantar'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Dieta</span>
              <span className="font-medium text-foreground">{request.dietType}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Data</span>
              <span className="font-medium text-foreground">
                {new Date(request.date).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Horário</span>
              <span className="font-medium text-foreground">
                {new Date(request.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="p-6 pt-0 space-y-3">
          {!isAwaitingApproval && (
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full h-14"
              onClick={handlePrint}
            >
              <Printer className="w-5 h-5 mr-2" />
              Imprimir Comprovante
            </Button>
          )}
          <Button 
            size="lg" 
            className="w-full h-14 text-lg"
            onClick={onNewRequest}
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Solicitação
          </Button>
        </div>
      </div>
    </div>
  );
}
