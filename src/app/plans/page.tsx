
"use client";

import { useState } from "react";
import type { ClientPlan } from "@/lib/types";
import { useClientPlans } from "@/hooks/use-client-plans";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, Scissors, RefreshCw, Trash2, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AddPlanSheet } from "@/components/AddPlanSheet";
import { Progress } from "@/components/ui/progress";

export default function PlansPage() {
  const { plans, addPlan, updatePlan, deletePlan, useCut, resetCuts, isLoaded } = useClientPlans();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<ClientPlan | undefined>(undefined);

  const handleAddClick = () => {
    setPlanToEdit(undefined);
    setIsSheetOpen(true);
  };

  const handleEditClick = (plan: ClientPlan) => {
    setPlanToEdit(plan);
    setIsSheetOpen(true);
  };

  const handleSavePlan = (planData: Omit<ClientPlan, 'id' | 'remainingCuts'>) => {
    if (planToEdit) {
      updatePlan(planToEdit.id, { ...planToEdit, ...planData });
    } else {
      addPlan(planData);
    }
    setIsSheetOpen(false);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
        <Header title="FlowBarber" showAnalyticsButton/>
        <main className="max-w-7xl mx-auto space-y-6 mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen text-foreground pb-24">
        <Header title="FlowBarber" showAnalyticsButton />
        <main className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Planos de Clientes</h2>
              <p className="text-muted-foreground">Gerencie os planos e cortes dos seus clientes.</p>
            </div>
            <Button onClick={handleAddClick}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Plano
            </Button>
          </div>

          {plans.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {plans.map(plan => (
                <Card key={plan.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{plan.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(plan)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Deletar plano?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Você tem certeza que quer deletar o plano de "{plan.name}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deletePlan(plan.id)}>Deletar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <CardDescription>R$ {plan.price.toFixed(2)} / {plan.totalCuts} cortes</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                    <div className="text-center">
                        <p className="text-4xl font-bold">{plan.remainingCuts}</p>
                        <p className="text-sm text-muted-foreground">cortes restantes</p>
                    </div>
                    <Progress value={(plan.remainingCuts / plan.totalCuts) * 100} />
                  </CardContent>
                  <CardFooter className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => useCut(plan.id)} disabled={plan.remainingCuts === 0}>
                        <Scissors className="h-4 w-4 mr-2"/>
                        Usar Corte
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button disabled={plan.remainingCuts > 0}>
                            <RefreshCw className="h-4 w-4 mr-2"/>
                            Renovar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Renovar plano?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Isso irá reiniciar a contagem de cortes para o plano de "{plan.name}" para {plan.totalCuts} cortes. 
                            Confirme que o pagamento de R$ {plan.price.toFixed(2)} foi recebido.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => resetCuts(plan.id)}>Confirmar Renovação</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-12 mt-12">
                <Users className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhum plano de cliente encontrado</h3>
                <p className="mt-2 text-sm text-muted-foreground">Clique em "Adicionar Plano" para registrar seu primeiro cliente.</p>
            </div>
          )}
        </main>
      </div>
      <AddPlanSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSave={handleSavePlan}
        planToEdit={planToEdit}
      />
    </>
  );
}
