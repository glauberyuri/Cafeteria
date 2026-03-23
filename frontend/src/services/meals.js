import api from '@/services/api';

export async function ListMealsToday(date) {

    const response = await api.get('/meal-requests/list', {
      params: {
        date: date
      }
    });
  
    return response.data;
  }

  export async function deliverMeal(mealId) {
    return api.post(`/meal-requests/${mealId}/deliver/`);
  }

  export async function deliverSector(sector) {
    const response = await api.post("/meal-requests/deliver_sector/", {
      sector: sector
    });
    return response.data;
  }
  
  export async function deliverAllMeals() {
    const response = await api.post("/meal-requests/deliver_all/");
    return response.data;
  }