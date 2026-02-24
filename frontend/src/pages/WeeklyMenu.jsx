import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  Save,
  Copy,
  RotateCcw,
  CalendarDays,
  UtensilsCrossed,
  ChefHat,
  Check,
  Clipboard,
} from 'lucide-react';
import { toast } from 'sonner';

const DAYS = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sabado',
  'Domingo',
];

  const WEEKDAY_MAP = {
    'Segunda-feira': 0,
    'Terça-feira': 1,
    'Quarta-feira': 2,
    'Quinta-feira': 3,
    'Sexta-feira': 4,
    'Sabado': 5,
    'Domingo': 6,
  };

  const WEEKDAY_LABEL_MAP = {
    0: 'Segunda-feira',
    1: 'Terça-feira',
    2: 'Quarta-feira',
    3: 'Quinta-feira',
    4: 'Sexta-feira',
    5: 'Sabado',
    6: 'Domingo',
  };


  function normalizeBackendMenu(items) {
    const base = createEmptyWeek();
  
    items.forEach(item => {
      const dayLabel = WEEKDAY_LABEL_MAP[item.weekday];
      const day = base.find(d => d.day === dayLabel);
  
      if (!day) return;
  
      if (item.meal_type === 'LUNCH') {
        day.lunch = {
          main: item.main || '',
          side: item.side || '',
          dessert: item.dessert || '',
        };
      }
  
      if (item.meal_type === 'DINNER') {
        day.dinner = {
          main: item.main || '',
          side: item.side || '',
          dessert: item.dessert || '',
        };
      }
    });
  
    return base;
  }
  
const emptyMeal = { main: '', side: '', dessert: '' };

const createEmptyWeek = () =>
  DAYS.map(day => ({
    day,
    lunch: { ...emptyMeal },
    dinner: { ...emptyMeal },
  }));

const TEMPLATES = [
  {
    name: 'Padrão Hospitalar',
    menu: [
      {
        day: 'Segunda-feira',
        lunch: { main: 'Frango Grelhado', side: 'Arroz, Feijão, Salada', dessert: 'Gelatina' },
        dinner: { main: 'Carne Assada', side: 'Purê de Batata, Legumes', dessert: 'Fruta' },
      },
      {
        day: 'Terça-feira',
        lunch: { main: 'Peixe ao Molho', side: 'Arroz, Farofa, Salada', dessert: 'Pudim' },
        dinner: { main: 'Strogonoff de Frango', side: 'Arroz, Batata Palha', dessert: 'Gelatina' },
      },
      {
        day: 'Quarta-feira',
        lunch: { main: 'Bife Acebolado', side: 'Arroz, Feijão, Salada', dessert: 'Fruta' },
        dinner: { main: 'Frango à Parmegiana', side: 'Arroz, Purê', dessert: 'Mousse' },
      },
      {
        day: 'Quinta-feira',
        lunch: { main: 'Feijoada Light', side: 'Arroz, Couve, Farofa', dessert: 'Laranja' },
        dinner: { main: 'Escondidinho de Carne', side: 'Salada Verde', dessert: 'Gelatina' },
      },
      {
        day: 'Sexta-feira',
        lunch: { main: 'Lasanha de Frango', side: 'Salada Mista', dessert: 'Sorvete' },
        dinner: { main: 'Peixe Grelhado', side: 'Arroz, Legumes', dessert: 'Fruta' },
      },
      {
        day: 'Sabado',
        lunch: { main: 'Lasanha de Frango', side: 'Salada Mista', dessert: 'Sorvete' },
        dinner: { main: 'Peixe Grelhado', side: 'Arroz, Legumes', dessert: 'Fruta' },
      },
      {
        day: 'Domingo',
        lunch: { main: 'Lasanha de Frango', side: 'Salada Mista', dessert: 'Sorvete' },
        dinner: { main: 'Peixe Grelhado', side: 'Arroz, Legumes', dessert: 'Fruta' },
      },
    ],
  },
];



export default function WeeklyMenu() {
  const [menu, setMenu] = useState(createEmptyWeek());
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [isSaved, setIsSaved] = useState(false);
  const [menuId, setMenuId] = useState(null);


  function getWeekStartDate() {
    const today = new Date();
    const day = today.getDay(); // 0 = domingo
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().slice(0, 10);
  }

  useEffect(() => {
    async function loadMenu() {
      try {
        const res = await api.get('/weekly-menu/');
        if (res.data) {
          setMenu(normalizeBackendMenu(res.data.items));
          setMenuId(res.data.id);
          setIsSaved(true);
        }
      } catch {
        // não existe ainda
      }
    }
  
    loadMenu();
  }, []);
  

  const currentIndex = menu.findIndex(m => m.day === selectedDay);
  const currentDayMenu = menu[currentIndex];



  function buildItems(menu, weeklyMenuId) {
    const items = [];
  
    menu.forEach(day => {
      const weekday = WEEKDAY_MAP[day.day];
  
      if (day.lunch.main?.trim()) {
        items.push({
          weekly_menu: weeklyMenuId,
          weekday,
          meal_type: 'LUNCH',
          main: day.lunch.main,
          side: day.lunch.side,
          dessert: day.lunch.dessert,
        });
      }
  
      if (day.dinner.main?.trim()) {
        items.push({
          weekly_menu: weeklyMenuId,
          weekday,
          meal_type: 'DINNER',
          main: day.dinner.main,
          side: day.dinner.side,
          dessert: day.dinner.dessert,
        });
      }
    });
  
    return items;
  }

  
  function updateMeal(meal, field, value) {
    setMenu(prev =>
      prev.map((d, i) =>
        i === currentIndex
          ? { ...d, [meal]: { ...d[meal], [field]: value } }
          : d
      )
    );
    setIsSaved(false);
  }

  function applyTemplate(template) {
    setMenu(template.map(d => ({
      ...d,
      lunch: { ...d.lunch },
      dinner: { ...d.dinner },
    })));
    setIsSaved(false);
    toast.success('Template aplicado com sucesso!');
  }

  function copyDayTo(targetDay) {
    setMenu(prev =>
      prev.map(d =>
        d.day === targetDay
          ? { ...d, lunch: { ...currentDayMenu.lunch }, dinner: { ...currentDayMenu.dinner } }
          : d
      )
    );
    setIsSaved(false);
    toast.success(`Cardápio copiado para ${targetDay}`);
  }

  async function clearWeek() {
    try {
      if (menuId) {
        await api.delete('/weekly-menu-items/bulk/', {
          data: { weekly_menu: menuId }
        });
      }
  
      setMenu(createEmptyWeek());
      setIsSaved(false);
      toast.success('Cardápio apagado com sucesso');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao limpar cardápio');
    }
  }

  async function handleSave() {
    try {
      
      const weeklyPayload = {
        reference_date: getWeekStartDate(),
      };
  
      let weeklyMenuId = menuId;
  
      if (!weeklyMenuId) {
        const res = await api.post('/weekly-menu/', weeklyPayload);
        weeklyMenuId = res.data.id;
        setMenuId(weeklyMenuId);
      }
  
      
      const items = buildItems(menu, weeklyMenuId);
  
      if (items.length === 0) {
        toast.error('Preencha ao menos uma refeição');
        return;
      }
  
      
      await api.post('/weekly-menu-items/bulk/', {
        weekly_menu: weeklyMenuId,
        items,
      });
  
      setIsSaved(true);
      toast.success('Cardápio da semana salvo com sucesso!');
    } catch (err) {
      console.error(err?.response?.data || err);
      toast.error('Erro ao salvar cardápio');
    }
  }
  
  

  function isDayFilled(day) {
    return day.lunch.main.trim() || day.dinner.main.trim();
  }

  function dayShortLabel(day) {
    return day.substring(0, 3);
  }

  return (
    <MainLayout title="Cardápio Semanal">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ChefHat className="w-7 h-7 text-primary" />
              Cardápio Semanal
            </h1>
            <p className="text-muted-foreground mt-1">
              Preencha o cardápio da semana.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearWeek}>
              <RotateCcw className="w-4 h-4 mr-1" /> Limpar
            </Button>
            <Button size="sm" onClick={handleSave}>
              {isSaved ? <Check className="w-4 h-4 mr-1" /> : <Save className="w-4 h-4 mr-1" />}
              {isSaved ? 'Salvo' : 'Salvar Semana'}
            </Button>
          </div>
        </div>

        {/* Templates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Clipboard className="w-5 h-5" />
              Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            {TEMPLATES.map(t => (
              <Button key={t.name} variant="outline" size="sm" onClick={() => applyTemplate(t.menu)}>
                <Copy className="w-4 h-4 mr-1" />
                {t.name}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Day Selector */}
        <div className="flex gap-2 overflow-x-auto">
          {menu.map(day => (
            <button
              key={day.day}
              onClick={() => setSelectedDay(day.day)}
              className={`px-4 py-3 rounded-xl border-2 min-w-[80px]
                ${selectedDay === day.day
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border'}
              `}
            >
              <CalendarDays className="w-4 h-4 mx-auto" />
              <span className="text-sm">{dayShortLabel(day.day)}</span>
              {isDayFilled(day) && <span className="block w-2 h-2 mx-auto bg-primary rounded-full mt-1" />}
            </button>
          ))}
        </div>

               {/* Day Editor */}
               <div className="grid md:grid-cols-2 gap-4">
          {/* Almoço */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-primary" />
                Almoço — {selectedDay}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Prato Principal</Label>
                <Input
                  value={currentDayMenu.lunch.main}
                  onChange={e => updateMeal('lunch', 'main', e.target.value)}
                  placeholder="Ex: Frango Grelhado"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Acompanhamentos</Label>
                <Input
                  value={currentDayMenu.lunch.side}
                  onChange={e => updateMeal('lunch', 'side', e.target.value)}
                  placeholder="Ex: Arroz, Feijão, Salada"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Sobremesa</Label>
                <Input
                  value={currentDayMenu.lunch.dessert}
                  onChange={e => updateMeal('lunch', 'dessert', e.target.value)}
                  placeholder="Ex: Gelatina"
                />
              </div>
            </CardContent>
          </Card>

          {/* Jantar */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-accent-foreground" />
                Jantar — {selectedDay}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Prato Principal</Label>
                <Input
                  value={currentDayMenu.dinner.main}
                  onChange={e => updateMeal('dinner', 'main', e.target.value)}
                  placeholder="Ex: Carne Assada"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Acompanhamentos</Label>
                <Input
                  value={currentDayMenu.dinner.side}
                  onChange={e => updateMeal('dinner', 'side', e.target.value)}
                  placeholder="Ex: Purê de Batata, Legumes"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Sobremesa</Label>
                <Input
                  value={currentDayMenu.dinner.dessert}
                  onChange={e => updateMeal('dinner', 'dessert', e.target.value)}
                  placeholder="Ex: Fruta"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Copy to other day */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Copy className="w-5 h-5" />
              Copiar "{selectedDay}" para outro dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {DAYS.filter(d => d !== selectedDay).map(day => (
                <Button
                  key={day}
                  variant="outline"
                  size="sm"
                  onClick={() => copyDayTo(day)}
                >
                  → {dayShortLabel(day)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Week Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Resumo da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Dia</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Almoço</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Jantar</th>
                    <th className="text-center py-2 px-2 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {menu.map(day => {
                    const filled = isDayFilled(day);
                    return (
                      <tr
                        key={day.day}
                        className="border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedDay(day.day)}
                      >
                        <td className="py-2 px-2 font-medium">{dayShortLabel(day.day)}</td>
                        <td className="py-2 px-2 text-muted-foreground truncate max-w-[200px]">
                          {day.lunch.main || '—'}
                        </td>
                        <td className="py-2 px-2 text-muted-foreground truncate max-w-[200px]">
                          {day.dinner.main || '—'}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <Badge variant={filled ? 'default' : 'secondary'} className="text-xs">
                            {filled ? 'Preenchido' : 'Vazio'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>             
      </div>
    </MainLayout>
  );
}
