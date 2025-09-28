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
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os serviços salvos.",
        variant: "destructive",
      });
    }
    setIsLoaded(true);
  }, [toast]);

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

  const addService = useCallback((service: Omit<Service, 'id' | 'date'>) => {
    const newService: Service = {
        id: new Date().toISOString() + Math.random(),
        date: new Date().toISOString(),
        ...service,
    }
    setServices((prevServices) => [newService, ...prevServices]);
    toast({ title: "Serviço adicionado", description: `"${service.name}" foi adicionado à lista.` });
  }, [toast]);

  const updateService = useCallback((id: string, updatedServiceData: Omit<Service, 'id' | 'date'>) => {
    setServices((prevServices) =>
      prevServices.map((service) => (service.id === id ? { ...service, ...updatedServiceData } : service))
    );
     toast({ title: "Serviço atualizado", description: `"${updatedServiceData.name}" foi atualizado.` });
  }, [toast]);

  const deleteService = useCallback((id: string) => {
    setServices((prevServices) => prevServices.filter((service) => service.id !== id));
    toast({ title: "Serviço deletado", variant: "destructive" });
  }, [toast]);

  const clearServices = useCallback(() => {
    const todayServices = services.filter(s => new Date(s.date).toDateString() !== new Date().toDateString());
    setServices(todayServices);
    toast({ title: "Lista limpa", description: "Os serviços de hoje foram removidos.", variant: "destructive"});
  }, [toast, services]);

  return { services, addService, updateService, deleteService, clearServices, isLoaded };
}
