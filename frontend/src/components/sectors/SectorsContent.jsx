import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Save, X, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSectors } from '@/contexts/SectorContext';

export default function SectorsContent() {
  const {
    sectors,
    loading,
    loadSectors,
    addSector,
    editSector,
    toggleSectorStatus,
    removeSector,
  } = useSectors();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newSector, setNewSector] = useState({ name: '', description: '' });
  const [editSectorData, setEditSectorData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadSectors();
  }, []);

  const handleAdd = async () => {
    if (!newSector.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    await addSector(newSector);
    setNewSector({ name: '', description: '' });
    setIsAdding(false);
    toast.success('Setor adicionado!');
  };

  const handleEdit = (sector) => {
    setEditSectorData({
      name: sector.name,
      description: sector.description || '',
    });
    setEditingId(sector.id);
  };

  const handleSaveEdit = async (id) => {
    if (!editSectorData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    await editSector(id, editSectorData);
    setEditingId(null);
  };

  const activeCount = sectors.filter(s => s.is_active).length;

  return (
    <MainLayout title="Setores">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
          {activeCount} setores ativos de {sectors.length} cadastrados
          </p>

          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} className="touch-target">
              <Plus className="w-5 h-5 mr-2" />
              Novo Tipo
            </Button>
          )}
        </div>

        {/* Add Form */}
        {isAdding && (
          <div className="bg-card rounded-2xl p-6 shadow-card border-2 border-primary">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Novo Tipo de Dieta
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  placeholder="Ex: Enfermagem"
                  value={newSector.name}
                  onChange={(e) =>
                    setNewSector({ ...newSector, name: e.target.value })
                  }
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  placeholder="Ex: Setor assistencial"
                  value={newSector.description}
                  onChange={(e) =>
                    setNewSector({ ...newSector, description: e.target.value })
                  }
                  className="h-12"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleAdd} className="flex-1 h-12">
                  <Save className="w-5 h-5 mr-2" />
                  Salvar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewSector({ name: '', description: '' });
                  }}
                  className="h-12"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* List */}
        <div className="grid gap-4">
          {sectors.map((sector) => (
            <div
              key={sector.id}
              className={cn(
                'bg-card rounded-xl p-5 shadow-card transition-all',
                !sector.is_active && 'opacity-60'
              )}
            >
              {editingId === sector.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome *</Label>
                      <Input
                        value={editSectorData.name}
                        onChange={(e) =>
                          setEditSectorData({
                            ...editSectorData,
                            name: e.target.value,
                          })
                        }
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input
                        value={editSectorData.description}
                        onChange={(e) =>
                          setEditSectorData({
                            ...editSectorData,
                            description: e.target.value,
                          })
                        }
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={() => handleSaveEdit(sector.id)} className="h-12">
                      <Save className="w-5 h-5 mr-2" />
                      Salvar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingId(null)}
                      className="h-12"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        sector.is_active
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Building2 className="w-6 h-6" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg">{sector.name}</h3>
                      {sector.description && (
                        <p className="text-sm text-muted-foreground">
                          {sector.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={sector.is_active}
                        onCheckedChange={() => toggleSectorStatus(sector)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {sector.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(sector)}
                      className="touch-target"
                    >
                      <Pencil className="w-5 h-5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSector(sector.id)}
                      className="touch-target text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {sectors.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum tipo de setor cadastrado</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
