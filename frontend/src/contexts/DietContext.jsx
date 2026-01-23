import { createContext, useContext, useEffect, useState } from 'react';
import {
  getDiets,
  createDiet,
  updateDiet,
  patchDiet,
  deleteDiet,
} from '@/services/diet';
import { toast } from 'sonner';

const DietContext = createContext(null)


export function DietsProvider({ children }) {
    const [diets, setDiets] = useState([]);
    const [loading, setLoading] = useState(false);
  
    async function loadDiets(params = {}) {
      try {
        setLoading(true);
        const data = await getDiets(params);
        setDiets(data);
      } catch {
        toast.error('Erro ao carregar dietas');
      } finally {
        setLoading(false);
      }
    }
  
    async function addDiet(data) {
      try {
        const diet = await createDiet(data);
        setDiets(prev => [...prev, diet]);
        toast.success('Dieta criado');
        return diet;
      } catch {
        toast.error('Erro ao criar Dieta');
        throw new Error();
      }
    }
  
    async function editDiet(id, data) {
      try {
        const updated = await updateDiet(id, data);
        setDiets(prev =>
          prev.map(s => (s.id === id ? updated : s))
        );
        return updated;
      } catch {
        toast.error('Erro ao atualizar dieta');
        throw new Error();
      }
    }
  
    async function toggleDietStatus(diet) {
      try {
        const updated = await patchDiet(diet.id, {
          is_active: !diet.is_active,
        });
        setDiets(prev =>
          prev.map(s => (s.id === diet.id ? updated : s))
        );
        toast.info('Status atualizado!');
      } catch {
        toast.error('Erro ao alterar status');
      }
    }
  
    async function removeDiet(id) {
      try {
        await deleteDiet(id);
        setDiets(prev => prev.filter(s => s.id !== id));
        toast.error('Dieta removido');
      } catch {
        toast.error('Erro ao remover dieta');
      }
    }
  
    return (
      <DietContext.Provider
        value={{
          diets,
          loading,
          loadDiets,
          addDiet,
          editDiet,
          toggleDietStatus,
          removeDiet,
        }}
      >
        {children}
      </DietContext.Provider>
    );
  }
  
  export function useDiets() {
    const context = useContext(DietContext);
    if (!context) {
      throw new Error('useDiets must be used within DietProvider');
    }
    return context;
  }