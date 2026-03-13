import { createContext, useContext, useMemo, useState } from "react";
import {
  getEmployees,
  getDoctors,
  getAcademics,
  createEmployee,
  updateEmployee,
  createDoctor,
  updateDoctor,
  createAcademic,
  updateAcademic,
  saveMealPreference,
} from "@/services/collaborators";

import { toast } from "sonner";

const CollaboratorContext = createContext(null);

const PAGE_SIZE = 10;

export function CollaboratorProvider({ children }) {

  const [allCollaborators, setAllCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [shift, setShift] = useState("ALL");

  async function loadCollaborators() {

    try {

      setLoading(true);

      const [employees, doctors, academics] = await Promise.all([
        getEmployees(),
        getDoctors(),
        getAcademics(),
      ]);

      const merged = [
        ...employees.map((e) => ({ ...e, type: "EMPLOYEE" })),
        ...doctors.map((d) => ({ ...d, type: "DOCTOR" })),
        ...academics.map((a) => ({ ...a, type: "ACADEMIC" })),
      ];

      setAllCollaborators(merged);
      setPage(1);

    } catch {

      toast.error("Erro ao carregar colaboradores");

    } finally {

      setLoading(false);

    }
  }

  async function saveCollaborator(data) {

    try {

      let saved;

      if (data.type === "EMPLOYEE") {

        saved = data.id
          ? await updateEmployee(data.id, data)
          : await createEmployee(data);

        if (data.meal_preference) {
          await saveMealPreference(
            saved.registration,
            data.meal_preference
          );
        }
      }

      if (data.type === "DOCTOR") {

        saved = data.id
          ? await updateDoctor(data.id, data)
          : await createDoctor(data);
      }

      if (data.type === "ACADEMIC") {

        saved = data.id
          ? await updateAcademic(data.id, data)
          : await createAcademic(data);
      }

      await loadCollaborators();

      toast.success("Colaborador salvo com sucesso");

      return saved;

    } catch (err) {

      toast.error("Erro ao salvar colaborador");
      throw err;

    }
  }

  /* FILTRO */

  const filteredCollaborators = useMemo(() => {

    const term = search.toLowerCase();

    return allCollaborators.filter((c) => {

      const matchesSearch =
        !term ||
        c.full_name?.toLowerCase().includes(term) ||
        c.department_name?.toLowerCase().includes(term) ||
        c.registration?.toLowerCase().includes(term) ||
        c.crm?.toLowerCase().includes(term);

      const matchesShift =
        shift === "ALL"
          ? true
          : c.type === "EMPLOYEE"
          ? c.shift === shift
          : true;

      return matchesSearch && matchesShift;

    });

  }, [allCollaborators, search, shift]);

  /* PAGINAÇÃO */

  const totalItems = filteredCollaborators.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  const collaborators = useMemo(() => {

    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    return filteredCollaborators.slice(start, end);

  }, [filteredCollaborators, page]);

  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;

  const startIndex = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(page * PAGE_SIZE, totalItems);

  return (

    <CollaboratorContext.Provider
      value={{

        collaborators,
        allCollaborators,

        loading,
        loadCollaborators,
        saveCollaborator,

        search,
        setSearch,

        shift,
        setShift,

        page,
        setPage,

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
    throw new Error(
      "useCollaborators must be used within CollaboratorProvider"
    );
  }

  return ctx;
}