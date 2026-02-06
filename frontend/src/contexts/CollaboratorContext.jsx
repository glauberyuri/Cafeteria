import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  getEmployees,
  getDoctors,
  getAcademics,
  createEmployee,
  createDoctor,
  createAcademic,
  updateEmployee,
  updateDoctor,
  updateAcademic,
  saveMealPreference,
} from '@/services/collaborators';
import { toast } from 'sonner';

const CollaboratorContext = createContext(null);

const PAGE_SIZE = 9; // ajuste como quiser

export function CollaboratorProvider({ children }) {
  const [allCollaborators, setAllCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [page, setPage] = useState(1);

  async function loadCollaborators() {
    try {
      setLoading(true);

      const [employees, doctors, academics] = await Promise.all([
        getEmployees(),
        getDoctors(),
        getAcademics(),
      ]);

      const merged = [
        ...employees.map(e => ({ ...e, type: 'EMPLOYEE' })),
        ...doctors.map(d => ({ ...d, type: 'DOCTOR' })),
        ...academics.map(a => ({ ...a, type: 'ACADEMIC' })),
      ];

      setAllCollaborators(merged);
      setPage(1); // reset página ao recarregar
    } catch {
      toast.error('Erro ao carregar colaboradores');
    } finally {
      setLoading(false);
    }
  }
  async function saveCollaborator(data) {
    try {
      let saved;
  
      if (data.type === 'EMPLOYEE') {
        saved = data.id
          ? await updateEmployee(data.id, data)
          : await createEmployee(data);
  
        // 🔥 SALVA AUTOMACAO
        if (data.meal_preference) {
          await saveMealPreference(
            saved.registration,
            data.meal_preference
          );
        }
      }
  
      if (data.type === 'DOCTOR') {
        saved = data.id
          ? await updateDoctor(data.id, data)
          : await createDoctor(data);
      }
  
      if (data.type === 'ACADEMIC') {
        saved = data.id
          ? await updateAcademic(data.id, data)
          : await createAcademic(data);
      }
  
      await loadCollaborators();
      toast.success('Colaborador salvo com sucesso');
      return saved;
    } catch (err) {
      toast.error('Erro ao salvar colaborador');
      throw err;
    }
  }
  

  const totalItems = allCollaborators.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  const collaborators = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return allCollaborators.slice(start, end);
  }, [allCollaborators, page]);

  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;

  const startIndex = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(page * PAGE_SIZE, totalItems);

  /* =======================
     PROVIDER
     ======================= */
  return (
    <CollaboratorContext.Provider
      value={{
        collaborators,
        allCollaborators,
        loading,
        loadCollaborators,
        saveCollaborator,
        page,
        setPage,
        pageSize: PAGE_SIZE,
        totalItems,
        totalPages,
        hasPrevPage,
        hasNextPage,
        startIndex,
        endIndex,
      }}
    >
      {children}
    </CollaboratorContext.Provider>
  );
}

export function useCollaborators() {
  const ctx = useContext(CollaboratorContext);
  if (!ctx) {
    throw new Error('useCollaborators must be used within CollaboratorProvider');
  }
  return ctx;
}
