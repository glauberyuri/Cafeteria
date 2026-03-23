import { useState, useEffect, useMemo } from 'react';
import { Calendar, Truck } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MealCard } from '@/components/meals/MealCard';
import { FilterButton } from '@/components/meals/FilterButton';
import { DeliveryMode } from '@/components/meals/DeliveryMode';
import { deliverMeal, deliverSector, deliverAllMeals } from "@/services/meals";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMeals } from "@/contexts/MealsContext";
import { getSectors } from "@/services/sectors";


export default function Meals() {

    const { loadMeals, allMeals } = useMeals();

    const [selectedSector, setSelectedSector] = useState('All Sectors');
    const [selectedShift, setSelectedShift] = useState('All Shifts');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [selectedStatus, setSelectedStatus] = useState();
    const [isDeliveryMode, setIsDeliveryMode] = useState(false);
    const [sectors, setSectors] = useState([]);

    const statuses = [
        { value: 'All', label: 'Todos' },
        { value: 'PENDING', label: 'Pendente' },
        { value: 'DELIVERED', label: 'Entregue' },
        { value: 'CANCELLED', label: 'Cancelado' }
      ];

    const shifts = [
        {value:'LUNCH', label:'Almoço'},
        {value:'DINNER', label: 'Jantar'}];

    useEffect(() => {

        loadMeals(selectedDate);
      
        const interval = setInterval(() => {
          loadMeals(selectedDate);
        }, 10000);
      
        return () => clearInterval(interval);
      
      }, [selectedDate]);

  useEffect(() => {
    async function loadSectors() {
      try {
        const data = await getSectors({ active: true });
        setSectors(data);
      } catch (err) {
        console.error("Erro ao carregar setores", err);
      }
    }

    loadSectors();
  }, []);

  const handleDeliverAll = async () => {

    try {
  
      await deliverAllMeals();
  
      loadMeals(selectedDate);
  
      toast.success("Todas refeições entregues");
  
    } catch {
  
      toast.error("Erro ao entregar refeições");
  
    }
  
  };

  const handleDeliverMeal = async (mealId) => {

    try {
  
      await deliverMeal(mealId);
  
      loadMeals(selectedDate);
  
    } catch {
  
      toast.error("Erro ao entregar refeição");
  
    }
  
  };

  const handleDeliverSector = async (sector) => {

    try {
  
      await deliverSector(sector);
  
      loadMeals(selectedDate);
  
      toast.success(`Setor ${sector} entregue`);
  
    } catch {
  
      toast.error("Erro ao entregar setor");
  
    }
  
  };


  const meals = allMeals;

  const filteredMeals = useMemo(() => {

    return meals.filter((meal) => {
  
      const matchesSector =
        selectedSector === 'ALL' ||
        meal.sector_name === selectedSector;
  
      const matchesShift =
        selectedShift === 'All Shifts' ||
        meal.meal_type === selectedShift;
  
      const matchesDate =
        meal.date?.split("T")[0] === selectedDate;
  
      const matchesStatus =
        selectedStatus === 'All' ||
        meal.status === selectedStatus;
  
      return (
        matchesSector &&
        matchesShift &&
        matchesDate &&
        matchesStatus
      );
  
    });
  
  }, [meals, selectedSector, selectedShift, selectedDate, selectedStatus]);

    const pendingCount = meals.filter(
        m => m.status === 'PENDING'
    ).length;


  if (isDeliveryMode) {
    return (
      <DeliveryMode
        meals={meals}
        onDeliverMeal={handleDeliverMeal}
        onDeliverSector={handleDeliverSector}
        onDeliverAll={handleDeliverAll}
        onClose={() => setIsDeliveryMode(false)}
      />
    );
  }

  return (
    <MainLayout title="Refeições">
      {/* Delivery Mode Button */}
      <div className="mb-6">
        <Button
          onClick={() => setIsDeliveryMode(true)}
          className="w-full sm:w-auto bg-green-600 hover:bg-green-950/90 text-white touch-target text-lg py-6 px-8"
          disabled={pendingCount === 0}
        >
          <Truck className="w-6 h-6 mr-3" />
          Modo Entrega Rápida
          {pendingCount > 0 && (
            <span className="ml-3 bg-white/20 px-3 py-1 rounded-full text-sm">
              {pendingCount} pendentes
            </span>
          )}
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl p-6 shadow-md mb-6 space-y-4">
        {/* Row 1: Sector */}
        <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Setor
            </label>

            <div className="flex gap-2 flex-wrap">

            <FilterButton
                key="ALL"
                label="Todos"
                active={selectedSector === 'ALL'}
                onClick={() => setSelectedSector('ALL')}
            />

            {sectors
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((sector) => (

                <FilterButton
                    key={sector.id}
                    label={sector.name}
                    active={selectedSector === sector.name}
                    onClick={() => setSelectedSector(sector.name)}
                />

            ))}

            </div>
        </div>

        {/* Row 2: Shift & Date */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Turno</label>
            <div className="flex gap-2 flex-wrap">
              {shifts.map((shift) => (
                <FilterButton
                  key={shift.value}
                  label={shift.label}
                  active={selectedShift === shift.value}
                  onClick={() => setSelectedShift(shift.value)}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Data</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-12 w-48"
                />
            </div>
          </div>
        </div>

        {/* Row 3: Status */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Status</label>
          <div className="flex gap-2 flex-wrap">
            {statuses.map((status) => (
              <FilterButton
                key={status.value}
                label={status.label}
                active={selectedStatus === status.value}
                onClick={() => setSelectedStatus(status.value)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        Mostrando <span className="font-semibold text-foreground">{filteredMeals.length}</span> refeições
      </p>

      {/* Meals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredMeals.map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </div>

      {filteredMeals.length === 0 && (
        <div className="text-center py-12 bg-card rounded-xl shadow-md">
          <p className="text-muted-foreground text-lg">Nenhuma refeição encontrada para os filtros selecionados</p>
        </div>
      )}
    </MainLayout>
  );
}
