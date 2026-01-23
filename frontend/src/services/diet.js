import api from '@/services/api';

    export async function getDiets(params = {}){
        const response = await api.get('diet_type/', { params });
        return response.data;
    }
    
    export async function createDiet(data) {
        const response = await api.post('diet_type/', data);
        return response.data;
    }

    export async function updateDiet(id, data) {
        const response = await api.put(`diet_type/${id}/`, data);
        return response.data;
      }
      
      
      export async function patchDiet(id, data) {
        const response = await api.patch(`diet_type/${id}/`, data);
        return response.data;
      }
      
      
      export async function deleteDiet(id) {
        await api.delete(`diet_type/${id}/`);
      }
      