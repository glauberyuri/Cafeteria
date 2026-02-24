import { useMemo } from 'react';


export function useMealTypeByTime(){
  return useMemo(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeInMinutes = hours * 60 + minutes;
    
    // Antes das 9:00 (540 minutos) = Almoço
    // A partir das 9:00 = Jantar
    const isLunch = timeInMinutes < 540; // 9:00
    
    return {
      mealType: isLunch ? 'Lunch' : 'Dinner',
      mealLabel: isLunch ? 'Almoço' : 'Jantar',
    };
  }, []);
}
