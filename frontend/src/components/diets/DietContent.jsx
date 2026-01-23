import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Save, X, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useDiets } from '@/contexts/DietContext';

export default function DietContent() {
    const [newDiet, setNewDiet] = useState({ name: '', description: '' });
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editDietData, setEditDietData] = useState({ name: '', description: '' });
    const {
        diets,
        loading,
        loadDiets,
        addDiet,
        editDiet,
        toggleDietStatus,
        removeDiet,
    } = useDiets();

    
  useEffect(() => {
    loadDiets();
  }, []);


  const handleAdd = async () => {
    if (!setNewDiet.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    await addDiet(newDiet);
    setNewDiet({ name: '', description: '' });
    setIsAdding(false);
  };

  const handleEdit = (diet) => {
        setEditDietData({
        name: diet.name,
        description: diet.description || '',
      });
      setEditingId(diet.id);
    };

    const handleSaveEdit = async (id) => {
        if (!editDietData.name.trim()) {
          toast.error('Nome é obrigatório');
          return;
        }
    
        await editDiet(id, editDietData);
        setEditingId(null);

        toast.success('Tipo de dieta atualizado!');
  };

  const activeCount = diets.filter(d => d.is_active).length;

  return (
    <MainLayout title="Tipos de Dieta">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              {activeCount} tipos ativos de {diets.length} cadastrados
            </p>
          </div>
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
              <Leaf className="w-5 h-5 text-primary" />
              Novo Tipo de Dieta
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">Nome *</Label>
                <Input
                  id="new-name"
                  placeholder="Ex: Sem Lactose"
                  value={newDiet.name}
                  onChange={(e) => setNewDiet({ ...newDiet, name: e.target.value })}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-desc">Descrição</Label>
                <Input
                  id="new-desc"
                  placeholder="Ex: Refeição sem derivados de leite"
                  value={newDiet.description}
                  onChange={(e) => setNewDiet({ ...newDiet, description: e.target.value })}
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
                    setNewDiet({ name: '', description: '' });
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
          {diets.map((diet) => (
            <div
              key={diet.id}
              className={cn(
                "bg-card rounded-xl p-5 shadow-card transition-all",
                !diet.is_active && "opacity-60"
              )}
            >
              {editingId === diet.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome *</Label>
                      <Input
                        value={editDietData.name}
                        onChange={(e) =>
                            setEditDietData({
                              ...editDietData,
                              name: e.target.value,
                            })
                          }
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input
                        value={editDietData.description}
                        onChange={(e) =>
                            setEditDietData({
                              ...editDietData,
                              description: e.target.value,
                            })
                          }
                        className="h-12"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => handleSaveEdit(diet.id)} className="h-12">
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
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      diet.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      <Leaf className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{diet.name}</h3>
                      {diet.description && (
                        <p className="text-sm text-muted-foreground">{diet.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={diet.is_active}
                        onCheckedChange={() => toggleDietStatus(diet)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {diet.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(diet)}
                      className="touch-target"
                    >
                      <Pencil className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeDiet(diet.id)}
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

        {diets.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Leaf className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum tipo de dieta cadastrado</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
