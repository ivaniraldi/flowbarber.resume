"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PREDEFINED_SERVICES } from "@/lib/constants";
import type { Service, PredefinedService } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Banknote, CreditCard, CheckCircle } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

interface AddServiceSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (service: Service) => void;
  serviceToEdit?: Service;
}

const serviceSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  price: z.coerce.number().min(0.01, "O preço deve ser maior que zero"),
  paymentMethod: z.enum(["dinheiro", "pagamento online"], {
    required_error: "Selecione um método de pagamento",
  }),
});

export function AddServiceSheet({
  isOpen,
  onOpenChange,
  onSave,
  serviceToEdit,
}: AddServiceSheetProps) {
  const [selectedServices, setSelectedServices] = useState<PredefinedService[]>([]);
  
  const form = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      price: 0,
      paymentMethod: "dinheiro",
    },
  });

  useEffect(() => {
    if (!serviceToEdit) {
      const newName = selectedServices.map(s => s.name).join(', ');
      const newPrice = selectedServices.reduce((acc, s) => acc + s.price, 0);
      form.setValue('name', newName);
      form.setValue('price', newPrice);
    }
  }, [selectedServices, serviceToEdit, form]);

  useEffect(() => {
    if (isOpen) {
        if (serviceToEdit) {
          form.reset({
            name: serviceToEdit.name,
            price: serviceToEdit.price,
            paymentMethod: serviceToEdit.paymentMethod,
          });
          setSelectedServices([]);
        } else {
          form.reset({
            name: "",
            price: 0,
            paymentMethod: "dinheiro",
          });
          setSelectedServices([]);
        }
    }
  }, [serviceToEdit, isOpen, form]);

  const onSubmit = (data: z.infer<typeof serviceSchema>) => {
    if (data.name && data.price > 0) {
        const service: Service = {
          id: serviceToEdit?.id || new Date().toISOString(),
          ...data,
        };
        onSave(service);
    }
  };
  
  const handlePredefinedClick = (service: PredefinedService) => {
    if(serviceToEdit) return;

    setSelectedServices(prev => {
        const isSelected = prev.find(s => s.name === service.name);
        if (isSelected) {
            return prev.filter(s => s.name !== service.name);
        } else {
            return [...prev, service];
        }
    });
  };
  
  const isServiceSelected = (service: PredefinedService) => {
    return !!selectedServices.find(s => s.name === service.name);
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>
            {serviceToEdit ? "Editar Serviço" : "Adicionar Serviço"}
          </SheetTitle>
          <SheetDescription>
            {serviceToEdit
              ? "Atualize os detalhes do serviço."
              : "Selecione um ou mais serviços predefinidos ou adicione um personalizado."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow flex flex-col overflow-hidden">
            <ScrollArea className="flex-grow pr-6 -mr-6">
              <div className="space-y-6 py-4">
                <Tabs defaultValue="predefined">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="predefined" disabled={!!serviceToEdit}>Serviços</TabsTrigger>
                    <TabsTrigger value="custom">Personalizado</TabsTrigger>
                  </TabsList>
                  <TabsContent value="predefined" className="mt-4 space-y-2">
                    {PREDEFINED_SERVICES.map((service) => (
                      <Button
                        type="button"
                        key={service.name}
                        variant={isServiceSelected(service) ? "default" : "outline"}
                        className={cn("w-full justify-start h-auto py-3", isServiceSelected(service) && "ring-2 ring-primary-focus")}
                        onClick={() => handlePredefinedClick(service)}
                      >
                         <div className="flex justify-between items-center w-full">
                          <span className="text-left">{service.name}</span>
                          <span className={cn("font-bold", isServiceSelected(service) ? "text-primary-foreground" : "text-secondary")}>R$ {service.price.toFixed(2)}</span>
                        </div>
                      </Button>
                    ))}
                  </TabsContent>
                  <TabsContent value="custom" className="mt-4 space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Serviço</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Hidratação" {...field} 
                             onChange={(e) => {
                                field.onChange(e);
                                setSelectedServices([]);
                            }}
                            />
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
                          <FormLabel>Preço (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="25.00" {...field}
                            onChange={(e) => {
                                field.onChange(e);
                                setSelectedServices([]);
                            }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                      <FormItem className="rounded-md border p-4 bg-muted/20">
                          <FormLabel className="text-sm text-muted-foreground">Total</FormLabel>
                           <div className="flex items-baseline">
                                <span className="text-2xl font-bold">R$</span>
                                <FormControl>
                                    <Input 
                                      type="number"
                                      readOnly 
                                      className="text-2xl font-bold border-0 bg-transparent shadow-none px-1 h-auto focus-visible:ring-0" 
                                      {...field} 
                                      value={field.value || '0.00'}
                                    />
                                </FormControl>
                           </div>
                          <FormMessage />
                      </FormItem>
                  )}
                  />


                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Método de Pagamento</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <FormItem>
                             <Label className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground", field.value === 'dinheiro' && "border-primary")}>
                              <FormControl>
                                  <RadioGroupItem value="dinheiro" className="sr-only" />
                              </FormControl>
                              <Banknote className="mb-3 h-6 w-6" />
                              Dinheiro
                             </Label>
                          </FormItem>
                          <FormItem>
                            <Label className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground", field.value === 'pagamento online' && "border-primary")}>
                              <FormControl>
                                  <RadioGroupItem value="pagamento online" className="sr-only" />
                              </FormControl>
                              <CreditCard className="mb-3 h-6 w-6" />
                              Online
                            </Label>
                          </FormItem>
                        </RadioGroup>
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
                {serviceToEdit ? "Salvar Alterações" : "Salvar Serviço"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

    