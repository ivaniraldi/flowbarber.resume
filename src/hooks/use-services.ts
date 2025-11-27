
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Service } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "flow-report-services";

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  const prevServicesRef = useRef<Service[]>([]);

  useEffect(() => {
    try {
      const storedServices = localStorage.getItem(STORAGE_KEY);
      if (storedServices) {
        const parsedServices = JSON.parse(storedServices);
        setServices(parsedServices);
        prevServicesRef.current = parsedServices;
      }
    } catch (error) {
      console.error("Failed to load services from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(services));

        if (JSON.stringify(services) !== JSON.stringify(prevServicesRef.current)) {
           if (services.length > prevServicesRef.current.length) {
              const newService = services.find(s => !prevServicesRef.current.some(ps => ps.id === s.id));
              if (newService) {
                toast({ title: "Serviço adicionado", description: `"${newService.name}" foi adicionado à lista.` });
              }
           } else if (services.length < prevServicesRef.current.length) {
              const prevTodayServices = prevServicesRef.current.filter(s => new Date(s.date).toDateString() === new Date().toDateString());
              const currentTodayServices = services.filter(s => new Date(s.date).toDateString() === new Date().toDateString());
              if(prevTodayServices.length > currentTodayServices.length && currentTodayServices.length === 0) {
                 toast({ title: "Lista limpa", description: "Os serviços de hoje foram removidos.", variant: "destructive"});
              } else {
                 toast({ title: "Serviço deletado", variant: "destructive" });
              }
           } else {
              const updatedService = services.find(s => {
                const prevService = prevServicesRef.current.find(ps => ps.id === s.id);
                return prevService && JSON.stringify(s) !== JSON.stringify(prevService);
              });
              if (updatedService) {
                toast({ title: "Serviço atualizado", description: `"${updatedService.name}" foi atualizado.` });
              }
           }
        }
        
        prevServicesRef.current = services;

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
        return [newService, ...prevServices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  }, []);

  const updateService = useCallback((id: string, updatedServiceData: Omit<Service, 'id'>) => {
    setServices((prevServices) =>
      prevServices.map((service) => (service.id === id ? { id, ...updatedServiceData } : service))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  }, []);

  const deleteService = useCallback((id: string) => {
    setServices((prevServices) => prevServices.filter((service) => service.id !== id));
  }, []);

  const clearServices = useCallback(() => {
    setServices((prevServices) => {
        const servicesToKeep = prevServices.filter(s => new Date(s.date).toDateString() !== new Date().toDateString());
        return servicesToKeep;
    });
  }, []);

  return { services, addService, updateService, deleteService, clearServices, isLoaded };
}
