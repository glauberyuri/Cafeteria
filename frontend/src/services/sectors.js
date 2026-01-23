import api from '@/services/api';


export async function getSectors(params = {}) {
  const response = await api.get('sectors/', { params });
  return response.data;
}


export async function createSector(data) {
  const response = await api.post('sectors/', data);
  return response.data;
}


export async function updateSector(id, data) {
  const response = await api.put(`sectors/${id}/`, data);
  return response.data;
}


export async function patchSector(id, data) {
  const response = await api.patch(`sectors/${id}/`, data);
  return response.data;
}


export async function deleteSector(id) {
  await api.delete(`sectors/${id}/`);
}
