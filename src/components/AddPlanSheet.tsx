
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { ClientPlan } from "@/lib/types";
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

interface AddPlanSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (plan: Omit<ClientPlan, 'id' | 'remainingCuts'>) => void;
  planToEdit?: ClientPlan;
}

const planSchema = z.object({
  name: z.string().min(2, "O nome do cliente é obrigatório."),
  price: z.coerce.number().min(0.01, "O preço deve ser maior que zero."),
  totalCuts: z.coerce.number().int().min(1, "Deve incluir pelo menos 1 corte."),
});

export function AddPlanSheet({
  isOpen,
  onOpenChange,
  onSave,
  planToEdit,
}: AddPlanSheetProps) {
  const form = useForm<z.infer<typeof planSchema>>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      price: 0,
      totalCuts: 0,
    },
  });

  useEffect(() => {
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
  }, [planToEdit, isOpen, form]);

  const onSubmit = (data: z.infer<typeof planSchema>) => {
    onSave(data);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
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
  );
}
