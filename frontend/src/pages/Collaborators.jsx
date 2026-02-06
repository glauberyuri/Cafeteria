import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, LayoutGrid, List } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CollaboratorCard } from '@/components/collaborators/CollaboratorCard';
import { CollaboratorTable } from '@/components/collaborators/CollaboratorTable';
import { CollaboratorPagination } from '@/components/collaborators/CollaboratorPagination';
import { CollaboratorFormDialog } from '@/components/collaborators/CollaboratorFormDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSectors } from '@/services/sectors';
import { FilterButton } from '@/components/meals/FilterButton';
import { useCollaborators } from '@/contexts/CollaboratorContext';

const SHIFTS = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Dia', value: 'DAY' },
  { label: 'Noite', value: 'NIGHT' },
];

export default function Collaborators() {
  const {
    collaborators,
    allCollaborators,
    loading,
    loadCollaborators,
    saveCollaborator,

    /* pagination */
    page,
    setPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage,
  } = useCollaborators();

  const [search, setSearch] = useState('');
  const [selectedShift, setSelectedShift] = useState('ALL');
  const [viewMode, setViewMode] = useState('table');
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
        console.error('Erro ao carregar setores', err);
      }
    }
  
    loadSectors();
  }, []);


  const filtered = useMemo(() => {
    const term = search.toLowerCase();
  
    return allCollaborators.filter((c) => {
      const matchesSearch =
        !term ||
        c.full_name?.toLowerCase().includes(term) ||
        c.department_name?.toLowerCase().includes(term) ||
        c.registration?.toLowerCase().includes(term) ||
        c.crm?.toLowerCase().includes(term);
  
      const matchesShift =
        selectedShift === 'ALL'
          ? true
          : c.type === 'EMPLOYEE'
            ? c.shift === selectedShift
            : true;
  
      return matchesSearch && matchesShift;
    });
  }, [allCollaborators, search, selectedShift]);
  


  const activeCount = useMemo(
    () => filtered.filter((c) => c.active).length,
    [filtered]
  );


  async function handleSave(data) {
    await saveCollaborator(data);
    setEditing(null);
    setDialogOpen(false);
  }

  return (
    <MainLayout title="Colaboradores">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search */}
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

        {/* Shift Filter */}
        <div className="flex gap-2 flex-wrap">
          {SHIFTS.map((s) => (
            <FilterButton
              key={s.value}
              label={s.label}
              active={selectedShift === s.value}
              onClick={() => {
                setSelectedShift(s.value);
                setPage(1);
              }}
            />
          ))}
        </div>

        {/* View toggle */}
        <div className="flex gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('table')}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>

        {/* Add */}
        <Button className="lg:ml-auto" onClick={() => setDialogOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Novo colaborador
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-6 mb-6 text-sm">
        <span>
          Total: <strong>{filtered.length}</strong>
        </span>
        <span>
          Ativos: <strong>{activeCount}</strong>
        </span>
        <span>
          Mostrando: <strong>{totalItems}</strong>
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Carregando colaboradores...
        </div>
      ) : viewMode === 'table' ? (
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

      {/* Pagination */}
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

      {/* Dialog */}
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
