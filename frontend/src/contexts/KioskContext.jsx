import { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import api from '@/services/api';

const KioskContext = createContext(null);

const DAYS = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
];

function normalizeBackendMenu(items) {
  const base = DAYS.map(day => ({
    day,
    lunch: { main: '', side: '', dessert: '' },
    dinner: { main: '', side: '', dessert: '' },
  }));

  items.forEach(item => {
    const day = base[item.weekday];
    if (!day) return;

    const formatted = {
      main: item.main || '',
      side: item.side || '',
      dessert: item.dessert || '',
    };

    if (item.meal_type === 'LUNCH') day.lunch = formatted;
    if (item.meal_type === 'DINNER') day.dinner = formatted;
  });

  return base;
}

export function KioskProvider({ children }) {
  const [weeklyMenu, setWeeklyMenu] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [orders, setOrders] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [dietTypes, setDietTypes] = useState([]);
  const [collaborator, setCollaborator] = useState(null);

  const today = new Date().toISOString().split('T')[0];
  const loadingRef = useRef(false);


  const registerAcademic = async ({
    full_name,
    institution,
    category,
    identifier,
    sector
  }) => {
  
    try {
  
      const academicRes = await api.post("/academics/", {
        full_name,
        institution,
        category,
        identifier,
        sector
      });
  
      const academicId = academicRes.data.id;
  
      const authorizationRes = await api.post("/academic-authorizations/", {
        academic: academicId,
        identifier,
        sector
      });
  
      return {
        academic: academicRes.data,
        authorization: authorizationRes.data
      };
  
    } catch (err) {
  
      console.error("Erro ao registrar acadêmico", err);
      throw err;
  
    }
  
  };

  const loadMenu = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const res = await api.get('/weekly-menu/');
      if (res.data?.items) {
        setWeeklyMenu(normalizeBackendMenu(res.data.items));
      } else {
        setWeeklyMenu([]);
      }
    } catch (err) {
      console.error('Erro ao carregar cardápio', err);
    } finally {
      setLoadingMenu(false);
      loadingRef.current = false;
    }
  };


  const loadOrders = async () => {
    try {
      const res = await api.get('/meal-requests/', {
        params: { date: today }
      });
      setOrders(res.data || []);
    } catch (err) {
      console.error('Erro ao carregar pedidos', err);
    }
  };

  const loadSectors = async () => {
    try {
  
      const res = await api.get('/sectors/', {
        params: { active: true }
      });
  
      setSectors(res.data || []);
  
    } catch (err) {
  
      console.error("Erro ao carregar setores", err);
  
    }
  };

  const loadDietTypes = async () => {
    try {
      const res = await api.get('/diet_type/');
      setDietTypes(res.data || []);
    } catch (err) {
      console.error('Erro ao carregar dietas', err);
    }
  };


  const createMealRequest = async (payload) => {
    try {
      const res = await api.post('/meal-requests/', payload);
      await loadOrders();
      return res.data;
    } catch (err) {
      console.error('Erro ao criar pedido', err);
      throw err;
    }
  };


  const cancelOrder = async (orderId) => {
    try {
      await api.patch(`/meal-requests/${orderId}/cancel/`);
      await loadOrders();
    } catch (err) {
      console.error('Erro ao cancelar pedido', err);
      throw err;
    }
  };

  const findOrdersByIdentifier = async (identifier) => {

    try {
  
      const res = await api.get('/meal-requests/list', {
        params: { identifier }
      });
  
      return res.data || [];
  
    } catch (err) {
  
      console.error("Erro ao buscar pedidos", err);
      return [];
  
    }
  
  };

  const searchCollaborator = async (identifier, type) => {
    try {
  
      const res = await api.get('/collaborators/search/', {
        params: {
          identifier,
          type
        }
      });
  
      return res.data;
  
    } catch (err) {
  
      if (err.response?.status === 404) {
        return null;
      }
  
      console.error("Erro ao buscar colaborador", err);
      throw err;
    }
  };

  const todayOrders = useMemo(() => {
    return orders.filter(order => order.date === today);
  }, [orders, today]);

  const clearCollaborator = () => setCollaborator(null);

  useEffect(() => {
    loadMenu();
    loadOrders();
    loadDietTypes();
    loadSectors();


    const interval = setInterval(() => {
      loadMenu();
      loadOrders();
    }, 60000);

    return () => clearInterval(interval);
  }, [today]);

  return (
    <KioskContext.Provider
      value={{
        weeklyMenu,
        loadingMenu,
        reloadMenu: loadMenu,

        dietTypes,
        sectors,

        orders,
        todayOrders,
        createMealRequest,
        cancelOrder,
        findOrdersByIdentifier,

        collaborator,
        setCollaborator,
        clearCollaborator,
        registerAcademic,
        searchCollaborator,
      }}
    >
      {children}
    </KioskContext.Provider>
  );
}

export function useKiosk() {
  const context = useContext(KioskContext);
  if (!context) {
    throw new Error('useKiosk deve ser usado dentro do KioskProvider');
  }
  return context;
}