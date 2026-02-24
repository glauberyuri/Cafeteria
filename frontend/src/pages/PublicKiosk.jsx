import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  UtensilsCrossed,
  ClipboardList,
  Calendar,
  Clock,
  Loader2,
  User,
  Stethoscope,
  GraduationCap,
  ArrowLeft,
  Search,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { SectorCombobox } from '@/components/request/SectorCombobox';
import { DietTypeSelector } from '@/components/request/DietTypeSelector';
import { useMealTypeByTime } from '@/hooks/useMealTypeByTime';
import { cn } from '@/lib/utils';
import { MealReceipt } from '@/components/request/MealReceipt';
import { useKiosk } from '@/contexts/KioskContext';

const collaboratorTypes = [
  { value: 'employee', label: 'Funcionário', icon: User, color: 'bg-blue-500' },
  { value: 'doctor', label: 'Médico', icon: Stethoscope, color: 'bg-green-500' },
  { value: 'student', label: 'Estudante', icon: GraduationCap, color: 'bg-amber-500' },
];

export default function PublicKiosk() {
  const { mealType, mealLabel } = useMealTypeByTime();

  const {
    weeklyMenu,
    todayOrders,
    createMealRequest,
    cancelOrder
  } = useKiosk();

  const [activeTab, setActiveTab] = useState('request');

  const [step, setStep] = useState('type');
  const [selectedType, setSelectedType] = useState(null);
  const [identifier, setIdentifier] = useState('');
  const [collaboratorName, setCollaboratorName] = useState('');
  const [sector, setSector] = useState('');
  const [dietType, setDietType] = useState('Comum');
  const [completedRequest, setCompletedRequest] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const getDayOfWeek = () => {
    const days = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
    return days[new Date().getDay()];
  };

  const todayMenu = weeklyMenu.find(m => m.day === getDayOfWeek());

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const data = await createMealRequest({
        collaborator_type: selectedType,
        identifier,
        sector,
        meal_type: mealType,
        diet_type: dietType
      });

      setCompletedRequest(data);
      toast.success('Pedido registrado com sucesso!');
    } catch {
      toast.error('Erro ao registrar pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelOrder(id);
      toast.success('Pedido cancelado!');
    } catch {
      toast.error('Erro ao cancelar pedido');
    }
  };

  const renderRequestForm = () => {
    if (completedRequest) {
      return (
        <MealReceipt
          request={completedRequest}
          onNewRequest={() => setCompletedRequest(null)}
        />
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <DietTypeSelector
          selected={dietType}
          onSelect={setDietType}
        />

        <Button
          type="submit"
          className="w-full h-14 text-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Registrando...
            </>
          ) : (
            <>
              <UtensilsCrossed className="w-5 h-5 mr-2" />
              Confirmar {mealLabel}
            </>
          )}
        </Button>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">

      {/* HEADER */}
      <header className="bg-primary text-primary-foreground py-6 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <UtensilsCrossed className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">MealTrack</h1>
              <p className="text-primary-foreground/80 text-sm">Sistema de Refeições</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <Clock className="w-5 h-5" />
              <span className="text-lg font-medium">{mealLabel}</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

          <TabsList className="grid w-full grid-cols-3 h-14 text-base">
            <TabsTrigger value="request">Solicitar</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="menu">Cardápio</TabsTrigger>
          </TabsList>

          {/* REQUEST */}
          <TabsContent value="request" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-primary/5 rounded-t-lg">
                <CardTitle>Solicitar {mealLabel}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {renderRequestForm()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ORDERS */}
          <TabsContent value="orders">
            <Card className="shadow-lg">
              <CardHeader className="bg-primary/5 rounded-t-lg">
                <CardTitle className="flex justify-between">
                  Pedidos do Dia
                  <Badge>{todayOrders.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {todayOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">
                    Nenhum pedido registrado hoje.
                  </p>
                ) : (
                  todayOrders.map(order => (
                    <div
                      key={order.id}
                      className="flex justify-between items-center p-4 rounded-lg border bg-card"
                    >
                      <div>
                        <p className="font-semibold">{order.collaborator_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.meal_type} • {order.diet_type}
                        </p>
                      </div>
                      {order.status !== 'Cancelled' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancel(order.id)}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* MENU */}
          <TabsContent value="menu">
            <Card className="shadow-lg">
              <CardHeader className="bg-primary/5 rounded-t-lg">
                <CardTitle>Cardápio Semanal</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {weeklyMenu.map(day => (
                  <div key={day.day} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{day.day}</h4>
                    <p><strong>Almoço:</strong> {day.lunch.main}</p>
                    <p><strong>Jantar:</strong> {day.dinner.main}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}