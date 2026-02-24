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
  const [dietTypes, setDietTypes] = useState([]);
  const [collaborator, setCollaborator] = useState(null);

  const today = new Date().toISOString().split('T')[0];
  const loadingRef = useRef(false);


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


  const todayOrders = useMemo(() => {
    return orders;
  }, [orders]);

  const clearCollaborator = () => setCollaborator(null);

  useEffect(() => {
    loadMenu();
    loadOrders();
    loadDietTypes();

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

        orders,
        todayOrders,
        createMealRequest,
        cancelOrder,

        collaborator,
        setCollaborator,
        clearCollaborator,
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