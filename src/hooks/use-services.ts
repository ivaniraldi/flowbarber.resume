
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Service, PredefinedService } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { PREDEFINED_SERVICES as INITIAL_PREDEFINED_SERVICES } from "@/lib/constants";

const SERVICES_STORAGE_KEY = "flow-report-services";
const PREDEFINED_SERVICES_STORAGE_KEY = "flow-report-predefined-services";

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [predefinedServices, setPredefinedServices] = useState<PredefinedService[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  
  const prevServicesRef = useRef<Service[]>([]);
  const prevPredefinedServicesRef = useRef<PredefinedService[]>([]);

  useEffect(() => {
    try {
      const storedServices = localStorage.getItem(SERVICES_STORAGE_KEY);
      if (storedServices) {
        const parsedServices = JSON.parse(storedServices);
        setServices(parsedServices);
        prevServicesRef.current = parsedServices;
      }
      
      const storedPredefinedServices = localStorage.getItem(PREDEFINED_SERVICES_STORAGE_KEY);
      if (storedPredefinedServices) {
        const parsedPredefined = JSON.parse(storedPredefinedServices);
        setPredefinedServices(parsedPredefined);
        prevPredefinedServicesRef.current = parsedPredefined;
      } else {
        setPredefinedServices(INITIAL_PREDEFINED_SERVICES);
        prevPredefinedServicesRef.current = INITIAL_PREDEFINED_SERVICES;
      }

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded && JSON.stringify(services) !== JSON.stringify(prevServicesRef.current)) {
      try {
        localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
        
        if (services.length > prevServicesRef.current.length) {
          const newService = services.find(s => !prevServicesRef.current.some(ps => ps.id === s.id));
          if (newService) {
            toast({ title: "Serviço adicionado", description: `"${newService.name}" foi adicionado à lista.` });
          }
        } else if (services.length < prevServicesRef.current.length) {
          const prevTodayServices = prevServicesRef.current.filter(s => new Date(s.date).toDateString() === new Date().toDateString());
          const currentTodayServices = services.filter(s => new Date(s.date).toDateString() === new Date().toDateString());
          if (prevTodayServices.length > currentTodayServices.length && currentTodayServices.length === 0) {
            toast({ title: "Lista limpa", description: "Os serviços de hoje foram removidos.", variant: "destructive" });
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

        prevServicesRef.current = services;
      } catch (error) {
        console.error("Failed to save services to localStorage", error);
        toast({ title: "Erro ao salvar dados", description: "Não foi possível salvar as alterações.", variant: "destructive" });
      }
    }
  }, [services, isLoaded, toast]);
  
  useEffect(() => {
    if (isLoaded && JSON.stringify(predefinedServices) !== JSON.stringify(prevPredefinedServicesRef.current)) {
        try {
            localStorage.setItem(PREDEFINED_SERVICES_STORAGE_KEY, JSON.stringify(predefinedServices));
            toast({ title: "Lista de serviços atualizada", description: "Suas alterações foram salvas com sucesso." });
            prevPredefinedServicesRef.current = predefinedServices;
        } catch (error) {
            console.error("Failed to save predefined services to localStorage", error);
            toast({ title: "Erro ao salvar", description: "Não foi possível salvar a lista de serviços.", variant: "destructive" });
        }
    }
  }, [predefinedServices, isLoaded, toast]);

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
  
  const savePredefinedServices = useCallback((newPredefinedServices: PredefinedService[]) => {
    setPredefinedServices(newPredefinedServices);
  }, []);

  return { services, addService, updateService, deleteService, clearServices, isLoaded, predefinedServices, savePredefinedServices };
}
