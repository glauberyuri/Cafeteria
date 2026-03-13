import { useState } from 'react';
import { Calendar, Truck } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MealCard } from '@/components/meals/MealCard';
import { FilterButton } from '@/components/meals/FilterButton';
import { DeliveryMode } from '@/components/meals/DeliveryMode';
import { mockMeals as initialMeals, sectors, shifts } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Meal } from '@/types';

export default function Meals() {
  const [meals, setMeals] = useState(initialMeals);
  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [selectedShift, setSelectedShift] = useState('All Shifts');
  const [selectedDate, setSelectedDate] = useState('2026-01-14');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isDeliveryMode, setIsDeliveryMode] = useState(false);

  const statuses = ['All', 'Pending', 'Delivered', 'Cancelled'];

  const handleDeliverMeal = (mealId) => {
    setMeals(prev => prev.map(meal => 
      meal.id === mealId ? { ...meal, status: 'Delivered' } : meal
    ));
  };

  const handleDeliverSector = (sector) => {
    setMeals(prev => prev.map(meal => 
      meal.sector === sector && meal.status === 'Pending' 
        ? { ...meal, status: 'Delivered' } 
        : meal
    ));
  };

  const filteredMeals = meals.filter((meal) => {
    const matchesSector = selectedSector === 'All Sectors' || meal.sector === selectedSector;
    const matchesShift = selectedShift === 'All Shifts' || meal.shift === selectedShift;
    const matchesDate = meal.date === selectedDate;
    const matchesStatus = selectedStatus === 'All' || meal.status === selectedStatus;
    return matchesSector && matchesShift && matchesDate && matchesStatus;
  });

  const pendingCount = meals.filter(m => m.status === 'Pending').length;

  if (isDeliveryMode) {
    return (
      <DeliveryMode
        meals={meals}
        onDeliverMeal={handleDeliverMeal}
        onDeliverSector={handleDeliverSector}
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
          className="w-full sm:w-auto bg-status-active hover:bg-status-active/90 text-white touch-target text-lg py-6 px-8"
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
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Setor</label>
          <div className="flex gap-2 flex-wrap">
            {sectors.map((sector) => (
              <FilterButton
                key={sector}
                label={sector}
                active={selectedSector === sector}
                onClick={() => setSelectedSector(sector)}
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
                  key={shift}
                  label={shift}
                  active={selectedShift === shift}
                  onClick={() => setSelectedShift(shift)}
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
                key={status}
                label={status}
                active={selectedStatus === status}
                onClick={() => setSelectedStatus(status)}
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
