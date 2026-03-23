import { useEffect, useMemo, useState } from "react";
import { Plus, Search, LayoutGrid, List } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { CollaboratorCard } from "@/components/collaborators/CollaboratorCard";
import { CollaboratorTable } from "@/components/collaborators/CollaboratorTable";
import { CollaboratorPagination } from "@/components/collaborators/CollaboratorPagination";
import { CollaboratorFormDialog } from "@/components/collaborators/CollaboratorFormDialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { getSectors } from "@/services/sectors";
import { FilterButton } from "@/components/meals/FilterButton";

import { useCollaborators } from "@/contexts/CollaboratorContext";

const SHIFTS = [
  { label: "Todos", value: "ALL" },
  { label: "Dia", value: "DAY" },
  { label: "Noite", value: "NIGHT" },
];

export default function Collaborators() {

  const {
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

    totalPages,
    totalItems,

    startIndex,
    endIndex,

    hasNextPage,
    hasPrevPage
  } = useCollaborators();

  const [viewMode, setViewMode] = useState("table");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [sectors, setSectors] = useState([]);


  useEffect(() => {
    loadCollaborators();
  }, []);


  useEffect(() => {
    async function loadSectors() {
      try {
        const data = await getSectors({ active: true });
        setSectors(data);
      } catch (err) {
        console.error("Erro ao carregar setores", err);
      }
    }

    loadSectors();
  }, []);


  const activeCount = useMemo(
    () => allCollaborators.filter((c) => c.active).length,
    [allCollaborators]
  );

  async function handleSave(data) {
    await saveCollaborator(data);
    setEditing(null);
    setDialogOpen(false);
  }

  return (
    <MainLayout title="Colaboradores">

      {/* TOOLBAR */}

      <div className="flex flex-col lg:flex-row gap-4 mb-6">

        {/* SEARCH */}

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

          <Input
            placeholder="Buscar por nome, setor ou identificador..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-12"
          />
        </div>

        {/* SHIFT FILTER */}

        <div className="flex gap-2 flex-wrap">
          {SHIFTS.map((s) => (
            <FilterButton
              key={s.value}
              label={s.label}
              active={shift === s.value}
              onClick={() => {
                setShift(s.value);
                setPage(1);
              }}
            />
          ))}
        </div>

        {/* VIEW MODE */}

        <div className="flex gap-1 border rounded-lg p-1">

          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("table")}
          >
            <List className="w-4 h-4" />
          </Button>

          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>

        </div>

        {/* ADD */}

        <Button
          className="lg:ml-auto"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo colaborador
        </Button>

      </div>

      {/* STATS */}

      <div className="flex gap-6 mb-6 text-sm">

        <span>
          Total: <strong>{totalItems}</strong>
        </span>

        <span>
          Ativos: <strong>{activeCount}</strong>
        </span>

        <span>
          Mostrando: <strong>{startIndex} - {endIndex}</strong>
        </span>

      </div>

      {/* CONTENT */}

      {loading ? (

        <div className="text-center py-12 text-muted-foreground">
          Carregando colaboradores...
        </div>

      ) : viewMode === "table" ? (

        <CollaboratorTable
          collaborators={collaborators}
          onEdit={(c) => {
            setEditing(c);
            setDialogOpen(true);
          }}
        />

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {collaborators.map((c) => (
            <CollaboratorCard
              key={`${c.type}-${c.id}`}
              collaborator={c}
              onEdit={() => {
                setEditing(c);
                setDialogOpen(true);
              }}
            />
          ))}

        </div>

      )}

      {!loading && collaborators.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum colaborador encontrado
        </div>
      )}

      {/* PAGINATION */}

      <CollaboratorPagination
        currentPage={page}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={totalItems}
        onPageChange={setPage}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
      />

      {/* FORM */}

      <CollaboratorFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        collaborator={editing}
        onSave={handleSave}
        sectors={sectors}
      />

    </MainLayout>
  );
}