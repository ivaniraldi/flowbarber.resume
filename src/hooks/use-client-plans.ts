
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ClientPlan, Service, PaymentMethod } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "flow-report-client-plans";

type UseClientPlansProps = {
  addService: (serviceData: Omit<Service, 'id'>) => void;
};

export function useClientPlans({ addService }: UseClientPlansProps) {
  const [plans, setPlans] = useState<ClientPlan[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  const prevPlansRef = useRef<ClientPlan[]>([]);

   useEffect(() => {
    let storedPlans: string | null = null;
    try {
      storedPlans = localStorage.getItem(STORAGE_KEY);
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
        if (JSON.stringify(plans) === JSON.stringify(prevPlansRef.current)) return;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));

        // Compare current plans with previous state to show relevant toast
        if (plans.length > prevPlansRef.current.length) {
          const newPlan = plans.find(p => !prevPlansRef.current.some(pp => pp.id === p.id));
          if (newPlan) {
            toast({ title: "Plano adicionado", description: `Plano para "${newPlan.name}" foi criado.` });
          }
        } else if (plans.length < prevPlansRef.current.length) {
          const deletedPlan = prevPlansRef.current.find(pp => !plans.some(p => p.id === pp.id));
          if(deletedPlan) {
              toast({ title: "Plano deletado", variant: "destructive" });
          }
        } else {
           const updatedPlan = plans.find(p => {
              const prevPlan = prevPlansRef.current.find(pp => pp.id === p.id);
              return prevPlan && JSON.stringify(p) !== JSON.stringify(prevPlan);
           });
           if(updatedPlan) {
              const prevPlan = prevPlansRef.current.find(pp => pp.id === updatedPlan.id)!;
              if (updatedPlan.remainingCuts < prevPlan.remainingCuts) {
                toast({ title: "Corte utilizado!", description: `Um corte foi debitado do plano de ${updatedPlan.name}.` });
              } else if (updatedPlan.remainingCuts > prevPlan.remainingCuts) {
                toast({ title: "Plano Reiniciado!", description: `O plano de ${updatedPlan.name} foi renovado.` });
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

  const addPlan = useCallback((planData: Omit<ClientPlan, 'id' | 'remainingCuts'>, paymentDetails: { addToRevenue: boolean, paymentMethod?: PaymentMethod }) => {
    const newPlan: ClientPlan = {
      id: new Date().toISOString() + Math.random(),
      ...planData,
      remainingCuts: planData.totalCuts,
    };
    setPlans((prev) => [...prev, newPlan].sort((a,b) => a.name.localeCompare(b.name)));

    if (paymentDetails.addToRevenue && paymentDetails.paymentMethod) {
      addService({
        name: `Plano - ${planData.name}`,
        price: planData.price,
        paymentMethod: paymentDetails.paymentMethod,
        date: new Date().toISOString(),
      });
    }
  }, [addService]);

  const updatePlan = useCallback((id: string, updatedPlanData: Omit<ClientPlan, 'id'>) => {
    setPlans((prev) =>
      prev.map((plan) => (plan.id === id ? { id, ...updatedPlanData } : plan))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  }, []);
  
  const deletePlan = useCallback((id: string) => {
    setPlans((prev) => prev.filter((plan) => plan.id !== id));
  }, []);

  const useCut = useCallback((id: string) => {
    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id === id && plan.remainingCuts > 0) {
          return { ...plan, remainingCuts: plan.remainingCuts - 1 };
        }
        if (plan.id === id && plan.remainingCuts === 0) {
            toast({ title: "Atenção!", description: `O plano de ${plan.name} não tem cortes restantes.`, variant: "destructive"});
        }
        return plan;
      })
    );
  }, [toast]);

  const resetCuts = useCallback((id: string, paymentDetails: { addToRevenue: boolean, paymentMethod?: PaymentMethod }) => {
    let planToRenew: ClientPlan | undefined;
    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id === id) {
          planToRenew = plan;
          return { ...plan, remainingCuts: plan.totalCuts };
        }
        return plan;
      })
    );

    if (paymentDetails.addToRevenue && paymentDetails.paymentMethod && planToRenew) {
      addService({
        name: `Renovação - ${planToRenew.name}`,
        price: planToRenew.price,
        paymentMethod: paymentDetails.paymentMethod,
        date: new Date().toISOString(),
      });
    }
  }, [addService]);


  return { plans, addPlan, updatePlan, deletePlan, useCut, resetCuts, isLoaded };
}
