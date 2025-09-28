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

  const addService = useCallback((service: Service) => {
    setServices((prevServices) => [service, ...prevServices]);
    toast({ title: "Serviço adicionado", description: `"${service.name}" foi adicionado à lista.` });
  }, [toast]);

  const updateService = useCallback((id: string, updatedService: Service) => {
    setServices((prevServices) =>
      prevServices.map((service) => (service.id === id ? updatedService : service))
    );
     toast({ title: "Serviço atualizado", description: `"${updatedService.name}" foi atualizado.` });
  }, [toast]);

  const deleteService = useCallback((id: string) => {
    setServices((prevServices) => prevServices.filter((service) => service.id !== id));
    toast({ title: "Serviço deletado", variant: "destructive" });
  }, [toast]);

  const clearServices = useCallback(() => {
    setServices([]);
    toast({ title: "Lista limpa", description: "Todos os serviços foram removidos.", variant: "destructive"});
  }, [toast]);

  return { services, addService, updateService, deleteService, clearServices, isLoaded };
}
