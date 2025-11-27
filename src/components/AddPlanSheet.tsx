
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { ClientPlan, PaymentMethod } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "./ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface AddPlanSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (plan: Omit<ClientPlan, 'id' | 'remainingCuts'>, paymentDetails: { addToRevenue: boolean, paymentMethod?: PaymentMethod }) => void;
  planToEdit?: ClientPlan;
}

const planSchema = z.object({
  name: z.string().min(2, "O nome do cliente é obrigatório."),
  price: z.coerce.number().min(0.01, "O preço deve ser maior que zero."),
  totalCuts: z.coerce.number().int().min(1, "Deve incluir pelo menos 1 corte."),
});

type PlanFormData = z.infer<typeof planSchema>;

export function AddPlanSheet({
  isOpen,
  onOpenChange,
  onSave,
  planToEdit,
}: AddPlanSheetProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<PlanFormData | null>(null);

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      price: 0,
      totalCuts: 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (planToEdit) {
        form.reset({
          name: planToEdit.name,
          price: planToEdit.price,
          totalCuts: planToEdit.totalCuts,
        });
      } else {
        form.reset({
          name: "",
          price: 0,
          totalCuts: 0,
        });
      }
    }
  }, [planToEdit, isOpen, form]);

  const onSubmit = (data: PlanFormData) => {
    if (planToEdit) {
      onSave(data, { addToRevenue: false }); // Don't show confirmation for edits
    } else {
      setFormData(data);
      setShowConfirmation(true);
    }
  };

  const handleConfirm = (paymentDetails: { addToRevenue: boolean, paymentMethod?: PaymentMethod }) => {
    if (formData) {
      onSave(formData, paymentDetails);
    }
    setShowConfirmation(false);
    setFormData(null);
  };
  
  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => {
        if (!open) {
          setShowConfirmation(false);
          setFormData(null);
        }
        onOpenChange(open);
      }}>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>
              {planToEdit ? "Editar Plano" : "Adicionar Novo Plano"}
            </SheetTitle>
            <SheetDescription>
              {planToEdit
                ? "Atualize os detalhes do plano do cliente."
                : "Registre um novo cliente e seu plano de cortes."}
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow flex flex-col overflow-hidden">
              <ScrollArea className="flex-grow pr-6 -mr-6">
                <div className="space-y-6 py-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Cliente</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: João da Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço do Plano (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" placeholder="100,00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalCuts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade de Cortes</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" placeholder="4" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </ScrollArea>

              <SheetFooter className="mt-auto pt-4 border-t">
                <SheetClose asChild>
                  <Button type="button" variant="outline" className="w-full sm:w-auto">
                    Cancelar
                  </Button>
                </SheetClose>
                <Button type="submit" className="w-full sm:w-auto">
                  {planToEdit ? "Salvar Alterações" : "Salvar Plano"}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {formData && (
         <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Pagamento</AlertDialogTitle>
                <AlertDialogDescription>
                    O pagamento de R$ {Number(formData.price).toFixed(2)} para o plano de "{formData.name}" foi recebido? 
                    Ao confirmar, este valor será adicionado à receita de hoje.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:flex-col sm:gap-2 sm:space-x-0">
                    <AlertDialogAction onClick={() => handleConfirm({ addToRevenue: true, paymentMethod: 'dinheiro'})}>Confirmar com Dinheiro</AlertDialogAction>
                    <AlertDialogAction onClick={() => handleConfirm({ addToRevenue: true, paymentMethod: 'pagamento online'})}>Confirmar com Pagamento Online</AlertDialogAction>
                    <AlertDialogAction onClick={() => handleConfirm({ addToRevenue: false })} variant="outline">Salvar sem adicionar à receita</AlertDialogAction>
                    <AlertDialogCancel className="w-full mt-2 sm:mt-0" onClick={() => setFormData(null)}>Cancelar</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
