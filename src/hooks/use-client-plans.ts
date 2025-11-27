"use client";

import { useState, useEffect, useCallback } from "react";
import type { ClientPlan } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "flow-report-client-plans";

export function useClientPlans() {
  const [plans, setPlans] = useState<ClientPlan[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedPlans = localStorage.getItem(STORAGE_KEY);
      if (storedPlans) {
        setPlans(JSON.parse(storedPlans));
      }
    } catch (error) {
      console.error("Failed to load plans from localStorage", error);
      // We can't toast here directly as it might be during SSR or initial render
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
      } catch (error) {
        console.error("Failed to save plans to localStorage", error);
        toast({
          title: "Erro ao salvar planos",
          description: "Não foi possível salvar as alterações nos planos.",
          variant: "destructive",
        });
      }
    }
  }, [plans, isLoaded, toast]);

  const addPlan = useCallback((planData: Omit<ClientPlan, 'id' | 'remainingCuts'>) => {
    setPlans((prevPlans) => {
        const newPlan: ClientPlan = {
            id: new Date().toISOString() + Math.random(),
            ...planData,
            remainingCuts: planData.totalCuts,
        };
        toast({ title: "Plano adicionado", description: `Plano para "${planData.name}" foi criado.` });
        return [...prevPlans, newPlan].sort((a,b) => a.name.localeCompare(b.name));
    });
  }, [toast]);

  const updatePlan = useCallback((id: string, updatedPlanData: Omit<ClientPlan, 'id'>) => {
    setPlans((prevPlans) =>
      prevPlans.map((plan) => (plan.id === id ? { id, ...updatedPlanData } : plan))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    toast({ title: "Plano atualizado", description: `Plano de "${updatedPlanData.name}" foi atualizado.` });
  }, [toast]);
  
  const deletePlan = useCallback((id: string) => {
    setPlans((prevPlans) => prevPlans.filter((plan) => plan.id !== id));
    toast({ title: "Plano deletado", variant: "destructive" });
  }, [toast]);

  const useCut = useCallback((id: string) => {
    setPlans((prevPlans) =>
      prevPlans.map((plan) => {
        if (plan.id === id && plan.remainingCuts > 0) {
          toast({ title: "Corte utilizado!", description: `Um corte foi debitado do plano de ${plan.name}.`});
          return { ...plan, remainingCuts: plan.remainingCuts - 1 };
        }
        if(plan.id === id && plan.remainingCuts === 0) {
            toast({ title: "Atenção!", description: `O plano de ${plan.name} não tem cortes restantes.`, variant: "destructive"});
        }
        return plan;
      })
    );
  }, [toast]);

  const resetCuts = useCallback((id: string) => {
    setPlans((prevPlans) =>
      prevPlans.map((plan) => {
        if (plan.id === id) {
          toast({ title: "Plano Reiniciado!", description: `O plano de ${plan.name} foi renovado.`});
          return { ...plan, remainingCuts: plan.totalCuts };
        }
        return plan;
      })
    );
  }, [toast]);


  return { plans, addPlan, updatePlan, deletePlan, useCut, resetCuts, isLoaded };
}
