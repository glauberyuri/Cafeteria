import { createContext, useContext, useState } from "react";
import { ListMealsToday } from "@/services/meals";
import { toast } from "sonner";

const MealsContext = createContext(null);

export function MealsProvider({ children }) {

  const [allMeals, setAllMeals] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadMeals(date) {

    try {
  
      setLoading(true);
  
      const data = await ListMealsToday(date);
  
      setAllMeals(data);
  
    } catch {
  
      toast.error("Erro ao carregar refeições");
  
    } finally {
  
      setLoading(false);
  
    }
  
  }

  return (
    <MealsContext.Provider
      value={{
        allMeals,
        loading,
        loadMeals
      }}
    >
      {children}
    </MealsContext.Provider>
  );
}

export function useMeals() {
  return useContext(MealsContext);
}