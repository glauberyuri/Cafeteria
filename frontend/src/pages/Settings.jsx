import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, DollarSign, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

export default function Settings() {
  const [pricing, setPricing] = useState("");

  const [schedule, setSchedule] = useState({
    lunch: { start: "", end: "" },
    dinner: { start: "", end: "" },
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await api.get("/meal-settings/");

        const data = res.data;

        setPricing(data.employee_price);

        setSchedule({
          lunch: {
            start: data.lunch_start || "",
            end: data.lunch_end || "",
          },
          dinner: {
            start: data.dinner_start || "",
            end: data.dinner_end || "",
          },
        });
      } catch (err) {
        toast.error("Erro ao carregar configurações");
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, []);

  const handleSave = async () => {
    const employee_price = parseFloat(pricing);

    if (isNaN(employee_price) || employee_price < 0) {
      toast.error("Valor do inválido");
      return;
    }

    if (!schedule.lunch.start || !schedule.lunch.end) {
      toast.error("Horários do almoço são obrigatórios");
      return;
    }

    if (!schedule.dinner.start || !schedule.dinner.end) {
      toast.error("Horários do jantar são obrigatórios");
      return;
    }

    if (schedule.lunch.start >= schedule.lunch.end) {
      toast.error("Horário do almoço inválido");
      return;
    }

    if (schedule.dinner.start >= schedule.dinner.end) {
      toast.error("Horário do jantar inválido");
      return;
    }

    setIsSaving(true);

    try {
        await api.put("/meal-settings/", {
            employee_price: employee_price,
            lunch_start: schedule.lunch.start,
            lunch_end: schedule.lunch.end,
            dinner_start: schedule.dinner.start,
            dinner_end: schedule.dinner.end,
        });

      toast.success("Configurações atualizadas com sucesso!");
    } catch (err) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Configurações">
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Configurações">
      <div className="space-y-8 max-w-2xl">
        <section className="bg-card rounded-2xl p-6 shadow-card-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Valor da Refeição</h2>
              <p className="text-sm text-muted-foreground">
                Defina o valor cobrado por refeição
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">

            <div className="space-y-2">
              <Label>Refeição (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={pricing}
                onChange={(e) =>
                  setPricing(e.target.value)
                }
                className="h-12"
              />
            </div>
          </div>
        </section>
        <section className="bg-card rounded-2xl p-6 shadow-card-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Horários de Pedido</h2>
            </div>
          </div>

          {/* Lunch */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Almoço</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="time"
                value={schedule.lunch.start}
                onChange={(e) =>
                  setSchedule({
                    ...schedule,
                    lunch: { ...schedule.lunch, start: e.target.value },
                  })
                }
              />
              <Input
                type="time"
                value={schedule.lunch.end}
                onChange={(e) =>
                  setSchedule({
                    ...schedule,
                    lunch: { ...schedule.lunch, end: e.target.value },
                  })
                }
              />
            </div>
          </div>

          {/* Dinner */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Jantar</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="time"
                value={schedule.dinner.start}
                onChange={(e) =>
                  setSchedule({
                    ...schedule,
                    dinner: { ...schedule.dinner, start: e.target.value },
                  })
                }
              />
              <Input
                type="time"
                value={schedule.dinner.end}
                onChange={(e) =>
                  setSchedule({
                    ...schedule,
                    dinner: { ...schedule.dinner, end: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </section>

        <Button onClick={handleSave} disabled={isSaving} className="h-12">
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          Salvar Configurações
        </Button>

      </div>
    </MainLayout>
  );
}