import { useState, useEffect } from 'react';
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
import { DietTypeSelector } from '@/components/request/DietTypeSelector';
import { SectorCombobox } from '@/components/request/SectorCombobox';
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



  const { findOrdersByIdentifier, registerAcademic, sectors, searchCollaborator } = useKiosk();

  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentMatricula, setStudentMatricula] = useState('');
  const [studentInstituicao, setStudentInstituicao] = useState('');
  const [studentCategory, setStudentCategory] = useState('');
  const [studentSector, setStudentSector ] = useState("");
  const [isRegisteringStudent, setIsRegisteringStudent] = useState(false);

  const { mealType, mealLabel } = useMealTypeByTime();
  const { weeklyMenu, todayOrders, createMealRequest, cancelOrder } = useKiosk();

  const [activeTab, setActiveTab] = useState('request');

  const [step, setStep] = useState('type');
  const [selectedType, setSelectedType] = useState(null);
  const [identifier, setIdentifier] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [collaboratorName, setCollaboratorName] = useState('');
  const [sector, setSector] = useState('');
  const [dietType, setDietType] = useState('Comum');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedRequest, setCompletedRequest] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [cancelIdentifier, setCancelIdentifier] = useState('');
  const [isCancelSearching, setIsCancelSearching] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [cancelNotFound, setCancelNotFound] = useState(false);
  const [isCancelling, setIsCancelling] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  const handleSearchUserOrders = async () => {

    if (!cancelIdentifier.trim()) return;
  
    setIsCancelSearching(true);
    setCancelNotFound(false);
    setUserOrders([]);
  
    try {
  
      const orders = await findOrdersByIdentifier(cancelIdentifier);
  
      const pending = orders.filter(
        order => order.status === "PENDING"
      );
  
      if (pending.length > 0) {
        setUserOrders(pending);
      } else {
        setCancelNotFound(true);
      }
  
    } catch (error) {
  
      console.error(error);
      setCancelNotFound(true);
  
    } finally {
  
      setIsCancelSearching(false);
  
    }
  };

  const canCancel = (mealType) => {

    const now = new Date();
    const hour = now.getHours();
  
    if (mealType === "LUNCH") return hour < 9;
    if (mealType === "DINNER") return hour < 12;
  
    return false;
  
  };

  const handleCancelOrder = async (orderId) => {

    setIsCancelling(orderId);

    try {

      await cancelOrder(orderId);

      setUserOrders(prev =>
        prev.filter(o => o.id !== orderId)
      );

      toast.success("Pedido cancelado");

    } catch {

      toast.error("Erro ao cancelar pedido");

    } finally {

      setIsCancelling(null);

    }

  };
  const getIdentifierLabel = () => {

    switch (selectedType) {

      case 'employee':
        return 'Matrícula';

      case 'doctor':
        return 'CRM ou CPF';

      case 'student':
        return 'Matrícula Escolar ou CPF';

      default:
        return 'Identificação';

    }
  };

  const getIdentifierPlaceholder = () => {

    switch (selectedType) {

      case 'employee':
        return 'Digite sua matrícula';

      case 'doctor':
        return 'Digite seu CRM ou CPF';

      case 'student':
        return 'Digite sua matrícula escolar ou CPF';

      default:
        return 'Digite sua identificação';

    }
  };

  const handleTypeSelect = (type) => {

    setSelectedType(type);
    setStep('identifier');
    setIdentifier('');
    setCollaboratorName('');
    setSector('');
    setNotFound(false);

  };

  const handleSearchCollaborator = async () => {

    if (!identifier.trim()) return;
  
    setIsSearching(true);
    setNotFound(false);
    setShowStudentForm(false);
  
    try {
  
      const result = await searchCollaborator(identifier, selectedType);
  
      if (result) {
  
        setCollaboratorName(result.full_name);
        setSector(result.sector || '');
        setStep('details');
  
      } else {
  
        if (selectedType === 'student') {
          setShowStudentForm(true);
        } else {
          setNotFound(true);
        }
  
      }
  
    } catch (err) {
  
      console.error(err);
      setNotFound(true);
  
    } finally {
  
      setIsSearching(false);
  
    }
  
  };

  const handleBack = () => {

    if (step === 'details') {

      setStep('identifier');
      setCollaboratorName('');
      setSector('');

    } else if (step === 'identifier') {

      setStep('type');
      setSelectedType(null);
      setIdentifier('');

    }
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!identifier.trim() || !collaboratorName.trim() || !sector) return;

    setIsSubmitting(true);

    try {

      const payload = {
        collaborator_name: collaboratorName,
        collaborator_type: selectedType,
        identifier: identifier,
        sector: sector,
        diet_type: dietType
      };

      const result = await createMealRequest(payload);

      const now = new Date();

      const request = {

        id: result?.id || Math.random().toString(36).substring(2, 8),
        collaboratorId: result?.collaboratorId || '',
        collaboratorName,
        collaboratorType: selectedType,
        identifier,
        sector,
        mealType,
        dietType,
        status: 'Pending',
        date: now.toISOString().split('T')[0],
        shift: 'Morning',
        createdAt: now.toISOString(),

      };

      setCompletedRequest(request);

    } catch (error) {

      const message =
        error.response?.data?.detail ||
        "Erro ao registrar pedido";
    
      toast.error(message);
    
    }  finally {

      setIsSubmitting(false);

    }
  };

  const handleStudentRegister = async () => {

    if (
      !studentName.trim() ||
      !studentMatricula.trim() ||
      !studentInstituicao.trim() ||
      !studentCategory ||
      !studentSector
    ) return;
  
    setIsRegisteringStudent(true);
  
    try {
  
      await registerAcademic({
        full_name: studentName,
        institution: studentInstituicao,
        category: studentCategory,
        identifier: studentMatricula,
        sector: studentSector
      });
  
      setCollaboratorName(studentName);
      setStudentMatricula(studentMatricula);
  
      setStep("details");
      setShowStudentForm(false);
      setNotFound(false);
  
      toast.success(
        studentCategory === "RESIDENT"
          ? "Residente sua matricula tera autorização por 180 dias apos aprovação da direção"
          : "Acadêmico sua matricula tera autorização por 7 dias apos aprovação da direção"
      );
  
    } catch {
  
      toast.error("Erro ao cadastrar acadêmico");
  
    } finally {
  
      setIsRegisteringStudent(false);
  
    }
  
  };
  

  const handleNewRequest = () => {

    setCompletedRequest(null);
    setStep('type');
    setSelectedType(null);
    setIdentifier('');
    setCollaboratorName('');
    setSector('');
    setDietType('Comum');
    setNotFound(false);

  };

  const getDayOfWeek = () => {

    const days = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado'
    ];

    return days[new Date().getDay()];

  };

  useEffect(() => {
    if (showStudentForm) {
      setStudentMatricula(identifier);
    }
  }, [showStudentForm]);

  const renderRequestForm = () => {
    if (completedRequest) {
      return (
        <MealReceipt request={completedRequest} onNewRequest={handleNewRequest} />
      );
    }

    // Step 1: Select collaborator type
    if (step === 'type') {
      return (
        <div className="space-y-4">
          <p className="text-center text-muted-foreground mb-6">
            Selecione seu tipo de cadastro para continuar
          </p>
          <div className="grid gap-4">
            {collaboratorTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => handleTypeSelect(type.value)}
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all touch-manipulation"
                >
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white", type.color)}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (step === 'identifier') {
      const typeInfo = collaboratorTypes.find(t => t.value === selectedType);
      const IconComponent = typeInfo?.icon || User;
      const availableSectors = sectors || [];
      
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b">
            <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white", typeInfo?.color)}>
              <IconComponent className="w-5 h-5" />
            </div>
            <span className="font-medium">{typeInfo?.label}</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-base">{getIdentifierLabel()}</Label>
              <div className="flex gap-2">
                <Input
                  id="identifier"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setNotFound(false);
                    setShowStudentForm(false);
                  }}
                  placeholder={getIdentifierPlaceholder()}
                  className="h-12 text-base flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchCollaborator()}
                />
                <Button 
                  onClick={handleSearchCollaborator}
                  disabled={!identifier.trim() || isSearching}
                  className="h-12 px-6"
                >
                  {isSearching ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>

            {notFound && selectedType !== 'student' && (
              <div className="p-4 rounded-lg bg-destructive/10 border text-center">
                <p className="font-medium">Cadastro não encontrado</p>
                <p className="text-sm">
                  Procure o setor de Recursos Humanos ou Nutrição.
                </p>
              </div>
            )}

            {showStudentForm && selectedType === 'student' && (
              <div className="space-y-4 p-4 rounded-xl border-2 border-amber-500/30 bg-amber-500/5">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                  <p className="font-medium text-sm">Cadastro não encontrado ou expirado</p>
                </div>
                <p className="text-sm text-muted-foreground">Preencha os dados abaixo para solicitar seu cadastro:</p>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="studentName" className="text-sm">Nome Completo</Label>
                    <Input
                      id="studentName"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Digite seu nome completo"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="studentMatricula" className="text-sm">Matrícula</Label>
                    <Input
                      id="studentMatricula"
                      value={studentMatricula}
                      onChange={(e) => setStudentMatricula(e.target.value)}
                      placeholder="Digite sua matrícula"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="studentInstituicao" className="text-sm">Instituição</Label>
                    <Input
                      id="studentInstituicao"
                      value={studentInstituicao}
                      onChange={(e) => setStudentInstituicao(e.target.value)}
                      placeholder="Digite sua instituição"
                      className="h-12"
                    />
                  </div>
                  <SectorCombobox
                    value={studentSector}
                    onSelect={setStudentSector}
                    sectors={availableSectors}
                    label="Setor Atual"
                  />

                  <div className="space-y-1">
                    <Label className="text-sm">Categoria</Label>

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'RESIDENT', label: 'Residente' },
                        { value: 'COMMON', label: 'Acadêmico' },
                      ].map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setStudentCategory(cat.value)}
                          className={cn(
                            "px-3 py-2.5 rounded-lg text-sm font-medium transition-all border-2",
                            studentCategory === cat.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background hover:border-primary/50"
                          )}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleStudentRegister}
                    disabled={!studentName.trim() || !studentMatricula.trim() || !studentInstituicao.trim() || !studentCategory || isRegisteringStudent}
                    className="w-full h-12 mt-2"
                  >
                    {isRegisteringStudent ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Cadastrando...
                      </>
                    ) : (
                      'Cadastrar e Continuar'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Step 3: Confirm details, select sector and diet type
    if (step === 'details') {
      const typeInfo = collaboratorTypes.find(t => t.value === selectedType);
      const IconComponent = typeInfo?.icon || User;
      const availableSectors = sectors || [];
      
      return (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b">
            <Button type="button" variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white", typeInfo?.color)}>
              <IconComponent className="w-5 h-5" />
            </div>
            <span className="font-medium">{typeInfo?.label}</span>
          </div>

          {/* Collaborator info display */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                {collaboratorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-lg">{collaboratorName}</p>
                <p className="text-sm text-muted-foreground">{identifier}</p>
              </div>
            </div>
          </div>

          <SectorCombobox
            value={sector}
            onSelect={setSector}
            sectors={availableSectors}
            label="Setor Atual"
          />

          <DietTypeSelector
            selected={dietType}
            onSelect={setDietType}
          />

          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full h-14 text-lg"
              disabled={isSubmitting || !sector}
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
          </div>
        </form>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <UtensilsCrossed className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Hospital das Clínicas Mário Ribeiro </h1>
              <p className="text-primary-foreground/80 text-sm">Sistema de Refeições</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <Clock className="w-5 h-5" />
              <span className="text-lg font-medium">{mealLabel}</span>
            </div>
            <p className="text-sm text-primary-foreground/60">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-14 text-base">
            <TabsTrigger value="request" className="gap-2 h-12">
              <UtensilsCrossed className="w-5 h-5" />
              <span className="hidden sm:inline">Solicitar</span>
            </TabsTrigger>
            <TabsTrigger value="cancel" className="gap-2 h-12">
              <XCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Cancelar</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2 h-12">
              <ClipboardList className="w-5 h-5" />
              <span className="hidden sm:inline">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger value="menu" className="gap-2 h-12">
              <Calendar className="w-5 h-5" />
              <span className="hidden sm:inline">Cardápio</span>
            </TabsTrigger>
          </TabsList>

          {/* Request Tab */}
          <TabsContent value="request" className="space-y-6">
            <div className="max-w-lg mx-auto">
              <Card className="shadow-lg">
                <CardHeader className="bg-primary/5 rounded-t-lg ">
                  <CardTitle className="flex items-center gap-2 mt-2">
                    <UtensilsCrossed className="w-5 h-5 text-primary" />
                    Solicitar {mealLabel}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {renderRequestForm()}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cancel Tab */}
          <TabsContent value="cancel" className="space-y-6">
            <Card className="shadow-lg max-w-xl mx-auto">
              <CardHeader className="bg-destructive/10 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <XCircle className="w-5 h-5" />
                  Cancelar Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Deadline warning */}
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800">Prazo para cancelamento</p>
                    <p className="text-amber-700">Almoço: até 10:00 • Jantar: até 16:00</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cancel-identifier" className="text-base">Sua Identificação</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cancel-identifier"
                      value={cancelIdentifier}
                      onChange={(e) => {
                        setCancelIdentifier(e.target.value);
                        setCancelNotFound(false);
                        setUserOrders([]);
                      }}
                      placeholder="Matrícula, CRM ou CPF"
                      className="h-12 text-base flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchUserOrders()}
                    />
                    <Button 
                      onClick={handleSearchUserOrders}
                      disabled={!cancelIdentifier.trim() || isCancelSearching}
                      className="h-12 px-6"
                    >
                      {isCancelSearching ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Search className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {cancelNotFound && (
                  <div className="p-4 rounded-lg bg-muted text-center">
                    <p className="text-muted-foreground">Nenhum pedido pendente encontrado para esta identificação.</p>
                  </div>
                )}

                {userOrders.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Seus pedidos pendentes:
                    </p>

                    {userOrders.map((order) => {

                      const canCancelThis = canCancel(order.meal_type);

                      return (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 rounded-lg border bg-card"
                        >

                          <div>
                            <p className="font-medium">
                              {order.meal_type === "LUNCH" ? "Almoço" : "Jantar"}
                            </p>

                            <p className="text-sm text-muted-foreground">
                              {order.diet_type || "Comum"} • {order.sector}
                            </p>
                          </div>

                          <Button
                            variant="destructive"
                            className="bg-red-500 text-white"
                            size="sm"
                            disabled={!canCancelThis || isCancelling === order.id}
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            {isCancelling === order.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : canCancelThis ? (
                              "Cancelar"
                            ) : (
                              "Prazo expirado"
                            )}
                          </Button>

                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="shadow-lg">
              <CardHeader className="bg-primary/5 rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-primary" />
                    Pedidos do Dia
                  </span>
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    {todayOrders.length} pedidos
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {todayOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">
                    Nenhum pedido registrado hoje.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {todayOrders.map((order) => {

                      const matricula = order.identifier;

                      return (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">

                            <p className="font-semibold text-base truncate">
                              {order.collaborator_name}
                            </p>

                            <p className="text-sm text-muted-foreground">

                              {matricula && (
                                <span className="font-medium">
                                  Mat: {matricula} •
                                </span>
                              )}

                              {order.sector} • {order.diet_type || 'Comum'}

                            </p>

                          </div>

                          <div className="text-right">

                            <Badge
                              variant={order.status === 'DELIVERED' ? 'default' : 'secondary'}
                              className={cn(
                                order.status === 'DELIVERED' && 'bg-green-500',
                                order.status === 'PENDING' && 'bg-amber-500 text-white'
                              )}
                            >

                              {order.status === 'DELIVERED'
                                ? 'Entregue'
                                : order.status === 'PENDING'
                                ? 'Pendente'
                                : 'Cancelado'}

                            </Badge>

                            <p className="text-sm text-muted-foreground mt-1">
                              {order.meal_type === 'LUNCH' ? 'Almoço' : 'Jantar'}
                            </p>

                          </div>
                        </div>
                      );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="menu">
            <Card className="shadow-lg">
              <CardHeader className="bg-primary/5 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 mt-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Cardápio Semanal
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {weeklyMenu.map((day, index) => (
                    <div 
                      key={day.day}
                      className={cn(
                        "rounded-lg border overflow-hidden",
                        day.day === getDayOfWeek() && "ring-2 ring-primary"
                      )}
                    >
                      <div className={cn(
                        "px-4 py-3 font-semibold flex items-center justify-between",
                        day.day === getDayOfWeek() ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <span>{day.day}</span>
                        {day.day === getDayOfWeek() && (
                          <Badge variant="secondary" className="bg-primary-foreground text-primary">
                            Hoje
                          </Badge>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                        <div className="p-4 space-y-2">
                          <h4 className="font-medium text-amber-600 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            Almoço
                          </h4>
                          <div className="text-sm space-y-1 text-muted-foreground">
                            <p><strong className="text-foreground">Principal:</strong> {day.lunch.main}</p>
                            <p><strong className="text-foreground">Acompanhamento:</strong> {day.lunch.side}</p>
                            <p><strong className="text-foreground">Sobremesa:</strong> {day.lunch.dessert}</p>
                          </div>
                        </div>
                        <div className="p-4 space-y-2">
                          <h4 className="font-medium text-indigo-600 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                            Jantar
                          </h4>
                          <div className="text-sm space-y-1 text-muted-foreground">
                            <p><strong className="text-foreground">Principal:</strong> {day.dinner.main}</p>
                            <p><strong className="text-foreground">Acompanhamento:</strong> {day.dinner.side}</p>
                            <p><strong className="text-foreground">Sobremesa:</strong> {day.dinner.dessert}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>TI HCMR - Sistema de Gerenciamento de Refeições Hospitalares</p>
        </div>
      </footer>
    </div>
  );
}