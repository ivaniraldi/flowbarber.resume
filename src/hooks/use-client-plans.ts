
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ClientPlan } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "flow-report-client-plans";

export function useClientPlans() {
  const [plans, setPlans] = useState<ClientPlan[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  const prevPlansRef = useRef<ClientPlan[]>([]);

  useEffect(() => {
    try {
      const storedPlans = localStorage.getItem(STORAGE_KEY);
      if (storedPlans) {
        const parsedPlans = JSON.parse(storedPlans);
        setPlans(parsedPlans);
        prevPlansRef.current = parsedPlans;
      }
    } catch (error) {
      console.error("Failed to load plans from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));

        // Detect changes and show toast
        if (prevPlansRef.current.length > plans.length) {
            toast({ title: "Plano deletado", variant: "destructive" });
        } else if (prevPlansRef.current.length < plans.length) {
            const newPlan = plans.find(p => !prevPlansRef.current.some(pp => pp.id === p.id));
            if (newPlan) {
                toast({ title: "Plano adicionado", description: `Plano para "${newPlan.name}" foi criado.` });
            }
        } else {
            const updatedPlan = plans.find(p => {
                const prevPlan = prevPlansRef.current.find(pp => pp.id === p.id);
                return prevPlan && JSON.stringify(p) !== JSON.stringify(prevPlan);
            });

            if (updatedPlan) {
                 const prevPlan = prevPlansRef.current.find(pp => pp.id === updatedPlan.id)!;
                 if(updatedPlan.remainingCuts < prevPlan.remainingCuts){
                    toast({ title: "Corte utilizado!", description: `Um corte foi debitado do plano de ${updatedPlan.name}.`});
                 } else if (updatedPlan.remainingCuts > prevPlan.remainingCuts) {
                    toast({ title: "Plano Reiniciado!", description: `O plano de ${updatedPlan.name} foi renovado.`});
                 } else {
                    toast({ title: "Plano atualizado", description: `Plano de "${updatedPlan.name}" foi atualizado.` });
                 }
            }
        }
        prevPlansRef.current = plans;
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
        return [...prevPlans, newPlan].sort((a,b) => a.name.localeCompare(b.name));
    });
  }, []);

  const updatePlan = useCallback((id: string, updatedPlanData: Omit<ClientPlan, 'id'>) => {
    setPlans((prevPlans) =>
      prevPlans.map((plan) => (plan.id === id ? { id, ...updatedPlanData } : plan))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  }, []);
  
  const deletePlan = useCallback((id: string) => {
    setPlans((prevPlans) => prevPlans.filter((plan) => plan.id !== id));
  }, []);

  const useCut = useCallback((id: string) => {
    setPlans((prevPlans) =>
      prevPlans.map((plan) => {
        if (plan.id === id && plan.remainingCuts > 0) {
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
          return { ...plan, remainingCuts: plan.totalCuts };
        }
        return plan;
      })
    );
  }, []);


  return { plans, addPlan, updatePlan, deletePlan, useCut, resetCuts, isLoaded };
}
