import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/services/api";

import { PendingStudentTable } from "../components/students/PendingStudentTable";
import { ApprovedStudentTable } from "../components/students/ApprovedStudentTable";

export default function StudentApproval() {

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadRequests() {
    try {

      setLoading(true);

      const res = await api.get("/academic-authorizations/");

      setRequests(res.data);

    } catch {

      toast.error("Erro ao carregar solicitações");

    } finally {

      setLoading(false);

    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  const pendingRequests = requests.filter(r => !r.approved);
  const processedRequests = requests.filter(r => r.approved);

  async function handleApprove(id) {
    try {

      await api.post(`/academic-authorizations/${id}/approve/`);

      toast.success("Solicitação aprovada");

      loadRequests();

    } catch {

      toast.error("Erro ao aprovar");

    }
  }

  async function handleReject(id) {
    try {

      await api.delete(`/academic-authorizations/${id}/reject/`);

      toast.success("Solicitação rejeitada");

      loadRequests();

    } catch {

      toast.error("Erro ao rejeitar");

    }
  }

  async function handleApproveAll() {
    try {

      await api.post("/academic-authorizations/approve-all/");

      toast.success(`${pendingRequests.length} aprovados`);

      loadRequests();

    } catch {

      toast.error("Erro ao aprovar todos");

    }
  }

  return (
    <MainLayout title="Autorização de Alunos">

      <Tabs defaultValue="pending" className="space-y-4">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

          <TabsList>

            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" />
              Pendentes ({pendingRequests.length})
            </TabsTrigger>

            <TabsTrigger value="processed" className="gap-2">
              <Check className="w-4 h-4" />
              Processados ({processedRequests.length})
            </TabsTrigger>

          </TabsList>

          {pendingRequests.length > 0 && (

            <Button
              size="lg"
              onClick={handleApproveAll}
              className="bg-blue-900 hover:bg-blue-600/90"
            >
              <Check className="w-5 h-5 mr-2" />
              Aprovar Todos ({pendingRequests.length})
            </Button>

          )}

        </div>

        <TabsContent value="pending">

          <PendingStudentTable
            requests={pendingRequests}
            onApprove={handleApprove}
            onReject={handleReject}
          />

        </TabsContent>

        <TabsContent value="processed">

          <ApprovedStudentTable requests={processedRequests} />

        </TabsContent>

      </Tabs>

    </MainLayout>
  );
}