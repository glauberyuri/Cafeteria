import { useState } from 'react';
import { CheckCircle, Users, X, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


export function DeliveryMode({ meals, onDeliverMeal, onDeliverSector, onDeliverAll, onClose }) {

  const [expandedSectors, setExpandedSectors] = useState([]);
  const [sectorFilter, setSectorFilter] = useState('all');

  // refeições pendentes
  const pendingMeals = meals.filter(m => m.status === 'PENDING');

  // agrupar por setor
  const mealsBySector = pendingMeals.reduce((acc, meal) => {

    const sector = meal.sector_name;

    if (!acc[sector]) {
      acc[sector] = [];
    }

    acc[sector].push(meal);

    return acc;

  }, {});


  const allSectors = Object.keys(mealsBySector).sort();

  const filteredSectors = sectorFilter === 'all'
    ? allSectors
    : allSectors.filter(s => s === sectorFilter);


  const toggleSector = (sector) => {

    setExpandedSectors(prev =>
      prev.includes(sector)
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    );

  };


  const handleDeliverMeal = (meal) => {

    onDeliverMeal(meal.id);
    console.log(meal)

    toast.success(`Refeição entregue para ${meal.identifier}`);

  };


  const handleDeliverSector = (sector) => {

    onDeliverSector(sector);

    toast.success(`Todas as refeições do setor ${sector} foram entregues!`);

  };


  const handleDeliverAll = async () => {

    try {
  
      await onDeliverAll();
  
      loadMeals();
  
      toast.success("Todas refeições entregues");
  
    } catch {
  
      toast.error("Erro ao entregar refeições");
  
    }
  
  };


  if (pendingMeals.length === 0) {

    return (
      <div className="fixed inset-0 bg-background/95 z-50 flex flex-col">

        <div className="bg-primary p-4 flex items-center justify-between shadow-lg">

          <h1 className="text-xl font-bold text-primary-foreground">
            Modo Entrega
          </h1>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-primary hover:bg-primary/20"
          >
            <X className="w-6 h-6" />
          </Button>

        </div>


        <div className="flex-1 flex items-center justify-center">

          <div className="text-center p-8">

            <CheckCircle className="w-16 h-16 text-status-active mx-auto mb-4" />

            <h2 className="text-2xl font-bold text-foreground mb-2">
              Todas as refeições entregues!
            </h2>

            <p className="text-muted-foreground mb-6">
              Não há refeições pendentes no momento.
            </p>

            <Button onClick={onClose}>
              Voltar
            </Button>

          </div>

        </div>

      </div>
    );

  }


  return (

    <div className="fixed inset-0 bg-background z-50 flex flex-col">


      {/* HEADER */}

      <div className="bg-primary p-4 shadow-lg">

        <div className="flex items-center justify-between mb-4">

          <div>

            <h1 className="text-xl font-bold text-primary-foreground">
              Modo Entrega
            </h1>

            <p className="text-primary-foreground/80 text-sm">
              {pendingMeals.length} refeições pendentes
            </p>

          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="w-6 h-6" />
          </Button>

        </div>


        {/* FILTRO SETOR */}

        <div className="flex gap-3">

          <div className="flex-1">

          <Select value={sectorFilter} onValueChange={setSectorFilter}>

          <SelectTrigger
            className="
              h-14
              text-lg
              px-4
              bg-primary-foreground/10
              text-primary-foreground
              border
              border-primary-foreground/20
              shadow-sm
            "
          >
            <Filter className="w-5 h-5 mr-2" />
            <SelectValue placeholder="Filtrar setor" />
          </SelectTrigger>


          <SelectContent
            className="
              text-lg
              bg-card
              border
              border-border
              shadow-lg
            "
          >

            <SelectItem value="all" className="py-3 text-lg">
              Todos os setores
            </SelectItem>

            {allSectors.map(sector => (

              <SelectItem key={sector} value={sector} className="py-3 text-lg">
                {sector} ({mealsBySector[sector].length})
              </SelectItem>

            ))}

          </SelectContent>

          </Select>

          </div>


          <Button
            onClick={handleDeliverAll}
            className="bg-green-500 hover:bg-green-500/90 text-white h-12 px-6"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Entregar Todos
          </Button>

        </div>

      </div>


      {/* LISTA */}

      <div className="flex-1 overflow-auto p-4 space-y-4">

        {filteredSectors.map((sector) => {

          const sectorMeals = mealsBySector[sector];

          const isExpanded = expandedSectors.includes(sector);

          return (

            <div key={sector} className="bg-card rounded-xl shadow-md overflow-hidden">


              {/* CABEÇALHO SETOR */}

              <div className="p-4 flex items-center justify-between border-b border-border">

                <button
                  onClick={() => toggleSector(sector)}
                  className="flex items-center gap-3 flex-1"
                >

                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>

                  <div className="text-left">

                    <h2 className="text-lg font-semibold text-foreground">
                      {sector}
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      {sectorMeals.length} refeições pendentes
                    </p>

                  </div>

                  {isExpanded
                    ? <ChevronUp className="w-5 h-5 ml-auto" />
                    : <ChevronDown className="w-5 h-5 ml-auto" />
                  }

                </button>


                <Button
                  onClick={() => handleDeliverSector(sector)}
                  className="ml-4 bg-blue-400 hover:bg-blue-900/90 text-white"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Entrega por Setor
                </Button>

              </div>


              {isExpanded && (
                <div className="divide-y divide-border">
                  {sectorMeals.map((meal) => (
                    <button
                      key={meal.id}
                      onClick={() => handleDeliverMeal(meal)}
                      className="w-full p-4 flex items-center justify-between hover:bg-accent/50"
                    >

                      <div className="text-left">

                        <h3 className="text-base font-semibold text-foreground">
                        {meal.identifier} • {meal.collaborator_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                        {meal.meal_type} • {meal.diet_type} • {meal.date}
                        </p>

                      </div>


                      <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-status-active" />
                      </div>

                    </button>

                  ))}

                </div>

              )}

            </div>

          );

        })}

      </div>


      {/* FOOTER */}

      <div className="bg-card border-t border-border p-4">

        <div className="flex items-center justify-between text-sm">

          <span className="text-muted-foreground">
            {filteredSectors.length} setores • {pendingMeals.length} pendentes
          </span>

          <Button variant="outline" onClick={onClose}>
            Sair do Modo Entrega
          </Button>

        </div>

      </div>

    </div>

  );

}