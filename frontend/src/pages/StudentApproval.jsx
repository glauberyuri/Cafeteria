import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Check, X, Clock, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/services/api';

export default function StudentApproval() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ======================
     LOAD REQUESTS
     ====================== */
  async function loadRequests() {
    try {
      setLoading(true);
      const res = await api.get('/academic-authorizations/');
      setRequests(res.data);
    } catch {
      toast.error('Erro ao carregar pedidos acadêmicos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  const pendingRequests = requests.filter(
    (r) => r.status === 'AWAITING_APPROVAL'
  );

  const processedRequests = requests.filter(
    (r) => r.status === 'APPROVED' || r.status === 'REJECTED'
  );

  /* ======================
     ACTIONS
     ====================== */
  async function handleApprove(id) {
    try {
      await api.post(`/academic-authorizations/${id}/approve/`);
      toast.success('Pedido aprovado com sucesso!');
      loadRequests();
    } catch {
      toast.error('Erro ao aprovar pedido');
    }
  }

  async function handleReject(id) {
    try {
      await api.post(`/academic-authorizations/${id}/reject/`);
      toast.error('Pedido rejeitado');
      loadRequests();
    } catch {
      toast.error('Erro ao rejeitar pedido');
    }
  }

  async function handleApproveAll() {
    try {
      await api.post('/academic-requests/approve-all/');
      toast.success(`${pendingRequests.length} pedidos aprovados!`);
      loadRequests();
    } catch {
      toast.error('Erro ao aprovar todos');
    }
  }

  /* ======================
     UI
     ====================== */
  return (
    <MainLayout title="Autorização de Alunos">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-status-pending/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-status-pending" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Pedidos Pendentes
            </h2>
            <p className="text-muted-foreground">
              {pendingRequests.length} aguardando aprovação
            </p>
          </div>
        </div>

        {pendingRequests.length > 0 && (
          <Button
            size="lg"
            onClick={handleApproveAll}
            className="bg-status-active hover:bg-status-active/90"
          >
            <Check className="w-5 h-5 mr-2" />
            Aprovar Todos ({pendingRequests.length})
          </Button>
        )}
      </div>

      {/* Pending */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Carregando pedidos...
        </div>
      ) : pendingRequests.length === 0 ? (
        <div className="bg-card rounded-xl p-12 text-center shadow-card">
          <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Nenhum pedido pendente
          </h3>
          <p className="text-muted-foreground">
            Todos os pedidos foram processados
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {pendingRequests.map((r) => (
            <div
              key={r.id}
              className="bg-card rounded-xl p-5 shadow-card border-l-4 border-status-pending"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold truncate">
                    {r.academic_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Matrícula: {r.registration}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Setor:</span>
                  <span className="font-medium">{r.sector_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Refeição:</span>
                  <span className="font-medium">
                    {r.meal_type === 'LUNCH' ? 'Almoço' : 'Jantar'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dieta:</span>
                  <span className="font-medium">{r.diet_type_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Solicitado:</span>
                  <span className="font-medium">
                    {new Date(r.created_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-status-active hover:bg-status-active/90"
                  size="lg"
                  onClick={() => handleApprove(r.id)}
                >
                  <Check className="w-5 h-5 mr-2" />
                  Aprovar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  size="lg"
                  onClick={() => handleReject(r.id)}
                >
                  <X className="w-5 h-5 mr-2" />
                  Rejeitar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Processed */}
      {processedRequests.length > 0 && (
        <>
          <h3 className="text-lg font-semibold mb-4">
            Processados Hoje
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {processedRequests.map((r) => (
              <div
                key={r.id}
                className={cn(
                  'bg-card rounded-xl p-5 shadow-card border-l-4 opacity-75',
                  r.status === 'APPROVED'
                    ? 'border-status-active'
                    : 'border-destructive'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{r.academic_name}</span>
                  <span
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-semibold',
                      r.status === 'APPROVED'
                        ? 'bg-status-active/10 text-status-active'
                        : 'bg-destructive/10 text-destructive'
                    )}
                  >
                    {r.status === 'APPROVED' ? 'Aprovado' : 'Rejeitado'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {r.meal_type === 'LUNCH' ? 'Almoço' : 'Jantar'} •{' '}
                  {r.sector_name}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </MainLayout>
  );
}
