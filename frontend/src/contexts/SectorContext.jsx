import { createContext, useContext, useEffect, useState } from 'react';
import {
  getSectors,
  createSector,
  updateSector,
  patchSector,
  deleteSector,
} from '@/services/sectors';
import { toast } from 'sonner';

const SectorContext = createContext(null);

export function SectorProvider({ children }) {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadSectors(params = {}) {
    try {
      setLoading(true);
      const data = await getSectors(params);
      setSectors(data);
    } catch {
      toast.error('Erro ao carregar setores');
    } finally {
      setLoading(false);
    }
  }

  async function addSector(data) {
    try {
      const sector = await createSector(data);
      setSectors(prev => [...prev, sector]);
      toast.success('Setor criado');
      return sector;
    } catch {
      toast.error('Erro ao criar setor');
      throw new Error();
    }
  }

  async function editSector(id, data) {
    try {
      const updated = await updateSector(id, data);
      setSectors(prev =>
        prev.map(s => (s.id === id ? updated : s))
      );
      toast.success('Setor atualizado');
      return updated;
    } catch {
      toast.error('Erro ao atualizar setor');
      throw new Error();
    }
  }

  async function toggleSectorStatus(sector) {
    try {
      const updated = await patchSector(sector.id, {
        is_active: !sector.is_active,
      });
      setSectors(prev =>
        prev.map(s => (s.id === sector.id ? updated : s))
      );
      toast.info('Status atualizado!');
    } catch {
      toast.error('Erro ao alterar status');
    }
  }

  async function removeSector(id) {
    try {
      await deleteSector(id);
      setSectors(prev => prev.filter(s => s.id !== id));
      toast.success('Setor removido');
    } catch {
      toast.error('Erro ao remover setor');
    }
  }

  return (
    <SectorContext.Provider
      value={{
        sectors,
        loading,
        loadSectors,
        addSector,
        editSector,
        toggleSectorStatus,
        removeSector,
      }}
    >
      {children}
    </SectorContext.Provider>
  );
}

export function useSectors() {
  const context = useContext(SectorContext);
  if (!context) {
    throw new Error('useSectors must be used within SectorProvider');
  }
  return context;
}
