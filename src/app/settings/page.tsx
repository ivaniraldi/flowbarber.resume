
"use client";

import { useState, useEffect } from 'react';
import { useServices } from '@/hooks/use-services';
import type { PredefinedService } from '@/lib/types';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const { predefinedServices, savePredefinedServices, isLoaded } = useServices();
  const [localServices, setLocalServices] = useState<PredefinedService[]>([]);

  useEffect(() => {
    if (isLoaded) {
      // Deep copy to avoid direct mutation
      setLocalServices(JSON.parse(JSON.stringify(predefinedServices)));
    }
  }, [isLoaded, predefinedServices]);

  const handleServiceChange = (index: number, field: keyof PredefinedService, value: string | number) => {
    const updatedServices = [...localServices];
    if (field === 'price') {
      updatedServices[index][field] = Number(value) || 0;
    } else {
      updatedServices[index][field] = value as string;
    }
    setLocalServices(updatedServices);
  };

  const handleAddNewService = () => {
    setLocalServices([...localServices, { name: '', price: 0 }]);
  };

  const handleRemoveService = (index: number) => {
    const updatedServices = localServices.filter((_, i) => i !== index);
    setLocalServices(updatedServices);
  };

  const handleSaveChanges = () => {
    // Filter out empty services before saving
    const servicesToSave = localServices.filter(s => s.name.trim() !== '' && s.price > 0);
    savePredefinedServices(servicesToSave);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
        <Header title="FlowBarber" showAnalyticsButton />
        <main className="max-w-2xl mx-auto space-y-6 mt-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground">
      <Header title="FlowBarber" showAnalyticsButton />
      <main className="p-4 md:p-6 lg:p-8 space-y-6 max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Ajustes</h2>
            <p className="text-muted-foreground">Personalize a sua lista de serviços predefinidos.</p>
          </div>
          <div className="flex gap-2">
             <Button onClick={handleAddNewService} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Serviço
              </Button>
            <Button onClick={handleSaveChanges}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Lista de Serviços</CardTitle>
            <CardDescription>Adicione, edite ou remova os serviços que aparecem na tela de adição.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {localServices.map((service, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Nome do serviço"
                  value={service.name}
                  onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                  className="flex-grow"
                />
                <Input
                  type="number"
                  placeholder="Preço"
                  value={service.price}
                  onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                  className="w-28"
                />
                <Button variant="ghost" size="icon" onClick={() => handleRemoveService(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
             {localServices.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                    Nenhum serviço predefinido. Adicione o primeiro!
                </p>
             )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
