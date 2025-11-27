"use client";

import { useState, useEffect, useCallback } from "react";
import type { Service } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "flow-report-services";

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedServices = localStorage.getItem(STORAGE_KEY);
      if (storedServices) {
        setServices(JSON.parse(storedServices));
      }
    } catch (error) {
      console.error("Failed to load services from localStorage", error);
       // We can't toast here directly as it might be during SSR or initial render
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
      } catch (error) {
        console.error("Failed to save services to localStorage", error);
        toast({
          title: "Erro ao salvar dados",
          description: "Não foi possível salvar as alterações.",
          variant: "destructive",
        });
      }
    }
  }, [services, isLoaded, toast]);

  const addService = useCallback((serviceData: Omit<Service, 'id'>) => {
    setServices((prevServices) => {
        const newService: Service = {
            id: new Date().toISOString() + Math.random(),
            ...serviceData,
        }
        toast({ title: "Serviço adicionado", description: `"${serviceData.name}" foi adicionado à lista.` });
        return [newService, ...prevServices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  }, [toast]);

  const updateService = useCallback((id: string, updatedServiceData: Omit<Service, 'id'>) => {
    setServices((prevServices) =>
      prevServices.map((service) => (service.id === id ? { id, ...updatedServiceData } : service))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
     toast({ title: "Serviço atualizado", description: `"${updatedServiceData.name}" foi atualizado.` });
  }, [toast]);

  const deleteService = useCallback((id: string) => {
    setServices((prevServices) => prevServices.filter((service) => service.id !== id));
    toast({ title: "Serviço deletado", variant: "destructive" });
  }, [toast]);

  const clearServices = useCallback(() => {
    setServices((prevServices) => {
        const todayServices = prevServices.filter(s => new Date(s.date).toDateString() !== new Date().toDateString());
        toast({ title: "Lista limpa", description: "Os serviços de hoje foram removidos.", variant: "destructive"});
        return todayServices;
    });
  }, [toast]);

  return { services, addService, updateService, deleteService, clearServices, isLoaded };
}
