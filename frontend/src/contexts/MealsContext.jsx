import { createContext, useContext, useMemo, useState } from "react";
import {
    ListMealsToday
} from "@/services/meals";
import { toast } from "sonner";

const MealsContext = createContext(null);

export function MealsProvider({children})

    const [allMeals, setAllMeals] = useState([])
    const [loading, setLoading] = useState(false);

    async function loadMeals(){
        try{
            setLoading(true)
            const data = await ListMealsToday();
            setAllMeals(data);
        }catch {
            toast.error('Erro ao carregar refeições');
        } finally {
            setLoading(false);
        }
    }