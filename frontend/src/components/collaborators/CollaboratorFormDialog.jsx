import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function CollaboratorFormDialog({
  open,
  onOpenChange,
  collaborator,
  onSave,
  sectors = [],
}) {
  const isEdit = Boolean(collaborator);

  const [type, setType] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    active: true,
  });

  const [mealPreference, setMealPreference] = useState({
    automation_type: 'NONE',
    default_meal_type: '',
    start_date: '',
  });


  
  useEffect(() => {
    if (collaborator) {
      setType(collaborator.type);
      setForm({
        ...collaborator,
        department: collaborator.department?.id ?? collaborator.department,
      });
    } else {
      setType('');
      setForm({
        full_name: '',
        email: '',
        active: true,
      });
    }
  }, [collaborator]);


  useEffect(() => {
    if (collaborator?.type === 'EMPLOYEE') {
      fetch(`/api/employee-meal-preference/${collaborator.registration}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          setMealPreference({
            automation_type: data?.automation_type ?? 'NONE',
            default_meal_type: data?.default_meal_type ?? '',
            start_date: data?.start_date ?? '',
          });
        });
    } else {
      setMealPreference({
        automation_type: 'NONE',
        default_meal_type: '',
        start_date: '',
      });
    }
  }, [collaborator]);
  
  

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };


     const handleSubmit = () => {
      if (!type || !form.full_name) return;
    
      const payload = {
        id: form.id,
        type,
        full_name: form.full_name,
        email: form.email || null,
        active: form.active,
    
        // EMPLOYEE
        registration: form.registration || null,
        department: form.department || null,
        shift: form.shift || null,
    
        // DOCTOR
        crm: form.crm || null,
    
        // ACADEMIC
        institution: form.institution || null,
        course: form.course || null,
      };
    
      onSave(payload);
      onOpenChange(false);
    };


    

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {/* SCROLL INTERNO (fix Radix Select) */}
        <div className="max-h-[90vh] overflow-y-auto space-y-4">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Editar colaborador' : 'Novo colaborador'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do colaborador abaixo.
            </DialogDescription>
          </DialogHeader>

          {/* TIPO */}
          {!isEdit && (
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de colaborador" />
              </SelectTrigger>
                              
                  <SelectContent
                    position="popper"
                    className="bg-background text-foreground border shadow-lg z-50"
                  >
                <SelectItem value="EMPLOYEE">Funcionário</SelectItem>
                <SelectItem value="DOCTOR">Médico</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* NOME */}
          <Input
            placeholder="Nome completo"
            value={form.full_name}
            onChange={(e) => update('full_name', e.target.value)}
          />

          {/* EMAIL */}
          <Input
            placeholder="Email (opcional)"
            value={form.email || ''}
            onChange={(e) => update('email', e.target.value)}
          />
          {/* STATUS */}
          <Select
            value={form.active ? 'true' : 'false'}
            onValueChange={(v) => update('active', v === 'true')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            
              <SelectContent
                position="popper"
                className="bg-background text-foreground border shadow-lg z-50"
              >
              <SelectItem value="true">Ativo</SelectItem>
              <SelectItem value="false">Inativo</SelectItem>
            </SelectContent>
          </Select>
          {type === 'EMPLOYEE' && (
            <div className="space-y-4">
              {/* Matrícula */}
              <Input
                placeholder="Matrícula"
                value={form.registration || ''}
                onChange={(e) => update('registration', e.target.value)}
              />

              {/* Setor + Turno */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  value={form.department ? String(form.department) : ''}
                  onValueChange={(v) => update('department', Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Setor" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {sectors.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={form.shift || ''}
                  onValueChange={(v) => update('shift', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Turno" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="DAY">Dia</SelectItem>
                    <SelectItem value="NIGHT">Noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* =======================
                  AUTOMAÇÃO DE REFEIÇÃO
                ======================= */}
              <div className="border rounded-xl p-4 space-y-4 bg-muted/30">
                <h4 className="font-semibold text-sm">
                  Automação de Refeição
                </h4>

                {/* Tipo de automação */}
                <Select
                  value={mealPreference.automation_type}
                  onValueChange={(v) =>
                    setMealPreference((prev) => ({
                      ...prev,
                      automation_type: v,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de automação" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="NONE">Sem automação</SelectItem>
                    <SelectItem value="WEEKDAYS">Segunda a Sexta</SelectItem>
                    <SelectItem value="ALTERNATE">
                      Plantonista (dia sim / dia não)
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Refeição + Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    value={mealPreference.default_meal_type}
                    onValueChange={(v) =>
                      setMealPreference((prev) => ({
                        ...prev,
                        default_meal_type: v,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Refeição padrão" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="LUNCH">Almoço</SelectItem>
                      <SelectItem value="DINNER">Janta</SelectItem>
                    </SelectContent>
                  </Select>

                  {mealPreference.automation_type === 'ALTERNATE' && (
                    <Input
                      type="date"
                      value={mealPreference.start_date}
                      onChange={(e) =>
                        setMealPreference((prev) => ({
                          ...prev,
                          start_date: e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MÉDICO */}
          {type === 'DOCTOR' && (
            <Input
              placeholder="CRM"
              value={form.crm || ''}
              onChange={(e) => update('crm', e.target.value)}
            />
          )}

          {/* ACADÊMICO */}
          {type === 'ACADEMIC' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Instituição"
                value={form.institution || ''}
                onChange={(e) => update('institution', e.target.value)}
              />
              <Input
                placeholder="Curso"
                value={form.course || ''}
                onChange={(e) => update('course', e.target.value)}
              />
            </div>
          )}

          <DialogFooter className="pt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {isEdit ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
