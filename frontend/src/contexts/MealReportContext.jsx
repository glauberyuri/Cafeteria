import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import api from "@/services/api";

const ReportContext = createContext();

const statusLabels = {
  DELIVERED: "Entregue",
  PENDING: "Pendente",
  CANCELLED: "Cancelado",
};

const normalizeMeal = (meal) => ({
  id: meal.id,
  collaboratorName:
    meal.collaborator_name ||
    meal.full_name ||
    meal.collaborator?.full_name ||
    "-",

  matricula:
    meal.identifier ||
    meal.registration ||
    meal.crm ||
    meal.matricula ||
    "-",

  sector:
    meal.sector_name ||
    meal.sector?.name ||
    meal.sector ||
    "-",

  mealType: meal.meal_type || "",
  mealTypeDisplay:
    meal.meal_type_display ||
    (meal.meal_type === "LUNCH"
      ? "Almoço"
      : meal.meal_type === "DINNER"
      ? "Jantar"
      : "-"),

  dietType: meal.diet_type || "-",

  status: meal.status || "",
  statusDisplay:
    meal.status_display ||
    statusLabels[meal.status] ||
    meal.status ||
    "-",

  collaboratorType: meal.collaborator_type || "-",
  price: Number(meal.price || 0),
  date: meal.date || null,
  shift: meal.shift || null,
});

const getData = async (url, params = {}) => {
  try {
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar ${url}`, error?.response?.data || error.message);
    return null;
  }
};

export const ReportProvider = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [todayMeals, setTodayMeals] = useState([]);
  const [dailyReport, setDailyReport] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [dietStats, setDietStats] = useState([]);
  const [sectorStats, setSectorStats] = useState([]);

  const [extractSearch, setExtractSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedCollaboratorType, setSelectedCollaboratorType] = useState("ALL");

  const [loading, setLoading] = useState(false);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(extractSearch.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [extractSearch]);

  const fetchToday = useCallback(async () => {
    const data = await getData("/meal-requests/today/");
    if (Array.isArray(data)) {
      setTodayMeals(data.map(normalizeMeal));
    } else {
      setTodayMeals([]);
    }
  }, []);

  const fetchDaily = useCallback(async () => {
    const data = await getData("/meal-requests/daily_report/", {
      month: selectedMonth,
    });

    if (Array.isArray(data)) {
      setDailyReport(data);
    } else {
      setDailyReport([]);
    }
  }, [selectedMonth]);

  const fetchMonthly = useCallback(async () => {
    setLoadingMonthly(true);
  
    try {
      const params = {
        month: selectedMonth,
      };
  
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
  
      if (selectedCollaboratorType !== "ALL") {
        params.collaborator_type = selectedCollaboratorType;
      }
  
      const data = await getData("/meal-requests/monthly_report/", params);
  
      if (Array.isArray(data)) {
        setMonthlyReport(data);
      } else {
        setMonthlyReport([]);
      }
    } finally {
      setLoadingMonthly(false);
    }
  }, [selectedMonth, debouncedSearch, selectedCollaboratorType]);

  const fetchDiet = useCallback(async () => {
    const data = await getData("/meal-requests/diet_stats/");

    if (Array.isArray(data)) {
      setDietStats(data);
    } else {
      setDietStats([]);
    }
  }, []);

  const fetchSector = useCallback(async () => {
    const data = await getData("/meal-requests/sector_stats/");

    if (Array.isArray(data)) {
      setSectorStats(data);
    } else {
      setSectorStats([]);
    }
  }, []);

  const fetchAllBase = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled([
        fetchToday(),
        fetchDaily(),
        fetchDiet(),
        fetchSector(),
      ]);

      const hasError = results.some((result) => result.status === "rejected");

      if (hasError) {
        setError("Erro parcial ao carregar dados");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar relatórios");
    } finally {
      setLoading(false);
    }
  }, [fetchToday, fetchDaily, fetchDiet, fetchSector]);

  useEffect(() => {
    fetchAllBase();
  }, [fetchAllBase]);

  useEffect(() => {
    fetchMonthly();
  }, [fetchMonthly]);

  const reversedDaily = useMemo(() => {
    return [...dailyReport].reverse();
  }, [dailyReport]);

  const summary = useMemo(() => {
    return {
      todayTotal: todayMeals.length,
      todayDelivered: todayMeals.filter((m) => m.status === "DELIVERED").length,
      todayPending: todayMeals.filter((m) => m.status === "PENDING").length,
      todayCancelled: todayMeals.filter((m) => m.status === "CANCELLED").length,
    };
  }, [todayMeals]);

  return (
    <ReportContext.Provider
      value={{
        todayMeals,
        dailyReport,
        reversedDaily,
        monthlyReport,
        dietStats,
        sectorStats,
        summary,

        selectedMonth,
        setSelectedMonth,

        selectedCollaboratorType,
        setSelectedCollaboratorType,

        extractSearch,
        setExtractSearch,
        debouncedSearch,

        statusLabels,
        loading,
        loadingMonthly,
        error,

        refetch: async () => {
          await fetchAllBase();
          await fetchMonthly();
        },
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};

export const useReports = () => useContext(ReportContext);