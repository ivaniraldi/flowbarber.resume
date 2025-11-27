
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "./ui/scroll-area";
import type { Service, PaymentMethod } from "@/lib/types";
import { format, parse } from "date-fns";

interface ImportDataSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onImport: (services: Omit<Service, 'id'>[]) => void;
}

const importSchema = z.object({
  data: z.string().min(10, "Cole o texto do relatório para importar."),
});

type ImportFormData = z.infer<typeof importSchema>;

function parseServices(text: string): Omit<Service, 'id'>[] {
    const lines = text.split('\n');
    const services: Omit<Service, 'id'>[] = [];
    let startIndex = lines.findIndex(line => line.trim().toLowerCase().startsWith('data serviço método preço'));
    
    if (startIndex === -1) {
        startIndex = lines.findIndex(line => line.trim().toLowerCase().startsWith('serviços realizados'));
    }

    if (startIndex === -1) return [];

    for (let i = startIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.length < 10) continue; // Skip empty or invalid lines

        const dateMatch = line.match(/^(\d{2}\/\d{2}\/\d{2})\s/);
        if (!dateMatch) continue;

        const dateStr = dateMatch[1];
        const date = parse(dateStr, 'dd/MM/yy', new Date());

        let restOfLine = line.substring(dateStr.length).trim();
        
        let paymentMethod: PaymentMethod;
        let name: string;
        let priceStr: string;

        const onlineIndex = restOfLine.lastIndexOf('pagamento online');
        const dinheiroIndex = restOfLine.lastIndexOf('dinheiro');

        let paymentIndex = -1;
        if (onlineIndex !== -1 && (dinheiroIndex === -1 || onlineIndex > dinheiroIndex)) {
            paymentIndex = onlineIndex;
            paymentMethod = 'pagamento online';
        } else if (dinheiroIndex !== -1) {
            paymentIndex = dinheiroIndex;
            paymentMethod = 'dinheiro';
        } else {
            continue; // Could not determine payment method
        }

        name = restOfLine.substring(0, paymentIndex).trim();
        const priceAndMethodPart = restOfLine.substring(paymentIndex).trim();
        
        const priceMatch = priceAndMethodPart.match(/R\$\s*([\d,.]+)/);
        if (!priceMatch) continue;
        
        priceStr = priceMatch[1].replace('.', '').replace(',', '.');
        const price = parseFloat(priceStr);

        if (!name || isNaN(price) || !date) continue;
        
        services.push({
            date: format(date, 'yyyy-MM-dd'),
            name,
            paymentMethod,
            price,
        });
    }

    return services;
}


export function ImportDataSheet({ isOpen, onOpenChange, onImport }: ImportDataSheetProps) {
  const [parsedServices, setParsedServices] = useState<Omit<Service, 'id'>[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const form = useForm<ImportFormData>({
    resolver: zodResolver(importSchema),
    defaultValues: { data: "" },
  });

  const onSubmit = (data: ImportFormData) => {
    const services = parseServices(data.data);
    if (services.length > 0) {
      setParsedServices(services);
      setShowConfirmation(true);
    } else {
        form.setError("data", { type: "manual", message: "Nenhum serviço válido encontrado no texto. Verifique o formato." });
    }
  };

  const handleConfirmImport = () => {
    onImport(parsedServices);
    setShowConfirmation(false);
    onOpenChange(false);
    form.reset();
  };

  const handleCloseSheet = (open: boolean) => {
    if (!open) {
      form.reset();
      setParsedServices([]);
      setShowConfirmation(false);
    }
    onOpenChange(open);
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleCloseSheet}>
        <SheetContent className="flex flex-col sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Importar Dados Históricos</SheetTitle>
            <SheetDescription>
              Cole o texto do seu relatório antigo abaixo. A aplicação tentará
              extrair as informações de data, serviço, método de pagamento e preço.
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow flex flex-col overflow-hidden">
              <ScrollArea className="flex-grow pr-6 -mr-6">
                <div className="space-y-6 py-4">
                  <FormField
                    control={form.control}
                    name="data"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Texto do Relatório</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Cole o seu relatório aqui..."
                            className="min-h-[300px] font-mono text-xs"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </ScrollArea>

              <SheetFooter className="mt-auto pt-4 border-t">
                <SheetClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </SheetClose>
                <Button type="submit">Analisar e Importar</Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de Importação</AlertDialogTitle>
            <AlertDialogDescription>
              Encontramos <span className="font-bold">{parsedServices.length}</span> serviços no texto fornecido.
              Deseja adicioná-los ao seu histórico? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImport}>
              Sim, Importar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
