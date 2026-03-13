import api from '@/services/api';

export async function ListMealsToday() {
    const response = await api.get('meal-requests/list');
    return response.data;
  }